'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface ParsedProduct {
  name: string;
  originalPrice: number;
  discountedPrice: number;
  category: string;
  description: string;
  unit: string;
}

export default function BulkImportPage() {
  const router = useRouter();
  const [rawText, setRawText] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [parsedProducts, setParsedProducts] = useState<ParsedProduct[]>([]);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleAiScan = async () => {
    if (!rawText.trim()) return showToast('Vui lòng nhập văn bản!', 'error');
    setLoading(true);
    setParsedProducts([]);

    try {
      const res = await fetch('/api/products/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: rawText }),
      });
      const json = await res.json();
      if (json.success) {
        setParsedProducts(json.data);
        showToast(`Đã bóc tách thành công ${json.data.length} sản phẩm`);
      } else {
        showToast(json.error || 'Lỗi bóc tách AI', 'error');
      }
    } catch {
      showToast('Không thể kết nối API AI', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmImport = async () => {
    if (parsedProducts.length === 0) return;
    setSaving(true);

    try {
      const res = await fetch('/api/products/bulk/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ products: parsedProducts }),
      });
      const json = await res.json();
      if (json.success) {
        showToast('Đã nhập hàng vào kho thành công!', 'success');
        setTimeout(() => router.push('/dashboard/cms/products'), 1500);
      } else {
        showToast('Lỗi lưu dữ liệu', 'error');
      }
    } catch {
      showToast('Lỗi mạng', 'error');
    } finally {
      setSaving(false);
    }
  };

  const updateParsedItem = (idx: number, field: keyof ParsedProduct, value: any) => {
    const updated = [...parsedProducts];
    updated[idx] = { ...updated[idx], [field]: value };
    setParsedProducts(updated);
  };

  const removeItem = (idx: number) => {
    setParsedProducts(parsedProducts.filter((_, i) => i !== idx));
  };

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">🚀 Bulk Import AI</h1>
          <p className="page-subtitle">Dán danh sách văn bản và để Gemini AI tự bóc tách sản phẩm vào kho hàng.</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: parsedProducts.length > 0 ? '1fr' : '1fr', gap: '20px' }}>
        
        {/* Step 1: Input */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: '700' }}>📄 Bước 1: Dán văn bản thô</h3>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Ví dụ: "Dưa vàng 45k, Mận hậu 60k sỉ 50k..."</div>
          </div>
          <textarea
            className="input"
            rows={8}
            placeholder="Nhập danh sách sản phẩm, giá cả từ Zalo, Facebook hoặc Messenger..."
            style={{ fontFamily: 'monospace', fontSize: '13px', lineHeight: '1.6' }}
            value={rawText}
            onChange={(e) => setRawText(e.target.value)}
          />
          <div style={{ marginTop: '16px', display: 'flex', gap: '12px' }}>
            <button 
              className="btn btn-primary" 
              style={{ flex: 1, padding: '14px', justifyContent: 'center' }}
              onClick={handleAiScan}
              disabled={loading}
            >
              {loading ? '🤖 AI đang bóc tách...' : '🚀 Bắt đầu Quét bằng AI'}
            </button>
            <button className="btn btn-ghost" onClick={() => setRawText('')}>Xóa trắng</button>
          </div>
        </div>

        {/* Step 2: Preview & Confirm */}
        {parsedProducts.length > 0 && (
          <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
            <div style={{ padding: '20px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '15px', fontWeight: '700' }}>🔍 Bước 2: Kiểm tra dữ liệu AI ({parsedProducts.length} món)</h3>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button className="btn btn-ghost btn-sm" onClick={() => setParsedProducts([])}>Hủy kết quả</button>
                <button 
                  className="btn btn-primary btn-sm" 
                  style={{ background: 'var(--green)' }}
                  onClick={handleConfirmImport}
                  disabled={saving}
                >
                  {saving ? '⏳ Đang lưu...' : '💾 Xác nhận & Lưu kho'}
                </button>
              </div>
            </div>
            
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border)', fontSize: '12px', color: 'var(--text-muted)' }}>
                    <th style={{ padding: '12px 16px' }}>Tên sản phẩm</th>
                    <th style={{ padding: '12px 16px' }}>Giá Lẻ</th>
                    <th style={{ padding: '12px 16px' }}>Giá Sỉ/Sale</th>
                    <th style={{ padding: '12px 16px' }}>Đơn vị</th>
                    <th style={{ padding: '12px 16px' }}>Danh mục</th>
                    <th style={{ padding: '12px 16px' }}>Mô tả thêm</th>
                    <th style={{ padding: '12px 16px', textAlign: 'right' }}>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {parsedProducts.map((p, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={{ padding: '8px 16px' }}>
                        <input 
                          type="text" className="input" style={{ padding: '6px 10px', fontSize: '13px' }} 
                          value={p.name} onChange={(e) => updateParsedItem(i, 'name', e.target.value)}
                        />
                      </td>
                      <td style={{ padding: '8px 16px' }}>
                        <input 
                          type="number" className="input" style={{ width: '100px', padding: '6px 10px', fontSize: '13px' }} 
                          value={p.originalPrice} onChange={(e) => updateParsedItem(i, 'originalPrice', parseFloat(e.target.value))}
                        />
                      </td>
                      <td style={{ padding: '8px 16px' }}>
                        <input 
                          type="number" className="input" style={{ width: '100px', padding: '6px 10px', fontSize: '13px' }} 
                          value={p.discountedPrice} onChange={(e) => updateParsedItem(i, 'discountedPrice', parseFloat(e.target.value))}
                        />
                      </td>
                      <td style={{ padding: '8px 16px' }}>
                        <input 
                          type="text" className="input" style={{ width: '70px', padding: '6px 10px', fontSize: '13px' }} 
                          value={p.unit} onChange={(e) => updateParsedItem(i, 'unit', e.target.value)}
                        />
                      </td>
                      <td style={{ padding: '8px 16px' }}>
                        <input 
                          type="text" className="input" style={{ width: '100px', padding: '6px 10px', fontSize: '13px' }} 
                          value={p.category} onChange={(e) => updateParsedItem(i, 'category', e.target.value)}
                        />
                      </td>
                      <td style={{ padding: '8px 16px' }}>
                        <input 
                          type="text" className="input" style={{ padding: '6px 10px', fontSize: '13px' }} 
                          value={p.description} onChange={(e) => updateParsedItem(i, 'description', e.target.value)}
                        />
                      </td>
                      <td style={{ padding: '8px 16px', textAlign: 'right' }}>
                        <button className="btn btn-ghost btn-sm" onClick={() => removeItem(i)}>🗑️</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {toast && (
        <div className="toast-container"><div className={`toast ${toast.type}`}>{toast.msg}</div></div>
      )}
    </>
  );
}
