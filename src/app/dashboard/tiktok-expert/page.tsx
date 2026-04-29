'use client';

import { useState } from 'react';

interface TikTokResult {
  hooks: string[];
  script15s: string;
  script30s: string;
  script60s: string;
  caption: string;
  trendingSounds: string[];
  commentSeedings: string[];
  cta: string;
  imagePrompt?: string;
  videoPrompt?: string;
}

export default function TikTokExpertPage() {
  const [productName, setProductName] = useState('');
  const [affiliateLink, setAffiliateLink] = useState('');
  const [additionalInfo, setAdditionalInfo] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<TikTokResult | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'15s' | '30s' | '60s'>('30s');

  const handleGenerate = async () => {
    if (!productName || !affiliateLink) return;
    setLoading(true); setResult(null);
    try {
      const res = await fetch('/api/content/tiktok-expert', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ productName, affiliateLink, additionalInfo }) });
      const data = await res.json();
      if (data.success) setResult(data.data);
    } catch {} finally { setLoading(false); }
  };

  const copy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id); setTimeout(() => setCopied(null), 2000);
  };

  const iStyle: React.CSSProperties = { width: '100%', padding: '16px', borderRadius: '12px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.05)', color: '#fff', fontSize: '14px', outline: 'none' };
  const scriptMap = { '15s': result?.script15s, '30s': result?.script30s, '60s': result?.script60s };

  return (
    <div style={{ maxWidth: '1600px', margin: '0 auto' }}>
      <header style={{ marginBottom: '50px' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', padding: '6px 16px', borderRadius: '100px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', marginBottom: '20px' }}>
          <span style={{ fontSize: '10px', fontWeight: '900', color: '#ff0050', letterSpacing: '0.1em' }}>TIKTOK STUDIO</span>
        </div>
        <h1 style={{ fontSize: '56px', fontWeight: '900', color: '#fff', letterSpacing: '-0.04em' }}>TikTok <span style={{ color: '#ff0050' }}>Expert.</span></h1>
        <p style={{ color: '#64748b', fontSize: '18px' }}>Tạo script video viral, caption, hashtags tối ưu cho TikTok Affiliate.</p>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '450px 1fr', gap: '40px', alignItems: 'start' }}>
        {/* Control */}
        <aside className="glass-panel" style={{ padding: '40px', borderRadius: '32px', position: 'sticky', top: '40px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#fff', marginBottom: '30px' }}>CONTROL PANEL</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
            <div><label style={{ display: 'block', fontSize: '11px', fontWeight: '800', color: '#475569', marginBottom: '10px', letterSpacing: '0.1em' }}>SẢN PHẨM</label><input type="text" placeholder="Tên sản phẩm..." value={productName} onChange={e => setProductName(e.target.value)} style={iStyle} /></div>
            <div><label style={{ display: 'block', fontSize: '11px', fontWeight: '800', color: '#475569', marginBottom: '10px', letterSpacing: '0.1em' }}>LINK BIO</label><input type="text" placeholder="Link affiliate (đặt ở bio)..." value={affiliateLink} onChange={e => setAffiliateLink(e.target.value)} style={iStyle} /></div>
            <div><label style={{ display: 'block', fontSize: '11px', fontWeight: '800', color: '#475569', marginBottom: '10px', letterSpacing: '0.1em' }}>THÔNG TIN THÊM</label><textarea rows={4} placeholder="Giá, ưu đãi, đặc điểm..." value={additionalInfo} onChange={e => setAdditionalInfo(e.target.value)} style={{ ...iStyle, resize: 'none' }} /></div>
            <button className="btn-tech" onClick={handleGenerate} disabled={loading || !productName || !affiliateLink} style={{ width: '100%', padding: '18px', background: loading ? '#475569' : 'linear-gradient(135deg,#ff0050,#00f2ea)', opacity: loading ? 0.5 : 1 }}>
              {loading ? 'GENERATING...' : 'TẠO SCRIPT TikTok 🎵'}
            </button>
          </div>
        </aside>

        {/* Output */}
        <main style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {result ? (
            <>
              {/* Hooks */}
              <div className="glass-panel" style={{ padding: '30px', borderRadius: '24px' }}>
                <h4 style={{ color: '#ff0050', fontSize: '14px', fontWeight: '800', marginBottom: '16px' }}>🎯 HOOK 3 GIÂY ĐẦU</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {result.hooks.map((h, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 18px', borderRadius: '14px', background: 'rgba(255,0,80,0.05)', border: '1px solid rgba(255,0,80,0.1)' }}>
                      <span style={{ color: '#fff', fontWeight: '600', fontSize: '15px' }}>"{h}"</span>
                      <button onClick={() => copy(h, `h-${i}`)} style={{ background: 'none', border: 'none', color: copied === `h-${i}` ? '#10b981' : '#ff0050', cursor: 'pointer' }}>{copied === `h-${i}` ? '✅' : '📋'}</button>
                    </div>
                  ))}
                </div>
              </div>

              {/* TikTok Phone Mockup + Script */}
              <div className="glass-panel" style={{ borderRadius: '24px', overflow: 'hidden' }}>
                {/* Tab bar */}
                <div style={{ display: 'flex', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  {(['15s', '30s', '60s'] as const).map(t => (
                    <button key={t} onClick={() => setActiveTab(t)} style={{ flex: 1, padding: '16px', background: activeTab === t ? 'rgba(255,0,80,0.1)' : 'transparent', color: activeTab === t ? '#ff0050' : '#64748b', border: 'none', borderBottom: activeTab === t ? '2px solid #ff0050' : '2px solid transparent', fontWeight: '800', fontSize: '14px', cursor: 'pointer', letterSpacing: '0.05em' }}>
                      📹 {t.toUpperCase()}
                    </button>
                  ))}
                </div>
                <div style={{ padding: '30px' }}>
                  <div style={{ whiteSpace: 'pre-wrap', color: '#e2e8f0', fontSize: '15px', lineHeight: '1.8', marginBottom: '20px' }}>
                    {scriptMap[activeTab]}
                  </div>
                  <button onClick={() => copy(scriptMap[activeTab] || '', `script-${activeTab}`)} className="btn-tech" style={{ width: '100%', padding: '14px', background: copied === `script-${activeTab}` ? '#10b981' : 'linear-gradient(135deg,#ff0050,#00f2ea)' }}>
                    {copied === `script-${activeTab}` ? 'COPIED ✅' : `COPY SCRIPT ${activeTab.toUpperCase()} 📋`}
                  </button>
                </div>
              </div>

              {/* Caption & CTA */}
              <div className="glass-panel" style={{ padding: '30px', borderRadius: '24px' }}>
                <h4 style={{ color: '#00f2ea', fontSize: '14px', fontWeight: '800', marginBottom: '16px' }}>📝 CAPTION & CTA</h4>
                <div style={{ background: 'rgba(0,0,0,0.2)', padding: '20px', borderRadius: '14px', marginBottom: '16px' }}>
                  <div style={{ color: '#e2e8f0', fontSize: '14px', whiteSpace: 'pre-wrap', marginBottom: '12px' }}>{result.caption}</div>
                  <button onClick={() => copy(result.caption, 'caption')} style={{ background: 'none', border: '1px solid rgba(0,242,234,0.2)', color: '#00f2ea', padding: '8px 16px', borderRadius: '10px', cursor: 'pointer', fontSize: '12px', fontWeight: '700' }}>{copied === 'caption' ? '✅' : '📋 Copy Caption'}</button>
                </div>
                <div style={{ padding: '16px', borderRadius: '14px', background: 'rgba(255,0,80,0.05)', border: '1px solid rgba(255,0,80,0.1)' }}>
                  <div style={{ fontSize: '11px', fontWeight: '800', color: '#ff0050', marginBottom: '8px' }}>CTA CUỐI VIDEO</div>
                  <div style={{ color: '#fff', fontSize: '15px', fontWeight: '600' }}>{result.cta}</div>
                </div>
              </div>

              {/* AI Prompts (Image/Video) */}
              {(result.imagePrompt || result.videoPrompt) && (
                <div className="glass-panel" style={{ padding: '30px', borderRadius: '24px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <h4 style={{ color: '#c084fc', fontSize: '14px', fontWeight: '800', marginBottom: '20px' }}>🤖 AI GENERATION PROMPTS</h4>
                  
                  {result.imagePrompt && (
                    <div style={{ marginBottom: '24px' }}>
                      <div style={{ fontSize: '11px', fontWeight: '800', color: '#c084fc', marginBottom: '8px' }}>🎨 IMAGE PROMPT (9:16)</div>
                      <div style={{ position: 'relative' }}>
                        <div style={{ padding: '16px', background: 'rgba(0,0,0,0.4)', borderRadius: '12px', fontSize: '13px', color: '#cbd5e1', fontStyle: 'italic', borderLeft: '4px solid #c084fc', lineHeight: '1.6' }}>
                          {result.imagePrompt}
                        </div>
                        <button onClick={() => copy(result.imagePrompt!, 'img-p')} style={{ position: 'absolute', top: '10px', right: '10px', background: 'none', border: 'none', color: copied === 'img-p' ? '#10b981' : '#c084fc', cursor: 'pointer' }}>
                          {copied === 'img-p' ? '✅' : '📋'}
                        </button>
                      </div>
                    </div>
                  )}

                  {result.videoPrompt && (
                    <div>
                      <div style={{ fontSize: '11px', fontWeight: '800', color: '#f59e0b', marginBottom: '8px' }}>🎥 VIDEO PROMPT (AI MOTION)</div>
                      <div style={{ position: 'relative' }}>
                        <div style={{ padding: '16px', background: 'rgba(0,0,0,0.4)', borderRadius: '12px', fontSize: '13px', color: '#cbd5e1', fontStyle: 'italic', borderLeft: '4px solid #f59e0b', lineHeight: '1.6' }}>
                          {result.videoPrompt}
                        </div>
                        <button onClick={() => copy(result.videoPrompt!, 'vid-p')} style={{ position: 'absolute', top: '10px', right: '10px', background: 'none', border: 'none', color: copied === 'vid-p' ? '#10b981' : '#f59e0b', cursor: 'pointer' }}>
                          {copied === 'vid-p' ? '✅' : '📋'}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Trending Sounds */}
              <div className="glass-panel" style={{ padding: '30px', borderRadius: '24px' }}>
                <h4 style={{ color: '#00f2ea', fontSize: '14px', fontWeight: '800', marginBottom: '16px' }}>🎵 GỢI Ý NHẠC TRENDING</h4>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                  {result.trendingSounds.map((s, i) => (
                    <div key={i} style={{ padding: '10px 16px', borderRadius: '100px', background: 'rgba(0,242,234,0.05)', border: '1px solid rgba(0,242,234,0.15)', color: '#00f2ea', fontSize: '13px', fontWeight: '600' }}>🎶 {s}</div>
                  ))}
                </div>
              </div>

              {/* Comment Seedings */}
              <div className="glass-panel" style={{ padding: '30px', borderRadius: '24px' }}>
                <h4 style={{ color: '#ff0050', fontSize: '14px', fontWeight: '800', marginBottom: '16px' }}>💬 COMMENT SEEDING</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {result.commentSeedings.map((c, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(0,0,0,0.2)', padding: '14px', borderRadius: '12px' }}>
                      <span style={{ fontSize: '13px', color: '#94a3b8', flex: 1 }}>{c}</span>
                      <button onClick={() => copy(c, `tc-${i}`)} style={{ background: 'none', border: 'none', color: copied === `tc-${i}` ? '#10b981' : '#ff0050', cursor: 'pointer', flexShrink: 0 }}>{copied === `tc-${i}` ? '✅' : '📋'}</button>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div style={{ height: '500px', borderRadius: '40px', border: '2px dashed rgba(255,0,80,0.1)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', color: '#475569' }}>
              <div style={{ fontSize: '80px', marginBottom: '20px', opacity: 0.2 }}>🎵</div>
              <h3 style={{ color: '#94a3b8', fontSize: '20px', marginBottom: '10px' }}>TikTok Studio sẵn sàng</h3>
              <p style={{ maxWidth: '400px', fontSize: '14px' }}>Nhập thông tin sản phẩm và nhấn TẠO SCRIPT để bắt đầu.</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
