import mongoose from 'mongoose';

const BeneficiarySchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  age: { type: Number, required: true },
  gender: { type: String, required: true },
  centerId: { type: String, required: false }, // เก็บ ID ของศูนย์ที่อยู่
  centerName: { type: String, required: false }, // เก็บชื่อศูนย์ (จะได้ไม่ต้อง Join ตาราง)
  status: { 
    type: String, 
    enum: ['normal', 'sick', 'disabled', 'critical'], 
    default: 'normal' 
  },
  chronicDisease: { type: String, default: '' }, // โรคประจำตัว
  registeredAt: { type: Date, default: Date.now }
});

export default mongoose.models.Beneficiary || mongoose.model('Beneficiary', BeneficiarySchema);