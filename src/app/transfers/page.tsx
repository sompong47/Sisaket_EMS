'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/layout/Header';
import '@/styles/table.css';

interface TransferItem {
  productId: string;
  productName: string;
  quantity: number;
  unit: string;
}

interface Transfer {
  _id: string;
  docNo: string;
  destination: string;
  items: TransferItem[];
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
}

export default function TransfersPage() {
  const [transfers, setTransfers] = useState<Transfer[]>([]);

  const fetchTransfers = async () => {
    try {
      const res = await fetch('/api/transfers');
      const data = await res.json();
      setTransfers(data);
    } catch (error) {
      console.error('Error fetching transfers:', error);
    }
  };

  useEffect(() => {
    fetchTransfers();
  }, []);

  const handleAction = async (id: string, action: 'approve' | 'reject') => {
    if (!confirm(`ยืนยันการ ${action === 'approve' ? 'อนุมัติ' : 'ปฏิเสธ'} รายการนี้?`)) return;

    try {
      const res = await fetch(`/api/transfers/${id}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action })
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        alert(`❌ เกิดข้อผิดพลาด: ${data.error}`);
        return;
      }

      alert(`✅ ดำเนินการสำเร็จ`);
      fetchTransfers(); // โหลดข้อมูลใหม่
    } catch (error) {
      alert('เกิดข้อผิดพลาดในการเชื่อมต่อ');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending': return <span className="status-badge" style={{background:'#fff3e0', color:'#ef6c00'}}>⏳ รออนุมัติ</span>;
      case 'approved': return <span className="status-badge active">✅ อนุมัติแล้ว</span>;
      case 'rejected': return <span className="status-badge inactive">❌ ปฏิเสธ</span>;
      default: return <span>-</span>;
    }
  };

  return (
    <div className="page-container">
      <Header title="🚚 รายการเบิกจ่ายพัสดุ" subtitle="จัดการการขนส่งและกระจายสินค้า" />

      {/* ปุ่มจำลองการขอเบิก (เพื่อเทสระบบ) */}
      <div className="filter-section">
        <div style={{color: 'var(--text-secondary)'}}>รายการเบิกจ่ายล่าสุด</div>
        <button 
          className="btn-import"
          onClick={async () => {
             try {
               // 1. ดึงสินค้าจากคลัง
               const resP = await fetch('/api/inventory');
               const products = await resP.json();
               if (products.length === 0) return alert('❌ ไม่พบสินค้าในคลัง! กรุณาเพิ่มสินค้าก่อน');

               // 2. ✅ เพิ่มใหม่: ดึงข้อมูลศูนย์พักพิง (เพื่อเอา ID และชื่อ)
               const resC = await fetch('/api/centers');
               const centers = await resC.json();
               if (centers.length === 0) return alert('❌ ไม่พบศูนย์พักพิง! กรุณาเพิ่มศูนย์ในเมนู "จัดการศูนย์พักพิง" ก่อนครับ');

               // 3. สร้างใบเบิก (ใช้ข้อมูลจริงจาก Database ครบถ้วน)
               const mockRequest = {
                 destination: centers[0].name, // ใช้ชื่อศูนย์แรกที่เจอ
                 
                 // ✅ เพิ่ม 2 บรรทัดนี้เพื่อให้ผ่าน Validation ของ Database
                 centerId: centers[0]._id,
                 centerName: centers[0].name,

                 items: [{
                   productId: products[0]._id,
                   productName: products[0].name,
                   quantity: 5,
                   unit: products[0].unit || 'หน่วย' // กันเหนียวถ้าไม่มีหน่วย
                 }]
               };

               console.log("Sending Request:", mockRequest);

               const res = await fetch('/api/transfers', {
                 method: 'POST', 
                 headers: { 'Content-Type': 'application/json' },
                 body: JSON.stringify(mockRequest)
               });

               if (!res.ok) {
                 const errData = await res.json();
                 throw new Error(errData.error || 'Server Error');
               }

               alert('✅ สร้างใบเบิกสำเร็จ! (บันทึกลง Database แล้ว)');
               fetchTransfers(); // โหลดตารางใหม่ทันที

             } catch (error: any) {
               console.error(error);
               alert('❌ เกิดข้อผิดพลาด: ' + error.message);
             }
          }}
        >
          + สร้างใบเบิก
        </button>
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>เลขที่เอกสาร</th>
              <th>ปลายทาง</th>
              <th>รายการสินค้า</th>
              <th>วันที่ขอ</th>
              <th>สถานะ</th>
              <th>จัดการ</th>
            </tr>
          </thead>
          <tbody>
            {transfers.map((t) => (
              <tr key={t._id}>
                <td style={{fontWeight:'bold', color:'var(--accent-purple)'}}>{t.docNo}</td>
                <td>{t.destination}</td>
                <td>
                  {t.items.map((item, i) => (
                    <div key={i} style={{fontSize:'0.9rem'}}>
                      • {item.productName} ({item.quantity} {item.unit})
                    </div>
                  ))}
                </td>
                <td style={{fontSize:'0.85rem', color:'var(--text-secondary)'}}>
                    {new Date(t.createdAt).toLocaleDateString('th-TH')}
                </td>
                <td>{getStatusBadge(t.status)}</td>
                <td>
                  {t.status === 'pending' && (
                    <div className="action-buttons">
                      <button 
                        onClick={() => handleAction(t._id, 'approve')}
                        className="btn-action btn-edit" title="อนุมัติ" style={{color:'#2e7d32', background:'#e8f5e9'}}>
                        ✓
                      </button>
                      <button 
                        onClick={() => handleAction(t._id, 'reject')}
                        className="btn-action btn-delete" title="ปฏิเสธ">
                        ✕
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {transfers.length === 0 && <div className="no-results">ไม่มีรายการเบิกจ่าย</div>}
      </div>
    </div>
  );
}