import mongoose from 'mongoose';

const ProductSchema = new mongoose.Schema({
  name: { type: String, required: true }, // เช่น ข้าวสาร, น้ำดื่ม
  category: { 
    type: String, 
    enum: ['food', 'medicine', 'equipment', 'clothing', 'other'],
    default: 'other' 
  },
  quantity: { type: Number, default: 0 }, // จำนวนคงเหลือ
  unit: { type: String, required: true }, // หน่วย (ถุง, แพ็ค, ขวด)
  minLevel: { type: Number, default: 10 }, // จุดเตือน (ถ้าต่ำกว่านี้ให้แจ้งเตือน)
  location: { type: String, default: 'คลังกลาง (ศาลากลาง)' }, // เก็บที่ไหน
  updatedAt: { type: Date, default: Date.now }
});

export default mongoose.models.Product || mongoose.model('Product', ProductSchema);