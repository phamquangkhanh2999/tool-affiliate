'use client';

import { useState } from 'react';
import Link from 'next/link';

interface Template {
  id: string;
  name: string;
  platform: 'facebook' | 'tiktok' | 'youtube';
  type: string;
  tone: string;
  preview: string;
  icon: string;
}

const TEMPLATES: Template[] = [
  { id: 'fb-review', name: 'Review Chân Thật', platform: 'facebook', type: 'Review', tone: 'Storytelling', preview: 'Mình vừa dùng thử [sản phẩm] được 2 tuần, và phải nói thật là...', icon: '⭐' },
  { id: 'fb-flash', name: 'Flash Sale FOMO', platform: 'facebook', type: 'Flash Sale', tone: 'Urgency', preview: '🔥 FLASH SALE CHỈ 3 TIẾNG 🔥\nGiá gốc: [xxx]đ → Chỉ còn [xxx]đ\nLink: [affiliate]', icon: '⚡' },
  { id: 'fb-story', name: 'Story Cá Nhân', platform: 'facebook', type: 'Personal Story', tone: 'Authentic', preview: 'Không nghĩ rằng mình sẽ viết review này, nhưng sau khi dùng [sản phẩm]...', icon: '📖' },
  { id: 'fb-compare', name: 'So Sánh Sản Phẩm', platform: 'facebook', type: 'Comparison', tone: 'Professional', preview: 'Mình đã thử cả 3 loại [category] phổ biến nhất hiện tại. Kết quả bất ngờ...', icon: '⚖️' },
  { id: 'tt-unbox', name: 'Unboxing Reveal', platform: 'tiktok', type: 'Unboxing', tone: 'Exciting', preview: '[Shot 1] Hộp bí ẩn... [Shot 2] Mở ra và... OMG 😱 [Shot 3] Review nhanh...', icon: '📦' },
  { id: 'tt-before', name: 'Before/After', platform: 'tiktok', type: 'Transformation', tone: 'Dramatic', preview: 'Before: [vấn đề] → After: [kết quả] • Link sản phẩm ở bio!', icon: '✨' },
  { id: 'tt-day', name: 'Day In My Life', platform: 'tiktok', type: 'Lifestyle', tone: 'Casual', preview: 'Một ngày của mình khi dùng [sản phẩm]: Sáng dậy → dùng → kết quả...', icon: '🌅' },
  { id: 'tt-trend', name: 'Trending Format', platform: 'tiktok', type: 'Trend', tone: 'Viral', preview: 'POV: Bạn phát hiện ra [sản phẩm] lần đầu tiên...', icon: '🔥' },
  { id: 'yt-tutorial', name: 'Tutorial Deep-dive', platform: 'youtube', type: 'Tutorial', tone: 'Educational', preview: 'Hướng dẫn A-Z cách sử dụng [sản phẩm] hiệu quả nhất | Review chi tiết', icon: '🎓' },
  { id: 'yt-top', name: 'Top 5/10 List', platform: 'youtube', type: 'Listicle', tone: 'Entertaining', preview: 'TOP 5 [category] ĐÁNG MUA NHẤT [năm] | So sánh chi tiết + Link mua', icon: '🏆' },
  { id: 'yt-honest', name: 'Honest Review', platform: 'youtube', type: 'Review', tone: 'Transparent', preview: 'Review THẬT [sản phẩm] sau 30 ngày - CÓ NÊN MUA KHÔNG? | Ưu & Nhược điểm', icon: '🔍' },
  { id: 'yt-vs', name: 'Comparison Battle', platform: 'youtube', type: 'Comparison', tone: 'Analytical', preview: '[Sản phẩm A] vs [Sản phẩm B] - Đâu mới là LỰA CHỌN TỐT NHẤT?', icon: '⚔️' },
];

