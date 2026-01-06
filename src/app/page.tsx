'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

// --- 1. ICONS ---
const Icons = {
  Chart: () => <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>,
  Box: () => <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>,
  Home: () => <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>,
  Plus: () => <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>,
  Search: () => <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>,
  Alert: () => <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>,
  Check: () => <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>,
  History: () => <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
};

// --- 2. TYPES ---
interface TransferRequest { _id: string; docNo: string; destination: string; items: any[]; status: string; createdAt: string; }
interface InventoryItem { _id: string; name: string; quantity: number; minLevel: number; unit: string; category: string; location: string; }
interface Center { _id: string; name: string; location: string; status: string; type: string; }
interface LogEntry { _id: string; timestamp: string; user: string; action: string; description: string; }

// --- 3. MAIN PAGE COMPONENT ---
export default function AdminWorkspace() {
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState<'overview' | 'tasks' | 'inventory' | 'centers' | 'history'>('overview');
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8; // ปรับจำนวนรายการต่อหน้าตรงนี้

  // Data
  const [stats, setStats] = useState({ centers: 0, items: 0, critical: 0, pending: 0 });
  const [requests, setRequests] = useState<TransferRequest[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [centers, setCenters] = useState<Center[]>([]);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [chartData, setChartData] = useState<number[]>(Array(7).fill(0));

  // Modals
  const [modalType, setModalType] = useState<'none' | 'task' | 'createRequest' | 'adjustStock' | 'addCenter' | 'addProduct'>('none');
  const [selectedTask, setSelectedTask] = useState<TransferRequest | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<InventoryItem | null>(null);

  // Wizard State
  const [wizardStep, setWizardStep] = useState(1);
  const [wizardCart, setWizardCart] = useState<any[]>([]);
  const [wizardCenter, setWizardCenter] = useState<Center | null>(null);

  // Forms
  const [productForm, setProductForm] = useState({ name: '', category: 'food', quantity: 0, unit: 'ชิ้น', minLevel: 10, location: '' });
  const [centerForm, setCenterForm] = useState({ name: '', location: '', type: 'ศูนย์พักพิง' });
  const [adjustQty, setAdjustQty] = useState(0);

  // --- Fetch Data ---
  const fetchData = async () => {
    try {
      const [resTrans, resInv, resCenters, resLogs] = await Promise.all([
        fetch('/api/transfers'), fetch('/api/inventory'), fetch('/api/centers'), fetch('/api/logs')
      ]);
      const transData = await resTrans.json();
      const invData = await resInv.json();
      const centerData = await resCenters.json();
      const logsData = await resLogs.json();

      setRequests(Array.isArray(transData) ? transData : []);
      setInventory(Array.isArray(invData) ? invData : []);
      setCenters(Array.isArray(centerData) ? centerData : []);
      setLogs(Array.isArray(logsData) ? logsData : []);

      const pendingCount = Array.isArray(transData) ? transData.filter((t:any) => t.status === 'pending').length : 0;
      const criticalCount = Array.isArray(invData) ? invData.filter((i:any) => i.quantity <= i.minLevel).length : 0;
      
      setStats({
        centers: Array.isArray(centerData) ? centerData.length : 0,
        items: Array.isArray(invData) ? invData.reduce((a:any, b:any) => a + (b.quantity||0), 0) : 0,
        critical: criticalCount,
        pending: pendingCount
      });

      // Chart Logic
      const last7Days = Array(7).fill(0);
      if (Array.isArray(logsData)) {
        const today = new Date();
        logsData.forEach((log: any) => {
          const diffDays = Math.floor((today.getTime() - new Date(log.timestamp).getTime()) / (1000 * 60 * 60 * 24));
          if (diffDays >= 0 && diffDays < 7) last7Days[6 - diffDays] += 1;
        });
      }
      setChartData(last7Days);

    } catch (error) { console.error(error); } 
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  // --- Logic Helpers ---
  const paginate = (items: any[]) => {
    const filtered = items.filter(item => !searchText || JSON.stringify(item).toLowerCase().includes(searchText.toLowerCase()));
    return {
      data: filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage),
      totalPages: Math.ceil(filtered.length / itemsPerPage)
    };
  };

  const getCategoryIcon = (cat: string) => {
    switch(cat) { case 'food': return '🍱'; case 'medicine': return '💊'; case 'clothing': return '👕'; case 'equipment': return '🔦'; default: return '📦'; }
  };

  // --- Actions ---
  const handleTaskAction = async (action: 'approve' | 'reject') => {
    if(!selectedTask) return;
    if(!confirm('ยืนยันการดำเนินการ?')) return;
    await fetch(`/api/transfers/${selectedTask._id}/${action}`, { method: 'POST' });
    alert('✅ เรียบร้อย'); setModalType('none'); fetchData();
  };

  const handleCreateRequest = async () => {
    if(!wizardCenter || wizardCart.length === 0) return;
    await fetch('/api/transfers', { method: 'POST', headers: {'Content-Type':'application/json'}, 
      body: JSON.stringify({ destination: wizardCenter.name, centerId: wizardCenter._id, items: wizardCart }) 
    });
    alert('✅ สร้างใบเบิกสำเร็จ'); setModalType('none'); setWizardCart([]); setWizardCenter(null); setWizardStep(1); fetchData();
  };

  const addToWizardCart = (item: InventoryItem) => {
    const exist = wizardCart.find(x => x.productId === item._id);
    if(exist) setWizardCart(wizardCart.map(x => x.productId === item._id ? {...x, quantity: x.quantity + 1} : x));
    else setWizardCart([...wizardCart, { productId: item._id, productName: item.name, quantity: 1, unit: item.unit }]);
  };

  const handleStockAdjust = async (type: 'add' | 'remove') => {
    if(!selectedProduct) return;
    const newQty = Math.max(0, selectedProduct.quantity + (type === 'add' ? adjustQty : -adjustQty));
    await fetch('/api/inventory', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ _id: selectedProduct._id, quantity: newQty }) });
    alert('✅ ปรับยอดสำเร็จ'); setModalType('none'); setAdjustQty(0); fetchData();
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch('/api/inventory', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify(productForm) });
    alert('✅ เพิ่มสินค้าเรียบร้อย'); setModalType('none'); fetchData();
  };

  const handleAddCenter = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch('/api/centers', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify(centerForm) });
    alert('✅ เพิ่มศูนย์เรียบร้อย'); setModalType('none'); fetchData();
  };

  // --- RENDER MAIN ---
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', padding: '24px', fontFamily: '"Prompt", sans-serif', color: 'var(--text-primary)' }}>
      
      {/* Header */}
      <div style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
            <Icons.Chart />
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: '1.8rem', fontWeight: '800' }}>Admin Dashboard</h1>
            <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.9rem' }}>ระบบบริหารจัดการภาวะฉุกเฉิน</p>
          </div>
        </div>
        <button onClick={() => { setModalType('createRequest'); setWizardStep(1); }} style={{ background: '#3b82f6', color: 'white', border: 'none', padding: '12px 24px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'bold', boxShadow: '0 4px 10px rgba(59,130,246,0.3)' }}>
          <Icons.Plus /> สร้างใบเบิก
        </button>
      </div>

      <style jsx global>{`
        .page-btn { background: var(--bg-card); border: 1px solid var(--border-color); color: var(--text-secondary); width: 36px; height: 36px; border-radius: 8px; cursor: pointer; display: flex; align-items: center; justify-content: center; font-weight: bold; transition: all 0.2s; }
        .page-btn:hover:not(:disabled) { border-color: #3b82f6; color: #3b82f6; }
        .page-btn.active { background: #3b82f6; color: white; border-color: #3b82f6; }
        .page-btn:disabled { opacity: 0.5; cursor: not-allowed; }
      `}</style>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '24px', overflowX: 'auto', paddingBottom: '5px', borderBottom: '1px solid var(--border-color)' }}>
        {[
          { id: 'overview', label: 'ภาพรวม', icon: Icons.Chart },
          { id: 'tasks', label: `งานรออนุมัติ (${stats.pending})`, icon: Icons.Check },
          { id: 'inventory', label: `คลังสินค้า (${stats.critical > 0 ? '!' : ''})`, icon: Icons.Box },
          { id: 'centers', label: 'ศูนย์พักพิง', icon: Icons.Home },
          { id: 'history', label: 'ประวัติ', icon: Icons.History }
        ].map((tab) => (
          <button key={tab.id} onClick={() => { setActiveTab(tab.id as any); setCurrentPage(1); setSearchText(''); }} 
            style={{ 
              padding: '10px 20px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: 'bold', display: 'flex', gap: '8px', alignItems: 'center', transition: 'all 0.2s',
              background: activeTab === tab.id ? '#3b82f6' : 'transparent', color: activeTab === tab.id ? 'white' : 'var(--text-secondary)'
            }}>
            <tab.icon /> {tab.label}
          </button>
        ))}
      </div>

      {/* --- CONTENT AREA --- */}
      
      {/* 1. OVERVIEW */}
      {activeTab === 'overview' && (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginBottom: '32px' }}>
            <StatCard title="งานรออนุมัติ" value={stats.pending} icon={<Icons.Check/>} color="#f59e0b" onClick={() => setActiveTab('tasks')} />
            <StatCard title="สินค้าวิกฤต" value={stats.critical} icon={<Icons.Alert/>} color="#ef4444" onClick={() => setActiveTab('inventory')} />
            <StatCard title="ศูนย์พักพิง" value={stats.centers} icon={<Icons.Home/>} color="#3b82f6" onClick={() => setActiveTab('centers')} />
            <StatCard title="สินค้าทั้งหมด" value={stats.items.toLocaleString()} icon={<Icons.Box/>} color="#10b981" onClick={() => setActiveTab('inventory')} />
          </div>
          <div style={{ background: 'var(--bg-card)', padding: '24px', borderRadius: '16px', border: '1px solid var(--border-color)' }}>
            <h3 style={{ marginTop: 0 }}>📈 ปริมาณการใช้งาน (7 วันล่าสุด)</h3>
            <SimpleLineChart data={chartData} />
          </div>
        </>
      )}

      {/* 2. TASKS LIST */}
      {activeTab === 'tasks' && (() => {
        const list = requests.filter(r => r.status === 'pending');
        const { data, totalPages } = paginate(list);
        return (
          <div style={{ background: 'var(--bg-card)', padding: '24px', borderRadius: '16px', border: '1px solid var(--border-color)' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
              {data.map(req => (
                <div key={req._id} onClick={() => { setSelectedTask(req); setModalType('task'); }}
                  style={{ background: 'var(--bg-primary)', padding: '20px', borderRadius: '12px', border: '1px solid var(--border-color)', cursor: 'pointer', transition: 'all 0.2s' }}
                  onMouseOver={(e) => e.currentTarget.style.borderColor = '#3b82f6'} onMouseOut={(e) => e.currentTarget.style.borderColor = 'var(--border-color)'}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                    <span style={{ color: '#f59e0b', background: 'rgba(245,158,11,0.1)', padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 'bold' }}>รออนุมัติ</span>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{new Date(req.createdAt).toLocaleDateString('th-TH')}</span>
                  </div>
                  <h3 style={{ margin: '0 0 5px', fontSize: '1.1rem' }}>{req.destination}</h3>
                  <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>{req.items.length} รายการ</div>
                </div>
              ))}
              {data.length === 0 && <div style={{ color: 'var(--text-secondary)', padding: '40px', gridColumn: '1/-1', textAlign: 'center' }}>ไม่มีรายการค้าง</div>}
            </div>
            <PaginationControls totalPages={totalPages} currentPage={currentPage} onPageChange={setCurrentPage} />
          </div>
        );
      })()}

      {/* 3. INVENTORY (Grid View) */}
      {activeTab === 'inventory' && (() => {
        const { data, totalPages } = paginate(inventory);
        return (
          <div style={{ background: 'var(--bg-card)', padding: '24px', borderRadius: '16px', border: '1px solid var(--border-color)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
              <input placeholder="🔍 ค้นหาสินค้า..." value={searchText} onChange={e => setSearchText(e.target.value)} 
                style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-color)', padding: '10px', borderRadius: '8px', color: 'var(--text-primary)', width: '300px' }} />
              <button onClick={() => setModalType('addProduct')} style={{ background: '#10b981', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>+ เพิ่มสินค้า</button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '16px' }}>
              {data.map(item => (
                <div key={item._id} onClick={() => { setSelectedProduct(item); setModalType('adjustStock'); }}
                  style={{ background: 'var(--bg-primary)', padding: '20px', borderRadius: '12px', border: '1px solid var(--border-color)', cursor: 'pointer', position: 'relative', overflow: 'hidden' }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ fontSize: '2.5rem' }}>{getCategoryIcon(item.category)}</div>
                    <span style={{ fontSize: '0.75rem', fontWeight: 'bold', padding: '2px 6px', borderRadius: '4px', background: item.quantity<=item.minLevel?'rgba(239,68,68,0.1)':'rgba(16,185,129,0.1)', color: item.quantity<=item.minLevel?'#ef4444':'#10b981' }}>
                      {item.quantity<=item.minLevel ? 'Low' : 'OK'}
                    </span>
                  </div>
                  <div style={{ fontWeight: 'bold', margin: '10px 0', fontSize: '1rem' }}>{item.name}</div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                    <span style={{ fontWeight: 'bold' }}>{item.quantity} {item.unit}</span>
                    <span style={{ color: 'var(--text-secondary)' }}>Min: {item.minLevel}</span>
                  </div>
                  <div style={{ height: '4px', background: 'var(--border-color)', marginTop: '10px', borderRadius: '2px' }}>
                    <div style={{ height: '100%', width: `${Math.min(100, (item.quantity / (item.minLevel*2||1))*100)}%`, background: item.quantity<=item.minLevel?'#ef4444':'#10b981' }} />
                  </div>
                </div>
              ))}
            </div>
            <PaginationControls totalPages={totalPages} currentPage={currentPage} onPageChange={setCurrentPage} />
          </div>
        );
      })()}

      {/* 4. CENTERS (Grid View) */}
      {activeTab === 'centers' && (() => {
        const { data, totalPages } = paginate(centers);
        return (
          <div style={{ background: 'var(--bg-card)', padding: '24px', borderRadius: '16px', border: '1px solid var(--border-color)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
              <input placeholder="🔍 ค้นหาศูนย์..." value={searchText} onChange={e => setSearchText(e.target.value)} 
                style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-color)', padding: '10px', borderRadius: '8px', color: 'var(--text-primary)', width: '300px' }} />
              <button onClick={() => setModalType('addCenter')} style={{ background: '#3b82f6', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>+ เพิ่มศูนย์</button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '16px' }}>
              {data.map(c => (
                <div key={c._id} style={{ background: 'var(--bg-primary)', padding: '20px', borderRadius: '12px', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '15px' }}>
                  <div style={{ width: '50px', height: '50px', background: 'var(--bg-card)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>🏥</div>
                  <div>
                    <div style={{ fontWeight: 'bold' }}>{c.name}</div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>📍 {c.location}</div>
                    <div style={{ marginTop: '5px', fontSize: '0.8rem', color: c.status === 'active' ? '#10b981' : '#ef4444', display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: c.status === 'active' ? '#10b981' : '#ef4444' }} />
                      {c.status === 'active' ? 'พร้อมใช้งาน' : 'ไม่พร้อม'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <PaginationControls totalPages={totalPages} currentPage={currentPage} onPageChange={setCurrentPage} />
          </div>
        );
      })()}

      {/* 5. HISTORY (Table) */}
      {activeTab === 'history' && (() => {
        const { data, totalPages } = paginate(logs);
        return (
          <div style={{ background: 'var(--bg-card)', padding: '24px', borderRadius: '16px', border: '1px solid var(--border-color)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.95rem' }}>
              <thead><tr style={{ textAlign: 'left', borderBottom: '1px solid var(--border-color)' }}><th style={{ padding: '12px' }}>เวลา</th><th>ผู้ทำรายการ</th><th>กิจกรรม</th><th>รายละเอียด</th></tr></thead>
              <tbody>
                {data.map(log => (
                  <tr key={log._id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: '12px', color: 'var(--text-secondary)' }}>{new Date(log.timestamp).toLocaleString('th-TH')}</td>
                    <td>{log.user}</td>
                    <td style={{ fontWeight: 'bold', color: '#3b82f6' }}>{log.action}</td>
                    <td>{log.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <PaginationControls totalPages={totalPages} currentPage={currentPage} onPageChange={setCurrentPage} />
          </div>
        );
      })()}

      {/* --- MODALS (Popups) --- */}

      {/* Wizard Modal */}
      {modalType === 'createRequest' && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999 }}>
          <div style={{ background: 'var(--bg-card)', width: '90%', maxWidth: '800px', height: '80vh', borderRadius: '16px', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '20px', borderBottom: '1px solid var(--border-color)', textAlign: 'center' }}>
              <h2 style={{ margin: 0 }}>สร้างใบเบิก: ขั้นตอน {wizardStep}/3</h2>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginTop: '10px' }}>
                {[1, 2, 3].map(s => <div key={s} style={{ width: '12px', height: '12px', borderRadius: '50%', background: wizardStep >= s ? '#3b82f6' : 'var(--border-color)' }} />)}
              </div>
            </div>
            <div style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>
              {wizardStep === 1 && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '15px' }}>
                  {inventory.map(item => (
                    <div key={item._id} onClick={() => addToWizardCart(item)} style={{ padding: '15px', borderRadius: '10px', border: wizardCart.find(x=>x.productId===item._id) ? '2px solid #3b82f6' : '1px solid var(--border-color)', cursor: 'pointer' }}>
                      <div style={{ fontWeight: 'bold' }}>{item.name}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>เหลือ {item.quantity}</div>
                      {wizardCart.find(x=>x.productId===item._id) && <div style={{ color: '#3b82f6', marginTop: '5px' }}>เลือกแล้ว: {wizardCart.find(x=>x.productId===item._id).quantity}</div>}
                    </div>
                  ))}
                </div>
              )}
              {wizardStep === 2 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <input placeholder="ค้นหาศูนย์..." autoFocus onChange={e => setSearchText(e.target.value)} style={{ padding: '10px', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', borderRadius: '8px' }} />
                  {centers.filter(c => c.name.includes(searchText)).map(c => (
                    <div key={c._id} onClick={() => setWizardCenter(c)} style={{ padding: '15px', background: wizardCenter?._id === c._id ? '#3b82f6' : 'var(--bg-primary)', color: wizardCenter?._id === c._id ? 'white' : 'var(--text-primary)', borderRadius: '8px', cursor: 'pointer' }}>
                      {c.name}
                    </div>
                  ))}
                </div>
              )}
              {wizardStep === 3 && (
                <div style={{ padding: '20px', background: 'var(--bg-primary)', borderRadius: '12px' }}>
                  <h3>ยืนยันข้อมูล</h3>
                  <p><strong>ปลายทาง:</strong> {wizardCenter?.name}</p>
                  <ul>{wizardCart.map((i, idx) => <li key={idx}>{i.productName} (x{i.quantity})</li>)}</ul>
                </div>
              )}
            </div>
            <div style={{ padding: '20px', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between' }}>
              <button onClick={() => wizardStep === 1 ? setModalType('none') : setWizardStep(s => s - 1)} style={{ background: 'transparent', border: '1px solid var(--border-color)', color: 'var(--text-secondary)', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer' }}>ย้อนกลับ</button>
              <button onClick={() => {
                if (wizardStep === 3) {
                  handleCreateRequest();
                  return;
                }
                if (wizardStep === 1 && wizardCart.length === 0) { alert('เลือกของก่อน'); return; }
                if (wizardStep === 2 && !wizardCenter) { alert('เลือกศูนย์ก่อน'); return; }
                setWizardStep(s => s + 1);
              }} style={{ background: '#3b82f6', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>{wizardStep === 3 ? 'ยืนยัน' : 'ถัดไป'}</button>
            </div>
          </div>
        </div>
      )}

      {/* Task / Stock Modals */}
      {(modalType === 'task' || modalType === 'adjustStock') && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999 }}>
          <div style={{ background: 'var(--bg-card)', width: '90%', maxWidth: '400px', padding: '30px', borderRadius: '16px', border: '1px solid var(--border-color)' }}>
            {modalType === 'task' && selectedTask ? (
              <>
                <h3 style={{ marginTop: 0 }}>อนุมัติใบเบิก?</h3>
                <p><strong>{selectedTask.destination}</strong></p>
                <ul>{selectedTask.items.map((i, idx) => <li key={idx}>{i.productName} x {i.quantity}</li>)}</ul>
                <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                  <button onClick={() => handleTaskAction('reject')} style={{ flex: 1, padding: '10px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>ปฏิเสธ</button>
                  <button onClick={() => handleTaskAction('approve')} style={{ flex: 1, padding: '10px', background: '#10b981', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>อนุมัติ</button>
                </div>
              </>
            ) : modalType === 'adjustStock' && selectedProduct ? (
              <>
                <h3 style={{ marginTop: 0 }}>ปรับสต็อก: {selectedProduct.name}</h3>
                <input type="number" placeholder="จำนวน" autoFocus onChange={e => setAdjustQty(Number(e.target.value))} style={{ width: '100%', padding: '10px', marginBottom: '20px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-primary)' }} />
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button onClick={() => handleStockAdjust('remove')} style={{ flex: 1, padding: '10px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>เบิกออก</button>
                  <button onClick={() => handleStockAdjust('add')} style={{ flex: 1, padding: '10px', background: '#10b981', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>เติมสต็อก</button>
                </div>
              </>
            ) : null}
            <button onClick={() => setModalType('none')} style={{ width: '100%', marginTop: '10px', padding: '10px', background: 'transparent', color: 'var(--text-secondary)', border: 'none', cursor: 'pointer' }}>ปิด</button>
          </div>
        </div>
      )}

      {/* Add Product / Center Modals */}
      {(modalType === 'addProduct' || modalType === 'addCenter') && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999 }}>
          <div style={{ background: 'var(--bg-card)', width: '400px', padding: '30px', borderRadius: '16px', border: '1px solid var(--border-color)' }}>
            <h3 style={{ marginTop: 0 }}>{modalType === 'addProduct' ? 'เพิ่มสินค้า' : 'เพิ่มศูนย์'}</h3>
            {modalType === 'addProduct' ? (
              <form onSubmit={handleAddProduct}>
                <input placeholder="ชื่อสินค้า" onChange={e => setProductForm({ ...productForm, name: e.target.value })} style={{ width: '100%', padding: '10px', marginBottom: '10px', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'var(--text-primary)' }} />
                <input placeholder="จำนวน" type="number" onChange={e => setProductForm({ ...productForm, quantity: Number(e.target.value) })} style={{ width: '100%', padding: '10px', marginBottom: '10px', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'var(--text-primary)' }} />
                <button className="btn-primary" style={{ width: '100%', padding: '10px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>บันทึก</button>
              </form>
            ) : (
              <form onSubmit={handleAddCenter}>
                <input placeholder="ชื่อศูนย์" onChange={e => setCenterForm({ ...centerForm, name: e.target.value })} style={{ width: '100%', padding: '10px', marginBottom: '10px', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'var(--text-primary)' }} />
                <input placeholder="ที่ตั้ง" onChange={e => setCenterForm({ ...centerForm, location: e.target.value })} style={{ width: '100%', padding: '10px', marginBottom: '10px', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'var(--text-primary)' }} />
                <button className="btn-primary" style={{ width: '100%', padding: '10px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>บันทึก</button>
              </form>
            )}
            <button onClick={() => setModalType('none')} style={{ width: '100%', marginTop: '10px', padding: '10px', background: 'transparent', color: 'var(--text-secondary)', border: 'none', cursor: 'pointer' }}>ยกเลิก</button>
          </div>
        </div>
      )}

    </div>
  );
}

// --- 4. EXTERNAL COMPONENTS (SAFE FROM SCOPE ERRORS) ---

function StatCard({ title, value, icon, color, onClick }: any) {
  return (
    <div onClick={onClick} style={{ background: 'var(--bg-card)', padding: '24px', borderRadius: '16px', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '15px', cursor: 'pointer', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
      <div style={{ width: '56px', height: '56px', borderRadius: '14px', background: `${color}20`, color: color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{icon}</div>
      <div><div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>{title}</div><div style={{ fontSize: '1.8rem', fontWeight: 'bold' }}>{value}</div></div>
    </div>
  );
}

function SimpleLineChart({ data }: { data: number[] }) {
  const max = Math.max(...data, 1);
  const points = data.map((v, i) => `${(i / 6) * 100},${100 - (v / max) * 80}`).join(' ');
  return (
    <div style={{ width: '100%', height: '120px', marginTop: '20px' }}>
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
        <polyline points={points} fill="none" stroke="#3b82f6" strokeWidth="2" />
        {data.map((v, i) => <circle key={i} cx={(i / 6) * 100} cy={100 - (v / max) * 80} r="3" fill="#3b82f6" />)}
      </svg>
    </div>
  );
}

// ✅ Pagination Controls (Moved Outside)
function PaginationControls({ totalPages, currentPage, onPageChange }: { totalPages: number; currentPage: number; onPageChange: (p: number) => void }) {
  if (totalPages <= 1) return null;

  const getPageNumbers = () => {
    const pages = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 4) {
        pages.push(1, 2, 3, 4, 5, '...', totalPages);
      } else if (currentPage >= totalPages - 3) {
        pages.push(1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
      }
    }
    return pages;
  };

  return (
    <div style={{ display: 'flex', gap: '5px', justifyContent: 'center', marginTop: '20px' }}>
      <button onClick={() => onPageChange(Math.max(1, currentPage - 1))} disabled={currentPage === 1} className="page-btn">«</button>
      {getPageNumbers().map((p, idx) => (
        p === '...' ? <span key={`dots-${idx}`} style={{ padding: '5px 10px', color: 'var(--text-secondary)' }}>...</span> :
        <button key={idx} onClick={() => onPageChange(Number(p))} className={`page-btn ${currentPage === p ? 'active' : ''}`}>{p}</button>
      ))}
      <button onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))} disabled={currentPage === totalPages} className="page-btn">»</button>
    </div>
  );
}