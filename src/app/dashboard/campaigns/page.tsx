'use client';

import { useState, useEffect } from 'react';
import { MOCK_PRODUCTS } from '@/data/mock-products';

interface Campaign {
  id: string;
  name: string;
  description: string | null;
  platform: string[];
  status: string;
  startDate: string | null;
  endDate: string | null;
  totalClicks: number;
  totalConversions: number;
  totalRevenue: number;
  createdAt: string;
  items: { product: { name: string; imageUrl: string | null; commissionRate: number } }[];
  _count: { schedules: number };
}

const STATUS_MAP: Record<string, { label: string; badge: string }> = {
  DRAFT: { label: 'Nháp', badge: 'badge-gray' },
  ACTIVE: { label: 'Đang chạy', badge: 'badge-green' },
  PAUSED: { label: 'Tạm dừng', badge: 'badge-yellow' },
  COMPLETED: { label: 'Hoàn thành', badge: 'badge-blue' },
  ARCHIVED: { label: 'Lưu trữ', badge: 'badge-gray' },
};

const PLATFORM_ICONS: Record<string, string> = {
  facebook: '📘',
  tiktok: '🎵',
  zalo: '💬',
  instagram: '📸',
};

function formatVND(n: number) {
  return new Intl.NumberFormat('vi-VN').format(n) + 'đ';
}

function CreateCampaignModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [platforms, setPlatforms] = useState<string[]>(['facebook']);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  function togglePlatform(p: string) {
    setPlatforms(prev => prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p]);
  }

  function toggleProduct(id: string) {
    setSelectedProducts(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  }

  async function handleCreate() {
    if (!name.trim()) return alert('Cần nhập tên chiến dịch');
    setLoading(true);
    try {
      const res = await fetch('/api/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, description, platform: platforms }),
      });
      const json = await res.json();
      if (json.success) { onCreated(); onClose(); }
      else alert('Lỗi: ' + json.error);
    } catch {
      alert('Không thể kết nối server');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 1000, padding: '20px'
    }}>
      <div style={{
        background: 'var(--bg-card)', border: '1px solid var(--border)',
        borderRadius: '20px', padding: '28px', width: '100%', maxWidth: '520px',
        maxHeight: '90vh', overflowY: 'auto'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: '700' }}>🎯 Tạo chiến dịch mới</h2>
          <button onClick={onClose} className="btn btn-ghost btn-icon" style={{ fontSize: '18px' }}>✕</button>
        </div>

        <div className="form-group">
          <label className="label">Tên chiến dịch *</label>
          <input className="input" placeholder="Tech Sale Tháng 5..." value={name} onChange={e => setName(e.target.value)} />
        </div>

        <div className="form-group">
          <label className="label">Mô tả</label>
          <textarea className="input" rows={2} placeholder="Chiến dịch quảng bá sản phẩm tech..." value={description} onChange={e => setDescription(e.target.value)} style={{ resize: 'vertical' }} />
        </div>

        <div className="form-group">
          <label className="label">Nền tảng đăng</label>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {Object.entries(PLATFORM_ICONS).map(([id, icon]) => (
              <button
                key={id}
                onClick={() => togglePlatform(id)}
                className={`btn btn-sm ${platforms.includes(id) ? 'btn-primary' : 'btn-secondary'}`}
              >
                {icon} {id.charAt(0).toUpperCase() + id.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '8px' }}>
          <button onClick={onClose} className="btn btn-secondary">Hủy</button>
          <button onClick={handleCreate} className="btn btn-primary" disabled={loading}>
            {loading ? '⏳ Đang tạo...' : '✅ Tạo chiến dịch'}
          </button>
        </div>
      </div>
    </div>
  );
}

