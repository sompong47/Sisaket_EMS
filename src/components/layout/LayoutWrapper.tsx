'use client';

import { usePathname } from 'next/navigation';
import Sidebar from '@/components/layout/Sidebar';
import Footer from '@/components/layout/Footer';

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // 🚫 รายชื่อหน้าที่ "ไม่ต้องการ" Sidebar และ Footer (หน้าเต็มจอ)
  const isPublicPage = [
    '/login', 
    '/register', 
    '/request',             // หน้าขอของ (คนนอก)
    '/update-population'    // หน้าอัปเดตยอดคน (คนนอก)
  ].includes(pathname);

  // กรณีเป็นหน้า Public (Login/Request) -> แสดงเนื้อหาเต็มจอเลย
  if (isPublicPage) {
    return <>{children}</>;
  }

  // กรณีเป็นหน้า Admin (Dashboard/Inventory) -> แสดง Sidebar + Footer ปกติ
  return (
    <div className="app-container">
      <Sidebar />
      <main className="main-content">
        <div style={{ minHeight: '80vh' }}>
          {children}
        </div>
        <Footer />
      </main>
    </div>
  );
}