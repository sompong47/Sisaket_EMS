'use client';

import { useState } from 'react';
import { signIn, getSession } from 'next-auth/react'; // ✅ เพิ่ม getSession
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import '@/styles/auth.css';

export default function LoginPage() {
  const router = useRouter();
  
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // 1. ส่งข้อมูลไปตรวจสอบ
      const result = await signIn('credentials', {
        redirect: false,
        username: username,
        password: password,
      });

      if (result?.error) {
        setError('❌ ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง');
        setLoading(false);
      } else {
        // 2. ✅ ล็อกอินผ่านแล้ว -> เช็ค Role เพื่อพาไปหน้าที่ถูกต้อง
        const session = await getSession();
        
        // ถ้าเป็น Staff ให้ไปหน้า /staff, ถ้าเป็น Admin ให้ไปหน้า /
        if (session?.user?.role === 'staff') {
           router.push('/staff');
        } else {
           router.push('/');
        }
        
        router.refresh(); 
      }
    } catch (err) {
      setError('เกิดข้อผิดพลาดในการเชื่อมต่อ');
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        
        {/* Logo Section */}
        <div className="auth-logo" style={{ width: '100px', height: '100px', margin: '0 auto 20px' }}>
          {/*  - ใช้รูป logo เดิมของคุณ */}
          <img 
            src="/ssk-logo.jpg" 
            alt="Sisaket EMS Logo" 
            style={{ width: '100%', height: '100%', objectFit: 'contain' }}
            onError={(e) => e.currentTarget.style.display = 'none'} // ซ่อนถ้าโหลดรูปไม่ได้
          />
        </div>

        <h1 className="auth-title">Sisaket EMS</h1>
        <p className="auth-subtitle">ระบบบริหารจัดการภาวะวิกฤต</p>

        {error && (
          <div style={{
            background: '#ffebee', color: '#c62828', padding: '10px', 
            borderRadius: '8px', marginBottom: '20px', fontSize: '0.9rem', 
            textAlign: 'center', border: '1px solid #ffcdd2'
          }}>
            {error}
          </div>
        )}

        <form className="auth-form" onSubmit={handleLogin}>
          <div className="form-group">
            <label>ชื่อผู้ใช้งาน (Username)</label>
            <input 
              type="text" className="auth-input" placeholder="เช่น admin" required 
              value={username} onChange={(e) => setUsername(e.target.value)}
            />
          </div>
          
          <div className="form-group">
            <label>รหัสผ่าน (Password)</label>
            <input 
              type="password" className="auth-input" placeholder="••••••••" required 
              value={password} onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button type="submit" className="auth-button" disabled={loading}>
            {loading ? '⏳ กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}
          </button>

          <div style={{ marginTop: '15px', textAlign: 'center' }}>
            <Link href="/register" style={{ fontSize: '0.9rem', color: '#666', textDecoration: 'none' }}>
              ยังไม่มีบัญชี? <b style={{ color: '#ef6c00' }}>สมัครสมาชิกใหม่</b>
            </Link>
          </div>


        </form>

        <div className="auth-footer">
          © 2025 Sisaket Shelter Management System
        </div>
      </div>
    </div>
  );
}