export default function TemplatesPage() {
  const [filter, setFilter] = useState<string>('all');
  const [copied, setCopied] = useState<string | null>(null);

  const filtered = filter === 'all' ? TEMPLATES : TEMPLATES.filter(t => t.platform === filter);
  const colors: Record<string, string> = { facebook: '#1877F2', tiktok: '#ff0050', youtube: '#FF0000' };
  const studioLinks: Record<string, string> = { facebook: '/dashboard/facebook-expert', tiktok: '/dashboard/tiktok-expert', youtube: '/dashboard/youtube-expert' };

  const copy = (text: string, id: string) => { navigator.clipboard.writeText(text); setCopied(id); setTimeout(() => setCopied(null), 2000); };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <header style={{ marginBottom: '50px' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', padding: '6px 16px', borderRadius: '100px', background: 'rgba(168,85,247,0.1)', border: '1px solid rgba(168,85,247,0.2)', marginBottom: '20px' }}>
          <span style={{ fontSize: '10px', fontWeight: '900', color: '#a855f7', letterSpacing: '0.1em' }}>TEMPLATE LIBRARY</span>
        </div>
        <h1 style={{ fontSize: '48px', fontWeight: '900', color: '#fff', letterSpacing: '-0.04em' }}>Content <span style={{ color: '#a855f7' }}>Templates.</span></h1>
        <p style={{ color: '#64748b', fontSize: '16px' }}>Thư viện mẫu nội dung sẵn có cho Facebook, TikTok, YouTube.</p>
      </header>

      {/* Filter */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '30px', flexWrap: 'wrap' }}>
        {[{ k: 'all', l: '📋 Tất cả' }, { k: 'facebook', l: '📘 Facebook' }, { k: 'tiktok', l: '🎵 TikTok' }, { k: 'youtube', l: '🎬 YouTube' }].map(f => (
          <button key={f.k} onClick={() => setFilter(f.k)} style={{ padding: '10px 20px', borderRadius: '12px', background: filter === f.k ? 'rgba(168,85,247,0.15)' : 'rgba(0,0,0,0.2)', border: filter === f.k ? '1px solid rgba(168,85,247,0.3)' : '1px solid rgba(255,255,255,0.05)', color: filter === f.k ? '#a855f7' : '#64748b', cursor: 'pointer', fontWeight: '700', fontSize: '13px' }}>{f.l}</button>
        ))}
      </div>

      {/* Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '20px' }}>
        {filtered.map(t => (
          <div key={t.id} className="glass-panel" style={{ padding: '28px', borderRadius: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ fontSize: '28px' }}>{t.icon}</span>
                <div>
                  <div style={{ fontWeight: '700', color: '#fff', fontSize: '16px' }}>{t.name}</div>
                  <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
                    <span style={{ fontSize: '10px', fontWeight: '800', color: colors[t.platform], padding: '3px 8px', borderRadius: '6px', background: `${colors[t.platform]}15`, textTransform: 'uppercase' }}>{t.platform}</span>
                    <span style={{ fontSize: '10px', fontWeight: '700', color: '#94a3b8', padding: '3px 8px', borderRadius: '6px', background: 'rgba(255,255,255,0.03)' }}>{t.tone}</span>
                  </div>
                </div>
              </div>
            </div>
            <div style={{ padding: '16px', borderRadius: '12px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.03)', fontSize: '13px', color: '#94a3b8', lineHeight: '1.6', whiteSpace: 'pre-wrap', flex: 1 }}>{t.preview}</div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button onClick={() => copy(t.preview, t.id)} style={{ flex: 1, padding: '10px', borderRadius: '10px', background: copied === t.id ? 'rgba(16,185,129,0.1)' : 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', color: copied === t.id ? '#10b981' : '#94a3b8', cursor: 'pointer', fontSize: '12px', fontWeight: '700' }}>{copied === t.id ? '✅ Copied' : '📋 Copy'}</button>
              <Link href={studioLinks[t.platform]} style={{ flex: 1, padding: '10px', borderRadius: '10px', background: `${colors[t.platform]}10`, border: `1px solid ${colors[t.platform]}30`, color: colors[t.platform], cursor: 'pointer', fontSize: '12px', fontWeight: '700', textDecoration: 'none', textAlign: 'center' }}>
                🚀 Dùng Template
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
