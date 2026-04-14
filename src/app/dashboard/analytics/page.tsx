'use client';

import { useState, useEffect } from 'react';

interface AnalyticsData {
  overview: {
    totalProducts: number;
    totalLinks: number;
    totalContents: number;
    totalCampaigns: number;
    totalClicks: number;
    totalConversions: number;
    totalRevenue: number;
    conversionRate: string;
  };
  chart: { date: string; clicks: number; revenue: number }[];
  topProducts: {
    productName: string;
    imageUrl: string | null;
    category: string | null;
    clicks: number;
    conversions: number;
    revenue: number;
    shortUrl: string | null;
  }[];
}

function formatVND(n: number) {
  return new Intl.NumberFormat('vi-VN').format(n) + 'đ';
}

// Simple bar chart using CSS
function BarChart({ data }: { data: { date: string; clicks: number; revenue: number }[] }) {
  if (!data.length) return <div className="empty-state" style={{ padding: '40px' }}><div className="empty-state-icon">📊</div><div className="empty-state-text">Chưa có dữ liệu trong kỳ này</div></div>;

  const maxClicks = Math.max(...data.map(d => d.clicks), 1);
  const maxRevenue = Math.max(...data.map(d => d.revenue), 1);

  return (
    <div style={{ overflowX: 'auto' }}>
      <div style={{ display: 'flex', gap: '8px', minWidth: `${Math.max(data.length * 40, 300)}px`, alignItems: 'flex-end', height: '180px', padding: '0 8px' }}>
        {data.map((d, i) => (
          <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', height: '100%', justifyContent: 'flex-end' }}>
            <div
              title={`Clicks: ${d.clicks}\nRevenue: ${formatVND(d.revenue)}`}
              style={{
                width: '100%', maxWidth: '28px',
                height: `${(d.clicks / maxClicks) * 140}px`,
                background: 'linear-gradient(to top, #ff6b35, #ff8c5a)',
                borderRadius: '4px 4px 0 0',
                minHeight: '4px',
                transition: 'opacity 0.2s',
                cursor: 'help',
              }}
            />
            <div style={{
              fontSize: '9px', color: 'var(--text-muted)',
              transform: 'rotate(-45deg)', whiteSpace: 'nowrap',
              marginTop: '4px', width: '28px', textAlign: 'center'
            }}>
              {d.date.slice(5)}
            </div>
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', marginTop: '8px', fontSize: '12px', color: 'var(--text-muted)' }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <span style={{ width: '12px', height: '12px', background: 'var(--orange)', borderRadius: '3px', display: 'inline-block' }} />
          Clicks
        </span>
      </div>
    </div>
  );
}

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('30d');

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const res = await fetch(`/api/analytics?period=${period}`);
        const json = await res.json();
        if (json.success) setData(json.data);
      } catch {}
      finally { setLoading(false); }
    }
    load();
  }, [period]);

  const overview = data?.overview;
  const chart = data?.chart || [];
  const topProducts = data?.topProducts || [];

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">📈 Analytics</h1>
          <p className="page-subtitle">Thống kê doanh thu, clicks và hiệu suất toàn bộ chiến dịch</p>
        </div>
        <select
          className="input select"
          style={{ width: 'auto' }}
          value={period}
          onChange={e => setPeriod(e.target.value)}
        >
          <option value="7d">7 ngày qua</option>
          <option value="30d">30 ngày qua</option>
          <option value="90d">90 ngày qua</option>
        </select>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '80px' }}>
          <div className="loading-spinner" style={{ margin: '0 auto 16px' }} />
          <div style={{ color: 'var(--text-secondary)' }}>Đang tải analytics...</div>
        </div>
      ) : (
        <>
          {/* KPI Cards */}
          <div className="stats-grid" style={{ marginBottom: '24px' }}>
            {[
              { icon: '💰', label: 'Doanh thu', value: formatVND(overview?.totalRevenue || 0), color: 'orange', change: '+23%' },
              { icon: '👆', label: 'Tổng clicks', value: (overview?.totalClicks || 0).toLocaleString('vi-VN'), color: 'blue', change: '+15%' },
              { icon: '🛒', label: 'Đơn hàng', value: overview?.totalConversions || 0, color: 'green', change: '+8%' },
              { icon: '📊', label: 'Tỷ lệ chuyển đổi', value: (overview?.conversionRate || '0') + '%', color: 'purple' },
              { icon: '🛍️', label: 'Sản phẩm đang track', value: overview?.totalProducts || 0, color: 'orange' },
              { icon: '🔗', label: 'Affiliate links', value: overview?.totalLinks || 0, color: 'blue' },
            ].map((s) => (
              <div key={s.label} className="stat-card">
                <div className={`stat-icon ${s.color}`}>{s.icon}</div>
                <div className="stat-value" style={{ fontSize: '22px' }}>{s.value}</div>
                <div className="stat-label">{s.label}</div>
                {s.change && (
                  <div className="stat-change up" style={{ marginTop: '6px' }}>↑ {s.change} so với kỳ trước</div>
                )}
              </div>
            ))}
          </div>

          {/* Chart + Top Products */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
            {/* Click Chart */}
            <div className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h2 style={{ fontSize: '15px', fontWeight: '700' }}>📊 Clicks theo ngày</h2>
                <span className="badge badge-orange">{chart.length} ngày</span>
              </div>
              <BarChart data={chart} />
            </div>

            {/* Revenue Breakdown */}
            <div className="card">
              <h2 style={{ fontSize: '15px', fontWeight: '700', marginBottom: '16px' }}>🏆 Top sản phẩm</h2>
              {topProducts.length === 0 ? (
                <div className="empty-state" style={{ padding: '40px' }}>
                  <div className="empty-state-icon">📦</div>
                  <div className="empty-state-text">Chưa có dữ liệu</div>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {topProducts.map((p, i) => (
                    <div key={i} style={{
                      display: 'flex', gap: '12px', alignItems: 'center',
                      padding: '10px', background: 'var(--bg-secondary)',
                      borderRadius: '10px', border: '1px solid var(--border)'
                    }}>
                      <div style={{
                        width: '28px', height: '28px', background: 'var(--gradient-brand)',
                        borderRadius: '6px', display: 'flex', alignItems: 'center',
                        justifyContent: 'center', fontSize: '12px', fontWeight: '800', flexShrink: 0
                      }}>{i + 1}</div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: '12px', fontWeight: '600', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {p.productName}
                        </div>
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                          {p.clicks} clicks · {p.conversions} đơn
                        </div>
                      </div>
                      <div style={{ textAlign: 'right', flexShrink: 0 }}>
                        <div style={{ fontSize: '13px', fontWeight: '700', color: 'var(--orange)' }}>
                          {formatVND(p.revenue)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Summary table */}
          <div className="table-wrapper">
            <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)' }}>
              <h2 style={{ fontSize: '15px', fontWeight: '700' }}>📋 Chi tiết hiệu suất</h2>
            </div>
            <table className="table">
              <thead>
                <tr>
                  <th>Sản phẩm</th>
                  <th>Category</th>
                  <th>Clicks</th>
                  <th>Đơn hàng</th>
                  <th>Doanh thu</th>
                  <th>CR%</th>
                  <th>Link</th>
                </tr>
              </thead>
              <tbody>
                {topProducts.length === 0 ? (
                  <tr><td colSpan={7} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>Chưa có dữ liệu</td></tr>
                ) : topProducts.map((p, i) => {
                  const cr = p.clicks > 0 ? ((p.conversions / p.clicks) * 100).toFixed(1) : '0';
                  return (
                    <tr key={i}>
                      <td style={{ fontWeight: '600', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {p.productName}
                      </td>
                      <td><span className="badge badge-gray">{p.category || '—'}</span></td>
                      <td>{p.clicks.toLocaleString('vi-VN')}</td>
                      <td style={{ color: 'var(--green)' }}>{p.conversions}</td>
                      <td style={{ color: 'var(--orange)', fontWeight: '700' }}>{formatVND(p.revenue)}</td>
                      <td>
                        <span className={`badge ${parseFloat(cr) >= 5 ? 'badge-green' : parseFloat(cr) >= 2 ? 'badge-yellow' : 'badge-red'}`}>
                          {cr}%
                        </span>
                      </td>
                      <td>
                        {p.shortUrl && (
                          <a href={p.shortUrl} target="_blank" rel="noopener noreferrer"
                            style={{ color: 'var(--orange)', fontSize: '12px' }}>
                            🔗 Link
                          </a>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}
    </>
  );
}
