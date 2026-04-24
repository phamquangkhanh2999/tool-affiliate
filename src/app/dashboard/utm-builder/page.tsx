'use client';

import { useState } from 'react';

interface UTMResult { originalUrl: string; utmUrl: string; shortDisplay: string }

export default function UTMBuilderPage() {
  const [url, setUrl] = useState('');
  const [campaign, setCampaign] = useState('');
  const [platform, setPlatform] = useState('facebook');
  const [content, setContent] = useState('');
  const [result, setResult] = useState<UTMResult | null>(null);
  const [multiResult, setMultiResult] = useState<Record<string, UTMResult> | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [mode, setMode] = useState<'single' | 'multi'>('single');
  const [loading, setLoading] = useState(false);

  const handleBuild = async () => {
    if (!url || !campaign) return;
    setLoading(true); setResult(null); setMultiResult(null);
    try {
      const res = await fetch('/api/utm', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(mode === 'multi' ? { url, campaign, multiPlatform: true } : { url, campaign, source: platform, medium: platform === 'youtube' || platform === 'tiktok' ? 'video' : 'social', content: content || undefined }),
      });
      const data = await res.json();
      if (data.success) {
        if (mode === 'multi') setMultiResult(data.data);
        else setResult(data.data);
      }
    } catch {} finally { setLoading(false); }
  };

  const copy = (text: string, id: string) => { navigator.clipboard.writeText(text); setCopied(id); setTimeout(() => setCopied(null), 2000); };
  const iStyle: React.CSSProperties = { width: '100%', padding: '16px', borderRadius: '12px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.05)', color: '#fff', fontSize: '14px', outline: 'none' };
  const platformColors: Record<string, string> = { facebook: '#1877F2', tiktok: '#ff0050', youtube: '#FF0000', zalo: '#0068FF', instagram: '#E4405F' };

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto' }}>
      <header style={{ marginBottom: '50px' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', padding: '6px 16px', borderRadius: '100px', background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)', marginBottom: '20px' }}>
          <span style={{ fontSize: '10px', fontWeight: '900', color: '#6366f1', letterSpacing: '0.1em' }}>UTM BUILDER</span>
        </div>
        <h1 style={{ fontSize: '48px', fontWeight: '900', color: '#fff', letterSpacing: '-0.04em' }}>UTM <span style={{ color: '#6366f1' }}>Builder.</span></h1>
        <p style={{ color: '#64748b', fontSize: '16px' }}>Tạo link tracking UTM tối ưu cho từng nền tảng, đo lường ROI chính xác.</p>
      </header>

      <section className="glass-panel" style={{ padding: '30px', borderRadius: '24px', marginBottom: '30px' }}>
        <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
          <button onClick={() => setMode('single')} style={{ padding: '10px 20px', borderRadius: '10px', background: mode === 'single' ? 'rgba(99,102,241,0.15)' : 'transparent', border: mode === 'single' ? '1px solid rgba(99,102,241,0.3)' : '1px solid rgba(255,255,255,0.05)', color: mode === 'single' ? '#6366f1' : '#64748b', cursor: 'pointer', fontWeight: '700', fontSize: '13px' }}>Từng Platform</button>
          <button onClick={() => setMode('multi')} style={{ padding: '10px 20px', borderRadius: '10px', background: mode === 'multi' ? 'rgba(99,102,241,0.15)' : 'transparent', border: mode === 'multi' ? '1px solid rgba(99,102,241,0.3)' : '1px solid rgba(255,255,255,0.05)', color: mode === 'multi' ? '#6366f1' : '#64748b', cursor: 'pointer', fontWeight: '700', fontSize: '13px' }}>Tất Cả Platforms</button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div><label style={{ display: 'block', fontSize: '11px', fontWeight: '800', color: '#475569', marginBottom: '8px', letterSpacing: '0.1em' }}>URL GỐC (AFFILIATE LINK)</label><input type="url" placeholder="https://shope.ee/..." value={url} onChange={e => setUrl(e.target.value)} style={iStyle} /></div>
          <div><label style={{ display: 'block', fontSize: '11px', fontWeight: '800', color: '#475569', marginBottom: '8px', letterSpacing: '0.1em' }}>TÊN CHIẾN DỊCH</label><input type="text" placeholder="flash-sale-t4, review-son-mac..." value={campaign} onChange={e => setCampaign(e.target.value)} style={iStyle} /></div>
          {mode === 'single' && (
            <>
              <div><label style={{ display: 'block', fontSize: '11px', fontWeight: '800', color: '#475569', marginBottom: '8px', letterSpacing: '0.1em' }}>NỀN TẢNG</label>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {['facebook', 'tiktok', 'youtube', 'zalo', 'instagram'].map(p => (
                    <button key={p} onClick={() => setPlatform(p)} style={{ padding: '10px 18px', borderRadius: '10px', background: platform === p ? `${platformColors[p]}15` : 'rgba(0,0,0,0.2)', border: `1px solid ${platform === p ? platformColors[p] + '40' : 'rgba(255,255,255,0.05)'}`, color: platform === p ? platformColors[p] : '#64748b', cursor: 'pointer', fontWeight: '700', fontSize: '13px', textTransform: 'capitalize' }}>{p}</button>
                  ))}
                </div>
              </div>
              <div><label style={{ display: 'block', fontSize: '11px', fontWeight: '800', color: '#475569', marginBottom: '8px', letterSpacing: '0.1em' }}>VARIANT (TÙY CHỌN)</label><input type="text" placeholder="variant-a, post-1..." value={content} onChange={e => setContent(e.target.value)} style={iStyle} /></div>
            </>
          )}
          <button className="btn-tech" onClick={handleBuild} disabled={loading || !url || !campaign} style={{ width: '100%', padding: '18px', background: loading ? '#475569' : 'linear-gradient(135deg,#6366f1,#22d3ee)', opacity: loading ? 0.5 : 1 }}>
            {loading ? 'Đang tạo...' : mode === 'multi' ? '🚀 TẠO UTM CHO TẤT CẢ PLATFORMS' : '🔗 TẠO UTM LINK'}
          </button>
        </div>
      </section>

      {/* Single Result */}
      {result && (
        <section className="glass-panel" style={{ padding: '30px', borderRadius: '24px', marginBottom: '30px' }}>
          <h4 style={{ color: '#6366f1', fontSize: '14px', fontWeight: '800', marginBottom: '16px' }}>✅ UTM LINK ĐÃ TẠO</h4>
          <div style={{ background: 'rgba(0,0,0,0.3)', padding: '20px', borderRadius: '14px', fontFamily: 'monospace', fontSize: '13px', color: '#22d3ee', wordBreak: 'break-all', lineHeight: '1.6', marginBottom: '16px' }}>{result.utmUrl}</div>
          <button onClick={() => copy(result.utmUrl, 'utm')} className="btn-tech" style={{ width: '100%', padding: '14px', background: copied === 'utm' ? '#10b981' : 'linear-gradient(135deg,#6366f1,#22d3ee)' }}>{copied === 'utm' ? 'COPIED ✅' : '📋 COPY UTM LINK'}</button>
        </section>
      )}

      {/* Multi Result */}
      {multiResult && (
        <section className="glass-panel" style={{ padding: '30px', borderRadius: '24px' }}>
          <h4 style={{ color: '#6366f1', fontSize: '14px', fontWeight: '800', marginBottom: '20px' }}>✅ UTM LINKS CHO TẤT CẢ PLATFORMS</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {Object.entries(multiResult).map(([p, r]) => (
              <div key={p} style={{ padding: '20px', borderRadius: '16px', background: 'rgba(0,0,0,0.2)', border: `1px solid ${(platformColors[p] || '#6366f1') + '20'}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <span style={{ fontSize: '13px', fontWeight: '800', color: platformColors[p] || '#6366f1', textTransform: 'uppercase' }}>{p}</span>
                  <button onClick={() => copy(r.utmUrl, `m-${p}`)} style={{ padding: '6px 14px', borderRadius: '8px', background: copied === `m-${p}` ? '#10b981' : 'rgba(255,255,255,0.05)', border: 'none', color: copied === `m-${p}` ? '#fff' : '#94a3b8', cursor: 'pointer', fontSize: '12px', fontWeight: '700' }}>{copied === `m-${p}` ? '✅' : '📋 Copy'}</button>
                </div>
                <div style={{ fontFamily: 'monospace', fontSize: '12px', color: '#94a3b8', wordBreak: 'break-all' }}>{r.utmUrl}</div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
