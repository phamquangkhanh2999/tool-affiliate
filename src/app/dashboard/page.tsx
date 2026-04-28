'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function DashboardPage() {
  const [stats, setStats] = useState({ totalPosts: 0, uniqueLinks: 0, aiStatus: 'CONNECTED' });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [resPosts, resLinks] = await Promise.all([
          fetch('/api/content/expert'),
          fetch('/api/links'),
        ]);
        if (resPosts.ok && resLinks.ok) {
          const jsonPosts = await resPosts.json();
          const jsonLinks = await resLinks.json();
          setStats({
            totalPosts: jsonPosts.data?.length || 0,
            uniqueLinks: jsonLinks.data?.length || 0,
            aiStatus: 'CONNECTED',
          });
        }
      } catch (err) {}
    };
    fetchStats();
  }, []);

  const studios = [
    { href: '/dashboard/facebook-expert', icon: '📘', name: 'Facebook Expert', desc: 'Tạo caption, review, auto-post + comment seeding', color: '#1877F2', gradient: 'linear-gradient(135deg,#1877F2,#00C6FF)' },
    { href: '/dashboard/tiktok-expert', icon: '🎵', name: 'TikTok Expert', desc: 'Script video 15s/30s/60s, hashtags, trending sounds', color: '#ff0050', gradient: 'linear-gradient(135deg,#ff0050,#00f2ea)' },
    { href: '/dashboard/youtube-expert', icon: '🎬', name: 'YouTube Expert', desc: 'Title SEO, script, description, tags, pinned comment', color: '#FF0000', gradient: 'linear-gradient(135deg,#FF0000,#FF6B6B)' },
  ];

  const tools = [
    { href: '/dashboard/utm-builder', icon: '🔗', name: 'UTM Builder', desc: 'Tạo link tracking UTM đo lường ROI', color: '#6366f1' },
    { href: '/dashboard/templates', icon: '📋', name: 'Templates', desc: 'Thư viện mẫu nội dung sẵn có', color: '#a855f7' },
    { href: '/dashboard/bulk-generate', icon: '📦', name: 'Bulk Generator', desc: 'Tạo content hàng loạt đa nền tảng', color: '#f59e0b' },
    { href: '/dashboard/facebook-connect', icon: '🔌', name: 'FB Connect', desc: 'Kết nối Page Facebook để auto-post', color: '#1877F2' },
  ];

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
      {/* Hero */}
      <section style={{ position: 'relative', padding: '80px 60px', borderRadius: '40px', background: 'linear-gradient(225deg, #0f172a 0%, #020617 100%)', marginBottom: '40px', border: '1px solid rgba(255,255,255,0.05)', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(rgba(34,211,238,0.1) 1px, transparent 1px)', backgroundSize: '40px 40px', opacity: 0.3, zIndex: 0 }} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 12px', borderRadius: '100px', background: 'rgba(34,211,238,0.1)', border: '1px solid rgba(34,211,238,0.2)', marginBottom: '30px' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#22d3ee', boxShadow: '0 0 10px #22d3ee' }} />
            <span style={{ fontSize: '10px', fontWeight: '900', color: '#22d3ee', letterSpacing: '0.1em' }}>MULTI-PLATFORM ENGINE READY</span>
          </div>
          <h1 style={{ fontSize: '64px', fontWeight: '900', marginBottom: '20px', lineHeight: '0.9', letterSpacing: '-0.05em' }}>
            <span style={{ color: '#fff' }}>COMMAND</span><br />
            <span style={{ background: 'linear-gradient(to right, #22d3ee, #6366f1)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>CENTER</span>
          </h1>
          <p style={{ color: '#64748b', fontSize: '18px', maxWidth: '600px', marginBottom: '30px', fontWeight: '500', lineHeight: '1.6' }}>
            Hệ điều hành nội dung AI tối thượng. Sáng tạo và phân phối trên Facebook, TikTok, YouTube.
          </p>
        </div>
      </section>

      {/* Content Studios */}
      <section style={{ marginBottom: '40px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: '800', color: '#fff', marginBottom: '20px', letterSpacing: '0.05em' }}>🎨 AI CONTENT STUDIOS</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
          {studios.map(s => (
            <Link key={s.href} href={s.href} style={{ textDecoration: 'none' }}>
              <div className="glass-panel" style={{ padding: '30px', borderRadius: '24px', height: '100%', position: 'relative', overflow: 'hidden', cursor: 'pointer' }}>
                <div style={{ position: 'absolute', top: 0, right: 0, width: '120px', height: '100%', background: `linear-gradient(to left, ${s.color}08, transparent)`, zIndex: 0 }} />
                <div style={{ position: 'relative', zIndex: 1 }}>
                  <div style={{ fontSize: '36px', marginBottom: '16px' }}>{s.icon}</div>
                  <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#fff', marginBottom: '8px' }}>{s.name}</h3>
                  <p style={{ color: '#64748b', fontSize: '13px', lineHeight: '1.5' }}>{s.desc}</p>
                  <div style={{ marginTop: '20px', display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '8px 16px', borderRadius: '10px', background: `${s.color}15`, border: `1px solid ${s.color}30`, color: s.color, fontSize: '12px', fontWeight: '700' }}>
                    Mở Studio →
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* System Diagnostics */}
      <section className="glass-panel" style={{ padding: '30px', borderRadius: '24px', marginBottom: '40px', background: 'rgba(34,211,238,0.02)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
          <div>
            <h3 style={{ fontSize: '20px', fontWeight: '800', color: '#fff', marginBottom: '8px' }}>🛡️ System Diagnostics</h3>
            <p style={{ color: '#64748b', fontSize: '14px' }}>Xác minh kết nối thời gian thực tới Database, AI Engine và Facebook</p>
          </div>
          <button id="diag-btn" className="btn-tech" style={{ padding: '12px 30px', fontSize: '14px' }} onClick={async () => {
            const btn = document.getElementById('diag-btn');
            if (btn) btn.innerText = 'Đang kiểm tra...';
            try {
              const res = await fetch('/api/debug/system-check');
              const data = await res.json();
              if (data.success) {
                const fbStatus = data.data.facebook?.status === 'error' ? '❌' : (data.data.facebook?.status === 'warning' ? '⚠️' : '✅');
                const fbMsg = data.data.facebook ? `\n${fbStatus} FACEBOOK: ${data.data.facebook.message}` : '';
                alert(`✅ DATABASE: ${data.data.database.message}\n✅ AI ENGINE: ${data.data.ai.message}${fbMsg}`);
              }
            } catch { alert('❌ Lỗi kết nối hệ thống'); }
            finally { if (btn) btn.innerText = 'Bắt đầu kiểm tra'; }
          }}>Bắt đầu kiểm tra</button>
        </div>
      </section>

      {/* Stats Grid */}
      <div className="grid-container" style={{ marginBottom: '40px' }}>
        <div className="glass-panel col-span-8" style={{ padding: '36px', borderRadius: '28px', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: 0, right: 0, width: '200px', height: '100%', background: 'linear-gradient(to left, rgba(34,211,238,0.05), transparent)', zIndex: 0 }} />
          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ fontSize: '12px', fontWeight: '800', color: '#475569', letterSpacing: '0.15em', marginBottom: '30px' }}>TOTAL GENERATED CONTENT</div>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '20px' }}>
              <div style={{ fontSize: '80px', fontWeight: '900', color: '#fff', lineHeight: '0.8' }}>{stats.totalPosts}</div>
              <div style={{ color: '#22d3ee', fontSize: '14px', fontWeight: '800', marginBottom: '10px' }}>UNITS CREATED</div>
            </div>
          </div>
        </div>
        <div className="glass-panel col-span-4" style={{ padding: '36px', borderRadius: '28px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: '11px', fontWeight: '800', color: '#475569', letterSpacing: '0.15em', marginBottom: '8px' }}>REPOSITORY SIZE</div>
            <div style={{ fontSize: '48px', fontWeight: '900', color: '#fff' }}>{stats.uniqueLinks}</div>
          </div>
          <div style={{ fontSize: '13px', color: '#64748b', fontWeight: '600' }}>UNIQUE AFFILIATE LINKS</div>
        </div>
        <div className="glass-panel col-span-4" style={{ padding: '36px', borderRadius: '28px' }}>
          <div style={{ fontSize: '11px', fontWeight: '800', color: '#475569', letterSpacing: '0.15em', marginBottom: '20px' }}>AI ENGINE STATUS</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <div style={{ flex: 1, height: '4px', background: 'rgba(34,211,238,0.2)', borderRadius: '10px', overflow: 'hidden' }}>
              <div style={{ width: '100%', height: '100%', background: '#22d3ee', boxShadow: '0 0 15px #22d3ee' }} />
            </div>
            <span style={{ fontSize: '14px', fontWeight: '900', color: '#22d3ee' }}>{stats.aiStatus}</span>
          </div>
          <div style={{ fontSize: '12px', color: '#64748b', marginTop: '16px', fontWeight: '500' }}>Gemini AI • Multi-Platform</div>
        </div>

        {/* Tools Quick Access */}
        <div className="col-span-8" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
          {tools.map(t => (
            <Link key={t.href} href={t.href} style={{ textDecoration: 'none' }}>
              <div className="glass-panel" style={{ padding: '24px', borderRadius: '20px', display: 'flex', alignItems: 'center', gap: '16px', height: '100%' }}>
                <span style={{ fontSize: '28px' }}>{t.icon}</span>
                <div>
                  <div style={{ fontWeight: '700', color: '#fff', fontSize: '15px', marginBottom: '4px' }}>{t.name}</div>
                  <div style={{ color: '#64748b', fontSize: '12px' }}>{t.desc}</div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
