import { NextResponse } from 'next/server';

const mockAlerts = [
  { id: 1, title: 'น้ำล้นตลิ่ง อ.กันทรารมย์', level: 'critical', type: 'flood', timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(), message: 'ระดับน้ำมูลสูงเกิน 7 เมตร ขอให้อพยพประชาชนทันที' },
  { id: 2, title: 'พายุฤดูร้อนเข้าพื้นที่', level: 'warning', type: 'storm', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), message: 'ลมกรรโชกแรง ระวังป้ายโฆษณาและต้นไม้หักโค่น' },
  { id: 3, title: 'เตรียมความพร้อมศูนย์พักพิง', level: 'info', type: 'general', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(), message: 'ให้ทุกศูนย์เช็คสต็อกอาหารและยาให้พร้อม' },
];

export async function GET() {
  return NextResponse.json(mockAlerts);
}

export async function POST(req: Request) {
  const body = await req.json();
  return NextResponse.json({ success: true, data: body });
}