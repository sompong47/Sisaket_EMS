'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/layout/Header';
import '@/styles/table.css';

interface Product {
  _id: string;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  minLevel: number;
  location: string;
}

export default function InventoryPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [filter, setFilter] = useState('all');
  const [searchText, setSearchText] = useState('');
  
  // State สำหรับ Modal และ Form
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '', category: 'food', quantity: 0, unit: 'ชิ้น', minLevel: 10, location: ''
  });

  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    try {
      const res = await fetch('/api/inventory');
      const data = await res.json();
      if(Array.isArray(data)) setProducts(data);
    } catch (error) {
      console.error('Error fetching inventory:', error);
    }
  };

  const getStockStatus = (qty: number, min: number) => {
    if (qty === 0) return { label: 'หมดสต็อก', color: '#ef5350', bg: '#ffebee' };
    if (qty <= min) return { label: 'ต้องเติม', color: '#ffa726', bg: '#fff3e0' };
    return { label: 'ปกติ', color: '#66bb6a', bg: '#e8f5e9' };
  };

  const getCategoryIcon = (cat: string) => {
    switch (cat) {
      case 'food': return '🍱';
      case 'medicine': return '💊';
      case 'equipment': return '🔦';
      case 'clothing': return '👕';
      default: return '📦';
    }
  };

  // Filter Logic
  const filteredProducts = products.filter(p => {
    const matchesCategory = filter === 'all' || p.category === filter;
    const matchesSearch = p.name.toLowerCase().includes(searchText.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // ฟังก์ชันปรับยอด (+/-)
  const updateStock = async (product: Product, change: number) => {
    const newQty = Math.max(0, product.quantity + change);
    // Optimistic Update (แก้หน้าจอทันทีไม่ต้องรอ API)
    setProducts(prev => prev.map(p => p._id === product._id ? { ...p, quantity: newQty } : p));

    try {
      await fetch('/api/inventory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ _id: product._id, quantity: newQty })
      });
    } catch (error) {
      console.error('Update failed');
      fetchInventory(); // โหลดคืนค่าเดิมถ้าพัง
    }
  };

  // ฟังก์ชันสร้างสินค้าใหม่
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/inventory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (!res.ok) throw new Error('Failed to create');

      alert('✅ เพิ่มสินค้าเรียบร้อย');
      setShowModal(false);
      setFormData({ name: '', category: 'food', quantity: 0, unit: 'ชิ้น', minLevel: 10, location: '' });
      fetchInventory();
    } catch (error) {
      alert('❌ เกิดข้อผิดพลาด');
    }
  };

  return (
    <div className="page-container">
      <Header 
        title=" คลังสินค้าและเวชภัณฑ์" 
        subtitle={`รายการพัสดุทั้งหมด ${products.length} รายการ`} 
      />

      {/* Filter Section */}
      <div className="filter-section">
        <div className="filter-group">
          <div className="search-box">
             <span className="search-icon">🔍</span>
             <input 
               type="text" className="search-input-table" 
               placeholder="ค้นหาพัสดุ..." 
               value={searchText}
               onChange={(e) => setSearchText(e.target.value)}
             />
          </div>
          <select 
            className="filter-select"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="all">หมวดหมู่ทั้งหมด</option>
            <option value="food">อาหารและน้ำดื่ม</option>
            <option value="medicine">ยาและเวชภัณฑ์</option>
            <option value="equipment">อุปกรณ์กู้ภัย</option>
            <option value="clothing">เครื่องนุ่งห่ม</option>
          </select>
        </div>
        <button className="btn-import" onClick={() => setShowModal(true)}>
           + เพิ่มสินค้าใหม่
        </button>
      </div>

      {/* 📦 GRID VIEW: แสดงสินค้าเป็นบล็อก */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', 
        gap: '20px', 
        paddingBottom: '40px' 
      }}>
        {filteredProducts.map((item) => {
          const status = getStockStatus(item.quantity, item.minLevel);
          // คำนวณ % หลอดพลัง (เทียบกับ 2 เท่าของ minLevel เพื่อความสวยงาม)
          const percent = Math.min(100, (item.quantity / (item.minLevel * 2 || 1)) * 100);

          return (
            <div key={item._id} style={{
              background: 'var(--bg-card)', 
              borderRadius: '16px', 
              padding: '20px', 
              border: '1px solid var(--border-color)',
              position: 'relative',
              boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
              transition: 'transform 0.2s',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between'
            }}
            onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-3px)'}
            onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
            >
              {/* Header Card */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '15px' }}>
                <div style={{ 
                  width: '50px', height: '50px', borderRadius: '12px', 
                  background: 'var(--bg-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '2rem'
                }}>
                  {getCategoryIcon(item.category)}
                </div>
                <span style={{ 
                  background: status.bg, color: status.color, 
                  padding: '4px 10px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 'bold' 
                }}>
                  {status.label}
                </span>
              </div>

              {/* Info */}
              <div style={{ marginBottom: '15px' }}>
                <h3 style={{ margin: '0 0 5px 0', fontSize: '1.1rem', color: 'var(--text-primary)' }}>{item.name}</h3>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  📍 {item.location || 'ไม่ระบุที่เก็บ'}
                </div>
              </div>

              {/* Progress Bar & Qty */}
              <div style={{ background: 'var(--bg-primary)', padding: '12px', borderRadius: '12px', marginBottom: '15px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px', alignItems: 'baseline' }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>คงเหลือ</span>
                  <span style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>
                    {item.quantity.toLocaleString()} <span style={{ fontSize: '0.8rem', fontWeight: 'normal' }}>{item.unit}</span>
                  </span>
                </div>
                <div style={{ width: '100%', height: '6px', background: '#ddd', borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{ 
                    width: `${percent}%`, height: '100%', 
                    background: status.color, transition: 'width 0.3s' 
                  }} />
                </div>
                <div style={{ textAlign: 'right', fontSize: '0.75rem', marginTop: '4px', color: '#999' }}>
                  ขั้นต่ำ: {item.minLevel} {item.unit}
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '10px' }}>
                <button 
                  onClick={() => updateStock(item, -1)} 
                  style={{ flex: 1, padding: '8px', borderRadius: '8px', border: '1px solid #ef5350', background: 'transparent', color: '#ef5350', cursor: 'pointer', fontWeight: 'bold' }}
                >
                  - เบิกออก
                </button>
                <button 
                  onClick={() => updateStock(item, 1)} 
                  style={{ flex: 1, padding: '8px', borderRadius: '8px', border: '1px solid #66bb6a', background: 'transparent', color: '#66bb6a', cursor: 'pointer', fontWeight: 'bold' }}
                >
                  + เติมของ
                </button>
              </div>

            </div>
          );
        })}
      </div>
      
      {filteredProducts.length === 0 && (
         <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-secondary)' }}>
           <div style={{ fontSize: '3rem', marginBottom: '10px' }}>📦</div>
           ยังไม่มีสินค้าในระบบ หรือไม่พบคำค้นหา
         </div>
      )}

      {/* 🟢 MODAL: เพิ่มสินค้าใหม่ */}
      {showModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.7)', zIndex: 999,
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }} onClick={() => setShowModal(false)}>
          <div style={{
            background: 'var(--bg-card)', padding: '30px', borderRadius: '16px',
            width: '100%', maxWidth: '500px', border: '1px solid var(--border-color)'
          }} onClick={e => e.stopPropagation()}>
            
            <h2 style={{ marginTop: 0, marginBottom: '20px' }}>เพิ่มสินค้าใหม่เข้าคลัง</h2>
            
            <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '5px' }}>ชื่อสินค้า</label>
                <input 
                  type="text" required className="search-input-table" 
                  value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}
                  placeholder="เช่น ปลากระป๋อง, ยาแก้ปวด..."
                  style={{ width: '100%' }}
                />
              </div>
              
              <div>
                <label style={{ display: 'block', marginBottom: '5px' }}>หมวดหมู่</label>
                <select 
                  className="search-input-table"
                  value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}
                  style={{ width: '100%' }}
                >
                  <option value="food">อาหารและน้ำดื่ม</option>
                  <option value="medicine">ยาและเวชภัณฑ์</option>
                  <option value="equipment">อุปกรณ์กู้ภัย</option>
                  <option value="clothing">เครื่องนุ่งห่ม</option>
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px' }}>จำนวนเริ่มต้น</label>
                  <input 
                    type="number" required className="search-input-table"
                    value={formData.quantity} onChange={e => setFormData({...formData, quantity: Number(e.target.value)})}
                    style={{ width: '100%' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px' }}>หน่วยนับ</label>
                  <input 
                    type="text" required className="search-input-table"
                    value={formData.unit} onChange={e => setFormData({...formData, unit: e.target.value})}
                    placeholder="เช่น ชิ้น, กล่อง"
                    style={{ width: '100%' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px' }}>จุดแจ้งเตือนขั้นต่ำ</label>
                  <input 
                    type="number" required className="search-input-table"
                    value={formData.minLevel} onChange={e => setFormData({...formData, minLevel: Number(e.target.value)})}
                    style={{ width: '100%' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px' }}>สถานที่เก็บ</label>
                  <input 
                    type="text" className="search-input-table"
                    value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})}
                    placeholder="เช่น โซน A"
                    style={{ width: '100%' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <button 
                  type="button" 
                  onClick={() => setShowModal(false)}
                  style={{ flex: 1, padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'transparent', cursor: 'pointer', color: 'var(--text-primary)', fontWeight: 'bold' }}
                >
                  ยกเลิก
                </button>
                <button 
                  type="submit" 
                  className="btn-import"
                  style={{ flex: 1 }}
                >
                  บันทึกสินค้า
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}