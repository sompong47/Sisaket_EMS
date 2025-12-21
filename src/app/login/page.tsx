'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import '@/styles/auth.css';

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  // จำลองการ Login (ยังไม่ได้ต่อ Database จริง)
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // จำลองเวลาโหลด 1.5 วินาที
    setTimeout(() => {
      setLoading(false);
      alert('✅ เข้าสู่ระบบสำเร็จ (จำลอง)');
      router.push('/'); // เด้งไปหน้าแรก
    }, 1500);
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-logo">⚡</div>
        <h1 className="auth-title">Sisaket EMS</h1>
        <p className="auth-subtitle">ระบบบริหารจัดการภาวะวิกฤต</p>

        <form className="auth-form" onSubmit={handleLogin}>
          <div className="form-group">
            <label>ชื่อผู้ใช้งาน (Username)</label>
            <input 
              type="text" 
              className="auth-input" 
              placeholder="admin" 
              required 
            />
          </div>
          
          <div className="form-group">
            <label>รหัสผ่าน (Password)</label>
            <input 
              type="password" 
              className="auth-input" 
              placeholder="••••••••" 
              required 
            />
          </div>

          <button type="submit" className="auth-button" disabled={loading}>
            {loading ? '⏳ กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}
          </button>
        </form>

        <div className="auth-footer">
          © 2025 Sisaket Shelter Management System
        </div>
      </div>
    </div>
  );
}