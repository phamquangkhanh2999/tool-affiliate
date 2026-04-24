'use client';

import { useState, useEffect, useCallback } from 'react';
import FacebookConnectModal from '@/components/FacebookConnectModal';

interface FBResult {
  hooks: string[];
  shortVersion: string;
  longVersion: string;
  commentSeedings: string[];
  prompt?: string;
  dbStatus?: string;
}

interface FBPage {
  id: string;
  pageId: string;
  pageName: string;
  isActive: boolean;
}

export default function FacebookExpertPage() {
  const [mode, setMode] = useState<'ai' | 'quick'>(() => {
    if (typeof window !== 'undefined' && window.location.hash === '#quick-post') return 'quick';
    return 'ai';
  });
  const [productName, setProductName] = useState('');
  const [affiliateLink, setAffiliateLink] = useState('');
  const [additionalInfo, setAdditionalInfo] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<FBResult | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  // Quick post state
  const [quickContent, setQuickContent] = useState('');
  const [quickComments, setQuickComments] = useState('');

  // Publish state
  const [pages, setPages] = useState<FBPage[]>([]);
  const [selectedPage, setSelectedPage] = useState('');
  const [autoComment, setAutoComment] = useState(true);
  const [commentDelay, setCommentDelay] = useState(45);
  const [publishing, setPublishing] = useState(false);
  const [publishStatus, setPublishStatus] = useState<{ status: string; postUrl?: string; comments?: number } | null>(null);
  const [isConnectModalOpen, setIsConnectModalOpen] = useState(false);

  const fetchPages = useCallback(() => {
    fetch('/api/facebook/pages').then(r => r.json()).then(j => {
      if (j.success) {
        const active = j.data.filter((p: FBPage) => p.isActive);
        setPages(active);
        // Maintain selection if possible, otherwise select first
        if (active.length > 0) {
          setSelectedPage(prev => {
            if (active.find((p: FBPage) => p.pageId === prev)) return prev;
            return active[0].pageId;
          });
        }
      }
    }).catch(() => {});
  }, []);

  useEffect(() => {
    fetchPages();
  }, [fetchPages]);

  const handleGenerate = async () => {
    if (!productName || !affiliateLink) return;
    setLoading(true); setResult(null); setPublishStatus(null);
    try {
      const res = await fetch('/api/content/expert', { method: 'POST', body: JSON.stringify({ productName, affiliateLink, additionalInfo }) });
      const data = await res.json();
      if (data.success) setResult(data.data);
    } catch {} finally { setLoading(false); }
  };

  const handlePublish = async () => {
    if (!result || !selectedPage) return;
    setPublishing(true);
    setPublishStatus({ status: 'publishing' });
    try {
      const res = await fetch('/api/facebook/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pageId: selectedPage,
          content: result.longVersion,
          commentSeedings: autoComment ? result.commentSeedings : [],
          commentDelay: commentDelay * 1000,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setPublishStatus({ status: 'completed', postUrl: data.data.postUrl, comments: data.data.commentsPosted });
      } else if (data.errorCode === 'TOKEN_EXPIRED') {
        setPublishStatus({ status: 'token_expired' });
      } else {
        setPublishStatus({ status: 'failed' });
      }
    } catch {
      setPublishStatus({ status: 'failed' });
    } finally { setPublishing(false); }
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const iStyle: React.CSSProperties = { width: '100%', padding: '16px', borderRadius: '12px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.05)', color: '#fff', fontSize: '14px', outline: 'none' };

  const handleQuickPublish = async () => {
    if (!quickContent.trim() || !selectedPage) return;
    setPublishing(true);
    setPublishStatus({ status: 'publishing' });
    try {
      const comments = quickComments.split('\n').filter(c => c.trim());
      const res = await fetch('/api/facebook/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pageId: selectedPage,
          content: quickContent,
          commentSeedings: comments,
          commentDelay: commentDelay * 1000,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setPublishStatus({ status: 'completed', postUrl: data.data.postUrl, comments: data.data.commentsPosted });
      } else if (data.errorCode === 'TOKEN_EXPIRED') {
        setPublishStatus({ status: 'token_expired' });
      } else {
        setPublishStatus({ status: 'failed' });
      }
    } catch {
      setPublishStatus({ status: 'failed' });
    } finally { setPublishing(false); }
  };

  return (
    <div style={{ maxWidth: '1600px', margin: '0 auto' }}>
      <header style={{ marginBottom: '30px' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', padding: '6px 16px', borderRadius: '100px', background: 'rgba(34,211,238,0.05)', border: '1px solid rgba(34,211,238,0.1)', marginBottom: '20px' }}>
          <span style={{ fontSize: '10px', fontWeight: '900', color: '#22d3ee', letterSpacing: '0.1em' }}>STUDIO MODE ACTIVE</span>
        </div>
        <h1 style={{ fontSize: '56px', fontWeight: '900', color: '#fff', letterSpacing: '-0.04em' }}>Content <span style={{ color: '#22d3ee' }}>Forge.</span></h1>
        <p style={{ color: '#64748b', fontSize: '18px', fontWeight: '500' }}>Hệ thống rèn đúc nội dung Facebook Expert + Auto Publish.</p>
      </header>

      {/* Mode Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '30px' }}>
        <button onClick={() => { setMode('ai'); setPublishStatus(null); }} style={{ padding: '12px 28px', borderRadius: '14px', background: mode === 'ai' ? 'rgba(34,211,238,0.15)' : 'rgba(0,0,0,0.2)', border: mode === 'ai' ? '1px solid rgba(34,211,238,0.3)' : '1px solid rgba(255,255,255,0.05)', color: mode === 'ai' ? '#22d3ee' : '#64748b', cursor: 'pointer', fontWeight: '800', fontSize: '14px' }}>🤖 Tạo bài AI</button>
        <button onClick={() => { setMode('quick'); setPublishStatus(null); }} style={{ padding: '12px 28px', borderRadius: '14px', background: mode === 'quick' ? 'rgba(16,185,129,0.15)' : 'rgba(0,0,0,0.2)', border: mode === 'quick' ? '1px solid rgba(16,185,129,0.3)' : '1px solid rgba(255,255,255,0.05)', color: mode === 'quick' ? '#10b981' : '#64748b', cursor: 'pointer', fontWeight: '800', fontSize: '14px' }}>⚡ Đăng nhanh</button>
      </div>

      {/* ═══ QUICK POST MODE ═══ */}
      {mode === 'quick' && (
        <div style={{ maxWidth: '800px' }}>
          <section className="glass-panel" style={{ padding: '30px', borderRadius: '24px', marginBottom: '24px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#10b981', marginBottom: '20px' }}>⚡ ĐĂNG NHANH LÊN FACEBOOK</h3>
            <p style={{ color: '#64748b', fontSize: '13px', marginBottom: '20px' }}>Gõ hoặc dán nội dung bạn muốn đăng. Không cần AI tạo — đăng trực tiếp lên Page.</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', color: '#475569', marginBottom: '10px', letterSpacing: '0.1em' }}>NỘI DUNG BÀI VIẾT *</label>
                <textarea rows={10} placeholder="Viết nội dung bài viết Facebook tại đây...\n\nVí dụ:\n🔥 Deal hot hôm nay!\nSản phẩm XYZ đang giảm 50%...\n\n👉 Link mua: https://..." value={quickContent} onChange={e => setQuickContent(e.target.value)} style={{ ...iStyle, resize: 'vertical', fontFamily: 'inherit', lineHeight: '1.6' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', color: '#475569', marginBottom: '10px', letterSpacing: '0.1em' }}>COMMENT SEEDING (TÙY CHỌN — MỖI DÒNG 1 COMMENT)</label>
                <textarea rows={4} placeholder="Mình vừa mua xong, chất lượng tốt lắm!\nCó ai đặt chưa? Review đi ạ\nLink còn hoạt động không shop?" value={quickComments} onChange={e => setQuickComments(e.target.value)} style={{ ...iStyle, resize: 'vertical', fontFamily: 'inherit', lineHeight: '1.6' }} />
              </div>
              {pages.length > 0 ? (
                <>
                  <div>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', color: '#475569', marginBottom: '8px' }}>CHỌN PAGE</label>
                    <select value={selectedPage} onChange={e => setSelectedPage(e.target.value)} style={{ ...iStyle, cursor: 'pointer' }}>
                      {pages.map(p => <option key={p.pageId} value={p.pageId}>{p.pageName}</option>)}
                    </select>
                  </div>
                  {quickComments.trim() && (
                    <div>
                      <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', color: '#475569', marginBottom: '8px' }}>DELAY GIỮA MỖI COMMENT: {commentDelay}s</label>
                      <input type="range" min={15} max={120} value={commentDelay} onChange={e => setCommentDelay(Number(e.target.value))} style={{ width: '100%', accentColor: '#10b981' }} />
                    </div>
                  )}
                  <button onClick={handleQuickPublish} disabled={publishing || !quickContent.trim()} className="btn-tech" style={{ width: '100%', padding: '18px', fontSize: '16px', background: publishing ? '#475569' : 'linear-gradient(135deg,#10b981,#22d3ee)', opacity: publishing ? 0.6 : 1 }}>
                    {publishing ? '⏳ ĐANG ĐĂNG...' : `🚀 ĐĂNG BÀI LÊN FACEBOOK${quickComments.trim() ? ` + ${quickComments.split('\n').filter(c => c.trim()).length} COMMENTS` : ''}`}
                  </button>
                </>
              ) : (
                <div style={{ padding: '20px', textAlign: 'center', color: '#64748b', fontSize: '14px', background: 'rgba(0,0,0,0.2)', borderRadius: '14px' }}>
                  Chưa kết nối Page nào hoặc Token đã hết hạn. <button onClick={() => setIsConnectModalOpen(true)} style={{ background: 'none', border: 'none', color: '#1877F2', fontWeight: '700', cursor: 'pointer', padding: 0, fontSize: '14px' }}>Kết nối ngay →</button>
                </div>
              )}
              {publishStatus && (
                <div style={{ padding: '16px', borderRadius: '14px', background: publishStatus.status === 'completed' ? 'rgba(16,185,129,0.1)' : publishStatus.status === 'token_expired' ? 'rgba(245,158,11,0.1)' : publishStatus.status === 'failed' ? 'rgba(239,68,68,0.1)' : 'rgba(245,158,11,0.1)', border: `1px solid ${publishStatus.status === 'completed' ? 'rgba(16,185,129,0.3)' : publishStatus.status === 'token_expired' ? 'rgba(245,158,11,0.3)' : publishStatus.status === 'failed' ? 'rgba(239,68,68,0.3)' : 'rgba(245,158,11,0.3)'}` }}>
                  {publishStatus.status === 'completed' && <div style={{ color: '#10b981', fontWeight: '700' }}>✅ Đã đăng thành công!{publishStatus.comments ? ` ${publishStatus.comments} comments đã post.` : ''}</div>}
                  {publishStatus.status === 'token_expired' && <div><div style={{ color: '#f59e0b', fontWeight: '700', marginBottom: '6px' }}>⚠️ Token Facebook đã hết hạn!</div><div style={{ fontSize: '13px', color: '#94a3b8' }}>Token chỉ sống 1-2 giờ. Bạn cần tạo token mới.</div><button onClick={() => setIsConnectModalOpen(true)} style={{ display: 'inline-block', marginTop: '8px', padding: '8px 16px', borderRadius: '10px', background: 'rgba(24,119,242,0.15)', color: '#1877F2', fontWeight: '700', fontSize: '13px', border: 'none', cursor: 'pointer' }}>🔌 Kết nối lại Facebook →</button></div>}
                  {publishStatus.status === 'failed' && <div style={{ color: '#ef4444', fontWeight: '700' }}>❌ Đăng bài thất bại. Kiểm tra token.</div>}
                  {publishStatus.status === 'publishing' && <div style={{ color: '#f59e0b', fontWeight: '700' }}>⏳ Đang xử lý...</div>}
                  {publishStatus.postUrl && <a href={publishStatus.postUrl} target="_blank" rel="noopener noreferrer" style={{ color: '#1877F2', fontSize: '13px', marginTop: '4px', display: 'block' }}>🔗 Xem bài đăng trên Facebook</a>}
                </div>
              )}
            </div>
          </section>
        </div>
      )}

      {/* ═══ AI MODE ═══ */}
      {mode === 'ai' && (
      <div style={{ display: 'grid', gridTemplateColumns: '450px 1fr', gap: '40px', alignItems: 'start' }}>
        {/* Control Panel */}
        <aside className="glass-panel" style={{ padding: '40px', borderRadius: '32px', position: 'sticky', top: '40px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#fff', marginBottom: '30px', letterSpacing: '0.05em' }}>CONTROL PANEL</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', color: '#475569', marginBottom: '10px', letterSpacing: '0.1em' }}>PRODUCT IDENTITY</label>
              <input type="text" placeholder="Tên sản phẩm..." value={productName} onChange={e => setProductName(e.target.value)} style={iStyle} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', color: '#475569', marginBottom: '10px', letterSpacing: '0.1em' }}>AFFILIATE LINK</label>
              <input type="text" placeholder="Dán link tại đây..." value={affiliateLink} onChange={e => setAffiliateLink(e.target.value)} style={iStyle} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', color: '#475569', marginBottom: '10px', letterSpacing: '0.1em' }}>ADDITIONAL PARAMETERS</label>
              <textarea rows={4} placeholder="Mô tả, giá, ưu đãi..." value={additionalInfo} onChange={e => setAdditionalInfo(e.target.value)} style={{ ...iStyle, resize: 'none' }} />
            </div>
            <button className="btn-tech" onClick={handleGenerate} disabled={loading || !productName || !affiliateLink} style={{ width: '100%', padding: '18px', marginTop: '10px', opacity: loading ? 0.5 : 1 }}>
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
                  <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'linear-gradient(135deg,#1877F2,#00C6FF)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>E</div>
                  <div><div style={{ fontWeight: '700', fontSize: '15px' }}>Expert Reviewer</div><div style={{ fontSize: '12px', color: '#65676b' }}>AI Engine • Now 🌐</div></div>
                </div>
                <div style={{ padding: '20px', fontSize: '15px', lineHeight: '1.5', whiteSpace: 'pre-wrap', color: '#050505' }}>{result.longVersion}</div>
                <div style={{ padding: '15px 20px', borderTop: '1px solid #f0f2f5', background: '#f9fafb' }}>
                  <button onClick={() => handleCopy(result.longVersion, 'post')} style={{ width: '100%', padding: '12px', borderRadius: '10px', background: copied === 'post' ? '#10b981' : '#1877F2', color: '#fff', border: 'none', fontWeight: '700', cursor: 'pointer' }}>
                    {copied === 'post' ? 'COPIED ✅' : 'COPY MAIN CONTENT 📋'}
                  </button>
                </div>
              </div>

              {/* 🚀 PUBLISH TO FACEBOOK */}
              <div className="glass-panel" style={{ padding: '30px', borderRadius: '24px', border: '1px solid rgba(24,119,242,0.15)', background: 'rgba(24,119,242,0.03)' }}>
                <h4 style={{ color: '#1877F2', fontSize: '14px', fontWeight: '800', marginBottom: '20px', letterSpacing: '0.1em' }}>🚀 ĐĂNG LÊN FACEBOOK</h4>
                {pages.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', color: '#475569', marginBottom: '8px' }}>CHỌN PAGE</label>
                      <select value={selectedPage} onChange={e => setSelectedPage(e.target.value)} style={{ ...iStyle, cursor: 'pointer' }}>
                        {pages.map(p => <option key={p.pageId} value={p.pageId}>{p.pageName}</option>)}
                      </select>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', color: '#94a3b8', fontSize: '14px' }}>
                        <input type="checkbox" checked={autoComment} onChange={e => setAutoComment(e.target.checked)} style={{ width: '18px', height: '18px', accentColor: '#1877F2' }} />
                        Auto-Comment Seeding ({result.commentSeedings.length} comments)
                      </label>
                    </div>
                    {autoComment && (
                      <div>
                        <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', color: '#475569', marginBottom: '8px' }}>DELAY GIỮA MỖI COMMENT: {commentDelay}s</label>
                        <input type="range" min={15} max={120} value={commentDelay} onChange={e => setCommentDelay(Number(e.target.value))} style={{ width: '100%', accentColor: '#1877F2' }} />
                      </div>
                    )}
                    <button onClick={handlePublish} disabled={publishing} className="btn-tech" style={{ width: '100%', padding: '18px', background: publishing ? '#475569' : 'linear-gradient(135deg,#1877F2,#00C6FF)', opacity: publishing ? 0.6 : 1 }}>
                      {publishing ? '⏳ ĐANG ĐĂNG BÀI...' : '🚀 ĐĂNG BÀI + AUTO COMMENT'}
                    </button>
                    {publishStatus && (
                      <div style={{ padding: '16px', borderRadius: '14px', background: publishStatus.status === 'completed' ? 'rgba(16,185,129,0.1)' : publishStatus.status === 'token_expired' ? 'rgba(245,158,11,0.1)' : publishStatus.status === 'failed' ? 'rgba(239,68,68,0.1)' : 'rgba(245,158,11,0.1)', border: `1px solid ${publishStatus.status === 'completed' ? 'rgba(16,185,129,0.3)' : publishStatus.status === 'token_expired' ? 'rgba(245,158,11,0.3)' : publishStatus.status === 'failed' ? 'rgba(239,68,68,0.3)' : 'rgba(245,158,11,0.3)'}` }}>
                        {publishStatus.status === 'completed' && <div style={{ color: '#10b981', fontWeight: '700' }}>✅ Đã đăng thành công! {publishStatus.comments}/{result.commentSeedings.length} comments</div>}
                        {publishStatus.status === 'token_expired' && <div><div style={{ color: '#f59e0b', fontWeight: '700', marginBottom: '6px' }}>⚠️ Token Facebook đã hết hạn!</div><div style={{ fontSize: '13px', color: '#94a3b8' }}>Token chỉ sống 1-2 giờ. Bạn cần tạo token mới.</div><button onClick={() => setIsConnectModalOpen(true)} style={{ display: 'inline-block', marginTop: '8px', padding: '8px 16px', borderRadius: '10px', background: 'rgba(24,119,242,0.15)', color: '#1877F2', fontWeight: '700', fontSize: '13px', border: 'none', cursor: 'pointer' }}>🔌 Kết nối lại Facebook →</button></div>}
                        {publishStatus.status === 'failed' && <div style={{ color: '#ef4444', fontWeight: '700' }}>❌ Đăng bài thất bại. Kiểm tra token.</div>}
                        {publishStatus.status === 'publishing' && <div style={{ color: '#f59e0b', fontWeight: '700' }}>⏳ Đang xử lý...</div>}
                        {publishStatus.postUrl && <a href={publishStatus.postUrl} target="_blank" rel="noopener noreferrer" style={{ color: '#1877F2', fontSize: '13px', marginTop: '4px', display: 'block' }}>🔗 Xem bài đăng</a>}
                      </div>
                    )}
                  </div>
                ) : (
                  <div style={{ padding: '20px', textAlign: 'center', color: '#64748b', fontSize: '14px' }}>
                    Chưa kết nối Page nào hoặc Token đã hết hạn. <button onClick={() => setIsConnectModalOpen(true)} style={{ background: 'none', border: 'none', color: '#1877F2', fontWeight: '700', cursor: 'pointer', padding: 0, fontSize: '14px' }}>Kết nối ngay →</button>
                  </div>
                )}
              </div>

              {/* Seeding Block */}
              <div className="glass-panel" style={{ padding: '30px', borderRadius: '24px' }}>
                <h4 style={{ color: '#22d3ee', fontSize: '14px', fontWeight: '800', marginBottom: '20px', letterSpacing: '0.1em' }}>SEEDING SCRIPTS</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {result.commentSeedings.map((c, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(0,0,0,0.2)', padding: '15px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.03)' }}>
                      <span style={{ fontSize: '13px', color: '#94a3b8', flex: 1 }}>{c}</span>
                      <button onClick={() => handleCopy(c, `c-${i}`)} style={{ background: 'none', border: 'none', color: copied === `c-${i}` ? '#10b981' : '#22d3ee', cursor: 'pointer', flexShrink: 0, marginLeft: '8px' }}>{copied === `c-${i}` ? '✅' : '📋'}</button>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div style={{ height: '500px', borderRadius: '40px', border: '2px dashed rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', color: '#475569' }}>
              <div style={{ fontSize: '80px', marginBottom: '20px', opacity: 0.2 }}>⚡</div>
              <h3 style={{ color: '#94a3b8', fontSize: '20px', marginBottom: '10px' }}>Dòng chảy dữ liệu đang trống</h3>
              <p style={{ maxWidth: '400px', fontSize: '14px' }}>Cấu hình tham số bên trái và nhấn EXECUTE để bắt đầu.</p>
            </div>
          )}
        </main>
      </div>
      )}

      <FacebookConnectModal 
        isOpen={isConnectModalOpen} 
        onClose={() => setIsConnectModalOpen(false)} 
        onSuccess={fetchPages} 
      />
    </div>
  );
}
