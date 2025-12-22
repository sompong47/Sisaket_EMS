import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Transfer from '@/models/Transfer';
import Product from '@/models/Product';
import Notification from '@/models/Notification';

export async function POST(req: Request, { params }: { params: { id: string } }) {
  await dbConnect();
  const { id } = params;
  const { action } = await req.json(); // action = 'approve' | 'reject'

  try {
    const transfer = await Transfer.findById(id);
    if (!transfer) return NextResponse.json({ error: 'Transfer not found' }, { status: 404 });

    if (transfer.status !== 'pending') {
      return NextResponse.json({ error: 'ใบงานนี้ถูกดำเนินการไปแล้ว' }, { status: 400 });
    }

    if (action === 'reject') {
      transfer.status = 'rejected';
      await transfer.save();
      return NextResponse.json({ message: 'ปฏิเสธคำขอแล้ว' });
    }

    // กรณีอนุมัติ (Approve) -> ต้องตัดสต็อกจริง
    if (action === 'approve') {
      // 1. วนลูปเช็คของทุกชิ้นในใบเบิก
      for (const item of transfer.items) {
        const product = await Product.findById(item.productId);
        
        if (!product || product.quantity < item.quantity) {
          return NextResponse.json({ 
            error: `สต็อกไม่พอ: ${item.productName} (มี ${product?.quantity || 0}, ขอ ${item.quantity})` 
          }, { status: 400 });
        }

        // 2. ตัดสต็อก
        product.quantity -= item.quantity;
        await product.save();
      }

      // 3. อัปเดตสถานะใบเบิก
      transfer.status = 'approved';
      transfer.approvedBy = 'Admin Officer'; // (Mock)
      transfer.updatedAt = new Date();
      await transfer.save();

      // 4. สร้างแจ้งเตือนเข้าระบบ
      await Notification.create({
        type: 'system',
        title: '✅ อนุมัติเบิกจ่ายสำเร็จ',
        message: `รายการ ${transfer.docNo} สำหรับ ${transfer.destination} ได้รับการอนุมัติแล้ว`,
        read: false
      });

      return NextResponse.json({ message: 'อนุมัติและตัดสต็อกเรียบร้อย' });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });

  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}