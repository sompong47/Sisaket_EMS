'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import '@/styles/auth.css'; // ใช้ CSS ชุดเดิมเพื่อให้ Theme เหมือนกัน

interface Center {
  _id: string;
  name: string;
  location: string;
  population: number;
  capacity: number;
}

export default function UpdatePopulationPage() {
  const [centers, setCenters] = useState<Center[]>([]);
  
  // State สำหรับฟอร์ม
  const [selectedCenterId, setSelectedCenterId] = useState('');
  const [population, setPopulation] = useState<number | ''>(''); // ยอดคนปัจจุบัน
  const [capacity, setCapacity] = useState(0); // ความจุ (เอาไว้โชว์เทียบ)
  const [loading, setLoading] = useState(false);

  // State สำหรับค้นหา (Searchable Dropdown)
  const [centerSearch, setCenterSearch] = useState('');
  const [showCenterList, setShowCenterList] = useState(false);
  const [filteredCenters, setFilteredCenters] = useState<Center[]>([]);
  
  const wrapperRef = useRef<HTMLDivElement>(null);

  // 1. โหลดข้อมูลศูนย์ทั้งหมดตอนเข้าหน้าเว็บ
  useEffect(() => {
    fetch('/api/centers').then(res => res.json()).then(data => {
      setCenters(data);
      setFilteredCenters(data);
    });

    // คลิกนอกกรอบเพื่อปิด Dropdown
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setShowCenterList(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ฟังก์ชันพิมพ์ค้นหา
  const handleSearchChange = (text: string) => {
    setCenterSearch(text);
    setSelectedCenterId(''); // ถ้าพิมพ์ใหม่ ให้เคลียร์ค่าเดิม
    setPopulation(''); // เคลียร์ตัวเลข
    setShowCenterList(true);
    
    const filtered = centers.filter(c => 
      c.name.toLowerCase().includes(text.toLowerCase())
    );
    setFilteredCenters(filtered);
  };

  // ฟังก์ชันเลือกศูนย์จากรายการ
  const selectCenter = (center: Center) => {
    setCenterSearch(center.name);
    setSelectedCenterId(center._id);
    
    // ✅ UX: ดึงยอดเดิมมาใส่ให้เลย ไม่ต้องพิมพ์ใหม่
    setPopulation(center.population); 
    setCapacity(center.capacity);
    
    setShowCenterList(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCenterId) return alert('❌ กรุณาเลือกศูนย์พักพิงให้ถูกต้อง');

    setLoading(true);

    try {
      const res = await fetch('/api/centers/update-population', { // เรียกใช้ API ที่คุณเพิ่งทำ
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          centerId: selectedCenterId,
          population: Number(population)
        })
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'ส่งข้อมูลไม่สำเร็จ');

      alert(`✅ อัปเดตยอดสำเร็จ! \nศูนย์: ${data.center} \nยอดปัจจุบัน: ${data.population} คน`);
      
      // อัปเดตข้อมูลใน State หลักด้วย (เผื่อเขาจะแก้ซ้ำ)
      const updatedCenters = centers.map(c => 
        c._id === selectedCenterId ? { ...c, population: Number(population) } : c
      );
      setCenters(updatedCenters);
      setFilteredCenters(updatedCenters);

    } catch (error: any) {
      alert('❌ เกิดข้อผิดพลาด: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // คำนวณเปอร์เซ็นต์ความหนาแน่น (Progress Bar)
  const occupancyRate = capacity > 0 && typeof population === 'number' 
    ? Math.min(100, (population / capacity) * 100) 
    : 0;

  // เลือกสี Progress Bar
  const getProgressColor = () => {
    if (occupancyRate >= 90) return '#ef5350'; // แดง (วิกฤต)
    if (occupancyRate >= 70) return '#ffa726'; // ส้ม (เริ่มแน่น)
    return '#66bb6a'; // เขียว (สบายๆ)
  };

  return (
    <div className="auth-container" style={{ background: '#e8eaf6' }}> {/* พื้นหลังโทนน้ำเงินอ่อน */}
      <div className="auth-card" style={{ maxWidth: '500px', textAlign: 'left' }}>
        
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <div style={{ fontSize: '3rem', marginBottom: '10px' }}>✉</div>
          <h1 className="auth-title" style={{ color: '#3f51b5' }}>อัปเดตยอดผู้อพยพ</h1>
          <p className="auth-subtitle">รายงานสถานการณ์ล่าสุด (Real-time)</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          
          {/* 1. ค้นหาศูนย์ */}
          <div className="form-group" ref={wrapperRef} style={{ position: 'relative' }}>
            <label style={{ color: '#333' }}> ค้นหาศูนย์พักพิงของคุณ</label>
            <input 
              type="text"
              className="auth-input"
              placeholder="พิมพ์ชื่อศูนย์... (เช่น โรงเรียนอนุบาล)"
              value={centerSearch}
              onChange={(e) => handleSearchChange(e.target.value)}
              onFocus={() => setShowCenterList(true)}
              required
            />
            
            {showCenterList && (
              <div style={{
                position: 'absolute', top: '100%', left: 0, right: 0,
                background: 'white', border: '1px solid #ddd', borderRadius: '8px',
                maxHeight: '200px', overflowY: 'auto', zIndex: 10,
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
              }}>
                {filteredCenters.length > 0 ? (
                  filteredCenters.map(c => (
                    <div 
                      key={c._id}
                      onClick={() => selectCenter(c)}
                      style={{
                        padding: '12px 16px', cursor: 'pointer',
                        borderBottom: '1px solid #eee', color: '#333' // ตัวหนังสือสีเข้ม
                      }}
                      onMouseOver={(e) => e.currentTarget.style.background = '#f5f5f5'}
                      onMouseOut={(e) => e.currentTarget.style.background = 'white'}
                    >
                      {c.name}
                    </div>
                  ))
                ) : (
                  <div style={{ padding: '12px', color: '#666', textAlign: 'center' }}>✖ ไม่พบชื่อศูนย์นี้</div>
                )}
              </div>
            )}
          </div>

          {/* แสดงสถานะปัจจุบันเมื่อเลือกศูนย์แล้ว */}
          {selectedCenterId && (
            <div style={{ 
              background: '#f8f9fa', padding: '15px', borderRadius: '8px', 
              marginBottom: '20px', border: '1px solid #e0e0e0' 
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', marginBottom: '5px', color: '#555' }}>
                <span>ความจุทั้งหมด: {capacity.toLocaleString()} คน</span>
                <span>หนาแน่น: {occupancyRate.toFixed(1)}%</span>
              </div>
              {/* Progress Bar */}
              <div style={{ height: '8px', background: '#e0e0e0', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ 
                  width: `${occupancyRate}%`, 
                  height: '100%', 
                  background: getProgressColor(),
                  transition: 'width 0.3s ease'
                }}></div>
              </div>
            </div>
          )}

          {/* 2. กรอกตัวเลข */}
          <div className="form-group">
            <label style={{ color: '#333' }}> จำนวนผู้พักพิงปัจจุบัน (คน)</label>
            <input 
              type="number" 
              className="auth-input" 
              min="0"
              value={population}
              onChange={(e) => setPopulation(e.target.value === '' ? '' : Number(e.target.value))}
              placeholder="ระบุตัวเลขล่าสุด..."
              required 
              style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#3f51b5' }}
            />
          </div>

          <button 
            type="submit" 
            className="auth-button" 
            style={{ background: '#3f51b5', marginTop: '10px' }}
            disabled={loading}
          >
            {loading ? ' กำลังบันทึก...' : ' บันทึกยอดล่าสุด'}
          </button>

        </form>

        <div style={{ marginTop: '20px', textAlign: 'center' }}>
          <Link href="/" style={{ fontSize: '0.9rem', color: '#666', textDecoration: 'none' }}>
            ← กลับหน้าหลัก
          </Link>
        </div>

      </div>
    </div>
  );
}