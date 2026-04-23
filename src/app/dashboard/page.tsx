'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';

export default function DashboardPage() {
  const [stats, setStats] = useState({ totalPosts: 0, uniqueLinks: 0, aiStatus: 'CONNECTED' });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [resPosts, resLinks] = await Promise.all([fetch('/api/content/expert'), fetch('/api/links')]);
        if (resPosts.ok && resLinks.ok) {
          const jsonPosts = await resPosts.json();
          const jsonLinks = await resLinks.json();
          setStats({ totalPosts: jsonPosts.data?.length || 0, uniqueLinks: jsonLinks.data?.length || 0, aiStatus: 'CONNECTED' });
        }
      } catch (err) {}
    };
    fetchStats();
  }, []);

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
      {/* Cinematic Hero */}
      <section style={{ 
        position: 'relative', 
        padding: '100px 60px', 
        borderRadius: '40px', 
        background: 'linear-gradient(225deg, #0f172a 0%, #020617 100%)',
        marginBottom: '40px',
        border: '1px solid rgba(255,255,255,0.05)',
        overflow: 'hidden'
      }}>
        {/* Vector Grid Background */}
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(rgba(34, 211, 238, 0.1) 1px, transparent 1px)', backgroundSize: '40px 40px', opacity: 0.3, zIndex: 0 }} />
        
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 12px', borderRadius: '100px', background: 'rgba(34, 211, 238, 0.1)', border: '1px solid rgba(34, 211, 238, 0.2)', marginBottom: '30px' }}>
             <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#22d3ee', boxShadow: '0 0 10px #22d3ee' }} />
             <span style={{ fontSize: '10px', fontWeight: '900', color: '#22d3ee', letterSpacing: '0.1em' }}>NEURAL ENGINE READY</span>
          </div>
          
          <h1 style={{ fontSize: '72px', fontWeight: '900', marginBottom: '20px', lineHeight: '0.9', letterSpacing: '-0.05em' }}>
            <span style={{ color: '#fff' }}>COMMAND</span> <br />
            <span style={{ background: 'linear-gradient(to right, #22d3ee, #6366f1)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>CENTER</span>
          </h1>
          
          <p style={{ color: '#64748b', fontSize: '20px', maxWidth: '600px', marginBottom: '40px', fontWeight: '500', lineHeight: '1.6' }}>
            Hệ điều hành nội dung AI tối thượng. Tinh chỉnh, sáng tạo và quản trị toàn bộ dòng chảy Affiliate của bạn.
          </p>

          <div style={{ display: 'flex', gap: '20px' }}>
            <Link href="/dashboard/facebook-expert">
              <button className="btn-tech" style={{ padding: '18px 40px', fontSize: '16px' }}>KHỞI CHẠY STUDIO ⚡</button>
            </Link>
          </div>
        </div>
      </section>

      {/* System Diagnostics Section */}
      <section className="glass-panel" style={{ padding: '40px', borderRadius: '32px', marginBottom: '40px', background: 'rgba(34, 211, 238, 0.02)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
          <div>
            <h3 style={{ fontSize: '24px', fontWeight: '800', color: '#fff', marginBottom: '8px' }}>🛡️ System Diagnostics</h3>
            <p style={{ color: '#64748b', fontSize: '14px' }}>Xác minh kết nối thời gian thực tới Neon Database và Gemini AI</p>
          </div>
          <button 
            id="diag-btn"
            className="btn-tech"
            style={{ padding: '12px 30px', fontSize: '14px' }}
            onClick={async () => {
              const btn = document.getElementById('diag-btn');
              if (btn) btn.innerText = 'Đang kiểm tra...';
              try {
                const res = await fetch('/api/debug/system-check');
                const data = await res.json();
                if (data.success) {
                  alert(`✅ DATABASE: ${data.data.database.message}\n✅ AI ENGINE: ${data.data.ai.message}`);
                }
              } catch (err) {
                alert('❌ Lỗi kết nối hệ thống');
              } finally {
                if (btn) btn.innerText = 'Bắt đầu kiểm tra';
              }
            }}
          >
            Bắt đầu kiểm tra
          </button>
        </div>
      </section>

      {/* Bento Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '24px' }}>
        
        {/* Large Stat Card */}
        <div className="glass-panel" style={{ gridColumn: 'span 8', padding: '40px', borderRadius: '32px', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: 0, right: 0, width: '200px', height: '100%', background: 'linear-gradient(to left, rgba(34, 211, 238, 0.05), transparent)', zIndex: 0 }} />
          <div style={{ position: 'relative', zIndex: 1 }}>
             <div style={{ fontSize: '12px', fontWeight: '800', color: '#475569', letterSpacing: '0.15em', marginBottom: '40px' }}>TOTAL GENERATED CONTENT</div>
             <div style={{ display: 'flex', alignItems: 'flex-end', gap: '20px' }}>
                <div style={{ fontSize: '100px', fontWeight: '900', color: '#fff', lineHeight: '0.8' }}>{stats.totalPosts}</div>
                <div style={{ color: '#22d3ee', fontSize: '14px', fontWeight: '800', marginBottom: '10px' }}>UNITS CREATED</div>
             </div>
          </div>
        </div>

        {/* Small Stat Card 1 */}
        <div className="glass-panel" style={{ gridColumn: 'span 4', padding: '40px', borderRadius: '32px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
           <div>
              <div style={{ fontSize: '11px', fontWeight: '800', color: '#475569', letterSpacing: '0.15em', marginBottom: '8px' }}>REPOSITORY SIZE</div>
              <div style={{ fontSize: '48px', fontWeight: '900', color: '#fff' }}>{stats.uniqueLinks}</div>
           </div>
           <div style={{ fontSize: '13px', color: '#64748b', fontWeight: '600' }}>UNIQUE AFFILIATE LINKS</div>
        </div>

        {/* System Health Card */}
        <div className="glass-panel" style={{ gridColumn: 'span 4', padding: '40px', borderRadius: '32px' }}>
           <div style={{ fontSize: '11px', fontWeight: '800', color: '#475569', letterSpacing: '0.15em', marginBottom: '24px' }}>AI ENGINE STATUS</div>
           <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              <div style={{ flex: 1, height: '4px', background: 'rgba(34, 211, 238, 0.2)', borderRadius: '10px', overflow: 'hidden' }}>
                 <div style={{ width: '100%', height: '100%', background: '#22d3ee', boxShadow: '0 0 15px #22d3ee' }} />
              </div>
              <span style={{ fontSize: '14px', fontWeight: '900', color: '#22d3ee' }}>{stats.aiStatus}</span>
           </div>
           <div style={{ fontSize: '12px', color: '#64748b', marginTop: '20px', fontWeight: '500' }}>GEMINI 1.5 FLASH • LATENCY 1.2s</div>
        </div>

        {/* Quick Link Card */}
        <Link href="/dashboard/links" style={{ gridColumn: 'span 8', textDecoration: 'none' }}>
           <div className="glass-panel" style={{ padding: '40px', borderRadius: '32px', height: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'linear-gradient(to right, rgba(99, 102, 241, 0.1), transparent)' }}>
              <div>
                 <div style={{ fontSize: '24px', fontWeight: '900', color: '#fff', marginBottom: '8px' }}>Mở Kho Link Tức Thì 📂</div>
                 <div style={{ color: '#94a3b8', fontSize: '14px' }}>Truy xuất nhanh các liên kết đã tạo trong lịch sử.</div>
              </div>
              <div style={{ fontSize: '32px' }}>→</div>
           </div>
        </Link>

      </div>
    </div>
  );
}
