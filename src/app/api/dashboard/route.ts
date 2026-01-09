export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Center from '@/models/Center';
import Transfer from '@/models/Transfer';
import Product from '@/models/Product';

export async function GET() {
  await dbConnect();

  try {
    // 1. ข้อมูลพื้นฐาน 4 การ์ด
    const centerCount = await Center.countDocuments({ status: 'active' });
    
    const populationResult = await Center.aggregate([
        { $group: { _id: null, total: { $sum: "$population" } } }
    ]);
    const population = populationResult[0]?.total || 0;

    const pendingCount = await Transfer.countDocuments({ status: 'pending' });
    const completedCount = await Transfer.countDocuments({ status: 'approved' });

    // 2. หา "5 อันดับศูนย์ที่มีคำร้องมากที่สุด" (Top 5 Centers)
    const topCenters = await Transfer.aggregate([
      {
        $group: {
          _id: "$centerName", // จัดกลุ่มตามชื่อศูนย์
          count: { $sum: 1 }, // นับจำนวนใบเบิก
          totalItems: { $sum: { $size: "$items" } } // แถม: นับจำนวนรายการของ
        }
      },
      { $sort: { count: -1 } }, // เรียงจากมากไปน้อย
      { $limit: 5 } // เอาแค่ 5 อันดับ
    ]);

    // 3. ข้อมูลสำหรับกราฟวงกลม (สถานะคำร้อง)
    const pending = await Transfer.countDocuments({ status: 'pending' });
    const approved = await Transfer.countDocuments({ status: 'approved' });
    const totalRequests = pending + approved;

    return NextResponse.json({
      stats: {
        centers: centerCount,
        population: population,
        pending: pendingCount,
        completed: completedCount
      },
      topCenters: topCenters,
      chartData: {
        pending,
        approved,
        total: totalRequests
      }
    });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Dashboard Error' }, { status: 500 });
  }
}