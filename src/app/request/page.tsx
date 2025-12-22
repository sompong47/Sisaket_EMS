'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import '@/styles/auth.css';

interface Center { _id: string; name: string; }
interface Product { _id: string; name: string; unit: string; quantity: number; }

export default function RequestPage() {
  const router = useRouter();
  const [centers, setCenters] = useState<Center[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  
  // Form State
  const [selectedCenterId, setSelectedCenterId] = useState('');
  const [selectedProduct, setSelectedProduct] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);

  // Search State
  const [centerSearch, setCenterSearch] = useState('');
  const [showCenterList, setShowCenterList] = useState(false);
  const [filteredCenters, setFilteredCenters] = useState<Center[]>([]);
  
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch('/api/centers').then(res => res.json()).then(data => {
      setCenters(data);
      setFilteredCenters(data);
    });
    fetch('/api/inventory').then(res => res.json()).then(setProducts);

    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setShowCenterList(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearchChange = (text: string) => {
    setCenterSearch(text);
    setSelectedCenterId('');
    setShowCenterList(true);
    
    const filtered = centers.filter(c => 
      c.name.toLowerCase().includes(text.toLowerCase())
    );
    setFilteredCenters(filtered);
  };

  const selectCenter = (center: Center) => {
    setCenterSearch(center.name);
    setSelectedCenterId(center._id);
    setShowCenterList(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCenterId) return alert('❌ กรุณาเลือกศูนย์พักพิงให้ถูกต้อง (เลือกจากรายการ)');

    setLoading(true);

    try {
      const centerData = centers.find(c => c._id === selectedCenterId);
      const productData = products.find(p => p._id === selectedProduct);

      if (!centerData || !productData) throw new Error('ข้อมูลไม่ครบถ้วน');

      const res = await fetch('/api/transfers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          destination: centerData.name,
          centerId: centerData._id,
          centerName: centerData.name,
          items: [{
            productId: productData._id,
            productName: productData.name,
            quantity: Number(quantity),
            unit: productData.unit
          }]
        })
      });

      if (!res.ok) throw new Error('ส่งข้อมูลไม่สำเร็จ');

      alert('✅ ส่งคำขอเรียบร้อย! กรุณารอเจ้าหน้าที่อนุมัติ');
      setQuantity(1);
      setSelectedProduct('');
      setCenterSearch('');
      setSelectedCenterId('');

    } catch (error) {
      alert('❌ เกิดข้อผิดพลาด: ' + error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container" style={{ background: '#f5f5f5' }}>
      <div className="auth-card" style={{ maxWidth: '500px', textAlign: 'left' }}>
        
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <div style={{ fontSize: '3rem', marginBottom: '10px' }}>🆘</div>
          <h1 className="auth-title">แจ้งขอความช่วยเหลือ</h1>
          <p className="auth-subtitle">ระบบเบิกจ่ายพัสดุฉุกเฉิน (Sisaket EMS)</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          
          {/* 1. ช่องค้นหาศูนย์พักพิง */}
          <div className="form-group" ref={wrapperRef} style={{ position: 'relative' }}>
            <label> ค้นหาศูนย์พักพิงของคุณ</label>
            <input 
              type="text"
              className="auth-input"
              placeholder="พิมพ์ชื่อศูนย์... (เช่น วัดบ้านนา)"
              value={centerSearch}
              onChange={(e) => handleSearchChange(e.target.value)}
              onFocus={() => setShowCenterList(true)}
              required
            />
            
            {/* รายการ Dropdown */}
            {showCenterList && (
              <div style={{
                position: 'absolute',
                top: '100%', left: 0, right: 0,
                background: 'white',
                border: '1px solid #ddd',
                borderRadius: '8px',
                maxHeight: '200px',
                overflowY: 'auto',
                zIndex: 10,
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
              }}>
                {filteredCenters.length > 0 ? (
                  filteredCenters.map(c => (
                    <div 
                      key={c._id}
                      onClick={() => selectCenter(c)}
                      style={{
                        padding: '12px 16px',
                        cursor: 'pointer',
                        borderBottom: '1px solid #eee',
                        transition: 'background 0.2s',
                        color: '#333' // ✅ แก้ตรงนี้: บังคับตัวหนังสือสีเข้ม
                      }}
                      onMouseOver={(e) => e.currentTarget.style.background = '#f5f5f5'}
                      onMouseOut={(e) => e.currentTarget.style.background = 'white'}
                    >
                      {c.name}
                    </div>
                  ))
                ) : (
                  <div style={{ padding: '12px', color: '#666', textAlign: 'center' }}> {/* ✅ แก้สีตรงนี้ด้วย */}
                    ✖ ไม่พบชื่อศูนย์นี้
                  </div>
                )}
              </div>
            )}
          </div>

          <hr style={{ margin: '10px 0', border: 'none', borderTop: '1px solid #eee' }} />

          {/* 2. เลือกสิ่งของ */}
          <div className="form-group">
            <label> สิ่งของที่ต้องการเบิก</label>
            <select 
              className="auth-input" 
              value={selectedProduct}
              onChange={e => setSelectedProduct(e.target.value)}
              required
            >
              <option value="">-- เลือกรายการ --</option>
              {products.map(p => (
                <option key={p._id} value={p._id}>
                  {p.name} (คงเหลือ: {p.quantity} {p.unit})
                </option>
              ))}
            </select>
          </div>

          {/* 3. ระบุจำนวน */}
          <div className="form-group">
            <label> จำนวน</label>
            <div style={{ display: 'flex', gap: '10px' }}>
              <input 
                type="number" 
                className="auth-input" 
                min="1"
                value={quantity}
                onChange={e => setQuantity(Number(e.target.value))}
                required 
                style={{ flex: 1 }}
              />
              <div style={{ 
                display: 'flex', alignItems: 'center', background: '#eee', 
                padding: '0 15px', borderRadius: '8px', color: '#333' // ✅ แก้สีหน่วยนับให้เข้มขึ้น
              }}>
                {products.find(p => p._id === selectedProduct)?.unit || 'หน่วย'}
              </div>
            </div>
          </div>

          <button 
            type="submit" 
            className="auth-button" 
            style={{ background: '#ef6c00', marginTop: '20px' }}
            disabled={loading}
          >
            {loading ? ' กำลังส่งข้อมูล...' : ' ส่งคำขอเบิกของ'}
          </button>

        </form>

        <div style={{ marginTop: '20px', textAlign: 'center' }}>
          <a href="/login" style={{ fontSize: '0.9rem', color: '#666', textDecoration: 'none' }}>
            ← กลับไปหน้าเจ้าหน้าที่ (Admin)
          </a>
        </div>

      </div>
    </div>
  );
}