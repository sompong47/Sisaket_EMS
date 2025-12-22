import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Log from '@/models/Log';

export async function GET() {
  await dbConnect();
  try {
    // ดึง 100 รายการล่าสุด
    const logs = await Log.find({}).sort({ timestamp: -1 }).limit(100);
    return NextResponse.json(logs);
  } catch (error) {
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}