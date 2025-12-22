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

  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    const res = await fetch('/api/inventory');
    const data = await res.json();
    setProducts(data);
  };

  // ฟังก์ชันคำนวณสถานะสต็อก
  const getStockStatus = (qty: number, min: number) => {
    if (qty === 0) return { label: 'หมดสต็อก', class: 'inactive' }; // แดง
    if (qty <= min) return { label: 'ต้องเติมด่วน', class: 'inactive' }; // แดง (ใช้ style เดียวกัน)
    if (qty <= min * 1.5) return { label: 'เริ่มน้อย', class: 'active' }; // เขียว (หรือจะทำสีส้มเพิ่มก็ได้)
    return { label: 'ปกติ', class: 'active' };
  };

  // กรองข้อมูล
  const filteredProducts = filter === 'all' 
    ? products 
    : products.filter(p => p.category === filter);

  // ฟังก์ชันปรับยอด (จำลองการกดปุ่ม + / -)
  const updateStock = async (product: Product, change: number) => {
    const newQty = Math.max(0, product.quantity + change);
    
    // อัปเดต UI ทันที (Optimistic Update)
    const updatedList = products.map(p => p._id === product._id ? { ...p, quantity: newQty } : p);
    setProducts(updatedList);

    // ยิง API ไปบันทึก
    await fetch('/api/inventory', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ _id: product._id, quantity: newQty })
    });
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
             <span className="search-icon"></span>
             <input type="text" className="search-input-table" placeholder="ค้นหาพัสดุ..." />
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
        <button className="btn-import" onClick={() => alert('ฟีเจอร์เพิ่มสินค้าใหม่กำลังพัฒนา')}>
           + เพิ่มสินค้าใหม่
        </button>
      </div>

      {/* Inventory Table */}
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>ชื่อรายการ</th>
              <th>หมวดหมู่</th>
              <th>สถานที่จัดเก็บ</th>
              <th>คงเหลือ</th>
              <th>สถานะ</th>
              <th>ปรับยอดด่วน</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.map((item) => {
              const status = getStockStatus(item.quantity, item.minLevel);
              return (
                <tr key={item._id}>
                  <td>
                    <div className="center-name">
                      <strong>{item.name}</strong>
                      <div className="center-location">Min: {item.minLevel} {item.unit}</div>
                    </div>
                  </td>
                  <td>
                    <span style={{ 
                      padding: '4px 8px', borderRadius: '4px', fontSize: '12px',
                      background: 'var(--hover-color)', color: 'var(--text-secondary)'
                    }}>
                      {item.category === 'food' ? ' อาหาร' : 
                       item.category === 'medicine' ? ' ยา' : 
                       item.category === 'equipment' ? ' อุปกรณ์' : ' อื่นๆ'}
                    </span>
                  </td>
                  <td className="center-location"> {item.location}</td>
                  <td className="center-capacity" style={{ fontSize: '1.1rem' }}>
                    {item.quantity.toLocaleString()} {item.unit}
                  </td>
                  <td>
                    <span className={`status-badge ${status.class}`}>
                      {status.label}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '5px' }}>
                      <button 
                        onClick={() => updateStock(item, -10)}
                        className="btn-action btn-delete" 
                        title="เบิกของ (-10)"
                      >
                        -
                      </button>
                      <button 
                        onClick={() => updateStock(item, 10)}
                        className="btn-action btn-edit" 
                        title="เติมของ (+10)"
                      >
                        +
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        
        {products.length === 0 && (
           <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
              คลังสินค้าว่างเปล่า (กรุณาเพิ่มสินค้าผ่าน Console หรือรอทีมงานเพิ่มให้)
           </div>
        )}
      </div>
    </div>
  );
}