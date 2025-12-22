import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Beneficiary from '@/models/Beneficiary';

// 🟢 GET: ดึงรายชื่อทั้งหมด
export async function GET() {
  await dbConnect();
  try {
    const people = await Beneficiary.find({}).sort({ registeredAt: -1 });
    return NextResponse.json(people);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch beneficiaries' }, { status: 500 });
  }
}

// 🟡 POST: ลงทะเบียนคนใหม่
export async function POST(req: Request) {
  await dbConnect();
  try {
    const body = await req.json();
    const newPerson = await Beneficiary.create(body);
    return NextResponse.json(newPerson);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create beneficiary' }, { status: 500 });
  }
}