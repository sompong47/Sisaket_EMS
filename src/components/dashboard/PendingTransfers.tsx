import '@/styles/dashboard.css';

export default function PendingTransfers() {
  // Mock Data ไปก่อน เดี๋ยวค่อยต่อ API
  const requests = [
    { id: 1, center: 'ศูนย์ อบต.โพธิ์ศรี', item: 'ข้าวสาร', qty: 20, status: 'รออนุมัติ' },
    { id: 2, center: 'ศูนย์โรงเรียนบ้านดู่', item: 'น้ำดื่ม', qty: 50, status: 'รออนุมัติ' },
  ];

  return (
    <div style={{ marginTop: '20px' }}>
      <h3 className="section-title">📦 คำร้องขอเบิกด่วน (Pending)</h3>
      <table className="data-table">
        <thead>
          <tr>
            <th>ศูนย์</th>
            <th>รายการ</th>
            <th>จำนวน</th>
            <th>สถานะ</th>
            <th>จัดการ</th>
          </tr>
        </thead>
        <tbody>
          {requests.map((req) => (
            <tr key={req.id}>
              <td>{req.center}</td>
              <td>{req.item}</td>
              <td>{req.qty}</td>
              <td style={{ color: 'var(--accent-orange)' }}>{req.status}</td>
              <td>
                <button style={{ 
                  background: 'var(--accent-green)', 
                  border: 'none', 
                  color: 'white', 
                  padding: '5px 10px', 
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}>อนุมัติ</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}