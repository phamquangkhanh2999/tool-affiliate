'use client';

import { useState, useEffect } from 'react';

interface OverviewData {
  totalProducts: number;
  totalLinks: number;
  totalContents: number;
  totalCampaigns: number;
  totalClicks: number;
  totalConversions: number;
  totalRevenue: number;
  conversionRate: string;
}

function StatCard({
  icon,
  label,
  value,
  change,
  colorClass,
  prefix = '',
  suffix = '',
}: {
  icon: string;
  label: string;
  value: number | string;
  change?: { value: string; up: boolean };
  colorClass: string;
  prefix?: string;
  suffix?: string;
}) {
  return (
    <div className="stat-card">
      <div className={`stat-icon ${colorClass}`}>{icon}</div>
      <div className="stat-value">
        {prefix}{typeof value === 'number' ? value.toLocaleString('vi-VN') : value}{suffix}
      </div>
      <div className="stat-label">{label}</div>
      {change && (
        <div className={`stat-change ${change.up ? 'up' : 'down'}`}>
          {change.up ? '↑' : '↓'} {change.value} so với tháng trước
        </div>
      )}
    </div>
  );
}


export default function DashboardPage() {
  const [overview, setOverview] = useState<OverviewData | null>(null);
  const [topProducts, setTopProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('30d');

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const res = await fetch(`/api/analytics?period=${period}`);
        if (res.ok) {
          const json = await res.json();
          if (json.success) setOverview(json.data.overview);
        }
      } catch {
        // Use mock data
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [period]);

  return (
    <>
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard 📊</h1>
          <p className="page-subtitle">Xin chào! Đây là tổng quan tài khoản affiliate của bạn.</p>
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <select
            className="input select"
            style={{ width: 'auto' }}
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
          >
            <option value="7d">7 ngày</option>
            <option value="30d">30 ngày</option>
            <option value="90d">90 ngày</option>
          </select>
          <a href="/dashboard/content" className="btn btn-primary">
            ✨ Tạo AI Content
          </a>
        </div>
      </div>

      {/* Stats Grid */}
      {loading || !overview ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
          <div className="loading-spinner" />
        </div>
      ) : (
        <div className="stats-grid">
          <StatCard
            icon="💰"
            label="Doanh thu (VND)"
            value={overview.totalRevenue}
            change={{ value: '+23%', up: true }}
            colorClass="orange"
            prefix="₫"
          />
          <StatCard
            icon="👆"
            label="Tổng lượt click"
            value={overview.totalClicks}
            change={{ value: '+15%', up: true }}
            colorClass="blue"
          />
          <StatCard
            icon="🛒"
            label="Đơn hàng"
            value={overview.totalConversions}
            change={{ value: '+8%', up: true }}
            colorClass="green"
          />
          <StatCard
            icon="📊"
            label="Tỷ lệ chuyển đổi"
            value={overview.conversionRate}
            colorClass="purple"
            suffix="%"
          />
          <StatCard
            icon="🛍️"
            label="Sản phẩm"
            value={overview.totalProducts}
            colorClass="orange"
          />
          <StatCard
            icon="🤖"
            label="Nội dung AI đã tạo"
            value={overview.totalContents}
            colorClass="purple"
          />
        </div>
      )}

      {/* 2 column grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginTop: '8px' }}>
        {/* Top Products */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
            <h2 style={{ fontSize: '16px', fontWeight: '700' }}>🏆 Top sản phẩm</h2>
            <a href="/dashboard/analytics" className="btn btn-ghost btn-sm">Xem tất cả →</a>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {topProducts.length === 0 ? (
              <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)' }}>Chưa có chiến dịch nào ra link affiliate để tracking.</div>
            ) : topProducts.map((p, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: '12px',
                padding: '10px', background: 'var(--bg-secondary)',
                borderRadius: '10px', border: '1px solid var(--border)'
              }}>
                <div style={{
                  width: '32px', height: '32px', borderRadius: '8px',
                  background: 'var(--gradient-brand)', display: 'flex',
                  alignItems: 'center', justifyContent: 'center',
                  fontSize: '14px', fontWeight: '800', flexShrink: 0
                }}>
                  {i + 1}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    fontSize: '13px', fontWeight: '600',
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
                  }}>{p.productName}</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                    {p.clicks} clicks • <span style={{ color: 'var(--green)' }}>₫{p.revenue.toLocaleString('vi-VN')}</span>
                  </div>
                </div>
                <span className="badge badge-orange">{p.category}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="card">
          <h2 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '16px' }}>⚡ Thao tác nhanh</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {[
              { icon: '🔍', title: 'Tìm sản phẩm hot', desc: 'Khám phá sản phẩm trending', href: '/dashboard/products' },
              { icon: '🤖', title: 'Tạo AI content', desc: 'Caption FB/TikTok tự động', href: '/dashboard/content' },
              { icon: '🎯', title: 'Tạo chiến dịch', desc: 'Nhóm sản phẩm, lên lịch đăng', href: '/dashboard/campaigns' },
              { icon: '🔗', title: 'Quản lý link', desc: 'Track click & doanh thu', href: '/dashboard/links' },
            ].map((action) => (
              <a key={action.href} href={action.href} style={{
                display: 'flex', alignItems: 'center', gap: '12px',
                padding: '12px', background: 'var(--bg-secondary)',
                borderRadius: '10px', border: '1px solid var(--border)',
                textDecoration: 'none', transition: 'all 0.2s ease'
              }}
              className="card"
              >
                <span style={{ fontSize: '20px' }}>{action.icon}</span>
                <div>
                  <div style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)' }}>{action.title}</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{action.desc}</div>
                </div>
                <span style={{ marginLeft: 'auto', color: 'var(--text-muted)' }}>→</span>
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Revenue hint */}
      <div style={{
        marginTop: '16px',
        padding: '16px 20px',
        background: 'linear-gradient(135deg, rgba(255,107,53,0.1), rgba(124,58,237,0.1))',
        border: '1px solid rgba(255,107,53,0.2)',
        borderRadius: '16px',
        display: 'flex',
        alignItems: 'center',
        gap: '16px'
      }}>
        <span style={{ fontSize: '28px' }}>💡</span>
        <div>
          <div style={{ fontSize: '14px', fontWeight: '600' }}>Mẹo tối ưu doanh thu hôm nay</div>
          <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Kem chống nắng đang trending mùa hè — tạo nội dung AI và đăng TikTok để tăng 3x click rate!
          </div>
        </div>
        <a href="/dashboard/content" className="btn btn-primary btn-sm" style={{ flexShrink: 0 }}>
          Tạo ngay
        </a>
      </div>
    </>
  );
}
