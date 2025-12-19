import Link from 'next/link';
import '@/styles/layout.css'; // Import CSS

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <h2 style={{ marginBottom: '40px', fontSize: '1.5rem', fontWeight: 'bold' }}>
        🚑 Sisaket EMS
      </h2>
      <nav>
        <ul style={{ listStyle: 'none', padding: 0 }}>
          <li style={{ marginBottom: '10px' }}>
            <Link href="/" className="menu-item active">🏠 ภาพรวม (Dashboard)</Link>
          </li>
          <li style={{ marginBottom: '10px' }}>
            <Link href="/centers" className="menu-item">temp🏢 จัดการศูนย์</Link>
          </li>
          <li style={{ marginBottom: '10px' }}>
             <Link href="/inventory" className="menu-item">📦 คลังสินค้ากลาง</Link>
          </li>
          <li style={{ marginBottom: '10px' }}>
             <Link href="/transfers" className="menu-item">🚚 รายการรับ-ส่ง</Link>
          </li>
        </ul>
      </nav>
    </aside>
  );
}