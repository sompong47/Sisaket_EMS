import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Center from '@/models/Center';
import { createLog } from '@/lib/logger'; // ✅ 1. อย่าลืม Import ตัวนี้

// 🟢 GET: ดึงข้อมูลศูนย์ทั้งหมด
export async function GET() {
  await dbConnect();
  try {
    const centers = await Center.find({}).sort({ name: 1 });
    return NextResponse.json(centers);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch centers' }, { status: 500 });
  }
}

// 🟡 POST: นำเข้าข้อมูล (Import JSON) หรือสร้างใหม่
export async function POST(req: Request) {
  await dbConnect();
  try {
    const body = await req.json();
    
    // 1. Normalization
    let rawData: any[] = [];
    if (Array.isArray(body)) {
      rawData = body;
    } else if (body.data && Array.isArray(body.data)) {
      rawData = body.data;
    } else {
      rawData = [body];
    }

    // 2. Mapping
    const dataToInsert = rawData.map((item: any) => {
      let contactStr = '-';
      if (Array.isArray(item.phoneNumbers) && item.phoneNumbers.length > 0) {
        contactStr = item.phoneNumbers.join(', '); 
      } else if (typeof item.phoneNumbers === 'string') {
        contactStr = item.phoneNumbers;
      }

      return {
        name: item.name || 'ไม่ระบุชื่อ',
        location: item.location || `${item.subdistrict || ''} ${item.district || ''}`.trim() || '-',
        type: item.district || item.shelterType || 'ศูนย์พักพิง', 
        status: item.status === 'active' ? 'active' : 'inactive',
        contact: contactStr,
        population: item.population || 0, 
        capacity: item.capacity || 0 
      };
    });

    const validData = dataToInsert.filter((d) => d.name !== 'ไม่ระบุชื่อ');

    if (validData.length === 0) {
      return NextResponse.json({ error: 'ไม่พบข้อมูลที่ใช้งานได้' }, { status: 400 });
    }

    // 3. Insert
    try {
      await Center.insertMany(validData, { ordered: false });
    } catch (e: any) {
      if (e.code !== 11000) throw e; 
    }

    // ✅ 2. เพิ่ม Log: บันทึกว่ามีการเพิ่มศูนย์
    // (ตัดชื่อมาแสดงแค่ 5 อันแรก ถ้าเยอะเกินให้ใส่ ...)
    const count = validData.length;
    const sampleNames = validData.slice(0, 5).map(d => d.name).join(', ');
    const logDesc = count > 5 
      ? `เพิ่ม/นำเข้าศูนย์ ${count} แห่ง: ${sampleNames} ...`
      : `เพิ่ม/นำเข้าศูนย์ ${count} แห่ง: ${sampleNames}`;

    await createLog('CREATE_CENTER', logDesc);

    return NextResponse.json({ 
      message: `นำเข้าข้อมูลสำเร็จ ${validData.length} รายการ`
    }, { status: 201 });

  } catch (error: any) {
    console.error('Import Error:', error);
    return NextResponse.json({ error: `เกิดข้อผิดพลาด: ${error.message}` }, { status: 500 });
  }
}

// 🔴 DELETE: ลบศูนย์พักพิง
export async function DELETE(req: Request) {
  await dbConnect();
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Center ID is required' }, { status: 400 });
    }

    // ต้องใช้ findByIdAndDelete เพื่อให้มัน Return ค่าที่ถูกลบกลับมา (จะได้เอาชื่อไป Log ถูก)
    const deletedCenter = await Center.findByIdAndDelete(id);

    if (!deletedCenter) {
      return NextResponse.json({ error: 'Center not found' }, { status: 404 });
    }

    // ✅ 3. เพิ่ม Log: บันทึกว่าลบศูนย์ไหนไป
    await createLog('DELETE_CENTER', `ลบศูนย์พักพิง: ${deletedCenter.name}`);

    return NextResponse.json({ message: 'Center deleted successfully' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete center' }, { status: 500 });
  }
}