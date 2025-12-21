import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Product from '@/models/Product';
import Notification from '@/models/Notification'; // เรียกใช้ Model แจ้งเตือน

// 🟢 GET: ดูของในคลังทั้งหมด
export async function GET() {
  await dbConnect();
  try {
    const products = await Product.find({}).sort({ quantity: 1 }); // เรียงตามของที่เหลือน้อยสุดขึ้นก่อน
    return NextResponse.json(products);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch inventory' }, { status: 500 });
  }
}

// 🟡 POST: เพิ่มสินค้าใหม่ หรือ ปรับยอดสินค้า
export async function POST(req: Request) {
  await dbConnect();
  try {
    const body = await req.json();
    
    // กรณี 1: สร้างสินค้าใหม่
    if (!body._id) {
      const newProduct = await Product.create(body);
      return NextResponse.json(newProduct);
    }

    // กรณี 2: อัปเดตจำนวนสินค้า (เช่น เบิกของ / เติมของ)
    const product = await Product.findById(body._id);
    if (!product) return NextResponse.json({ error: 'Product not found' }, { status: 404 });

    product.quantity = body.quantity;
    product.updatedAt = new Date();
    await product.save();

    // 🔥 เช็คสต็อกอัตโนมัติ: ถ้าของน้อยกว่าเกณฑ์ ให้แจ้งเตือน!
    if (product.quantity <= product.minLevel) {
      await Notification.create({
        type: 'stock',
        title: `📦 สต็อกเตือนภัย: ${product.name}`,
        message: `เหลือเพียง ${product.quantity} ${product.unit} (ต่ำกว่าเกณฑ์ ${product.minLevel}) กรุณาเติมด่วน!`,
        read: false
      });
    }

    return NextResponse.json(product);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update inventory' }, { status: 500 });
  }
}