'use client';

import { useState, useEffect } from 'react';

interface CampaignItem {
  id: string;
  name: string;
  platform: string[];
  status: string;
  totalClicks: number;
  totalConversions: number;
  totalRevenue: number;
  description: string;
  startDate?: string;
  endDate?: string;
}

export default function CampaignCmsPage() {
  const [campaigns, setCampaigns] = useState<CampaignItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOpt, setSelectedOpt] = useState<CampaignItem | null>(null);
  const [isEditModalOpen, setEditModalOpen] = useState(false);
  const [isViewModalOpen, setViewModalOpen] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  // Edit form state
  const [editName, setEditName] = useState('');
  const [editStatus, setEditStatus] = useState('');
  const [editDesc, setEditDesc] = useState('');

  useEffect(() => {
    fetch('/api/campaigns')
      .then(res => res.json())
      .then(json => {
        if (json.success) setCampaigns(json.data);
      })
      .finally(() => setLoading(false));
  }, []);

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Bạn có chắc muốn xóa lịch sử chiến dịch: ${name}? (Hành động này sẽ xóa mọi link tracking bên trong)`)) return;
    try {
      const res = await fetch(`/api/campaigns/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setCampaigns(campaigns.filter(c => c.id !== id));
        showToast('Xóa thành công');
      } else {
        showToast('Lỗi khi xóa', 'error');
      }
    } catch {
      showToast('Lỗi mạng', 'error');
    }
  };

  const openEdit = (c: CampaignItem) => {
    setSelectedOpt(c);
    setEditName(c.name);
    setEditStatus(c.status);
    setEditDesc(c.description || '');
    setEditModalOpen(true);
  };

  const saveEdit = async () => {
    if (!selectedOpt) return;
    try {
      const res = await fetch(`/api/campaigns/${selectedOpt.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: editName, status: editStatus, description: editDesc })
      });
      if (res.ok) {
        showToast('Đã cập nhật chiến dịch');
        setCampaigns(campaigns.map(c => 
          c.id === selectedOpt.id ? { ...c, name: editName, status: editStatus, description: editDesc } : c
        ));
        setEditModalOpen(false);
      } else {
        showToast('Sửa thất bại', 'error');
      }
    } catch {
      showToast('Lỗi mạng', 'error');
    }
  };

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">📈 Quản Trị Chiến Dịch (CMS)</h1>
          <p className="page-subtitle">Quản lý hiệu suất, thay đổi trạng thái các nhóm chiến dịch Affiliate.</p>
        </div>
      </div>

      <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border)', fontSize: '13px', color: 'var(--text-muted)' }}>
              <th style={{ padding: '16px' }}>Tên Chiến Dịch</th>
              <th style={{ padding: '16px' }}>Nền Tảng</th>
              <th style={{ padding: '16px' }}>Lượt Click (Views)</th>
              <th style={{ padding: '16px' }}>Đơn Hàng</th>
              <th style={{ padding: '16px' }}>Doanh Thu Affiliate</th>
              <th style={{ padding: '16px' }}>Trạng Thái</th>
              <th style={{ padding: '16px', textAlign: 'right' }}>Thao Tác</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} style={{ padding: '20px', textAlign: 'center' }}>Đang tải dữ liệu...</td></tr>
            ) : campaigns.length === 0 ? (
              <tr><td colSpan={7} style={{ padding: '20px', textAlign: 'center' }}>Chưa có chiến dịch nào.</td></tr>
            ) : campaigns.map(c => (
              <tr key={c.id} style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '12px 16px' }}>
                  <div style={{ fontWeight: '600', fontSize: '14px' }}>{c.name}</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{c.description || 'Không có mô tả'}</div>
                </td>
                <td style={{ padding: '12px 16px' }}>
                  <div style={{ display: 'flex', gap: '4px' }}>
                    {c.platform.map(p => <span key={p} className="badge badge-purple" style={{textTransform:'capitalize'}}>{p}</span>)}
                  </div>
                </td>
                <td style={{ padding: '12px 16px', fontWeight: 'bold' }}>{c.totalClicks}</td>
                <td style={{ padding: '12px 16px', color: 'var(--green)', fontWeight: 'bold' }}>{c.totalConversions}</td>
                <td style={{ padding: '12px 16px', fontWeight: 'bold' }}>₫{c.totalRevenue.toLocaleString()}</td>
                <td style={{ padding: '12px 16px' }}>
                  <span className={`badge ${c.status === 'ACTIVE' ? 'badge-green' : c.status === 'PAUSED' ? 'badge-orange' : 'badge-gray'}`}>
                    {c.status}
                  </span>
                </td>
                <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                  <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                    <button className="btn btn-ghost btn-sm" onClick={() => { setSelectedOpt(c); setViewModalOpen(true); }}>👁️ Xem</button>
                    <button className="btn btn-primary btn-sm" onClick={() => openEdit(c)}>✏️ Sửa</button>
                    <button className="btn btn-sm" style={{ background: 'var(--red)', color: 'white' }} onClick={() => handleDelete(c.id, c.name)}>🗑️ Xóa</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Edit Modal */}
      {isEditModalOpen && selectedOpt && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="card" style={{ width: '400px', padding: '24px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '20px' }}>✏️ Sửa Chiến Dịch</h3>
            <div className="form-group">
              <label className="label">Tên Chiến Dịch</label>
              <input type="text" className="input" value={editName} onChange={e => setEditName(e.target.value)} />
            </div>
            <div className="form-group">
              <label className="label">Mô tả mục tiêu</label>
              <textarea className="input" rows={2} value={editDesc} onChange={e => setEditDesc(e.target.value)} />
            </div>
            <div className="form-group">
              <label className="label">Trạng Thái</label>
              <select className="input select" value={editStatus} onChange={e => setEditStatus(e.target.value)}>
                <option value="ACTIVE">Đang Chạy (ACTIVE)</option>
                <option value="PAUSED">Tạm Dừng (PAUSED)</option>
                <option value="COMPLETED">Đã Hoàn Thành (COMPLETED)</option>
                <option value="ARCHIVED">Lưu Trữ (ARCHIVED)</option>
              </select>
            </div>
            <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
              <button className="btn btn-ghost" style={{ flex: 1 }} onClick={() => setEditModalOpen(false)}>Hủy</button>
              <button className="btn btn-primary" style={{ flex: 1 }} onClick={saveEdit}>💾 Cập nhật</button>
            </div>
          </div>
        </div>
      )}

      {/* View Modal */}
      {isViewModalOpen && selectedOpt && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="card" style={{ width: '500px', padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 'bold' }}>👁️ Thống Kê Nhanh Chiến Dịch</h3>
              <button style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '20px' }} onClick={() => setViewModalOpen(false)}>✕</button>
            </div>
            <div style={{ fontWeight: '600', fontSize: '16px', marginBottom: '8px', color: 'var(--primary)' }}># {selectedOpt.name}</div>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '16px' }}>{selectedOpt.description || 'Chưa cập nhật mục tiêu'}</p>
            
            <div style={{ background: 'var(--bg-secondary)', padding: '16px', borderRadius: '8px', marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: '8px', marginBottom: '8px' }}>
                <span style={{ color: 'var(--text-muted)' }}>Tổng nhấp chuột (Clicks):</span>
                <span style={{ fontWeight: 'bold' }}>{selectedOpt.totalClicks}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: '8px', marginBottom: '8px' }}>
                <span style={{ color: 'var(--text-muted)' }}>Đơn hàng (Order Payouts):</span>
                <span style={{ fontWeight: 'bold', color: 'var(--green)' }}>{selectedOpt.totalConversions} đơn</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Doanh Thu Ước Tính:</span>
                <span style={{ fontWeight: 'bold', fontSize: '16px', color: 'var(--orange)' }}>₫ {selectedOpt.totalRevenue.toLocaleString()}</span>
              </div>
            </div>

            <a href={`/dashboard/performance`} className="btn btn-primary" style={{ width: '100%' }}>🔬 Nhờ AI phân tích Tối Ưu</a>
          </div>
        </div>
      )}

      {toast && (
        <div className="toast-container"><div className={`toast ${toast.type}`}>{toast.msg}</div></div>
      )}
    </>
  );
}
