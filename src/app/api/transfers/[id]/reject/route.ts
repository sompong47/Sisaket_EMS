import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Transfer from '@/models/Transfer';
import { createLog } from '@/lib/logger';

export async function POST(req: Request, { params }: { params: { id: string } }) {
  await dbConnect();
  const { id } = params;

  try {
    // ✅ ใช้ findByIdAndUpdate แทน .save() 
    // เพื่อบังคับเปลี่ยนสถานะทันที (ข้ามการเช็ค docNo ที่หายไปในข้อมูลเก่า)
    const transfer = await Transfer.findByIdAndUpdate(
      id,
      { 
        $set: { 
          status: 'rejected',
          approvedBy: 'Admin',
          updatedAt: new Date()
        } 
      },
      { new: true } // ให้คืนค่าข้อมูลใหม่กลับมา
    );

    if (!transfer) {
      return NextResponse.json({ error: 'ไม่พบคำขอ' }, { status: 404 });
    }

    // บันทึก Log
    await createLog('Admin', 'REJECT_TRANSFER', `ปฏิเสธคำขอ (Cleanup Data): ${id}`);

    return NextResponse.json({ message: 'ปฏิเสธคำขอเรียบร้อย', transfer });

  } catch (error: any) {
    console.error("Reject Error:", error);
    return NextResponse.json({ error: error.message || 'เกิดข้อผิดพลาด' }, { status: 500 });
  }
}