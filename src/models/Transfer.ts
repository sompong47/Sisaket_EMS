import mongoose from 'mongoose';

const TransferSchema = new mongoose.Schema({
  docNo: { type: String, required: true }, // เลขที่เอกสาร เช่น TR-2512-001
  destination: { type: String, required: true }, // ปลายทาง (เช่น ศูนย์วัดบ้านนา)
  items: [{
    productId: { type: String, required: true },
    productName: { type: String, required: true },
    quantity: { type: Number, required: true },
    unit: { type: String, required: true }
  }],
  status: { 
    type: String, 
    enum: ['pending', 'approved', 'rejected', 'completed'], 
    default: 'pending' 
  },
  requestedBy: { type: String, default: 'เจ้าหน้าที่ศูนย์' },
  approvedBy: { type: String }, // ใครเป็นคนกดอนุมัติ
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date }
});

export default mongoose.models.Transfer || mongoose.model('Transfer', TransferSchema);