function CampaignCard({ campaign, onUpdate }: { campaign: Campaign; onUpdate: () => void }) {
  const st = STATUS_MAP[campaign.status] || STATUS_MAP.DRAFT;
  const cr = campaign.totalClicks > 0
    ? ((campaign.totalConversions / campaign.totalClicks) * 100).toFixed(1)
    : '0';

  async function updateStatus(status: string) {
    await fetch(`/api/campaigns/${campaign.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    onUpdate();
  }

  return (
    <div className="card" style={{ transition: 'all 0.2s ease' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '700' }}>{campaign.name}</h3>
            <span className={`badge ${st.badge}`}>{st.label}</span>
          </div>
          {campaign.description && (
            <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{campaign.description}</p>
          )}
        </div>

        <div style={{ display: 'flex', gap: '6px' }}>
          {campaign.status === 'DRAFT' && (
            <button className="btn btn-sm btn-primary" onClick={() => updateStatus('ACTIVE')}>
              ▶ Kích hoạt
            </button>
          )}
          {campaign.status === 'ACTIVE' && (
            <button className="btn btn-sm btn-secondary" onClick={() => updateStatus('PAUSED')}>
              ⏸ Tạm dừng
            </button>
          )}
          {campaign.status === 'PAUSED' && (
            <button className="btn btn-sm btn-primary" onClick={() => updateStatus('ACTIVE')}>
              ▶ Tiếp tục
            </button>
          )}
        </div>
      </div>

      {/* Platforms */}
      <div style={{ display: 'flex', gap: '6px', marginBottom: '16px' }}>
        {campaign.platform.map(p => (
          <span key={p} className="badge badge-blue">
            {PLATFORM_ICONS[p] || '📱'} {p}
          </span>
        ))}
        <span className="badge badge-gray">📅 {new Date(campaign.createdAt).toLocaleDateString('vi-VN')}</span>
      </div>

      {/* Stats */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '12px', padding: '14px', background: 'var(--bg-secondary)',
        borderRadius: '12px', border: '1px solid var(--border)', marginBottom: '14px'
      }}>
        {[
          { label: 'Clicks', value: campaign.totalClicks.toLocaleString('vi-VN'), icon: '👆' },
          { label: 'Đơn hàng', value: campaign.totalConversions, icon: '🛒', color: 'var(--green)' },
          { label: 'Doanh thu', value: formatVND(campaign.totalRevenue), icon: '💰', color: 'var(--orange)' },
          { label: 'CR%', value: cr + '%', icon: '📊', color: parseFloat(cr) > 5 ? 'var(--green)' : 'var(--yellow)' },
        ].map(s => (
          <div key={s.label} style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '16px', marginBottom: '2px' }}>{s.icon}</div>
            <div style={{ fontSize: '15px', fontWeight: '700', color: s.color || 'var(--text-primary)' }}>{s.value}</div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Products in campaign */}
      {campaign.items.length > 0 && (
        <div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px', fontWeight: '600' }}>
            🛍️ {campaign.items.length} SẢN PHẨM
          </div>
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {campaign.items.slice(0, 4).map((item, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: '4px',
                padding: '4px 10px', background: 'var(--bg-primary)',
                borderRadius: '8px', border: '1px solid var(--border)',
                fontSize: '12px', color: 'var(--text-secondary)'
              }}>
                {item.product.name.slice(0, 25)}...
                <span className="badge badge-green" style={{ fontSize: '10px' }}>
                  {item.product.commissionRate}%
                </span>
              </div>
            ))}
            {campaign.items.length > 4 && (
              <span style={{ color: 'var(--text-muted)', fontSize: '12px', padding: '4px 8px' }}>
                +{campaign.items.length - 4} nữa
              </span>
            )}
          </div>
        </div>
      )}

      <div style={{ display: 'flex', gap: '8px', marginTop: '14px' }}>
        <a href="/dashboard/content" className="btn btn-sm btn-primary">
          🤖 Tạo AI content
        </a>
        <a href="/dashboard/links" className="btn btn-sm btn-secondary">
          🔗 Xem links
        </a>
      </div>
    </div>
  );
}

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [filterStatus, setFilterStatus] = useState('');

  async function fetchCampaigns() {
    setLoading(true);
    try {
      const url = filterStatus ? `/api/campaigns?status=${filterStatus}` : '/api/campaigns';
      const res = await fetch(url);
      const json = await res.json();
      if (json.success) setCampaigns(json.data);
    } catch {}
    finally { setLoading(false); }
  }

  useEffect(() => { fetchCampaigns(); }, [filterStatus]);

  const stats = {
    total: campaigns.length,
    active: campaigns.filter(c => c.status === 'ACTIVE').length,
    revenue: campaigns.reduce((s, c) => s + c.totalRevenue, 0),
  };

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">🎯 Chiến dịch</h1>
          <p className="page-subtitle">Tổ chức sản phẩm thành chiến dịch, quản lý đăng đa nền tảng</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowCreate(true)}>
          + Tạo chiến dịch
        </button>
      </div>

      {/* Stats */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
        {[
          { label: 'Tổng chiến dịch', value: stats.total, icon: '🎯' },
          { label: 'Đang active', value: stats.active, icon: '✅', color: 'var(--green)' },
          { label: 'Tổng doanh thu', value: formatVND(stats.revenue), icon: '💰', color: 'var(--orange)' },
        ].map(s => (
          <div key={s.label} className="card" style={{ flex: 1, padding: '14px 18px' }}>
            <div style={{ fontSize: '20px', marginBottom: '6px' }}>{s.icon}</div>
            <div style={{ fontSize: '22px', fontWeight: '800', color: s.color || 'var(--text-primary)' }}>{s.value}</div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filter tabs */}
      <div className="tabs" style={{ maxWidth: '600px' }}>
        {[
          { value: '', label: 'Tất cả' },
          { value: 'ACTIVE', label: '✅ Active' },
          { value: 'PAUSED', label: '⏸ Tạm dừng' },
          { value: 'DRAFT', label: '📝 Nháp' },
          { value: 'COMPLETED', label: '🏁 Hoàn thành' },
        ].map(f => (
          <button
            key={f.value}
            className={`tab ${filterStatus === f.value ? 'active' : ''}`}
            onClick={() => setFilterStatus(f.value)}
          >
            {f.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px' }}>
          <div className="loading-spinner" style={{ margin: '0 auto' }} />
        </div>
      ) : campaigns.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">🎯</div>
          <div className="empty-state-title">Chưa có chiến dịch nào</div>
          <div className="empty-state-text" style={{ marginBottom: '20px' }}>
            Tạo chiến dịch đầu tiên để nhóm sản phẩm và lên lịch đăng
          </div>
          <button className="btn btn-primary" onClick={() => setShowCreate(true)}>
            + Tạo chiến dịch ngay
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {campaigns.map(c => (
            <CampaignCard key={c.id} campaign={c} onUpdate={fetchCampaigns} />
          ))}
        </div>
      )}

      {showCreate && (
        <CreateCampaignModal
          onClose={() => setShowCreate(false)}
          onCreated={fetchCampaigns}
        />
      )}
    </>
  );
}
