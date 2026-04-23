'use client';

import { useState } from 'react';
import { ExpertFacebookPostResult } from '@/lib/gemini';

export default function FacebookExpertPage() {
  const [productName, setProductName] = useState('');
  const [affiliateLink, setAffiliateLink] = useState('');
  const [additionalInfo, setAdditionalInfo] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ExpertFacebookPostResult | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!productName || !affiliateLink) return;
    setLoading(true);
    try {
      const res = await fetch('/api/content/expert', {
        method: 'POST',
        body: JSON.stringify({ productName, affiliateLink, additionalInfo }),
      });
      const data = await res.json();
      if (data.success) setResult(data.data);
    } catch (err) {} finally { setLoading(false); }
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div style={{ maxWidth: '1600px', margin: '0 auto' }}>
      <header style={{ marginBottom: '50px' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', padding: '6px 16px', borderRadius: '100px', background: 'rgba(34, 211, 238, 0.05)', border: '1px solid rgba(34, 211, 238, 0.1)', marginBottom: '20px' }}>
           <span style={{ fontSize: '10px', fontWeight: '900', color: '#22d3ee', letterSpacing: '0.1em' }}>STUDIO MODE ACTIVE</span>
        </div>
        <h1 style={{ fontSize: '56px', fontWeight: '900', color: '#fff', letterSpacing: '-0.04em' }}>Content <span style={{ color: '#22d3ee' }}>Forge.</span></h1>
        <p style={{ color: '#64748b', fontSize: '18px', fontWeight: '500' }}>Hệ thống rèn đúc nội dung Facebook Expert tối ưu chuyển đổi.</p>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '450px 1fr', gap: '40px', alignItems: 'start' }}>
        
        {/* Control Panel */}
        <aside className="glass-panel" style={{ padding: '40px', borderRadius: '32px', position: 'sticky', top: '40px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#fff', marginBottom: '30px', letterSpacing: '0.05em' }}>CONTROL PANEL</h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
            <div className="input-group">
               <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', color: '#475569', marginBottom: '10px', letterSpacing: '0.1em' }}>PRODUCT IDENTITY</label>
               <input 
                 type="text" 
                 placeholder="Tên sản phẩm..."
                 value={productName}
                 onChange={(e) => setProductName(e.target.value)}
                 style={{ width: '100%', padding: '16px', borderRadius: '12px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.05)', color: '#fff', fontSize: '14px', outline: 'none' }}
               />
            </div>

            <div className="input-group">
               <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', color: '#475569', marginBottom: '10px', letterSpacing: '0.1em' }}>AFFILIATE LINK</label>
               <input 
                 type="text" 
                 placeholder="Dán link tại đây..."
                 value={affiliateLink}
                 onChange={(e) => setAffiliateLink(e.target.value)}
                 style={{ width: '100%', padding: '16px', borderRadius: '12px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.05)', color: '#fff', fontSize: '14px', outline: 'none' }}
               />
            </div>

            <div className="input-group">
               <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', color: '#475569', marginBottom: '10px', letterSpacing: '0.1em' }}>ADDITIONAL PARAMETERS</label>
               <textarea 
                 rows={5}
                 placeholder="Mô tả, giá, ưu đãi..."
                 value={additionalInfo}
                 onChange={(e) => setAdditionalInfo(e.target.value)}
                 style={{ width: '100%', padding: '16px', borderRadius: '12px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.05)', color: '#fff', fontSize: '14px', outline: 'none', resize: 'none' }}
               />
            </div>

            <button 
              className="btn-tech"
              onClick={handleGenerate}
              disabled={loading || !productName || !affiliateLink}
              style={{ width: '100%', padding: '18px', marginTop: '10px', opacity: loading ? 0.5 : 1 }}
            >
              {loading ? 'GENERATING...' : 'EXECUTE FORGE ⚡'}
            </button>
          </div>
        </aside>

        {/* Output Zone */}
        <main style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
          {result ? (
            <>
              {/* Facebook Mockup */}
              <div className="glass-panel" style={{ background: '#fff', borderRadius: '24px', color: '#1c1e21', overflow: 'hidden', maxWidth: '650px' }}>
                <div style={{ padding: '15px 20px', display: 'flex', alignItems: 'center', gap: '12px', borderBottom: '1px solid #f0f2f5' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'linear-gradient(135deg, #1877F2, #00C6FF)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>E</div>
                  <div>
                    <div style={{ fontWeight: '700', fontSize: '15px' }}>Expert Reviewer</div>
                    <div style={{ fontSize: '12px', color: '#65676b' }}>AI Engine • Now 🌐</div>
                  </div>
                </div>
                <div style={{ padding: '20px', fontSize: '15px', lineHeight: '1.5', whiteSpace: 'pre-wrap', color: '#050505' }}>
                  {result.longVersion}
                </div>
                <div style={{ padding: '15px 20px', borderTop: '1px solid #f0f2f5', background: '#f9fafb' }}>
                   <button 
                     onClick={() => handleCopy(result.longVersion, 'post')}
                     style={{ width: '100%', padding: '12px', borderRadius: '10px', background: copied === 'post' ? '#10b981' : '#1877F2', color: '#fff', border: 'none', fontWeight: '700', cursor: 'pointer' }}
                   >
                     {copied === 'post' ? 'COPIED TO CLIPBOARD ✅' : 'COPY MAIN CONTENT 📋'}
                   </button>
                </div>
              </div>

              {/* Seeding Block */}
              <div className="glass-panel" style={{ padding: '30px', borderRadius: '24px' }}>
                <h4 style={{ color: '#22d3ee', fontSize: '14px', fontWeight: '800', marginBottom: '20px', letterSpacing: '0.1em' }}>SEEDING SCRIPTS</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                   {result.commentSeedings.map((comment, i) => (
                     <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(0,0,0,0.2)', padding: '15px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.03)' }}>
                        <span style={{ fontSize: '13px', color: '#94a3b8' }}>{comment}</span>
                        <button onClick={() => handleCopy(comment, `c-${i}`)} style={{ background: 'none', border: 'none', color: copied === `c-${i}` ? '#10b981' : '#22d3ee', cursor: 'pointer' }}>{copied === `c-${i}` ? '✅' : '📋'}</button>
                     </div>
                   ))}
                </div>
              </div>
            </>
          ) : (
            <div style={{ height: '500px', borderRadius: '40px', border: '2px dashed rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', color: '#475569' }}>
               <div style={{ fontSize: '80px', marginBottom: '20px', opacity: 0.2 }}>⚡</div>
               <h3 style={{ color: '#94a3b8', fontSize: '20px', marginBottom: '10px' }}>Dòng chảy dữ liệu đang trống</h3>
               <p style={{ maxWidth: '400px', fontSize: '14px' }}>Cấu hình tham số bên trái và nhấn EXECUTE để bắt đầu quá trình rèn đúc nội dung AI.</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
