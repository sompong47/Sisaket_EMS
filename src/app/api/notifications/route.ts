import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Notification from '@/models/Notification';

function formatTimeAgo(date: Date) {
  // ... โค้ดแปลงเวลา ...
  return new Date(date).toLocaleDateString('th-TH');
}

export async function GET() {
  await dbConnect();
  try {
    const notifications = await Notification.find({}).sort({ createdAt: -1 }).limit(20);
    
    const formattedData = notifications.map(item => ({
      id: item._id,
      type: item.type,
      title: item.title,
      message: item.message,
      read: item.read,
      time: formatTimeAgo(item.createdAt)
    }));

    return NextResponse.json(formattedData);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  await dbConnect();
  const body = await req.json();
  await Notification.create(body);
  return NextResponse.json({ success: true });
}