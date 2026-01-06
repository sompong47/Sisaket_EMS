'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

// --- Type Definitions ---
interface RequestItem {
  productId: string;
  productName: string;
  quantity: number;
  unit: string;
  category?: string;
}

interface Center { _id: string; name: string; location: string; }
interface Product { _id: string; name: string; quantity: number; unit: string; category: string; }

export default function RequestPage() {
  // --- State ---
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  
  // Data
  const [centers, setCenters] = useState<Center[]>([]);
  const [inventory, setInventory] = useState<Product[]>([]);

  // Selection
  const [selectedCenter, setSelectedCenter] = useState<Center | null>(null);
  const [cart, setCart] = useState<RequestItem[]>([]);

  // Search
  const [searchCenter, setSearchCenter] = useState('');
  const [searchProduct, setSearchProduct] = useState('');

  // --- Init ---
  useEffect(() => {
    fetch('/api/centers').then(res => res.json()).then(setCenters).catch(console.error);
    fetch('/api/inventory').then(res => res.json()).then(setInventory).catch(console.error);
  }, []);

  // --- Helpers ---
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'food': return '🍱';
      case 'medicine': return '💊';
      case 'clothing': return '👕';
      case 'equipment': return '🔦';
      default: return '📦';
    }
  };

  // --- Cart Logic ---
  const addToCart = (product: Product) => {
    const existing = cart.find(item => item.productId === product._id);
    if (existing) {
      updateQuantity(product._id, existing.quantity + 1);
    } else {
      setCart([...cart, {
        productId: product._id,
        productName: product.name,
        quantity: 1,
        unit: product.unit,
        category: product.category
      }]);
    }
  };

  const removeFromCart = (productId: string) => {
    setCart(cart.filter(item => item.productId !== productId));
  };

  const updateQuantity = (productId: string, newQty: number) => {
    setCart(cart.map(item => {
      if (item.productId === productId) {
        return { ...item, quantity: Math.max(1, newQty) };
      }
      return item;
    }));
  };

  // --- Submit ---
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

      if (!res.ok) throw new Error('ส่งคำขอไม่สำเร็จ');

      alert('✅ ส่งคำขอความช่วยเหลือเรียบร้อย! \nกรุณารอเจ้าหน้าที่อนุมัติและจัดส่ง');
      
      // Reset
      setCurrentStep(1);
      setCart([]);
      setSelectedCenter(null);
      setSearchCenter('');
      setSearchProduct('');

    } catch (error: any) {
      alert('❌ เกิดข้อผิดพลาด: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f5', padding: '20px', fontFamily: '"Prompt", sans-serif' }}>
      
      {/* Container Box */}
      <div style={{
        maxWidth: '1000px', margin: '0 auto', background: 'white',
        borderRadius: '20px', boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
        overflow: 'hidden', display: 'flex', flexDirection: 'column',
        height: '90vh' // Fix height to allow internal scrolling
      }}>

        {/* Header / Stepper */}
        <div style={{ padding: '20px 30px', background: 'white', borderBottom: '1px solid #eee' }}>
          <div style={{ textAlign: 'center', marginBottom: '20px' }}>
            <h1 style={{ margin: 0, color: '#d32f2f', fontSize: '1.8rem' }}>🆘 แจ้งขอความช่วยเหลือ</h1>
            <p style={{ margin: '5px 0 0', color: '#666' }}>ระบบเบิกจ่ายพัสดุฉุกเฉิน (Sisaket EMS)</p>
          </div>

          {/* Steps Indicator */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '40px', position: 'relative' }}>
            <div style={{ position: 'absolute', top: '15px', left: '20%', right: '20%', height: '2px', background: '#eee', zIndex: 0 }} />
            
            {[1, 2, 3].map((step, idx) => {
              const isActive = currentStep >= step;
              const labels = ['เลือกศูนย์ของคุณ', 'เลือกสิ่งของ', 'ยืนยัน'];
              return (
                <div key={step} style={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
                  <div style={{
                    width: '32px', height: '32px', borderRadius: '50%',
                    background: isActive ? '#d32f2f' : '#eee', color: isActive ? 'white' : '#999',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold',
                    margin: '0 auto 5px'
                  }}>
                    {step}
                  </div>
                  <span style={{ fontSize: '0.85rem', color: isActive ? '#333' : '#999', fontWeight: isActive ? 'bold' : 'normal' }}>
                    {labels[idx]}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Body Content */}
        <div style={{ flex: 1, padding: '30px', background: '#fafafa', overflowY: 'auto' }}>
          
          {/* --- STEP 1: Identify Center --- */}
          {currentStep === 1 && (
            <div style={{ maxWidth: '600px', margin: '0 auto', height: '100%', display: 'flex', flexDirection: 'column' }}>
              <h3 style={{ textAlign: 'center', marginBottom: '20px' }}>📍 คุณกำลังขอความช่วยเหลือให้ศูนย์ไหน?</h3>
              
              <input 
                type="text" 
                placeholder="🔍 พิมพ์ชื่อศูนย์พักพิง..." 
                value={searchCenter}
                onChange={(e) => setSearchCenter(e.target.value)}
                style={{
                  width: '100%', padding: '15px', borderRadius: '12px', border: '1px solid #ddd',
                  fontSize: '1rem', marginBottom: '20px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)'
                }}
              />

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', flex: 1, overflowY: 'auto' }}>
                {centers.filter(c => c.name.toLowerCase().includes(searchCenter.toLowerCase())).map(center => (
                  <div 
                    key={center._id}
                    onClick={() => setSelectedCenter(center)}
                    style={{
                      padding: '20px', background: 'white', borderRadius: '12px', cursor: 'pointer',
                      border: selectedCenter?._id === center._id ? '2px solid #d32f2f' : '1px solid #eee',
                      backgroundColor: selectedCenter?._id === center._id ? '#fff5f5' : 'white',
                      transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: '15px'
                    }}
                  >
                    <div style={{ fontSize: '1.5rem' }}>🏥</div>
                    <div>
                      <div style={{ fontWeight: 'bold', fontSize: '1.1rem', color: '#333' }}>{center.name}</div>
                      <div style={{ color: '#666', fontSize: '0.9rem' }}>{center.location}</div>
                    </div>
                    {selectedCenter?._id === center._id && <div style={{ marginLeft: 'auto', color: '#d32f2f', fontSize: '1.5rem' }}>✔</div>}
                  </div>
                ))}
                {centers.length === 0 && <div style={{ textAlign: 'center', color: '#999', padding: '20px' }}>กำลังโหลดรายชื่อ...</div>}
              </div>
            </div>
          )}

          {/* --- STEP 2: Select Items (Grid Layout) --- */}
          {currentStep === 2 && (
            <div style={{ display: 'flex', gap: '20px', height: '100%', flexDirection: 'column' }}>
              <div style={{ textAlign: 'center', marginBottom: '10px' }}>
                <h3>📦 เลือกสิ่งของที่ต้องการเบิก</h3>
                <p style={{ color: '#666', fontSize: '0.9rem' }}>ศูนย์: {selectedCenter?.name}</p>
              </div>

              <div style={{ display: 'flex', gap: '20px', flex: 1, overflow: 'hidden' }}>
                {/* Left: Product Grid */}
                <div style={{ flex: 2, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                  <input 
                    type="text" placeholder="🔍 ค้นหาสิ่งของ..."
                    value={searchProduct} onChange={e => setSearchProduct(e.target.value)}
                    style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #ddd', marginBottom: '15px' }}
                  />
                  <div style={{ 
                    display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', 
                    gap: '15px', overflowY: 'auto', paddingBottom: '10px', paddingRight: '5px'
                  }}>
                    {inventory.filter(p => p.name.toLowerCase().includes(searchProduct.toLowerCase())).map(product => {
                      const inCart = cart.find(c => c.productId === product._id);
                      return (
                        <div key={product._id} 
                          onClick={() => addToCart(product)}
                          style={{
                            background: inCart ? '#fff5f5' : 'white',
                            border: inCart ? '2px solid #ef5350' : '1px solid #eee',
                            borderRadius: '12px', padding: '15px', cursor: 'pointer',
                            display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center',
                            transition: 'all 0.2s', boxShadow: '0 2px 5px rgba(0,0,0,0.02)'
                          }}
                        >
                          <div style={{ fontSize: '2.5rem', marginBottom: '10px' }}>{getCategoryIcon(product.category)}</div>
                          <div style={{ fontWeight: '600', fontSize: '0.9rem', marginBottom: '5px', color: '#333' }}>{product.name}</div>
                          <div style={{ fontSize: '0.8rem', color: '#888' }}>คงเหลือ: {product.quantity}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Right: Cart */}
                <div style={{ 
                  flex: 1, background: 'white', borderRadius: '16px', padding: '20px', 
                  border: '1px solid #eee', display: 'flex', flexDirection: 'column',
                  boxShadow: '0 5px 15px rgba(0,0,0,0.05)'
                }}>
                  <h4 style={{ margin: '0 0 15px 0', borderBottom: '1px solid #eee', paddingBottom: '10px' }}>
                    รายการที่เลือก ({cart.length})
                  </h4>
                  <div style={{ flex: 1, overflowY: 'auto' }}>
                    {cart.length === 0 ? (
                      <div style={{ textAlign: 'center', color: '#ccc', marginTop: '50px' }}>
                        <div style={{ fontSize: '2rem' }}>🛒</div>
                        ยังไม่ได้เลือกสินค้า
                      </div>
                    ) : (
                      cart.map(item => (
                        <div key={item.productId} style={{ 
                          display: 'flex', alignItems: 'center', gap: '10px', 
                          marginBottom: '10px', paddingBottom: '10px', borderBottom: '1px solid #f9f9f9' 
                        }}>
                          <div style={{ fontSize: '1.5rem' }}>{getCategoryIcon(item.category || '')}</div>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: '0.9rem', fontWeight: '600' }}>{item.productName}</div>
                            <div style={{ fontSize: '0.8rem', color: '#888' }}>{item.unit}</div>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '5px', background: '#f5f5f5', borderRadius: '8px', padding: '2px' }}>
                            <button onClick={() => updateQuantity(item.productId, item.quantity - 1)} style={{ width:'28px', border:'none', background:'transparent', cursor:'pointer', fontWeight:'bold' }}>-</button>
                            <span style={{ fontSize: '0.9rem', fontWeight: 'bold', width: '24px', textAlign: 'center' }}>{item.quantity}</span>
                            <button onClick={() => updateQuantity(item.productId, item.quantity + 1)} style={{ width:'28px', border:'none', background:'transparent', cursor:'pointer', fontWeight:'bold' }}>+</button>
                          </div>
                          <button onClick={() => removeFromCart(item.productId)} style={{ color: '#ef5350', border: 'none', background: 'transparent', cursor: 'pointer', fontSize: '1.2rem', padding:'0 5px' }}>×</button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* --- STEP 3: Confirm --- */}
          {currentStep === 3 && (
            <div style={{ maxWidth: '600px', margin: '0 auto', textAlign: 'center' }}>
              <div style={{ fontSize: '4rem', marginBottom: '20px' }}>📝</div>
              <h2 style={{ color: '#333' }}>ตรวจสอบข้อมูล</h2>
              <p style={{ color: '#666', marginBottom: '30px' }}>กรุณาตรวจสอบความถูกต้องก่อนส่งคำขอ</p>

              <div style={{ background: 'white', padding: '25px', borderRadius: '16px', boxShadow: '0 5px 15px rgba(0,0,0,0.05)', textAlign: 'left' }}>
                <div style={{ marginBottom: '20px', borderBottom: '1px solid #eee', paddingBottom: '15px' }}>
                  <label style={{ fontSize: '0.85rem', color: '#999' }}>ผู้ขอเบิก (ศูนย์พักพิง)</label>
                  <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#333', marginTop: '5px' }}>
                    🏥 {selectedCenter?.name}
                  </div>
                  <div style={{ fontSize: '0.9rem', color: '#666' }}>{selectedCenter?.location}</div>
                </div>

                <div>
                  <label style={{ fontSize: '0.85rem', color: '#999' }}>รายการสิ่งของ</label>
                  <div style={{ marginTop: '10px' }}>
                    {cart.map((item, idx) => (
                      <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f5f5f5' }}>
                        <span style={{ color: '#333' }}>• {item.productName}</span>
                        <span style={{ fontWeight: 'bold' }}>x {item.quantity} {item.unit}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Footer Actions */}
        <div style={{ padding: '20px 30px', background: 'white', borderTop: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          
          {currentStep === 1 ? (
            <Link href="/staff" style={{ color: '#666', textDecoration: 'none', fontSize: '0.9rem' }}>
              ← กลับ Dashboard
            </Link>
          ) : (
            <button 
              onClick={() => setCurrentStep(currentStep - 1)}
              style={{ background: 'transparent', border: '1px solid #ddd', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', color: '#555' }}
            >
              ย้อนกลับ
            </button>
          )}

          {currentStep < 3 ? (
            <button 
              onClick={() => {
                if (currentStep === 1 && !selectedCenter) return alert('กรุณาเลือกศูนย์พักพิง');
                if (currentStep === 2 && cart.length === 0) return alert('กรุณาเลือกสิ่งของอย่างน้อย 1 ชิ้น');
                setCurrentStep(currentStep + 1);
              }}
              style={{ background: '#d32f2f', color: 'white', border: 'none', padding: '12px 30px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '1rem', boxShadow: '0 4px 10px rgba(211, 47, 47, 0.3)' }}
            >
              ถัดไป →
            </button>
          ) : (
            <button 
              onClick={handleSubmit}
              disabled={loading}
              style={{ background: '#ef6c00', color: 'white', border: 'none', padding: '12px 30px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '1rem', boxShadow: '0 4px 10px rgba(239, 108, 0, 0.3)' }}
            >
              {loading ? 'กำลังส่งข้อมูล...' : '🚀 ยืนยันการขอความช่วยเหลือ'}
            </button>
          )}

        </div>

      </div>
    </div>
  );
}