'use client';

import { useState, useEffect, useCallback } from 'react';
import FacebookConnectModal from '@/components/FacebookConnectModal';
import MediaUpload from '@/components/MediaUpload';

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
  const [mode, setMode] = useState<'ai' | 'quick' | 'reels'>(() => {
    if (typeof window !== 'undefined') {
      if (window.location.hash === '#quick-post') return 'quick';
      if (window.location.hash === '#reels') return 'reels';
    }
    return 'ai';
  });
  const [productName, setProductName] = useState('');
  const [affiliateLink, setAffiliateLink] = useState('');
  const [additionalInfo, setAdditionalInfo] = useState('');
  const [importUrl, setImportUrl] = useState('');
  const [importing, setImporting] = useState(false);
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

  // Reels state
  const [reelsFile, setReelsFile] = useState<File | null>(null);
  const [reelsDescription, setReelsDescription] = useState('');

  // Scheduling state
  const [isScheduled, setIsScheduled] = useState(false);
  const [scheduledTime, setScheduledTime] = useState(() => {
    const now = new Date();
    now.setMinutes(now.getMinutes() + 15); // Default to 15 mins from now
    return now.toISOString().slice(0, 16);
  });
  const [affiliateId, setAffiliateId] = useState(() => {
    if (typeof window !== 'undefined') return localStorage.getItem('fb_affiliate_id') || '';
    return '';
  });
  const [converting, setConverting] = useState(false);

  const fetchPages = useCallback(() => {
    fetch('/api/facebook/pages').then(r => r.json()).then(j => {
      if (j.success) {
        const active = j.data.filter((p: FBPage) => p.isActive);
        setPages(active);
        if (active.length > 0) {
          setSelectedPage(prev => {
            if (active.find((p: FBPage) => p.pageId === prev)) return prev;
            return active[0].pageId;
          });
        }
      }
    }).catch(() => {});
  }, []);

  const handleImport = async () => {
    if (!importUrl) return;
    setImporting(true);
    try {
      const res = await fetch('/api/scraper/product', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: importUrl })
      });
      const data = await res.json();
      if (data.success) {
        setProductName(data.data.name || '');
        // Keep current link if exists, otherwise use original
        if (!affiliateLink) {
           setAffiliateLink(data.data.originalUrl || importUrl);
        }
        setAdditionalInfo(`Giá: ${data.data.price}\n\n${data.data.description}`);
        // Visual feedback
        const btn = document.getElementById('btn-quick-import');
        if (btn) {
           btn.classList.add('bg-green-600');
           setTimeout(() => btn.classList.remove('bg-green-600'), 2000);
        }
      } else {
        alert(`${data.error || 'Không thể quét thông tin sản phẩm.'}`);
      }
    } catch (err: any) {
      alert(`Lỗi kết nối: ${err.message}`);
    } finally {
      setImporting(false);
    }
  };

  const handleConvert = async () => {
    if (!affiliateLink || !affiliateId) {
      alert('Vui lòng nhập link cần chuyển và Affiliate ID trước!');
      return;
    }
    setConverting(true);
    try {
      const res = await fetch('/api/affiliate/convert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: affiliateLink, affiliateId })
      });
      const data = await res.json();
      if (data.success) {
        setAffiliateLink(data.shortUrl || data.convertedUrl);
        localStorage.setItem('fb_affiliate_id', affiliateId);
        alert('✨ Chuyển đổi thành công!');
      } else {
        alert('Lỗi: ' + data.error);
      }
    } catch (err: any) {
      alert('Lỗi kết nối: ' + err.message);
    } finally {
      setConverting(false);
    }
  };

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
    if (isScheduled) {
      try {
        const res = await fetch('/api/schedule', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            platform: 'facebook',
            postType: 'FEED',
            content: result.longVersion,
            scheduledAt: scheduledTime,
            metadata: {
              pageId: selectedPage,
              commentSeedings: autoComment ? result.commentSeedings : [],
              commentDelay: commentDelay * 1000
            }
          }),
        });
        const data = await res.json();
        if (data.success) {
          setPublishStatus({ status: 'completed' });
          alert(`Đã lên lịch thành công cho lúc ${scheduledTime}!`);
        } else {
          setPublishStatus({ status: 'failed' });
        }
      } catch {
        setPublishStatus({ status: 'failed' });
      } finally { setPublishing(false); }
      return;
    }
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
    if (isScheduled) {
      try {
        const res = await fetch('/api/schedule', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            platform: 'facebook',
            postType: 'FEED',
            content: quickContent,
            scheduledAt: scheduledTime,
            metadata: {
              pageId: selectedPage,
              commentSeedings: quickComments.split('\n').filter(c => c.trim()),
              commentDelay: commentDelay * 1000
            }
          }),
        });
        const data = await res.json();
        if (data.success) {
          setPublishStatus({ status: 'completed' });
          alert(`Đã lên lịch thành công cho lúc ${scheduledTime}!`);
        } else {
          setPublishStatus({ status: 'failed' });
        }
      } catch {
        setPublishStatus({ status: 'failed' });
      } finally { setPublishing(false); }
      return;
    }

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

  const handleReelsPublish = async () => {
    if (!reelsFile || !selectedPage) return;
    setPublishing(true);
    setPublishStatus({ status: 'publishing' });
    try {
      const formData = new FormData();
      formData.append('pageId', selectedPage);
      formData.append('video', reelsFile);
      formData.append('description', reelsDescription);
      formData.append('commentSeedings', quickComments);
      formData.append('commentDelay', (commentDelay * 1000).toString());

      const res = await fetch('/api/facebook/reels/publish', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (data.success) {
        setPublishStatus({ status: 'completed', postUrl: data.reelUrl });
      } else if (res.status === 401) {
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
      <div style={{ display: 'flex', gap: '8px', padding: '6px', borderRadius: '16px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.05)', marginBottom: '30px' }}>
        <button onClick={() => {setMode('ai'); setPublishStatus(null);}} style={{ flex: 1, padding: '12px', borderRadius: '12px', border: 'none', background: mode === 'ai' ? '#22d3ee' : 'transparent', color: mode === 'ai' ? '#000' : '#64748b', fontWeight: '800', fontSize: '13px', cursor: 'pointer', transition: 'all 0.3s' }}>🤖 TẠO BÀI AI</button>
        <button onClick={() => {setMode('quick'); setPublishStatus(null);}} style={{ flex: 1, padding: '12px', borderRadius: '12px', border: 'none', background: mode === 'quick' ? '#22d3ee' : 'transparent', color: mode === 'quick' ? '#000' : '#64748b', fontWeight: '800', fontSize: '13px', cursor: 'pointer', transition: 'all 0.3s' }}>⚡ ĐĂNG NHANH</button>
        <button onClick={() => {setMode('reels'); setPublishStatus(null);}} style={{ flex: 1, padding: '12px', borderRadius: '12px', border: 'none', background: mode === 'reels' ? '#1877F2' : 'transparent', color: mode === 'reels' ? '#fff' : '#64748b', fontWeight: '800', fontSize: '13px', cursor: 'pointer', transition: 'all 0.3s' }}>🎬 ĐĂNG REELS</button>
        <a href="/dashboard/facebook-expert/history" style={{ flex: 1, padding: '12px', borderRadius: '12px', background: 'transparent', color: '#64748b', fontWeight: '800', fontSize: '13px', textAlign: 'center', textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>📚 LỊCH SỬ</a>
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
                <textarea rows={10} placeholder="Viết nội dung bài viết Facebook tại đây..." value={quickContent} onChange={e => setQuickContent(e.target.value)} style={{ ...iStyle, resize: 'vertical', fontFamily: 'inherit', lineHeight: '1.6' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', color: '#475569', marginBottom: '10px', letterSpacing: '0.1em' }}>COMMENT SEEDING (TÙY CHỌN)</label>
                <textarea rows={4} placeholder="Mỗi dòng 1 comment..." value={quickComments} onChange={e => setQuickComments(e.target.value)} style={{ ...iStyle, resize: 'vertical', fontFamily: 'inherit', lineHeight: '1.6' }} />
              </div>
              {pages.length > 0 ? (
                <>
                  <div>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', color: '#475569', marginBottom: '8px' }}>CHỌN PAGE</label>
                    <select value={selectedPage} onChange={e => setSelectedPage(e.target.value)} style={{ ...iStyle, cursor: 'pointer' }}>
                      {pages.map(p => <option key={p.pageId} value={p.pageId}>{p.pageName}</option>)}
                    </select>
                  </div>
                  <div style={{ marginTop: '20px', padding: '15px', borderRadius: '14px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', marginBottom: '20px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', marginBottom: isScheduled ? '15px' : '0' }}>
                      <input type="checkbox" checked={isScheduled} onChange={e => setIsScheduled(e.target.checked)} style={{ width: '18px', height: '18px', accentColor: '#10b981' }} />
                      <span style={{ fontSize: '13px', fontWeight: '700', color: isScheduled ? '#10b981' : '#64748b' }}>📅 Lên lịch đăng bài</span>
                    </label>
                    {isScheduled && (
                      <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
                        <label style={{ display: 'block', fontSize: '10px', fontWeight: '800', color: '#475569', marginBottom: '8px' }}>THỜI GIAN ĐĂNG</label>
                        <input type="datetime-local" value={scheduledTime} onChange={e => setScheduledTime(e.target.value)} style={{ ...iStyle, padding: '10px', fontSize: '13px', border: '1px solid rgba(16,185,129,0.2)' }} />
                      </div>
                    )}
                  </div>
                  <button onClick={handleQuickPublish} disabled={publishing || !quickContent.trim()} className="btn-tech" style={{ width: '100%', padding: '18px', fontSize: '16px', background: publishing ? '#475569' : 'linear-gradient(135deg,#10b981,#22d3ee)' }}>
                    {publishing ? '⏳ ĐANG ĐĂNG...' : (isScheduled ? '📅 LÊN LỊCH ĐĂNG BÀI' : '🚀 ĐĂNG BÀI LÊN FACEBOOK')}
                  </button>
                </>
              ) : (
                <div style={{ padding: '20px', textAlign: 'center', color: '#64748b' }}>
                  Chưa kết nối Page nào. <button onClick={() => setIsConnectModalOpen(true)} style={{ background: 'none', border: 'none', color: '#1877F2', fontWeight: '700', cursor: 'pointer' }}>Kết nối ngay →</button>
                </div>
              )}
              {publishStatus && (
                <div style={{ padding: '16px', borderRadius: '14px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
                  {publishStatus.status === 'completed' && <div style={{ color: '#10b981' }}>✅ Thành công!</div>}
                  {publishStatus.postUrl && <a href={publishStatus.postUrl} target="_blank" rel="noopener noreferrer" style={{ color: '#1877F2', fontSize: '13px' }}>🔗 Xem bài đăng</a>}
                </div>
              )}
            </div>
          </section>
        </div>
      )}

      {/* ═══ AI MODE ═══ */}
      {mode === 'ai' && (
        <div style={{ display: 'grid', gridTemplateColumns: '450px 1fr', gap: '40px', alignItems: 'start' }}>
          <aside className="glass-panel" style={{ padding: '40px', borderRadius: '32px', position: 'sticky', top: '40px' }}>
            <div style={{ marginBottom: '30px', paddingBottom: '20px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', color: '#22d3ee', marginBottom: '12px', letterSpacing: '0.1em' }}>⚡ QUICK IMPORT (SHOPEE/LAZADA)</label>
              <div style={{ display: 'flex', gap: '10px' }}>
                <input 
                  type="text" 
                  placeholder="Dán link sản phẩm..." 
                  value={importUrl} 
                  onChange={e => setImportUrl(e.target.value)} 
                  style={{ ...iStyle, padding: '12px' }} 
                />
                <button 
                  id="btn-quick-import"
                  onClick={handleImport} 
                  disabled={importing || !importUrl} 
                  style={{ padding: '0 20px', borderRadius: '12px', background: '#22d3ee', color: '#000', border: 'none', fontWeight: '800', cursor: 'pointer', opacity: importing ? 0.6 : 1, transition: 'all 0.3s' }}
                >
                  {importing ? '⏳' : 'GET'}
                </button>
              </div>
            </div>

            <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#fff', marginBottom: '30px' }}>CONTROL PANEL</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
              <div style={{ padding: '15px', borderRadius: '16px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>
                <label style={{ display: 'block', fontSize: '10px', fontWeight: '800', color: '#64748b', marginBottom: '8px', letterSpacing: '0.05em' }}>AFFILIATE ID / TAG</label>
                <input 
                   type="text" 
                   placeholder="Nhập mã ID (VD: shop123)..." 
                   value={affiliateId} 
                   onChange={e => setAffiliateId(e.target.value)} 
                   style={{ ...iStyle, fontSize: '12px', padding: '8px 12px' }} 
                />
              </div>

              <input type="text" placeholder="Tên sản phẩm..." value={productName} onChange={e => setProductName(e.target.value)} style={iStyle} />
              
              <div style={{ position: 'relative' }}>
                <input type="text" placeholder="Dán link sản phẩm (Lazada/Shopee)..." value={affiliateLink} onChange={e => setAffiliateLink(e.target.value)} style={{ ...iStyle, paddingRight: '100px' }} />
                <button 
                  onClick={handleConvert}
                  disabled={converting || !affiliateLink || !affiliateId}
                  style={{ 
                    position: 'absolute', right: '8px', top: '8px', bottom: '8px', 
                    padding: '0 12px', borderRadius: '8px', background: 'rgba(34,211,238,0.1)', 
                    color: '#22d3ee', border: '1px solid rgba(34,211,238,0.2)', 
                    fontSize: '11px', fontWeight: '800', cursor: 'pointer', transition: 'all 0.2s' 
                  }}
                >
                  {converting ? '...' : 'CONVERT ✨'}
                </button>
              </div>

              <textarea rows={4} placeholder="Mô tả thêm..." value={additionalInfo} onChange={e => setAdditionalInfo(e.target.value)} style={{ ...iStyle, resize: 'none' }} />
              <button className="btn-tech" onClick={handleGenerate} disabled={loading || !productName || !affiliateLink} style={{ width: '100%', padding: '18px' }}>
                {loading ? 'GENERATING...' : 'EXECUTE FORGE ⚡'}
              </button>
            </div>
          </aside>

          <main style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
            {result ? (
              <>
                <div className="glass-panel" style={{ background: '#fff', borderRadius: '24px', color: '#1c1e21', overflow: 'hidden' }}>
                  <div style={{ padding: '20px', fontSize: '15px', whiteSpace: 'pre-wrap' }}>{result.longVersion}</div>
                  <div style={{ padding: '20px', borderTop: '1px solid #f0f2f5' }}>
                    <button onClick={() => handleCopy(result.longVersion, 'post')} style={{ width: '100%', padding: '12px', borderRadius: '10px', background: '#1877F2', color: '#fff', border: 'none', cursor: 'pointer' }}>COPY CONTENT</button>
                  </div>
                </div>

                <div className="glass-panel" style={{ padding: '30px', borderRadius: '24px' }}>
                  <h4 style={{ color: '#1877F2', fontSize: '14px', fontWeight: '800', marginBottom: '20px' }}>🚀 ĐĂNG LÊN FACEBOOK</h4>
                  {pages.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      <select value={selectedPage} onChange={e => setSelectedPage(e.target.value)} style={iStyle}>
                        {pages.map(p => <option key={p.pageId} value={p.pageId}>{p.pageName}</option>)}
                      </select>
                      <div style={{ marginTop: '10px', padding: '15px', borderRadius: '14px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', marginBottom: isScheduled ? '15px' : '0' }}>
                          <input type="checkbox" checked={isScheduled} onChange={e => setIsScheduled(e.target.checked)} style={{ width: '18px', height: '18px', accentColor: '#1877F2' }} />
                          <span style={{ fontSize: '13px', fontWeight: '700', color: isScheduled ? '#1877F2' : '#64748b' }}>📅 Lên lịch đăng bài</span>
                        </label>
                        {isScheduled && (
                          <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
                            <label style={{ display: 'block', fontSize: '10px', fontWeight: '800', color: '#475569', marginBottom: '8px' }}>THỜI GIAN ĐĂNG</label>
                            <input type="datetime-local" value={scheduledTime} onChange={e => setScheduledTime(e.target.value)} style={{ ...iStyle, padding: '10px', fontSize: '13px', border: '1px solid rgba(24,119,242,0.2)' }} />
                          </div>
                        )}
                      </div>
                      <button onClick={handlePublish} disabled={publishing} className="btn-tech" style={{ width: '100%', padding: '18px', background: '#1877F2' }}>
                        {publishing ? '⏳ ĐANG ĐĂNG...' : (isScheduled ? '📅 LÊN LỊCH ĐĂNG BÀI' : '🚀 ĐĂNG BÀI + SEEDING')}
                      </button>
                    </div>
                  ) : (
                    <div style={{ textAlign: 'center', color: '#64748b' }}>Chưa kết nối Page.</div>
                  )}
                </div>
              </>
            ) : (
              <div style={{ height: '400px', borderRadius: '40px', border: '2px dashed rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#475569' }}>
                Dòng chảy dữ liệu đang trống. Nhấn EXECUTE để bắt đầu.
              </div>
            )}
          </main>
        </div>
      )}

      {/* ═══ REELS MODE ═══ */}
      {mode === 'reels' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '30px', animation: 'fadeIn 0.5s ease-out' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div className="glass-panel" style={{ padding: '24px', borderRadius: '24px' }}>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', color: '#1877F2', marginBottom: '12px' }}>VIDEO REEL (9:16, MP4, &lt;60S)</label>
              <MediaUpload onFileSelect={setReelsFile} accept="video/mp4" maxSizeMB={100} />
            </div>

            <div className="glass-panel" style={{ padding: '24px', borderRadius: '24px' }}>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', color: '#1877F2', marginBottom: '12px' }}>MÔ TẢ VIDEO</label>
              <textarea placeholder="Gõ mô tả hấp dẫn..." value={reelsDescription} onChange={e => setReelsDescription(e.target.value)} style={{ ...iStyle, height: '120px', resize: 'none' }} />
            </div>

            <div className="glass-panel" style={{ padding: '24px', borderRadius: '24px' }}>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', color: '#1877F2', marginBottom: '12px' }}>COMMENT SEEDING (MỖI DÒNG 1 COMMENT)</label>
              <textarea 
                placeholder="Tuyệt vời quá shop ơi!\nLink mua ở đâu vậy ạ?\nĐã nhận hàng, chất lượng 5 sao..." 
                value={quickComments} 
                onChange={e => setQuickComments(e.target.value)} 
                style={{ ...iStyle, height: '100px', resize: 'none' }} 
              />
            </div>
          </div>

          <aside style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div className="glass-panel" style={{ padding: '24px', borderRadius: '24px' }}>
              <h4 style={{ fontSize: '13px', fontWeight: '800', color: '#fff', marginBottom: '20px' }}>XUẤT BẢN</h4>
              <select value={selectedPage} onChange={e => setSelectedPage(e.target.value)} style={{ ...iStyle, padding: '12px', marginBottom: '20px' }}>
                {pages.length > 0 ? pages.map(p => <option key={p.pageId} value={p.pageId}>{p.pageName}</option>) : <option disabled>Chưa kết nối Page</option>}
              </select>

              {quickComments.trim() && (
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', color: '#475569', marginBottom: '8px' }}>DELAY COMMENT: {commentDelay}s</label>
                  <input type="range" min={15} max={120} value={commentDelay} onChange={e => setCommentDelay(Number(e.target.value))} style={{ width: '100%', accentColor: '#1877F2' }} />
                </div>
              )}

              <button onClick={handleReelsPublish} disabled={publishing || !reelsFile || !selectedPage} style={{ width: '100%', padding: '14px', borderRadius: '12px', background: publishing ? '#475569' : 'linear-gradient(135deg,#1877F2,#00C6FF)', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: '800' }}>
                {publishing ? '⏳ ĐANG TẢI LÊN...' : '🚀 ĐĂNG REELS NGAY'}
              </button>

              <div style={{ marginTop: '20px', padding: '15px', borderRadius: '14px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', marginBottom: isScheduled ? '15px' : '0' }}>
                  <input type="checkbox" checked={isScheduled} onChange={e => setIsScheduled(e.target.checked)} style={{ width: '18px', height: '18px', accentColor: '#22d3ee' }} />
                  <span style={{ fontSize: '13px', fontWeight: '700', color: isScheduled ? '#22d3ee' : '#64748b' }}>📅 Lên lịch đăng bài</span>
                </label>
                
                {isScheduled && (
                  <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
                    <label style={{ display: 'block', fontSize: '10px', fontWeight: '800', color: '#475569', marginBottom: '8px' }}>THỜI GIAN ĐĂNG</label>
                    <input 
                      type="datetime-local" 
                      value={scheduledTime} 
                      onChange={e => setScheduledTime(e.target.value)} 
                      style={{ ...iStyle, padding: '10px', fontSize: '13px', border: '1px solid rgba(34,211,238,0.2)' }} 
                    />
                    <p style={{ fontSize: '11px', color: '#64748b', marginTop: '8px' }}>Múi giờ: GMT+7 (Việt Nam)</p>
                  </div>
                )}
              </div>

              {publishStatus && (
                <div style={{ marginTop: '20px', padding: '14px', borderRadius: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
                  {publishStatus.status === 'completed' && <div style={{ color: '#10b981' }}>✅ Thành công!</div>}
                  {publishStatus.status === 'failed' && <div style={{ color: '#ef4444' }}>❌ Thất bại.</div>}
                  {publishStatus.postUrl && <a href={publishStatus.postUrl} target="_blank" rel="noopener noreferrer" style={{ color: '#1877F2', fontSize: '13px', marginTop: '4px', display: 'block' }}>🔗 Xem Reels</a>}
                </div>
              )}
            </div>
          </aside>
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
