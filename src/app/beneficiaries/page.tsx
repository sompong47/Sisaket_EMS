'use client';

import { useState, useEffect } from 'react';
import { Beneficiary } from '@/types';
import Header from '@/components/layout/Header';
import '@/styles/table.css'; // ✅ ใช้ CSS ตารางอันสวยที่เราเพิ่งแก้

export default function BeneficiariesPage() {
  const [people, setPeople] = useState<Beneficiary[]>([]);
  const [filteredPeople, setFilteredPeople] = useState<Beneficiary[]>([]);
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    // โหลดข้อมูลจาก API
    fetch('/api/beneficiaries')
      .then(res => res.json())
      .then(data => {
        setPeople(data);
        setFilteredPeople(data);
      });
  }, []);

  // ฟังก์ชันกรองข้อมูล (Search & Filter)
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

  // Badge สีตามสุขภาพ
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
      <Header 
        title=" รายชื่อผู้ประสบภัย" 
        subtitle={`ลงทะเบียนแล้ว ${people.length} คน`}
      />

      {/* Filter Section */}
      <div className="filter-section">
        <div className="filter-group">
          <div className="search-box">
            <span className="search-icon"></span>
            <input 
              type="text" 
              className="search-input-table"
              placeholder="ค้นหา (ชื่อ, นามสกุล, ศูนย์พักพิง)"
              value={searchText}
              onChange={e => setSearchText(e.target.value)}
            />
          </div>

          <select className="filter-select" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
            <option value="all">สุขภาพทั้งหมด</option>
            <option value="normal">ร่างกายปกติ</option>
            <option value="sick">มีโรคประจำตัว</option>
            <option value="disabled">ผู้พิการ/ติดเตียง</option>
          </select>
        </div>

        <button className="btn-import">
           + ลงทะเบียนรายใหม่
        </button>
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
              <th>หมายเหตุ (โรคประจำตัว)</th>
              <th>จัดการ</th>
            </tr>
          </thead>
          <tbody>
            {filteredPeople.map((person) => (
              <tr key={person._id}>
                <td>
                    <div style={{fontWeight: 'bold'}}>{person.firstName} {person.lastName}</div>
                </td>
                <td>{person.age} ปี / {person.gender === 'male' ? 'ชาย' : 'หญิง'}</td>
                <td>📍 {person.centerName}</td>
                <td>{getStatusBadge(person.status)}</td>
                <td style={{color: 'var(--text-secondary)'}}>
                    {person.chronicDisease || '-'}
                </td>
                <td>
                    <div className="action-buttons">
                        <button className="btn-action btn-edit">✏️</button>
                    </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredPeople.length === 0 && <div className="no-results">✖ ไม่พบรายชื่อที่ค้นหา</div>}
      </div>
    </div>
  );
}