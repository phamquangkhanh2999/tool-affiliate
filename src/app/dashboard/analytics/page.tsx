'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function AnalyticsDashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState('30d');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/analytics?range=${range}`);
        const json = await res.json();
        if (json.success) {
          setData(json.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [range]);

  if (loading) {
    return (
      <div style={{ padding: '40px', display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <div style={{ color: '#22d3ee', fontSize: '20px', fontWeight: 'bold' }}>Đang tải dữ liệu phân tích...</div>
      </div>
    );
  }

  if (!data) return <div>Lỗi tải dữ liệu</div>;

  const maxRevenue = Math.max(...data.chartData.map((d: any) => d.revenue));

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', paddingBottom: '60px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '40px' }}>
        <div>
          <h1 style={{ fontSize: '36px', fontWeight: '900', color: '#fff', marginBottom: '8px' }}>Phân tích doanh thu</h1>
          <p style={{ color: '#64748b' }}>Theo dõi hiệu suất của tất cả Affiliate Link</p>
        </div>
        <div style={{ display: 'flex', gap: '10px', background: 'rgba(255,255,255,0.05)', padding: '5px', borderRadius: '12px' }}>
          {['7d', '30d', 'all'].map(r => (
            <button
              key={r}
              onClick={() => setRange(r)}
              style={{
                padding: '8px 16px',
                borderRadius: '8px',
                border: 'none',
                background: range === r ? '#22d3ee' : 'transparent',
                color: range === r ? '#000' : '#94a3b8',
                fontWeight: '700',
                cursor: 'pointer'
              }}
            >
              {r === '7d' ? '7 Ngày' : r === '30d' ? '30 Ngày' : 'Tất cả'}
            </button>
          ))}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid-container" style={{ marginBottom: '40px' }}>
        <div className="glass-panel col-span-3" style={{ padding: '24px', borderRadius: '20px' }}>
          <div style={{ fontSize: '12px', color: '#64748b', fontWeight: '700', marginBottom: '10px' }}>TỔNG DOANH THU</div>
          <div style={{ fontSize: '32px', fontWeight: '900', color: '#22d3ee' }}>
            {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(data.summary.totalRevenue)}
          </div>
        </div>
        <div className="glass-panel col-span-3" style={{ padding: '24px', borderRadius: '20px' }}>
          <div style={{ fontSize: '12px', color: '#64748b', fontWeight: '700', marginBottom: '10px' }}>TỔNG SỐ CLICK</div>
          <div style={{ fontSize: '32px', fontWeight: '900', color: '#fff' }}>{data.summary.totalClicks}</div>
        </div>
        <div className="glass-panel col-span-3" style={{ padding: '24px', borderRadius: '20px' }}>
          <div style={{ fontSize: '12px', color: '#64748b', fontWeight: '700', marginBottom: '10px' }}>CHUYỂN ĐỔI (ĐƠN HÀNG)</div>
          <div style={{ fontSize: '32px', fontWeight: '900', color: '#fff' }}>{data.summary.conversions}</div>
        </div>
        <div className="glass-panel col-span-3" style={{ padding: '24px', borderRadius: '20px' }}>
          <div style={{ fontSize: '12px', color: '#64748b', fontWeight: '700', marginBottom: '10px' }}>LINK ĐÃ TẠO</div>
          <div style={{ fontSize: '32px', fontWeight: '900', color: '#fff' }}>{data.summary.totalLinks}</div>
        </div>
      </div>

      <div className="grid-container">
        {/* Revenue Chart */}
        <div className="glass-panel col-span-8" style={{ padding: '30px', borderRadius: '24px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '30px' }}>Biểu đồ doanh thu</h3>
          <div style={{ height: '300px', display: 'flex', alignItems: 'flex-end', gap: '8px', paddingBottom: '20px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
            {data.chartData.map((d: any, idx: number) => {
              const heightPct = maxRevenue === 0 ? 0 : (d.revenue / maxRevenue) * 100;
              return (
                <div key={idx} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
                  <div 
                    title={`${d.date}: ${new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(d.revenue)}`}
                    style={{ 
                      width: '100%', 
                      height: `${heightPct}%`, 
                      background: 'linear-gradient(to top, #6366f1, #22d3ee)', 
                      borderRadius: '4px 4px 0 0',
                      minHeight: '4px',
                      transition: 'height 0.5s ease'
                    }} 
                  />
                </div>
              );
            })}
          </div>
        </div>

        {/* Top Links */}
        <div className="glass-panel col-span-4" style={{ padding: '30px', borderRadius: '24px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '20px' }}>Top Link Hiệu Quả</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {data.topLinks.length === 0 ? (
              <div style={{ color: '#64748b', fontSize: '14px', textAlign: 'center', padding: '40px 0' }}>Chưa có dữ liệu click</div>
            ) : (
              data.topLinks.map((link: any, idx: number) => (
                <div key={link.id} style={{ display: 'flex', alignItems: 'center', gap: '15px', padding: '15px', background: 'rgba(255,255,255,0.02)', borderRadius: '12px' }}>
                  <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: 'rgba(34,211,238,0.1)', color: '#22d3ee', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                    {idx + 1}
                  </div>
                  <div style={{ flex: 1, overflow: 'hidden' }}>
                    <div style={{ fontSize: '14px', fontWeight: '700', color: '#fff', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>{link.productName}</div>
                    <div style={{ fontSize: '12px', color: '#64748b' }}>{link.clicks} clicks</div>
                  </div>
                  <div style={{ fontWeight: '800', color: '#22d3ee', fontSize: '14px' }}>
                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(link.revenue)}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
