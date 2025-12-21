import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Transfer from '@/models/Transfer';

// 🟢 GET: ดูรายการเบิกทั้งหมด
export async function GET() {
  await dbConnect();
  try {
    // เรียงเอาใบใหม่สุดขึ้นก่อน
    const transfers = await Transfer.find({}).sort({ createdAt: -1 });
    return NextResponse.json(transfers);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch transfers' }, { status: 500 });
  }
}

// 🟡 POST: เปิดใบขอเบิกใหม่ (สมมติว่าศูนย์เป็นคนกดขอมา)
// ... imports

export async function POST(req: Request) {
  await dbConnect();
  try {
    const body = await req.json();
    
    // สร้างเลขที่เอกสาร
    const count = await Transfer.countDocuments();
    const docNo = `TR-${new Date().getFullYear()}-${(count + 1).toString().padStart(4, '0')}`;

    console.log("กำลังสร้างใบเบิก:", docNo, body); // ✅ เพิ่ม Log 1

    const newTransfer = await Transfer.create({
      ...body,
      docNo,
      status: 'pending'
    });

    return NextResponse.json(newTransfer);
  } catch (error: any) { // ✅ แก้ตรงนี้ให้รับ type any
    console.error("❌ Error สร้างใบเบิก:", error.message); // ✅ ให้มันพ่น Error ออกมาทาง Terminal
    return NextResponse.json({ error: error.message || 'Failed to create transfer' }, { status: 500 });
  }
}