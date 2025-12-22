import Log from '@/models/Log';
import dbConnect from '@/lib/mongodb';

export async function createLog(action: string, description: string, user: string = 'Admin Officer') {
  try {
    await dbConnect(); // กันเหนียว เผื่อ connection หลุด
    await Log.create({
      action,
      description,
      user
    });
    console.log(`[LOG] ${action}: ${description}`);
  } catch (error) {
    console.error('Failed to create log:', error);
    // ไม่ต้อง throw error ออกไป เพราะ Log พังไม่ควรทำให้ระบบหลักพัง
  }
}