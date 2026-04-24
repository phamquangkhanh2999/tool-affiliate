'use client';

import { useState } from 'react';

interface YTResult {
  titles: string[];
  thumbnailTexts: string[];
  script: { hook: string; body: string; cta: string };
  description: string;
  tags: string[];
  pinnedComment: string;
  communityPost: string;
}

export default function YouTubeExpertPage() {
  const [productName, setProductName] = useState('');
  const [affiliateLink, setAffiliateLink] = useState('');
  const [additionalInfo, setAdditionalInfo] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<YTResult | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<'script' | 'seo' | 'engage'>('script');

  const handleGenerate = async () => {
    if (!productName || !affiliateLink) return;
    setLoading(true); setResult(null);
    try {
      const res = await fetch('/api/content/youtube-expert', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ productName, affiliateLink, additionalInfo }) });
      const data = await res.json();
      if (data.success) setResult(data.data);
    } catch {} finally { setLoading(false); }
  };

  const copy = (text: string, id: string) => { navigator.clipboard.writeText(text); setCopied(id); setTimeout(() => setCopied(null), 2000); };
  const iStyle: React.CSSProperties = { width: '100%', padding: '16px', borderRadius: '12px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.05)', color: '#fff', fontSize: '14px', outline: 'none' };

  return (
    <div style={{ maxWidth: '1600px', margin: '0 auto' }}>
      <header style={{ marginBottom: '50px' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', padding: '6px 16px', borderRadius: '100px', background: 'rgba(255,0,0,0.08)', border: '1px solid rgba(255,0,0,0.15)', marginBottom: '20px' }}>
          <span style={{ fontSize: '10px', fontWeight: '900', color: '#FF0000', letterSpacing: '0.1em' }}>YOUTUBE STUDIO</span>
        </div>
        <h1 style={{ fontSize: '56px', fontWeight: '900', color: '#fff', letterSpacing: '-0.04em' }}>YouTube <span style={{ color: '#FF0000' }}>Expert.</span></h1>
        <p style={{ color: '#64748b', fontSize: '18px' }}>Tạo title, script, SEO description, tags tối ưu cho YouTube Affiliate.</p>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '450px 1fr', gap: '40px', alignItems: 'start' }}>
        <aside className="glass-panel" style={{ padding: '40px', borderRadius: '32px', position: 'sticky', top: '40px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#fff', marginBottom: '30px' }}>CONTROL PANEL</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
            <div><label style={{ display: 'block', fontSize: '11px', fontWeight: '800', color: '#475569', marginBottom: '10px', letterSpacing: '0.1em' }}>SẢN PHẨM</label><input type="text" placeholder="Tên sản phẩm..." value={productName} onChange={e => setProductName(e.target.value)} style={iStyle} /></div>
            <div><label style={{ display: 'block', fontSize: '11px', fontWeight: '800', color: '#475569', marginBottom: '10px', letterSpacing: '0.1em' }}>AFFILIATE LINK</label><input type="text" placeholder="Link affiliate..." value={affiliateLink} onChange={e => setAffiliateLink(e.target.value)} style={iStyle} /></div>
            <div><label style={{ display: 'block', fontSize: '11px', fontWeight: '800', color: '#475569', marginBottom: '10px', letterSpacing: '0.1em' }}>THÔNG TIN THÊM</label><textarea rows={4} placeholder="Giá, ưu đãi, tính năng..." value={additionalInfo} onChange={e => setAdditionalInfo(e.target.value)} style={{ ...iStyle, resize: 'none' }} /></div>
            <button className="btn-tech" onClick={handleGenerate} disabled={loading || !productName || !affiliateLink} style={{ width: '100%', padding: '18px', background: loading ? '#475569' : 'linear-gradient(135deg,#FF0000,#FF6B6B)', opacity: loading ? 0.5 : 1 }}>
              {loading ? 'GENERATING...' : 'TẠO NỘI DUNG YT 🎬'}
            </button>
          </div>
        </aside>

        <main style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {result ? (
            <>
              {/* Titles */}
              <div className="glass-panel" style={{ padding: '30px', borderRadius: '24px' }}>
                <h4 style={{ color: '#FF0000', fontSize: '14px', fontWeight: '800', marginBottom: '16px' }}>🎯 TIÊU ĐỀ TỐI ƯU CTR</h4>
                {result.titles.map((t, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 18px', borderRadius: '14px', background: 'rgba(255,0,0,0.03)', border: '1px solid rgba(255,0,0,0.08)', marginBottom: '8px' }}>
                    <span style={{ color: '#fff', fontWeight: '600', fontSize: '15px' }}>{t}</span>
                    <button onClick={() => copy(t, `t-${i}`)} style={{ background: 'none', border: 'none', color: copied === `t-${i}` ? '#10b981' : '#FF0000', cursor: 'pointer' }}>{copied === `t-${i}` ? '✅' : '📋'}</button>
                  </div>
                ))}
              </div>

              {/* Thumbnail Texts */}
              <div className="glass-panel" style={{ padding: '30px', borderRadius: '24px' }}>
                <h4 style={{ color: '#FF6B6B', fontSize: '14px', fontWeight: '800', marginBottom: '16px' }}>🖼️ TEXT THUMBNAIL</h4>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
                  {result.thumbnailTexts.map((th, i) => (
                    <div key={i} onClick={() => copy(th, `th-${i}`)} style={{ padding: '20px 28px', borderRadius: '16px', background: 'linear-gradient(135deg,rgba(255,0,0,0.08),rgba(255,107,107,0.05))', border: '1px solid rgba(255,0,0,0.15)', cursor: 'pointer', color: '#fff', fontSize: '18px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      {copied === `th-${i}` ? '✅ Copied' : th}
                    </div>
                  ))}
                </div>
              </div>

              {/* Script Tabs */}
              <div className="glass-panel" style={{ borderRadius: '24px', overflow: 'hidden' }}>
                <div style={{ display: 'flex', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  {(['script', 'seo', 'engage'] as const).map(s => (
                    <button key={s} onClick={() => setActiveSection(s)} style={{ flex: 1, padding: '16px', background: activeSection === s ? 'rgba(255,0,0,0.08)' : 'transparent', color: activeSection === s ? '#FF0000' : '#64748b', border: 'none', borderBottom: activeSection === s ? '2px solid #FF0000' : '2px solid transparent', fontWeight: '800', fontSize: '13px', cursor: 'pointer' }}>
                      {s === 'script' ? '📹 SCRIPT' : s === 'seo' ? '🔍 SEO' : '💬 ENGAGE'}
                    </button>
                  ))}
                </div>
                <div style={{ padding: '30px' }}>
                  {activeSection === 'script' && (
                    <div>
                      <div style={{ marginBottom: '20px' }}><div style={{ fontSize: '11px', fontWeight: '800', color: '#FF0000', marginBottom: '8px' }}>🎬 HOOK (30s đầu)</div><div style={{ whiteSpace: 'pre-wrap', color: '#e2e8f0', fontSize: '15px', lineHeight: '1.8', padding: '16px', background: 'rgba(0,0,0,0.2)', borderRadius: '12px' }}>{result.script.hook}</div></div>
                      <div style={{ marginBottom: '20px' }}><div style={{ fontSize: '11px', fontWeight: '800', color: '#FF6B6B', marginBottom: '8px' }}>📝 NỘI DUNG CHÍNH</div><div style={{ whiteSpace: 'pre-wrap', color: '#e2e8f0', fontSize: '15px', lineHeight: '1.8', padding: '16px', background: 'rgba(0,0,0,0.2)', borderRadius: '12px' }}>{result.script.body}</div></div>
                      <div><div style={{ fontSize: '11px', fontWeight: '800', color: '#10b981', marginBottom: '8px' }}>🎯 CTA</div><div style={{ whiteSpace: 'pre-wrap', color: '#e2e8f0', fontSize: '15px', lineHeight: '1.8', padding: '16px', background: 'rgba(0,0,0,0.2)', borderRadius: '12px' }}>{result.script.cta}</div></div>
                      <button onClick={() => copy(`${result.script.hook}\n\n${result.script.body}\n\n${result.script.cta}`, 'fullscript')} className="btn-tech" style={{ width: '100%', padding: '14px', marginTop: '20px', background: copied === 'fullscript' ? '#10b981' : 'linear-gradient(135deg,#FF0000,#FF6B6B)' }}>{copied === 'fullscript' ? 'COPIED ✅' : 'COPY FULL SCRIPT 📋'}</button>
                    </div>
                  )}
                  {activeSection === 'seo' && (
                    <div>
                      <div style={{ marginBottom: '20px' }}><div style={{ fontSize: '11px', fontWeight: '800', color: '#FF0000', marginBottom: '8px' }}>📝 DESCRIPTION</div><div style={{ whiteSpace: 'pre-wrap', color: '#e2e8f0', fontSize: '14px', lineHeight: '1.8', padding: '16px', background: 'rgba(0,0,0,0.2)', borderRadius: '12px', fontFamily: 'monospace' }}>{result.description}</div><button onClick={() => copy(result.description, 'desc')} className="btn-tech" style={{ marginTop: '12px', padding: '10px 20px', background: copied === 'desc' ? '#10b981' : 'linear-gradient(135deg,#FF0000,#FF6B6B)', fontSize: '13px' }}>{copied === 'desc' ? '✅' : '📋 Copy Description'}</button></div>
                      <div><div style={{ fontSize: '11px', fontWeight: '800', color: '#FF6B6B', marginBottom: '8px' }}>🏷️ TAGS</div><div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>{result.tags.map((tag, i) => <span key={i} style={{ padding: '6px 14px', borderRadius: '100px', background: 'rgba(255,0,0,0.05)', border: '1px solid rgba(255,0,0,0.1)', color: '#FF6B6B', fontSize: '12px', fontWeight: '600' }}>{tag}</span>)}</div><button onClick={() => copy(result.tags.join(', '), 'tags')} style={{ marginTop: '12px', padding: '8px 16px', borderRadius: '10px', background: 'none', border: '1px solid rgba(255,0,0,0.2)', color: '#FF0000', cursor: 'pointer', fontSize: '12px', fontWeight: '700' }}>{copied === 'tags' ? '✅' : '📋 Copy All Tags'}</button></div>
                    </div>
                  )}
                  {activeSection === 'engage' && (
                    <div>
                      <div style={{ marginBottom: '24px' }}><div style={{ fontSize: '11px', fontWeight: '800', color: '#FF0000', marginBottom: '8px' }}>📌 PINNED COMMENT</div><div style={{ whiteSpace: 'pre-wrap', color: '#e2e8f0', fontSize: '14px', lineHeight: '1.6', padding: '16px', background: 'rgba(0,0,0,0.2)', borderRadius: '12px' }}>{result.pinnedComment}</div><button onClick={() => copy(result.pinnedComment, 'pin')} className="btn-tech" style={{ marginTop: '12px', padding: '10px 20px', background: copied === 'pin' ? '#10b981' : 'linear-gradient(135deg,#FF0000,#FF6B6B)', fontSize: '13px' }}>{copied === 'pin' ? '✅' : '📋 Copy Pinned Comment'}</button></div>
                      <div><div style={{ fontSize: '11px', fontWeight: '800', color: '#FF6B6B', marginBottom: '8px' }}>📢 COMMUNITY POST</div><div style={{ whiteSpace: 'pre-wrap', color: '#e2e8f0', fontSize: '14px', lineHeight: '1.6', padding: '16px', background: 'rgba(0,0,0,0.2)', borderRadius: '12px' }}>{result.communityPost}</div><button onClick={() => copy(result.communityPost, 'comm')} className="btn-tech" style={{ marginTop: '12px', padding: '10px 20px', background: copied === 'comm' ? '#10b981' : 'linear-gradient(135deg,#FF0000,#FF6B6B)', fontSize: '13px' }}>{copied === 'comm' ? '✅' : '📋 Copy Community Post'}</button></div>
                    </div>
                  )}
                </div>
              </div>
            </>
          ) : (
            <div style={{ height: '500px', borderRadius: '40px', border: '2px dashed rgba(255,0,0,0.1)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', color: '#475569' }}>
              <div style={{ fontSize: '80px', marginBottom: '20px', opacity: 0.2 }}>🎬</div>
              <h3 style={{ color: '#94a3b8', fontSize: '20px', marginBottom: '10px' }}>YouTube Studio sẵn sàng</h3>
              <p style={{ maxWidth: '400px', fontSize: '14px' }}>Nhập thông tin sản phẩm và nhấn TẠO NỘI DUNG YT.</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
