import mongoose from 'mongoose';

const TransferSchema = new mongoose.Schema({
  docNo: { type: String, required: true, unique: true }, 
  destination: { type: String, required: true }, 
  
  centerId: { type: String }, 
  centerName: { type: String },

  items: [{
    productId: { type: String, required: true },
    productName: { type: String, required: true },
    quantity: { type: Number, required: true },
    unit: { type: String, required: true }
  }],
  status: { 
    type: String, 
    // ✅ ต้องมี 'cancelled' ในบรรทัดนี้ครับ ไม่งั้นจะ Error แบบในรูป
    enum: ['pending', 'approved', 'rejected', 'completed', 'cancelled'], 
    default: 'pending' 
  },
  requestedBy: { type: String, default: 'เจ้าหน้าที่ศูนย์' },
  approvedBy: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date }
});

export default mongoose.models.Transfer || mongoose.model('Transfer', TransferSchema);