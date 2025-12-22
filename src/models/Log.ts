import mongoose from 'mongoose';

const LogSchema = new mongoose.Schema({
  action: { type: String, required: true }, // เช่น 'CREATE', 'UPDATE', 'DELETE', 'LOGIN'
  description: { type: String, required: true }, // รายละเอียด เช่น "เพิ่มศูนย์พักพิงใหม่: วัดบ้านนา"
  user: { type: String, default: 'Admin Officer' }, // ใครทำ (เดี๋ยวพอมี Login จริงค่อยเปลี่ยนเป็นชื่อจริง)
  ipAddress: { type: String, default: '-' },
  timestamp: { type: Date, default: Date.now }
});

export default mongoose.models.Log || mongoose.model('Log', LogSchema);