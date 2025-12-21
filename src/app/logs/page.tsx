'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/layout/Header';
import '@/styles/table.css';

interface Log {
  _id: string;
  action: string;
  description: string;
  user: string;
  timestamp: string;
}

export default function LogsPage() {
  const [logs, setLogs] = useState<Log[]>([]);

  useEffect(() => {
    fetch('/api/logs').then(res => res.json()).then(setLogs);
  }, []);

  // เลือกสีตามการกระทำ
  const getActionStyle = (action: string) => {
    if (action.includes('CREATE')) return { bg: '#e8f5e9', color: '#2e7d32', icon: '➕' }; // เขียว
    if (action.includes('DELETE')) return { bg: '#ffebee', color: '#c62828', icon: '🗑️' }; // แดง
    if (action.includes('UPDATE') || action.includes('APPROVE')) return { bg: '#e3f2fd', color: '#1565c0', icon: '✏️' }; // ฟ้า
    return { bg: '#f5f5f5', color: '#616161', icon: '📝' }; // เทา
  };

  return (
    <div className="page-container">
      <Header title="📜 ประวัติการใช้งานระบบ" subtitle="Activity Logs (100 รายการล่าสุด)" />

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th style={{width: '180px'}}>วัน-เวลา</th>
              <th style={{width: '150px'}}>ผู้ใช้งาน</th>
              <th style={{width: '200px'}}>การกระทำ</th>
              <th>รายละเอียด</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log) => {
              const style = getActionStyle(log.action);
              return (
                <tr key={log._id}>
                  <td style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                    {new Date(log.timestamp).toLocaleString('th-TH')}
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: '#3b82f6', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px' }}>
                        {log.user.charAt(0)}
                      </div>
                      {log.user}
                    </div>
                  </td>
                  <td>
                    <span style={{
                      padding: '4px 8px', borderRadius: '6px', fontSize: '12px', fontWeight: 'bold',
                      background: style.bg, color: style.color, display: 'inline-flex', alignItems: 'center', gap: '5px'
                    }}>
                      {style.icon} {log.action}
                    </span>
                  </td>
                  <td>{log.description}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {logs.length === 0 && <div className="no-results">ยังไม่มีประวัติการใช้งาน</div>}
      </div>
    </div>
  );
}