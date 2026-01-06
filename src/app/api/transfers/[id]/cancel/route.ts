import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Transfer from '@/models/Transfer';
import Inventory from '@/models/Inventory';
import { createLog } from '@/lib/logger';

export async function POST(req: Request, { params }: { params: { id: string } }) {
  await dbConnect();
  const { id } = params;

  try {
    // 1. หาเอกสารคำขอ
    const transfer = await Transfer.findById(id);
    if (!transfer) return NextResponse.json({ error: 'ไม่พบคำขอ' }, { status: 404 });

    // ต้องเป็นรายการที่ "อนุมัติแล้ว" เท่านั้นถึงจะคืนของได้
    if (transfer.status !== 'approved') {
      return NextResponse.json({ error: 'ทำได้เฉพาะรายการที่อนุมัติไปแล้วเท่านั้น' }, { status: 400 });
    }

    // 2. 🔄 คืนสต็อกสินค้า (Reverse Stock)
    for (const item of transfer.items) {
      const product = await Inventory.findById(item.productId);
      
      if (product) {
        product.quantity += item.quantity; // บวกกลับเข้าไป
        await product.save();
      }
    }

    // 3. อัปเดตสถานะเป็น "ยกเลิก"
    transfer.status = 'cancelled';
    transfer.updatedAt = new Date();
    await transfer.save();

    // 4. บันทึก Log
    await createLog(
      'Admin', 
      'CANCEL_TRANSFER', 
      `ยกเลิกใบเบิก ${transfer.docNo} - คืนสต็อกสินค้าเรียบร้อย`
    );

    return NextResponse.json({ message: 'ยกเลิกและคืนสต็อกเรียบร้อย', transfer });

  } catch (error: any) {
    console.error("Cancel Error:", error);
    return NextResponse.json({ error: error.message || 'เกิดข้อผิดพลาด' }, { status: 500 });
  }
}