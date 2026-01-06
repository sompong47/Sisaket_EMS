'use client';

import { useState, useEffect, useRef } from 'react';
import Header from '@/components/layout/Header';
import '@/styles/table.css';
import * as XLSX from 'xlsx';

// Type Definitions
interface Beneficiary {
  _id: string;
  firstName: string;
  lastName: string;
  age: number;
  gender: string;
  centerName: string;
  status: string;
  chronicDisease?: string;
}

interface Center {
  _id: string;
  name: string;
}

export default function BeneficiariesPage() {
  const [people, setPeople] = useState<Beneficiary[]>([]);
  const [centers, setCenters] = useState<Center[]>([]); 
  const [filteredPeople, setFilteredPeople] = useState<Beneficiary[]>([]);
  
  // Search & Filter State (สำหรับตารางหลัก)
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'manual' | 'import'>('manual');
  
  // Form State
  const [formData, setFormData] = useState({
    firstName: '', lastName: '', age: '', gender: 'male',
    centerName: '', status: 'normal', chronicDisease: ''
  });

  // ✅ 1. เพิ่ม State สำหรับ Searchable Dropdown ใน Modal
  const [centerSearch, setCenterSearch] = useState(''); // ข้อความที่พิมพ์ในช่องศูนย์
  const [showCenterList, setShowCenterList] = useState(false); // ควบคุมการเปิด/ปิดลิสต์
  const [filteredCenters, setFilteredCenters] = useState<Center[]>([]); // รายชื่อศูนย์ที่กรองแล้ว
  const wrapperRef = useRef<HTMLDivElement>(null); // เอาไว้เช็คว่าคลิกนอกกรอบไหม

  // โหลดข้อมูลเริ่มต้น
  useEffect(() => {
    fetchData();
    
    // โหลดรายชื่อศูนย์พักพิง
    fetch('/api/centers').then(res => res.json()).then(data => {
      setCenters(data);
      setFilteredCenters(data); // เริ่มต้นให้แสดงทั้งหมด
    }).catch(() => {});

    // Event Listener: คลิกที่อื่นเพื่อปิด Dropdown
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setShowCenterList(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchData = async () => {
    const res = await fetch('/api/beneficiaries');
    const data = await res.json();
    if(Array.isArray(data)) {
        setPeople(data);
        setFilteredPeople(data);
    }
  };

  // Filter Logic (ตารางหลัก)
  useEffect(() => {
    let result = [...people];
    if (searchText) {
      const k = searchText.toLowerCase();
      result = result.filter(p => 
        p.firstName.toLowerCase().includes(k) || 
        p.lastName.toLowerCase().includes(k) ||
        p.centerName?.toLowerCase().includes(k)
      );
    }
    if (statusFilter !== 'all') {
      result = result.filter(p => p.status === statusFilter);
    }
    setFilteredPeople(result);
  }, [people, searchText, statusFilter]);

  // ✅ ฟังก์ชันพิมพ์ค้นหาศูนย์ใน Modal
  const handleCenterSearch = (text: string) => {
    setCenterSearch(text);
    setFormData({ ...formData, centerName: '' }); // ถ้าพิมพ์ใหม่ ให้เคลียร์ค่าที่เลือกไว้ก่อน (กันสับสน)
    setShowCenterList(true);
    
    const filtered = centers.filter(c => 
      c.name.toLowerCase().includes(text.toLowerCase())
    );
    setFilteredCenters(filtered);
  };

  // ✅ ฟังก์ชันเลือกศูนย์
  const selectCenter = (center: Center) => {
    setCenterSearch(center.name);
    setFormData({ ...formData, centerName: center.name });
    setShowCenterList(false);
  };

  // Handle Form Submit (Manual Add)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // ตรวจสอบว่าเลือกศูนย์หรือยัง (ใช้ค่าจาก formData.centerName เป็นหลัก)
    if(!formData.centerName) {
      // กรณี user พิมพ์ชื่อศูนย์ถูกต้องเป๊ะๆ แต่ไม่ได้กดเลือกจาก Dropdown เราจะอนุโลมให้
      const match = centers.find(c => c.name === centerSearch);
      if (match) {
        formData.centerName = match.name;
      } else {
        return alert('❌ กรุณาเลือกศูนย์พักพิงจากรายการ');
      }
    }

    const res = await fetch('/api/beneficiaries', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });

    if (res.ok) {
      alert('✅ ลงทะเบียนสำเร็จ');
      setShowModal(false);
      // Reset Form
      setFormData({ firstName: '', lastName: '', age: '', gender: 'male', centerName: '', status: 'normal', chronicDisease: '' });
      setCenterSearch(''); // Reset Search
      fetchData();
    } else {
      alert('❌ เกิดข้อผิดพลาด');
    }
  };

  // Excel import helper
  const importExcelFile = async (file: File) => {
    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const raw = XLSX.utils.sheet_to_json<Record<string, any>>(sheet, { defval: '' });

      const headerMap: Record<string, string[]> = {
        firstName: ['firstname','first name','ชื่อ','ชื่อจริง'],
        lastName: ['lastname','last name','นามสกุล'],
        age: ['age','อายุ'],
        gender: ['gender','เพศ','sex'],
        centerName: ['center','centername','ศูนย์','ศูนย์พักพิง','center name'],
        status: ['status','สถานะ'],
        chronicDisease: ['chronic','disease','โรค','โรคประจำตัว']
      };

      const mapKey = (key: string) => {
        const k = key.toLowerCase().trim();
        for (const target in headerMap) {
          if (headerMap[target].some(h => k === h || k.includes(h))) return target;
        }
        return null;
      };

      const mapped = raw.map(row => {
        const out: any = {};
        for (const [k, v] of Object.entries(row)) {
          const mk = mapKey(k);
          if (!mk) continue;
          out[mk] = mk === 'age' ? Number(v) || 0 : String(v).trim();
        }
        return out;
      });

      if (mapped.length === 0) { alert('ไม่พบข้อมูลที่สามารถนำเข้าได้'); return; }

      const res = await fetch('/api/beneficiaries', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(mapped)
      });

      if (res.ok) {
        alert('นำเข้า Excel สำเร็จ'); setShowModal(false); fetchData();
      } else {
        const err = await res.json().catch(()=>null);
        alert('เกิดข้อผิดพลาดในการนำเข้า: ' + (err?.error || err?.message || res.status));
      }
    } catch (error) {
      console.error(error); alert('ไฟล์ Excel ไม่ถูกต้องหรือเกิดข้อผิดพลาด');
    }
  };

  // Export beneficiaries to Excel
  const handleExportExcel = () => {
    if (people.length === 0) { alert('ไม่มีข้อมูลสำหรับส่งออก'); return; }
    const data = people.map(p => ({ firstName: p.firstName, lastName: p.lastName, age: p.age, gender: p.gender, centerName: p.centerName, status: p.status, chronicDisease: p.chronicDisease }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new(); XLSX.utils.book_append_sheet(wb, ws, 'Beneficiaries');
    const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([wbout], { type: 'application/octet-stream' });
    const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = `beneficiaries_${new Date().toISOString().slice(0,10)}.xlsx`; document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'normal': return <span className="status-badge active" style={{background: 'rgba(38,166,154,0.1)', color:'#26a69a'}}>ปกติ</span>;
      case 'sick': return <span className="status-badge" style={{background: 'rgba(255,167,38,0.1)', color:'#ffa726'}}>ป่วย/โรคประจำตัว</span>;
      case 'disabled': return <span className="status-badge" style={{background: 'rgba(239,83,80,0.1)', color:'#ef5350'}}>ผู้พิการ/ติดเตียง</span>;
      default: return <span className="status-badge inactive">ไม่ระบุ</span>;
    }
  };

  return (
    <div className="page-container">
      <Header title=" รายชื่อผู้ประสบภัย" subtitle={`ลงทะเบียนแล้ว ${people.length} คน`} />

      {/* Filter Section (ตารางหลัก) */}
      <div className="filter-section">
        <div className="filter-group">
          <div className="search-box">
             <span className="search-icon">🔍</span>
             <input 
               type="text" className="search-input-table"
               placeholder="ค้นหา (ชื่อ, นามสกุล, ศูนย์พักพิง)"
               value={searchText} onChange={e => setSearchText(e.target.value)}
             />
          </div>
          <select className="filter-select" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
            <option value="all">สุขภาพทั้งหมด</option>
            <option value="normal">ร่างกายปกติ</option>
            <option value="sick">มีโรคประจำตัว</option>
            <option value="disabled">ผู้พิการ/ติดเตียง</option>
          </select>
        </div>

        <div className="actions-container">
          <label className="btn-file" title="ลากและวางไฟล์ Excel หรือคลิกเพื่อเลือก" onDragOver={(e)=>{e.preventDefault(); (e.dataTransfer as DataTransfer).dropEffect = 'copy';}} onDrop={(e)=>{e.preventDefault(); const f = e.dataTransfer?.files?.[0]; if(f) importExcelFile(f);}}>
            <input type="file" accept=".xlsx,.xls,.csv" style={{display:'none'}} onChange={(e)=>{const f = e.target.files?.[0]; if(f) importExcelFile(f); e.target.value='';}} />
            <span className="btn-file-label">📂 นำเข้า Excel (ลากไฟล์มาวางได้)</span>
          </label>

          <button className="btn-export" onClick={() => handleExportExcel()}>⬇ ส่งออก Excel</button>

          <button className="btn-import btn-add" onClick={() => setShowModal(true)}> + ลงทะเบียน / เพิ่ม</button>
        </div>
      </div>

      {/* Table */}
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>ชื่อ - นามสกุล</th>
              <th>อายุ / เพศ</th>
              <th>ศูนย์พักพิง</th>
              <th>สถานะสุขภาพ</th>
              <th>หมายเหตุ</th>
            </tr>
          </thead>
          <tbody>
            {filteredPeople.map((person) => (
              <tr key={person._id}>
                <td><div style={{fontWeight: 'bold'}}>{person.firstName} {person.lastName}</div></td>
                <td>{person.age} ปี / {person.gender === 'male' ? 'ชาย' : 'หญิง'}</td>
                <td>📍 {person.centerName}</td>
                <td>{getStatusBadge(person.status)}</td>
                <td style={{color: 'var(--text-secondary)'}}>{person.chronicDisease || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredPeople.length === 0 && <div className="no-results">✖ ไม่พบรายชื่อที่ค้นหา</div>}
      </div>

      {/* 🟢 MODAL */}
      {showModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.7)', zIndex: 999,
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }} onClick={() => setShowModal(false)}>
          
          <div style={{
            background: 'var(--bg-card)', padding: '30px', borderRadius: '16px',
            width: '100%', maxWidth: '500px', border: '1px solid var(--border-color)',
            maxHeight: '90vh', overflowY: 'auto' // กันทะลุจอ
          }} onClick={e => e.stopPropagation()}>
            
            <h2 style={{ marginTop: 0, marginBottom: '20px' }}>ลงทะเบียนผู้ประสบภัย</h2>
            
            {/* Tabs */}
            <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', borderBottom: '1px solid var(--border-color)' }}>
              <button 
                onClick={() => setActiveTab('manual')}
                style={{ 
                  padding: '10px 15px', background: 'transparent', border: 'none', cursor: 'pointer',
                  borderBottom: activeTab === 'manual' ? '2px solid #ef6c00' : 'none',
                  color: activeTab === 'manual' ? '#ef6c00' : 'var(--text-secondary)', fontWeight: 'bold'
                }}
              >
                📝 กรอกเอง
              </button>
              <button 
                onClick={() => setActiveTab('import')}
                style={{ 
                  padding: '10px 15px', background: 'transparent', border: 'none', cursor: 'pointer',
                  borderBottom: activeTab === 'import' ? '2px solid #ef6c00' : 'none',
                  color: activeTab === 'import' ? '#ef6c00' : 'var(--text-secondary)', fontWeight: 'bold'
                }}
              >
                📂 Import Excel
              </button>
            </div>

            {/* Content: Manual Form */}
            {activeTab === 'manual' && (
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                  <div>
                    <label>ชื่อ</label>
                    <input type="text" className="search-input-table" required 
                      value={formData.firstName} onChange={e => setFormData({...formData, firstName: e.target.value})} />
                  </div>
                  <div>
                    <label>นามสกุล</label>
                    <input type="text" className="search-input-table" required
                      value={formData.lastName} onChange={e => setFormData({...formData, lastName: e.target.value})} />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                  <div>
                    <label>อายุ</label>
                    <input type="number" className="search-input-table" required
                      value={formData.age} onChange={e => setFormData({...formData, age: e.target.value})} />
                  </div>
                  <div>
                    <label>เพศ</label>
                    <select className="search-input-table" value={formData.gender} onChange={e => setFormData({...formData, gender: e.target.value})}>
                      <option value="male">ชาย</option>
                      <option value="female">หญิง</option>
                    </select>
                  </div>
                </div>

                {/* ✅ 2. เปลี่ยนตรงนี้เป็น Searchable Dropdown */}
                <div ref={wrapperRef} style={{ position: 'relative' }}>
                  <label>ศูนย์พักพิง</label>
                  <input 
                    type="text" 
                    className="search-input-table"
                    placeholder="พิมพ์ชื่อศูนย์เพื่อค้นหา..."
                    value={centerSearch}
                    onChange={(e) => handleCenterSearch(e.target.value)}
                    onFocus={() => setShowCenterList(true)}
                    required
                  />
                  
                  {/* Dropdown List */}
                  {showCenterList && (
                    <div style={{
                      position: 'absolute', top: '100%', left: 0, right: 0,
                      background: 'var(--bg-card)', border: '1px solid var(--border-color)', 
                      borderRadius: '8px', maxHeight: '200px', overflowY: 'auto', zIndex: 100,
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                    }}>
                      {filteredCenters.length > 0 ? (
                        filteredCenters.map(c => (
                          <div 
                            key={c._id}
                            onClick={() => selectCenter(c)}
                            style={{
                              padding: '10px 12px', cursor: 'pointer',
                              borderBottom: '1px solid var(--border-color)',
                              color: 'var(--text-primary)'
                            }}
                            onMouseOver={(e) => e.currentTarget.style.background = 'var(--hover-color)'}
                            onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
                          >
                            {c.name}
                          </div>
                        ))
                      ) : (
                        <div style={{ padding: '10px', color: 'var(--text-secondary)', textAlign: 'center' }}>
                          ไม่พบศูนย์ที่ค้นหา
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div>
                   <label>สถานะสุขภาพ</label>
                   <select className="search-input-table" value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}>
                     <option value="normal">ร่างกายปกติ</option>
                     <option value="sick">มีโรคประจำตัว</option>
                     <option value="disabled">ผู้พิการ/ติดเตียง</option>
                   </select>
                </div>

                {formData.status !== 'normal' && (
                  <div>
                    <label>ระบุโรคประจำตัว / อาการ</label>
                    <input type="text" className="search-input-table" 
                      value={formData.chronicDisease} onChange={e => setFormData({...formData, chronicDisease: e.target.value})} />
                  </div>
                )}

                <button type="submit" className="btn-import" style={{ marginTop: '10px' }}>บันทึกข้อมูล</button>
              </form>
            )}

            {/* Content: Import Excel */}
            {activeTab === 'import' && (
              <div style={{ textAlign: 'center', padding: '20px' }}>
                <div style={{ fontSize: '3rem', marginBottom: '10px' }}>📂</div>
                <p style={{ marginBottom: '12px', color: 'var(--text-secondary)' }}>
                  อัปโหลดไฟล์ Excel (.xlsx .xls .csv) หรือลากไฟล์มาวาง
                </p>

                <label className="btn-file" onDragOver={(e)=>{e.preventDefault(); (e.dataTransfer as DataTransfer).dropEffect='copy'}} onDrop={(e)=>{e.preventDefault(); const f = e.dataTransfer?.files?.[0]; if(f) importExcelFile(f)}} style={{cursor:'pointer', margin: '0 auto'}}>
                  <input type="file" accept=".xlsx,.xls,.csv" style={{display:'none'}} onChange={(e)=>{const f = e.target.files?.[0]; if(f) importExcelFile(f); e.target.value='';}} />
                  นำเข้า Excel (คลิกหรือลากไฟล์มาวาง)
                </label>

                <div style={{ marginTop: '16px' }}>
                  <small style={{ color: 'var(--text-secondary)' }}>ไฟล์ต้องมีคอลัมน์: firstName, lastName, age, gender, centerName, status, chronicDisease (ไม่จำเป็น)</small>
                </div>
              </div>
            )}

          </div>
        </div>
      )}

    </div>
  );
}