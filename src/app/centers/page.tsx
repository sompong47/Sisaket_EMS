'use client';

import { useState, useEffect } from 'react';
import { Center } from '@/types';
import Header from '@/components/layout/Header';
import '@/styles/table.css';
import * as XLSX from 'xlsx';

export default function CentersPage() {
  const [centers, setCenters] = useState<Center[]>([]);
  const [filteredCenters, setFilteredCenters] = useState<Center[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Search & Filter State
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  // Modal & Form State (เพิ่มใหม่)
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    type: 'เมืองศรีสะเกษ', // Default
    population: 100,      // ใช้แทน capacity
    contact: '',
    status: 'active'
  });

  useEffect(() => {
    fetchCenters();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [centers, searchText, statusFilter, typeFilter]);

  const fetchCenters = async () => {
    try {
      const res = await fetch('/api/centers');
      const data = await res.json();
      setCenters(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let results = [...centers];

    if (searchText) {
      const keyword = searchText.toLowerCase().trim();
      results = results.filter(center => 
        center.name?.toLowerCase().includes(keyword) ||
        center.location?.toLowerCase().includes(keyword) ||
        center.contact?.toLowerCase().includes(keyword)
      );
    }

    if (statusFilter !== 'all') {
      results = results.filter(center => center.status === statusFilter);
    }

    if (typeFilter !== 'all') {
      results = results.filter(center => center.type === typeFilter);
    }

    setFilteredCenters(results);
    setCurrentPage(1);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('คุณแน่ใจหรือไม่ที่จะลบศูนย์นี้?')) return;
    
    try {
      const res = await fetch(`/api/centers?id=${id}`, { method: 'DELETE' }); // แก้ route ให้ตรงกับ API
      if (res.ok) {
        alert('ลบสำเร็จ');
        fetchCenters();
      }
    } catch (error) {
      alert('เกิดข้อผิดพลาดในการลบ');
    }
  };

  // ฟังก์ชันบันทึกข้อมูลใหม่ (เพิ่มใหม่)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/centers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (!res.ok) throw new Error('Failed to add');

      alert('✅ เพิ่มศูนย์พักพิงเรียบร้อย');
      setShowModal(false);
      setFormData({ name: '', location: '', type: 'เมืองศรีสะเกษ', population: 100, contact: '', status: 'active' });
      fetchCenters();
    } catch (error) {
      alert('✖ เกิดข้อผิดพลาดในการบันทึก');
    }
  };

  // Helper to import from a File (used by input change and drop)
  const importExcelFile = async (file: File) => {
    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const raw = XLSX.utils.sheet_to_json<Record<string, any>>(sheet, { defval: '' });

      // Flexible header mapping (Thai/English common headers)
      const headerMap: Record<string, string[]> = {
        name: ['name','ชื่อ','ชื่อศูนย์','center','center name'],
        location: ['location','ที่ตั้ง','สถานที่','address','ที่อยู่'],
        type: ['type','อำเภอ','district','shelter type'],
        population: ['population','ความจุ','จำนวนคน','people','capacity'],
        contact: ['contact','เบอร์','โทร','phone','telephone'],
        status: ['status','สถานะ']
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
          out[mk] = mk === 'population' ? Number(v) || 0 : String(v).trim();
        }
        return out;
      });

      if (mapped.length === 0) {
        alert('ไม่พบข้อมูลที่สามารถนำเข้าได้');
        return;
      }

      const res = await fetch('/api/centers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(mapped),
      });

      if (res.ok) {
        alert('นำเข้า Excel สำเร็จ');
        fetchCenters();
      } else {
        const err = await res.json().catch(() => null);
        alert('เกิดข้อผิดพลาดในการนำเข้า: ' + (err?.error || err?.message || res.status));
      }
    } catch (error) {
      console.error(error);
      alert('ไฟล์ Excel ไม่ถูกต้องหรือเกิดข้อผิดพลาด');
    }
  };

  const handleImportExcel = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    importExcelFile(file).finally(() => { e.target.value = ''; });
  };

  const handleDropExcel = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    const file = e.dataTransfer?.files?.[0];
    if (file) importExcelFile(file);
  };

  const handleExportExcel = () => {
    if (centers.length === 0) { alert('ไม่มีข้อมูลสำหรับส่งออก'); return; }

    const data = centers.map(c => ({
      name: c.name, location: c.location, type: c.type, population: c.population, contact: c.contact, status: c.status
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Centers');
    const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([wbout], { type: 'application/octet-stream' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `centers_${new Date().toISOString().slice(0,10)}.xlsx`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const uniqueTypes = Array.from(new Set(centers.map(c => c.type))).filter(Boolean);

  // Pagination Logic
  const totalPages = Math.ceil(filteredCenters.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentCenters = filteredCenters.slice(startIndex, endIndex);

  const getPageNumbers = () => {
    const pages = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 3) {
        pages.push(1, 2, 3, 4, '...', totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
      }
    }
    return pages;
  };

  return (
    <div className="page-container">
      <Header 
        title="จัดการศูนย์พักพิง" 
        subtitle={`ทั้งหมด ${centers.length} ศูนย์`}
      />

      {/* Filter Section */}
      <div className="filter-section">
        <div className="filter-group">
          <div className="search-box">
            <span className="search-icon"></span>
            <input
              type="text"
              placeholder="ค้นหา (ชื่อ, สถานที่, ติดต่อ)"
              className="search-input-table"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
            />
          </div>

          <select 
            className="filter-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">สถานะความพร้อมทั้งหมด</option>
            <option value="active">รองรับได้</option>
            <option value="inactive">เต็ม/ปิด</option>
          </select>

          <select 
            className="filter-select"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
          >
            <option value="all">เลือกอำเภอ</option>
            {uniqueTypes.map((type, i) => (
              <option key={i} value={type}>{type}</option>
            ))}
          </select>

          <button className="btn-reset" onClick={() => {
            setSearchText(''); setStatusFilter('all'); setTypeFilter('all');
          }}>
            ↻
          </button>
        </div>

        <div className="actions-container">
          {/* ปุ่ม Import JSON (แยกออกมา) */}
          <label
            className="btn-file"
            title="ลากและวางไฟล์ Excel หรือคลิกเพื่อเลือก"
            onDragOver={(e) => { e.preventDefault(); (e.dataTransfer as DataTransfer).dropEffect = 'copy'; }}
            onDrop={handleDropExcel}
          >
            <input 
              type="file" 
              accept=".xlsx,.xls,.csv" 
              style={{ display: 'none' }} 
              onChange={handleImportExcel} 
            />
            <span className="btn-file-label">📂 นำเข้า Excel (ลากไฟล์มาวางได้)</span>
          </label>

          <button className="btn-export" onClick={handleExportExcel}>⬇ ส่งออก Excel</button>

          {/* ปุ่มเพิ่มศูนย์ใหม่ (เปิด Modal) */}
          <button className="btn-import btn-add" onClick={() => setShowModal(true)}>
            + เพิ่มศูนย์ใหม่
          </button>
        </div>
      </div>

      {/* Results Summary */}
      <div className="results-summary">
        <span className="results-text">
          พบข้อมูล: <strong className="results-count">{filteredCenters.length}</strong> รายการ
        </span>
        <span className="results-page">หน้า {currentPage} จาก {totalPages || 1}</span>
      </div>

      {/* Table */}
      {loading ? (
        <div className="loading-container">กำลังโหลดข้อมูล...</div>
      ) : (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>ชื่อศูนย์ / สถานที่</th>
                <th>ตำบล / อำเภอ</th>
                <th>เบอร์โทรติดต่อ</th>
                <th>ความจุ</th>
                <th>สถานะ</th>
                <th>จัดการ</th>
              </tr>
            </thead>
            <tbody>
              {currentCenters.map((center) => (
                <tr key={center._id}>
                  <td>
                    <div className="center-name">
                      <strong>{center.name}</strong>
                      <div className="center-location">📍 {center.location}</div>
                    </div>
                  </td>
                  <td><div className="center-type">{center.type}</div></td>
                  <td className="center-contact">{center.contact}</td>
                  <td className="center-capacity">
                    <strong>{center.population?.toLocaleString()}</strong>
                  </td>
                  <td>
                    <span className={`status-badge ${center.status}`}>
                      {center.status === 'active' ? 'รองรับได้' : 'เต็ม/ปิด'}
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button 
                        className="btn-action btn-delete" 
                        title="ลบ"
                        onClick={() => handleDelete(center._id)}
                      >
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredCenters.length === 0 && (
            <div className="no-results">✖ ไม่พบข้อมูลศูนย์พักพิงที่ค้นหา</div>
          )}
        </div>
      )}

      {/* Pagination */}
      {filteredCenters.length > 0 && (
        <div className="pagination-container">
          <button 
            className="pagination-btn"
            onClick={() => setCurrentPage(1)}
            disabled={currentPage === 1}
          >‹‹</button>
          
          <button 
            className="pagination-btn"
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >‹</button>

          {getPageNumbers().map((page, index) => (
            page === '...' ? (
              <span key={`ellipsis-${index}`} className="pagination-ellipsis">...</span>
            ) : (
              <button
                key={page}
                className={`pagination-btn ${currentPage === page ? 'active' : ''}`}
                onClick={() => setCurrentPage(page as number)}
              >
                {page}
              </button>
            )
          ))}

          <button 
            className="pagination-btn"
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
          >›</button>

          <button 
            className="pagination-btn"
            onClick={() => setCurrentPage(totalPages)}
            disabled={currentPage === totalPages}
          >››</button>
        </div>
      )}

      {/* 🟢 MODAL: เพิ่มศูนย์พักพิงใหม่ */}
      {showModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.5)', zIndex: 999,
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <div style={{
            background: 'var(--bg-card)', padding: '30px', borderRadius: '16px',
            width: '100%', maxWidth: '500px', boxShadow: '0 10px 30px rgba(0,0,0,0.2)'
          }}>
            <h2 style={{ marginTop: 0, marginBottom: '20px' }}>เพิ่มศูนย์พักพิงแห่งใหม่</h2>
            
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '5px' }}>ชื่อศูนย์พักพิง</label>
                <input 
                  type="text" required className="search-input-table" 
                  value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}
                  placeholder="เช่น วัดบ้านนา, โรงเรียน..."
                />
              </div>
              
              <div>
                <label style={{ display: 'block', marginBottom: '5px' }}>ที่ตั้ง (รายละเอียด)</label>
                <input 
                  type="text" required className="search-input-table"
                  value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})}
                  placeholder="เช่น หมู่ 1 ต.โพนเขวา"
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '5px' }}>อำเภอ</label>
                <select 
                  className="search-input-table"
                  value={formData.type}
                  onChange={e => setFormData({...formData, type: e.target.value})}
                >
                  <option value="เมืองศรีสะเกษ">เมืองศรีสะเกษ</option>
                  <option value="กันทรารมย์">กันทรารมย์</option>
                  <option value="ขุขันธ์">ขุขันธ์</option>
                  <option value="ราษีไศล">ราษีไศล</option>
                  <option value="อุทุมพรพิสัย">อุทุมพรพิสัย</option>
                  {/* เพิ่มอำเภออื่นๆ ตามต้องการ */}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px' }}>ความจุ (คน)</label>
                  <input 
                    type="number" required className="search-input-table"
                    value={formData.population} onChange={e => setFormData({...formData, population: Number(e.target.value)})}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px' }}>เบอร์ติดต่อ</label>
                  <input 
                    type="text" className="search-input-table"
                    value={formData.contact} onChange={e => setFormData({...formData, contact: e.target.value})}
                    placeholder="0xx-xxxxxxx"
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <button 
                  type="button" 
                  onClick={() => setShowModal(false)}
                  style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'transparent', cursor: 'pointer', color: 'var(--text-primary)' }}
                >
                  ยกเลิก
                </button>
                <button 
                  type="submit" 
                  className="btn-import"
                  style={{ flex: 1 }}
                >
                  บันทึกข้อมูล
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}