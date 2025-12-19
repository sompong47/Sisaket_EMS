import StatCard from '@/components/dashboard/StatCard';
import PendingTransfers from '@/components/dashboard/PendingTransfers';
import '@/styles/dashboard.css';

export default function DashboardPage() {
  return (
    <div>
      <header style={{ marginBottom: '30px' }}>
        <h1 style={{ fontSize: '2rem', margin: 0, color: 'var(--accent-purple)' }}>
          ศรีสะเกษพร้อม (Sisaket EMS)
        </h1>
        <p style={{ color: 'var(--text-secondary)' }}>ระบบบริหารจัดการศูนย์พักพิงและสต็อกสินค้า</p>
      </header>

      {/* Grid Stats */}
      <div className="dashboard-grid">
        <StatCard title="ศูนย์พักพิงทั้งหมด" value={5} color="var(--accent-purple)" />
        <StatCard title="ประชากรผู้อพยพ" value={529} color="var(--accent-green)" />
        <StatCard title="คำร้องด่วน" value={92} color="var(--accent-orange)" />
        <StatCard title="สินค้าวิกฤต (Low Stock)" value={3} color="var(--accent-red)" />
      </div>

      {/* Table Section */}
      <PendingTransfers />
      
    </div>
  );
}