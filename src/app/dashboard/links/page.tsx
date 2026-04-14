'use client';

import { useState, useEffect } from 'react';

interface AffiliateLink {
  id: string;
  trackingCode: string;
  shortUrl: string;
  originalUrl: string;
  clicks: number;
  conversions: number;
  revenue: number;
  createdAt: string;
  product: { name: string; imageUrl: string | null; category: string | null } | null;
}

function formatVND(n: number) {
  return new Intl.NumberFormat('vi-VN').format(n) + 'đ';
}

export default function LinksPage() {
  const [links, setLinks] = useState<AffiliateLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchLinks();
  }, []);

  async function fetchLinks() {
    setLoading(true);
    try {
      const res = await fetch('/api/affiliate/generate?limit=50');
      const json = await res.json();
      if (json.success) setLinks(json.data);
    } catch {
      // Use empty
    } finally {
      setLoading(false);
    }
  }

  function copyLink(url: string, id: string) {
    navigator.clipboard.writeText(url || '');
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  }

  const filtered = links.filter(l =>
    !search ||
    l.product?.name?.toLowerCase().includes(search.toLowerCase()) ||
    l.trackingCode.includes(search)
  );

  const totalClicks = links.reduce((s, l) => s + l.clicks, 0);
  const totalRevenue = links.reduce((s, l) => s + l.revenue, 0);
  const totalConversions = links.reduce((s, l) => s + l.conversions, 0);

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">🔗 Affiliate Links</h1>
          <p className="page-subtitle">Quản lý tất cả link affiliate và theo dõi hiệu suất</p>
        </div>
      </div>

      {/* Summary stats */}
      <div className="stats-grid" style={{ marginBottom: '20px' }}>
        {[
          { icon: '🔗', label: 'Tổng link', value: links.length, color: 'orange' },
          { icon: '👆', label: 'Tổng clicks', value: totalClicks.toLocaleString('vi-VN'), color: 'blue' },
          { icon: '🛒', label: 'Đơn thành công', value: totalConversions, color: 'green' },
          { icon: '💰', label: 'Doanh thu', value: formatVND(totalRevenue), color: 'purple' },
        ].map((s) => (
          <div key={s.label} className="stat-card">
            <div className={`stat-icon ${s.color}`}>{s.icon}</div>
            <div className="stat-value" style={{ fontSize: '22px' }}>{s.value}</div>
            <div className="stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Search + Table */}
      <div className="table-wrapper">
        <div style={{ padding: '16px', borderBottom: '1px solid var(--border)', display: 'flex', gap: '12px', alignItems: 'center' }}>
          <div className="input-group" style={{ maxWidth: '320px' }}>
            <span className="input-icon">🔍</span>
            <input
              type="text"
              className="input"
              placeholder="Tìm theo sản phẩm hoặc tracking code..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <span className="badge badge-orange">{filtered.length} links</span>
        </div>

        {loading ? (
          <div style={{ padding: '60px', textAlign: 'center' }}>
            <div className="loading-spinner" style={{ margin: '0 auto' }} />
          </div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">🔗</div>
            <div className="empty-state-title">Chưa có affiliate link</div>
            <div className="empty-state-text">Vào trang Sản phẩm, chọn sản phẩm rồi nhấn Lưu để tạo link</div>
          </div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Sản phẩm</th>
                <th>Short Link</th>
                <th>Clicks</th>
                <th>Đơn hàng</th>
                <th>Doanh thu</th>
                <th>CR%</th>
                <th>Ngày tạo</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((link) => {
                const cr = link.clicks > 0 ? ((link.conversions / link.clicks) * 100).toFixed(1) : '0';
                return (
                  <tr key={link.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{
                          width: '36px', height: '36px', borderRadius: '8px',
                          background: 'var(--bg-secondary)', border: '1px solid var(--border)',
                          overflow: 'hidden', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }}>
                          {link.product?.imageUrl
                            ? <img src={link.product.imageUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" />
                            : '🛍️'
                          }
                        </div>
                        <div>
                          <div style={{ fontSize: '13px', fontWeight: '600', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {link.product?.name || 'Sản phẩm không tên'}
                          </div>
                          {link.product?.category && (
                            <span className="badge badge-gray" style={{ marginTop: '2px' }}>{link.product.category}</span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td>
                      <code style={{
                        fontSize: '12px', color: 'var(--orange)',
                        background: 'var(--orange-glow)', padding: '3px 8px', borderRadius: '6px'
                      }}>
                        {link.shortUrl || `shope.ee/${link.trackingCode.slice(0, 8)}`}
                      </code>
                    </td>
                    <td>
                      <span style={{ fontWeight: '600' }}>{link.clicks.toLocaleString('vi-VN')}</span>
                    </td>
                    <td>
                      <span style={{ color: 'var(--green)', fontWeight: '600' }}>{link.conversions}</span>
                    </td>
                    <td>
                      <span style={{ color: 'var(--orange)', fontWeight: '700' }}>
                        {formatVND(link.revenue)}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${parseFloat(cr) >= 5 ? 'badge-green' : parseFloat(cr) >= 2 ? 'badge-yellow' : 'badge-red'}`}>
                        {cr}%
                      </span>
                    </td>
                    <td style={{ color: 'var(--text-muted)', fontSize: '12px' }}>
                      {new Date(link.createdAt).toLocaleDateString('vi-VN')}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button
                          className="btn btn-sm btn-secondary"
                          onClick={() => copyLink(link.shortUrl || link.originalUrl, link.id)}
                        >
                          {copied === link.id ? '✅' : '📋'}
                        </button>
                        <a
                          href={link.originalUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn btn-sm btn-ghost"
                        >
                          🔗
                        </a>
                        <a
                          href={`/dashboard/content?affiliateLink=${encodeURIComponent(link.shortUrl || link.originalUrl)}&productName=${encodeURIComponent(link.product?.name || '')}`}
                          className="btn btn-sm btn-primary"
                        >
                          🤖
                        </a>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}
