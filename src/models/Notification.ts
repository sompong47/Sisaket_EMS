import mongoose from 'mongoose';

const NotificationSchema = new mongoose.Schema({
  type: { 
    type: String, 
    required: true,
    enum: ['emergency', 'request', 'stock', 'system', 'info'] // บังคับว่าต้องเป็นคำพวกนี้เท่านั้น
  },
  title: { type: String, required: true },
  message: { type: String, required: true },
  read: { type: Boolean, default: false }, // อ่านยัง? (ค่าเริ่มต้นคือยัง)
  createdAt: { type: Date, default: Date.now } // วันเวลาที่แจ้งเตือน
});

// เช็คว่ามี Model นี้อยู่แล้วไหม ถ้าไม่มีค่อยสร้างใหม่ (ป้องกัน error เวลา Next.js refresh)
export default mongoose.models.Notification || mongoose.model('Notification', NotificationSchema);