import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Center from '@/models/Center';

export async function POST(req: Request) {
  await dbConnect();

  try {
    const { centerId, population } = await req.json();

    // 1. ตรวจสอบข้อมูลเบื้องต้น
    if (!centerId) {
      return NextResponse.json({ error: 'กรุณาระบุ Center ID' }, { status: 400 });
    }
    
    // แปลงค่าให้เป็นตัวเลข (กันคนส่งมาเป็น String)
    const popNum = parseInt(population);
    if (isNaN(popNum) || popNum < 0) {
      return NextResponse.json({ error: 'จำนวนคนไม่ถูกต้อง' }, { status: 400 });
    }

    // 2. อัปเดตข้อมูลใน Database
    // ใช้ findByIdAndUpdate เพื่อแก้ไขเฉพาะฟิลด์ population
    // ... (ส่วนตรวจสอบ input เหมือนเดิม) ...

    // ดึงข้อมูลเก่ามาดูก่อน เพื่อเทียบความจุ (Capacity)
    const center = await Center.findById(centerId);
    if (!center) return NextResponse.json({ error: 'ไม่พบศูนย์' }, { status: 404 });

    // คำนวณสถานะอัตโนมัติ
    let newStatus = 'active'; // ปกติรับได้
    if (popNum >= center.capacity) {
        newStatus = 'full';   // ถ้าคนเกินความจุ ให้ขึ้นว่าเต็ม
    }

    // อัปเดตลง Database
    center.population = popNum;
    center.status = newStatus;
    center.updatedAt = new Date();
    await center.save();

    return NextResponse.json({ 
      message: 'อัปเดตยอดเรียบร้อยแล้ว', 
      center: center.name,
      population: center.population,
      status: center.status // ส่งสถานะกลับไปบอกด้วย
    });

  } catch (error: any) {
    console.error('Update Population Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}