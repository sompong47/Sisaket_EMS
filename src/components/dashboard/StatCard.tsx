import '@/styles/dashboard.css';

interface StatCardProps {
  title: string;
  value: number | string;
  color: string;
}

export default function StatCard({ title, value, color }: StatCardProps) {
  return (
    <div className="stat-card" style={{ borderTop: `4px solid ${color}` }}>
      <div className="card-title">{title}</div>
      <div className="card-value" style={{ color: color }}>
        {value}
      </div>
    </div>
  );
}