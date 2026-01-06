'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/layout/Header';
import '@/styles/table.css';

// --- Type Definitions ---
interface TransferItem {
  productId: string;
  productName: string;
  quantity: number;
  unit: string;
  category?: string; // เพิ่มมาเพื่อโชว์ไอคอน
  maxQuantity?: number; // เพื่อเช็คไม่ให้เบิกเกิน
}

interface Transfer {
  _id: string;
  docNo: string;
  destination: string;
  items: TransferItem[];
  // ✅ เพิ่มสถานะ 'cancelled'
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  createdAt: string;
}

interface Center { _id: string; name: string; location: string; }
interface Product { _id: string; name: string; quantity: number; unit: string; category: string; }

export default function TransfersPage() {
  // --- Main Data State ---
  const [transfers, setTransfers] = useState<Transfer[]>([]);
  const [loading, setLoading] = useState(false);

  // --- Modal & Wizard State ---
  const [showModal, setShowModal] = useState(false);
  const [currentStep, setCurrentStep] = useState(1); // 1=Select Items, 2=Select Center, 3=Confirm

  // --- Resource Data ---
  const [centers, setCenters] = useState<Center[]>([]);
  const [inventory, setInventory] = useState<Product[]>([]);

  // --- Selection State ---
  const [cart, setCart] = useState<TransferItem[]>([]); // สินค้าที่เลือก (หลายชิ้น)
  const [selectedCenter, setSelectedCenter] = useState<Center | null>(null); // ศูนย์ที่เลือก

  // --- Filters ---
  const [searchProduct, setSearchProduct] = useState('');
  const [searchCenter, setSearchCenter] = useState('');

  // --- Initial Fetch ---
  useEffect(() => {
    fetchTransfers();
    // Pre-load data for modal
    fetch('/api/centers').then(res => res.json()).then(setCenters).catch(console.error);
    fetch('/api/inventory').then(res => res.json()).then(setInventory).catch(console.error);
  }, []);

  const fetchTransfers = async () => {
    try {
      const res = await fetch('/api/transfers');
      const data = await res.json();
      if (Array.isArray(data)) setTransfers(data);
    } catch (error) {
      console.error('Error fetching transfers:', error);
    }
  };

  // --- Helper Functions ---
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'food': return '🍱';
      case 'medicine': return '💊';
      case 'clothing': return '👕';
      case 'equipment': return '🔦';
      default: return '📦';
    }
  };

  // ✅ ฟังก์ชันแสดงสถานะ (รวม Cancelled)
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending': return <span className="status-badge" style={{background:'#fff3e0', color:'#ef6c00'}}>⏳ รออนุมัติ</span>;
      case 'approved': return <span className="status-badge active" style={{background:'#e8f5e9', color:'#2e7d32'}}>✅ อนุมัติแล้ว</span>;
      case 'rejected': return <span className="status-badge inactive" style={{background:'#ffebee', color:'#c62828'}}>❌ ปฏิเสธ</span>;
      case 'cancelled': return <span className="status-badge" style={{background:'#f5f5f5', color:'#666', border:'1px solid #ddd'}}>🚫 ยกเลิกแล้ว</span>;
      default: return <span>-</span>;
    }
  };

  // --- Cart Logic (Step 1) ---
  const addToCart = (product: Product) => {
    const existing = cart.find(item => item.productId === product._id);
    if (existing) {
      if (existing.quantity < product.quantity) {
        updateQuantity(product._id, existing.quantity + 1);
      }
    } else {
      setCart([...cart, {
        productId: product._id,
        productName: product.name,
        quantity: 1,
        unit: product.unit,
        category: product.category,
        maxQuantity: product.quantity
      }]);
    }
  };

  const removeFromCart = (productId: string) => {
    setCart(cart.filter(item => item.productId !== productId));
  };

  const updateQuantity = (productId: string, newQty: number) => {
    setCart(cart.map(item => {
      if (item.productId === productId) {
        const validQty = Math.max(1, Math.min(newQty, item.maxQuantity || 9999));
        return { ...item, quantity: validQty };
      }
      return item;
    }));
  };

  // --- Submit Logic (Final Step) ---
  const handleSubmit = async () => {
    if (!selectedCenter || cart.length === 0) return;
    setLoading(true);

    try {
      const payload = {
        destination: selectedCenter.name,
        centerId: selectedCenter._id,
        centerName: selectedCenter.name,
        items: cart.map(({ productId, productName, quantity, unit }) => ({
          productId, productName, quantity, unit
        }))
      };

      const res = await fetch('/api/transfers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) throw new Error('สร้างใบเบิกไม่สำเร็จ');

      alert('✅ สร้างใบเบิกสำเร็จ!');
      closeModal();
      fetchTransfers();
    } catch (error: any) {
      alert('❌ เกิดข้อผิดพลาด: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setCurrentStep(1);
    setCart([]);
    setSelectedCenter(null);
    setSearchProduct('');
    setSearchCenter('');
  };

  // ✅ ฟังก์ชันจัดการ Action (รวม Cancel)
  const handleAction = async (id: string, action: 'approve' | 'reject' | 'cancel') => {
    let confirmMsg = '';
    if (action === 'approve') confirmMsg = 'ยืนยันการอนุมัติและตัดสต็อก?';
    else if (action === 'reject') confirmMsg = 'ต้องการปฏิเสธคำขอนี้?';
    else if (action === 'cancel') confirmMsg = '⚠️ ยืนยันการยกเลิก? \nสินค้าจะถูกคืนเข้าคลังทันที';

    if (!confirm(confirmMsg)) return;

    try {
      const res = await fetch(`/api/transfers/${id}/${action}`, { method: 'POST' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      alert(`✅ ดำเนินการเรียบร้อย`);
      fetchTransfers();
    } catch (error: any) {
      alert(`❌ เกิดข้อผิดพลาด: ${error.message}`);
    }
  };

  return (
    <div className="page-container">
      <Header title=" รายการเบิกจ่ายพัสดุ" subtitle="จัดการการขนส่งและกระจายสินค้า" />

      {/* ปุ่มเปิด Modal */}
      <div className="filter-section">
        <div style={{color: 'var(--text-secondary)'}}>รายการเบิกจ่ายล่าสุด</div>
        <button className="btn-import" onClick={() => setShowModal(true)}>
          + สร้างใบเบิก
        </button>
      </div>

      {/* ตารางแสดงข้อมูล */}
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
                <td style={{fontWeight:'bold', color:'var(--accent-purple)'}}>{t.docNo || '-'}</td>
                <td>{t.destination}</td>
                <td>
                  {t.items.map((item, i) => (
                    <div key={i} style={{fontSize:'0.9rem'}}>
                      • {item.productName} ({item.quantity} {item.unit})
                    </div>
                  ))}
                </td>
                <td style={{fontSize:'0.85rem', color:'var(--text-secondary)'}}>
                    {t.createdAt ? new Date(t.createdAt).toLocaleDateString('th-TH') : '-'}
                </td>
                <td>{getStatusBadge(t.status)}</td>
                <td>
                  {t.status === 'pending' ? (
                    <div className="action-buttons">
                      <button onClick={() => handleAction(t._id, 'approve')} className="btn-action" title="อนุมัติ" style={{color:'white', background:'#2e7d32', border:'none', width:'32px', height:'32px', borderRadius:'6px', cursor:'pointer', marginRight:'5px'}}>✓</button>
                      <button onClick={() => handleAction(t._id, 'reject')} className="btn-action" title="ปฏิเสธ" style={{color:'white', background:'#c62828', border:'none', width:'32px', height:'32px', borderRadius:'6px', cursor:'pointer'}}>✕</button>
                    </div>
                  ) : t.status === 'approved' ? (
                    // ✅ ปุ่มยกเลิก/คืนของ
                    <button 
                      onClick={() => handleAction(t._id, 'cancel')}
                      style={{
                        fontSize:'0.8rem', color:'#d32f2f', background:'transparent', 
                        border:'1px solid #d32f2f', borderRadius:'6px', padding:'4px 8px', cursor:'pointer'
                      }}
                    >
                      ↺ ยกเลิก/คืนของ
                    </button>
                  ) : (
                    <span style={{fontSize:'0.8rem', color:'#999'}}>สิ้นสุด</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {transfers.length === 0 && <div className="no-results" style={{padding:'40px', textAlign:'center', color:'#888'}}>ไม่มีรายการเบิกจ่าย</div>}
      </div>

      {/* 🟢 MODAL: WIZARD STEPPER */}
      {showModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.85)', zIndex: 999,
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          
          <div style={{
            background: 'var(--bg-card)', borderRadius: '20px',
            width: '90%', maxWidth: '900px', height: '85vh',
            display: 'flex', flexDirection: 'column', overflow: 'hidden',
            border: '1px solid var(--border-color)', boxShadow: '0 20px 50px rgba(0,0,0,0.5)'
          }}>
            
            {/* Header Steps */}
            <div style={{ 
              padding: '20px 30px', borderBottom: '1px solid var(--border-color)',
              background: 'var(--bg-primary)', display: 'flex', justifyContent: 'space-between', alignItems: 'center'
            }}>
              <h2 style={{ margin: 0 }}>สร้างคำร้องขอทรัพยากร</h2>
              <div style={{ display: 'flex', gap: '10px' }}>
                 {[1, 2, 3].map(step => (
                   <div key={step} style={{
                     width: '30px', height: '30px', borderRadius: '50%',
                     background: currentStep >= step ? '#3b82f6' : 'var(--border-color)',
                     color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
                     fontWeight: 'bold', fontSize: '0.9rem'
                   }}>
                     {step}
                   </div>
                 ))}
              </div>
            </div>

            {/* Content Body */}
            <div style={{ flex: 1, padding: '30px', overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
              
              {/* --- STEP 1: SELECT PRODUCTS --- */}
              {currentStep === 1 && (
                <div style={{ display: 'flex', gap: '20px', height: '100%' }}>
                  {/* Left: Product Grid */}
                  <div style={{ flex: 2, overflowY: 'auto', paddingRight: '10px' }}>
                    <input 
                      type="text" placeholder="🔍 ค้นหาสินค้า..."
                      value={searchProduct} onChange={e => setSearchProduct(e.target.value)}
                      className="search-input-table" style={{ width: '100%', marginBottom: '20px' }}
                    />
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '15px' }}>
                      {inventory.filter(p => p.name.toLowerCase().includes(searchProduct.toLowerCase())).map(product => {
                        const inCart = cart.find(c => c.productId === product._id);
                        return (
                          <div key={product._id} 
                            onClick={() => addToCart(product)}
                            style={{
                              background: inCart ? 'rgba(59, 130, 246, 0.1)' : 'var(--bg-primary)',
                              border: inCart ? '2px solid #3b82f6' : '1px solid var(--border-color)',
                              borderRadius: '12px', padding: '15px', cursor: 'pointer',
                              display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center',
                              transition: 'all 0.2s'
                            }}
                          >
                            <div style={{ fontSize: '2.5rem', marginBottom: '10px' }}>{getCategoryIcon(product.category)}</div>
                            <div style={{ fontWeight: '600', fontSize: '0.9rem', marginBottom: '5px' }}>{product.name}</div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>คงเหลือ: {product.quantity}</div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Right: Cart (Selected List) */}
                  <div style={{ flex: 1, borderLeft: '1px solid var(--border-color)', paddingLeft: '20px', display: 'flex', flexDirection: 'column' }}>
                    <h3 style={{ margin: '0 0 15px 0' }}>รายการที่เลือก ({cart.length})</h3>
                    <div style={{ flex: 1, overflowY: 'auto' }}>
                      {cart.length === 0 ? (
                        <div style={{ color: 'var(--text-secondary)', textAlign: 'center', marginTop: '50px' }}>ยังไม่ได้เลือกสินค้า</div>
                      ) : (
                        cart.map(item => (
                          <div key={item.productId} style={{ 
                            background: 'var(--bg-primary)', borderRadius: '10px', padding: '10px', marginBottom: '10px',
                            border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '10px'
                          }}>
                            <div style={{ fontSize: '1.5rem' }}>{getCategoryIcon(item.category || '')}</div>
                            <div style={{ flex: 1 }}>
                              <div style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>{item.productName}</div>
                              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>หน่วย: {item.unit}</div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                              <button onClick={() => updateQuantity(item.productId, item.quantity - 1)} style={{ width:'24px', height:'24px', borderRadius:'50%', border:'1px solid #ddd', cursor:'pointer' }}>-</button>
                              <span style={{ fontWeight: 'bold', width: '20px', textAlign: 'center' }}>{item.quantity}</span>
                              <button onClick={() => updateQuantity(item.productId, item.quantity + 1)} style={{ width:'24px', height:'24px', borderRadius:'50%', border:'1px solid #ddd', cursor:'pointer' }}>+</button>
                            </div>
                            <button onClick={() => removeFromCart(item.productId)} style={{ color: '#ef5350', border: 'none', background: 'transparent', cursor: 'pointer', fontSize: '1.2rem' }}>×</button>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* --- STEP 2: SELECT CENTER --- */}
              {currentStep === 2 && (
                <div style={{ maxWidth: '600px', margin: '0 auto', width: '100%' }}>
                  <h3 style={{ textAlign: 'center', marginBottom: '20px' }}>เลือกศูนย์พักพิงปลายทาง</h3>
                  <input 
                    type="text" placeholder="🔍 ค้นหาศูนย์พักพิง..."
                    value={searchCenter} onChange={e => setSearchCenter(e.target.value)}
                    className="search-input-table" style={{ width: '100%', marginBottom: '20px', fontSize: '1.1rem', padding: '15px' }}
                  />
                  <div style={{ maxHeight: '400px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {centers.filter(c => c.name.toLowerCase().includes(searchCenter.toLowerCase())).map(center => (
                      <div key={center._id}
                        onClick={() => setSelectedCenter(center)}
                        style={{
                          background: selectedCenter?._id === center._id ? 'rgba(59, 130, 246, 0.1)' : 'var(--bg-primary)',
                          border: selectedCenter?._id === center._id ? '2px solid #3b82f6' : '1px solid var(--border-color)',
                          borderRadius: '12px', padding: '20px', cursor: 'pointer',
                          display: 'flex', alignItems: 'center', gap: '15px', transition: 'all 0.2s'
                        }}
                      >
                        <div style={{ fontSize: '1.5rem' }}>🏘️</div>
                        <div>
                          <div style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>{center.name}</div>
                          <div style={{ color: 'var(--text-secondary)' }}>📍 {center.location}</div>
                        </div>
                        {selectedCenter?._id === center._id && (
                          <div style={{ marginLeft: 'auto', color: '#3b82f6', fontSize: '1.5rem' }}>✔</div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* --- STEP 3: CONFIRM --- */}
              {currentStep === 3 && (
                <div style={{ maxWidth: '600px', margin: '0 auto', width: '100%', textAlign: 'center' }}>
                  <div style={{ fontSize: '4rem', marginBottom: '20px' }}>📋</div>
                  <h2 style={{ marginBottom: '10px' }}>ตรวจสอบข้อมูลก่อนยืนยัน</h2>
                  <p style={{ color: 'var(--text-secondary)', marginBottom: '30px' }}>
                    กรุณาตรวจสอบรายการสินค้าและปลายทางให้ถูกต้องก่อนสร้างใบเบิก
                  </p>

                  <div style={{ background: 'var(--bg-primary)', padding: '20px', borderRadius: '16px', textAlign: 'left', marginBottom: '20px' }}>
                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '5px' }}>ปลายทาง</div>
                    <div style={{ fontSize: '1.2rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '10px' }}>
                      🏘️ {selectedCenter?.name}
                    </div>
                  </div>

                  <div style={{ background: 'var(--bg-primary)', padding: '20px', borderRadius: '16px', textAlign: 'left', maxHeight: '300px', overflowY: 'auto' }}>
                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '10px' }}>รายการสินค้า ({cart.length})</div>
                    {cart.map((item, idx) => (
                      <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--border-color)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <span>{getCategoryIcon(item.category || '')}</span>
                          <span>{item.productName}</span>
                        </div>
                        <div style={{ fontWeight: 'bold' }}>
                          x {item.quantity} {item.unit}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>

            {/* Footer Buttons */}
            <div style={{ 
              padding: '20px 30px', borderTop: '1px solid var(--border-color)',
              display: 'flex', justifyContent: 'space-between'
            }}>
              {currentStep === 1 ? (
                <button onClick={closeModal} style={{ padding: '12px 24px', borderRadius: '10px', border: '1px solid var(--border-color)', background: 'transparent', cursor: 'pointer', color: 'var(--text-primary)' }}>
                  ยกเลิก
                </button>
              ) : (
                <button onClick={() => setCurrentStep(currentStep - 1)} style={{ padding: '12px 24px', borderRadius: '10px', border: '1px solid var(--border-color)', background: 'transparent', cursor: 'pointer', color: 'var(--text-primary)' }}>
                  ← ย้อนกลับ
                </button>
              )}

              {currentStep < 3 ? (
                <button 
                  onClick={() => {
                    if (currentStep === 1 && cart.length === 0) return alert('กรุณาเลือกสินค้าอย่างน้อย 1 ชิ้น');
                    if (currentStep === 2 && !selectedCenter) return alert('กรุณาเลือกศูนย์พักพิงปลายทาง');
                    setCurrentStep(currentStep + 1);
                  }} 
                  className="btn-import" style={{ padding: '12px 30px', fontSize: '1rem' }}
                >
                  ถัดไป →
                </button>
              ) : (
                <button 
                  onClick={handleSubmit} 
                  className="btn-import" 
                  disabled={loading}
                  style={{ padding: '12px 30px', fontSize: '1rem', background: '#2e7d32' }}
                >
                  {loading ? 'กำลังบันทึก...' : 'ยืนยันและสร้างใบเบิก'}
                </button>
              )}
            </div>

          </div>
        </div>
      )}

    </div>
  );
}