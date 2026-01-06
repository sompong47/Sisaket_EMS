'use client';

import { useEffect, useState } from 'react';
import Button from '@/components/common/Button';
import Input from '@/components/common/Input';
import Select from '@/components/common/Select';

interface ItemRow { productId: string; qty: number; }

interface Props { onSuccess?: () => void; }

export default function TransferForm({ onSuccess }: Props) {
  const [centers, setCenters] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [centerId, setCenterId] = useState('');
  const [items, setItems] = useState<ItemRow[]>([{ productId: '', qty: 1 }]);
  const [productSearch, setProductSearch] = useState<string[]>(['']);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // keep productSearch array in sync with rows
    setProductSearch(prev => {
      const copy = [...prev];
      while (copy.length < items.length) copy.push('');
      while (copy.length > items.length) copy.pop();
      return copy;
    });
  }, [items.length]);

  useEffect(() => {
    const fetchAll = async () => {
      const [cRes, pRes] = await Promise.all([fetch('/api/centers'), fetch('/api/products')]);
      setCenters(await cRes.json());
      setProducts(await pRes.json());
    };
    fetchAll();
  }, []);

  const addRow = () => { setItems([...items, { productId: '', qty: 1 }]); setProductSearch(prev => [...prev, '']); };
  const removeRow = (i: number) => { setItems(items.filter((_, idx) => idx !== i)); setProductSearch(prev => prev.filter((_, idx) => idx !== i)); };
  const updateRow = (i: number, k: keyof ItemRow, v: any) => {
    const clone = [...items]; clone[i] = { ...clone[i], [k]: v }; setItems(clone);
    if (k === 'productId') {
      // clear search after selecting a product to reduce confusion
      setProductSearch(prev => { const c = [...prev]; c[i] = ''; return c; });
    }
  };

  const updateProductSearch = (i: number, value: string) => {
    const c = [...productSearch]; c[i] = value; setProductSearch(c);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!centerId) return alert('กรุณาเลือกศูนย์');
    const valid = items.filter(i => i.productId && i.qty > 0);
    if (valid.length === 0) return alert('กรุณาเลือกสินค้าอย่างน้อย 1 รายการ');
    setLoading(true);
    try {
      const payload = {
        centerId,
        centerName: centers.find(c => c._id === centerId)?.name,
        items: valid.map(i => ({ productId: i.productId, productName: products.find(p=>p._id===i.productId)?.name || 'Unknown', quantity: i.qty }))
      };
      const res = await fetch('/api/transfers', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      if (res.ok) { alert('สร้างคำร้องเรียบร้อย'); onSuccess?.(); }
      else { const d = await res.json(); alert('ผิดพลาด: ' + (d?.error || 'ไม่ทราบ')); }
    } catch (err) { console.error(err); alert('การเชื่อมต่อล้มเหลว'); }
    finally { setLoading(false); }
  };

  return (
    <form onSubmit={submit}>
      <Select label="ศูนย์ที่ขอเบิก" value={centerId} onChange={e=>setCenterId(e.target.value)}>
        <option value="">-- เลือกศูนย์ --</option>
        {centers.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
      </Select>

      {items.map((it, idx) => (
        <div key={idx} style={{ display: 'flex', gap: 8, marginBottom: 8, alignItems: 'center' }}>
          <input
            className="search-input-table"
            placeholder="ค้นหาสินค้า..."
            value={productSearch[idx] || ''}
            onChange={e => updateProductSearch(idx, e.target.value)}
            style={{ flex: 2 }}
          />

          <select value={it.productId} onChange={e => updateRow(idx, 'productId', e.target.value)} style={{ flex: 2 }}>
            <option value="">-- เลือกสินค้า --</option>
            {(() => {
              const filtered = products.filter(p => (productSearch[idx] || '').trim() === '' ? true : p.name.toLowerCase().includes((productSearch[idx] || '').toLowerCase()));
              if (filtered.length === 0) return <option disabled>ไม่พบสินค้า</option>;
              return filtered.map(p => <option key={p._id} value={p._id}>{p.name} (คง {p.quantity})</option>);
            })()}
          </select>

          <Input type="number" value={String(it.qty)} onChange={e => updateRow(idx, 'qty', parseInt(e.target.value || '0'))} style={{ flex: 1 }} />
          {items.length > 1 && <Button type="button" variant="danger" onClick={() => removeRow(idx)}>ลบ</Button>}
        </div>
      ))}

      <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
        <Button type="button" variant="ghost" onClick={addRow}>+ เพิ่มแถว</Button>
        <div style={{ flex: 1 }} />
        <Button type="submit" variant="primary" disabled={loading}>{loading ? 'กำลังส่ง...' : 'ส่งคำร้อง'}</Button>
      </div>
    </form>
  );
}
