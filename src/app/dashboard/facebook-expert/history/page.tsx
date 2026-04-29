/* eslint-disable react-hooks/immutability */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import Link from 'next/link';
import { useEffect, useState, useCallback } from 'react';
import FacebookConnectModal from '@/components/FacebookConnectModal';

interface FBPage { id: string; pageId: string; pageName: string; isActive: boolean; }

export default function FacebookExpertHistory() {
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<any | null>(null);
  const [displayedContent, setDisplayedContent] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    if (selectedItem) {
      setDisplayedContent(selectedItem.content);
    }
  }, [selectedItem]);

  // Publish from history
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
    loadHistory();
    fetchPages();
  }, [fetchPages]);

  async function loadHistory() {
    try {
      const res = await fetch('/api/content/expert');
      if (res.ok) {
        const json = await res.json();
        if (json.success) {
          const expertContents = json.data.filter((item: any) => item.metadata?.hooks);
          setHistory(expertContents);
        }
      }
    } catch (err) {
      console.error('Lỗi tải lịch sử:', err);
    } finally {
      setLoading(false);
    }
  }

  const copyToClipboard = (text: string, id: string) => {
    const cleanText = text
      .replace(/\*\*/g, '')
      .replace(/__/g, '')
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '$2');
    navigator.clipboard.writeText(cleanText);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handlePublishFromHistory = async () => {
    if (!selectedItem || !selectedPage) return;
    setPublishing(true);
    setPublishStatus({ status: 'publishing' });
    try {
      const res = await fetch('/api/facebook/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pageId: selectedPage,
          content: displayedContent,
          commentSeedings: autoComment ? (selectedItem.metadata?.commentSeedings || []) : [],
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
    <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '32px', color: '#f1f5f9' }}>
      <header style={{ marginBottom: '40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '32px', fontWeight: '800', background: 'linear-gradient(to right, #60a5fa, #c084fc)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            CMS Lịch sử Facebook Expert
          </h1>
          <p style={{ color: '#94a3b8' }}>Quản lý, tái sử dụng và đăng lại nội dung AI đã tạo</p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <Link href='/dashboard/facebook-expert#quick-post'>
            <button style={{ padding: '12px 24px', borderRadius: '12px', background: 'rgba(16,185,129,0.15)', color: '#10b981', border: '1px solid rgba(16,185,129,0.2)', cursor: 'pointer', fontWeight: '600' }}>
              ⚡ Đăng nhanh
            </button>
          </Link>
          <Link href='/dashboard/facebook-expert'>
            <button style={{ padding: '12px 24px', borderRadius: '12px', background: '#334155', color: 'white', border: 'none', cursor: 'pointer', fontWeight: '600' }}>
              + Tạo bài mới
            </button>
          </Link>
        </div>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '400px 1fr', gap: '32px', alignItems: 'start' }}>
        {/* List Panel */}
        <aside style={{ background: 'rgba(30, 41, 59, 0.7)', borderRadius: '24px', padding: '20px', border: '1px solid rgba(255,255,255,0.1)', height: 'calc(100vh - 200px)', overflowY: 'auto' }}>
          {loading ? (
            <p style={{ textAlign: 'center', padding: '20px' }}>Đang tải...</p>
          ) : history.length === 0 ? (
            <p style={{ textAlign: 'center', padding: '20px', color: '#64748b' }}>Chưa có bài viết nào được lưu.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {history.map((item) => (
                <div
                  key={item.id}
                  onClick={() => { setSelectedItem(item); setPublishStatus(null); }}
                  style={{
                    padding: '16px', borderRadius: '16px', cursor: 'pointer', transition: 'all 0.2s',
                    background: selectedItem?.id === item.id ? 'rgba(59, 130, 246, 0.2)' : 'rgba(15, 23, 42, 0.5)',
                    border: selectedItem?.id === item.id ? '1px solid #3b82f6' : '1px solid rgba(255,255,255,0.05)',
                  }}
                >
                  <div style={{ fontWeight: '700', fontSize: '14px', marginBottom: '4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {item.metadata?.productName || 'Sản phẩm không tên'}
                  </div>
                  <div style={{ fontSize: '12px', color: '#64748b' }}>{new Date(item.createdAt).toLocaleString('vi-VN')}</div>
                </div>
              ))}
            </div>
          )}
        </aside>

        {/* Detail Panel */}
        <main>
          {selectedItem ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {/* Facebook Mockup */}
              <div style={{ background: 'white', borderRadius: '16px', color: '#1c1e21', overflow: 'hidden', maxWidth: '600px', width: '100%', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}>
                <div style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#1877F2', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>D</div>
                  <div>
                    <div style={{ fontWeight: '700', fontSize: '15px' }}>Deal Ngon Mỗi Ngày</div>
                    <div style={{ fontSize: '13px', color: '#65676b' }}>Đã lưu lúc {new Date(selectedItem.createdAt).toLocaleTimeString('vi-VN')}</div>
                  </div>
                </div>
                <div style={{ padding: '4px 16px 16px', fontSize: '15px', whiteSpace: 'pre-wrap' }}>{displayedContent}</div>
                <div style={{ padding: '0 16px 16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {/* Variant Selection in History */}
                  {selectedItem.metadata?.variants && selectedItem.metadata.variants.length > 0 && (
                    <div style={{ display: 'flex', gap: '8px', padding: '8px', background: '#f0f2f5', borderRadius: '10px' }}>
                      <button 
                        onClick={() => setDisplayedContent(selectedItem.content)}
                        style={{ flex: 1, padding: '6px', borderRadius: '6px', background: displayedContent === selectedItem.content ? '#1877F2' : 'white', color: displayedContent === selectedItem.content ? 'white' : '#65676b', border: '1px solid #ddd', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer' }}
                      >
                        GỐC
                      </button>
                      {selectedItem.metadata.variants.map((v: any, idx: number) => (
                        <button 
                          key={idx}
                          onClick={() => setDisplayedContent(v.long)}
                          style={{ flex: 1, padding: '6px', borderRadius: '6px', background: displayedContent === v.long ? '#1877F2' : 'white', color: displayedContent === v.long ? 'white' : '#65676b', border: '1px solid #ddd', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer' }}
                        >
                          V{idx + 1}
                        </button>
                      ))}
                    </div>
                  )}

                  <button style={{ width: '100%', padding: '12px', borderRadius: '8px', background: '#1877F2', color: 'white', fontWeight: '700', border: 'none', cursor: 'pointer' }} onClick={() => copyToClipboard(displayedContent, 'main')}>
                    {copiedId === 'main' ? '✅ ĐÃ COPY!' : '📋 Copy nội dung đang chọn'}
                  </button>
                </div>
              </div>

              {/* ═══ PUBLISH FROM HISTORY ═══ */}
              <div style={{ maxWidth: '600px', padding: '24px', borderRadius: '20px', background: 'linear-gradient(135deg, rgba(24,119,242,0.08), rgba(16,185,129,0.08))', border: '1px solid rgba(24,119,242,0.15)' }}>
                <h4 style={{ fontWeight: '800', color: '#fff', fontSize: '15px', marginBottom: '16px' }}>🚀 ĐĂNG BÀI NÀY LÊN FACEBOOK</h4>
                {pages.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', color: '#475569', marginBottom: '6px' }}>CHỌN PAGE</label>
                      <select value={selectedPage} onChange={e => setSelectedPage(e.target.value)} style={{ width: '100%', padding: '12px', borderRadius: '10px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.08)', color: '#fff', fontSize: '14px', cursor: 'pointer', outline: 'none' }}>
                        {pages.map(p => <option key={p.pageId} value={p.pageId}>{p.pageName}</option>)}
                      </select>
                    </div>
                    <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px', color: '#94a3b8' }}>
                        <input type="checkbox" checked={autoComment} onChange={e => setAutoComment(e.target.checked)} style={{ accentColor: '#1877F2' }} />
                        Auto Comment ({selectedItem.metadata?.commentSeedings?.length || 0} seedings)
                      </label>
                      {autoComment && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#64748b' }}>
                          Delay: {commentDelay}s
                          <input type="range" min={15} max={120} value={commentDelay} onChange={e => setCommentDelay(Number(e.target.value))} style={{ width: '80px', accentColor: '#1877F2' }} />
                        </div>
                      )}
                    </div>
                    <button onClick={handlePublishFromHistory} disabled={publishing} style={{ width: '100%', padding: '14px', borderRadius: '12px', background: publishing ? '#475569' : 'linear-gradient(135deg,#1877F2,#00C6FF)', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: '800', fontSize: '15px', opacity: publishing ? 0.6 : 1 }}>
                      {publishing ? '⏳ ĐANG ĐĂNG...' : '🚀 ĐĂNG BÀI NÀY LÊN FACEBOOK'}
                    </button>
                    {publishStatus && (
                      <div style={{ padding: '14px', borderRadius: '12px', background: publishStatus.status === 'completed' ? 'rgba(16,185,129,0.1)' : publishStatus.status === 'token_expired' ? 'rgba(245,158,11,0.1)' : publishStatus.status === 'failed' ? 'rgba(239,68,68,0.1)' : 'rgba(245,158,11,0.1)', border: `1px solid ${publishStatus.status === 'completed' ? 'rgba(16,185,129,0.3)' : publishStatus.status === 'token_expired' ? 'rgba(245,158,11,0.3)' : publishStatus.status === 'failed' ? 'rgba(239,68,68,0.3)' : 'rgba(245,158,11,0.3)'}` }}>
                        {publishStatus.status === 'completed' && <div style={{ color: '#10b981', fontWeight: '700' }}>✅ Đã đăng thành công!{publishStatus.comments ? ` ${publishStatus.comments} comments đã post.` : ''}</div>}
                        {publishStatus.status === 'token_expired' && <div><div style={{ color: '#f59e0b', fontWeight: '700', marginBottom: '6px' }}>⚠️ Token Facebook đã hết hạn!</div><div style={{ fontSize: '13px', color: '#94a3b8' }}>Token chỉ sống 1-2 giờ. Bạn cần tạo token mới.</div><button onClick={() => setIsConnectModalOpen(true)} style={{ display: 'inline-block', marginTop: '8px', padding: '8px 16px', borderRadius: '10px', background: 'rgba(24,119,242,0.15)', color: '#1877F2', fontWeight: '700', fontSize: '13px', border: 'none', cursor: 'pointer' }}>🔌 Kết nối lại Facebook →</button></div>}
                        {publishStatus.status === 'failed' && <div style={{ color: '#ef4444', fontWeight: '700' }}>❌ Thất bại. Kiểm tra token.</div>}
                        {publishStatus.status === 'publishing' && <div style={{ color: '#f59e0b', fontWeight: '700' }}>⏳ Đang xử lý...</div>}
                        {publishStatus.postUrl && <a href={publishStatus.postUrl} target="_blank" rel="noopener noreferrer" style={{ color: '#1877F2', fontSize: '13px', marginTop: '4px', display: 'block' }}>🔗 Xem bài đăng trên Facebook</a>}
                      </div>
                    )}
                  </div>
                ) : (
                  <div style={{ padding: '16px', textAlign: 'center', color: '#64748b', fontSize: '14px', background: 'rgba(0,0,0,0.15)', borderRadius: '12px' }}>
                    Chưa kết nối Page nào hoặc Token đã hết hạn. <button onClick={() => setIsConnectModalOpen(true)} style={{ background: 'none', border: 'none', color: '#1877F2', fontWeight: '700', cursor: 'pointer', padding: 0, fontSize: '14px' }}>Kết nối ngay →</button>
                  </div>
                )}
              </div>

              {/* Video Script Section */}
              {selectedItem.metadata?.videoScript && (
                <div style={{ background: 'rgba(59, 130, 246, 0.05)', borderRadius: '24px', padding: '24px', border: '1px solid rgba(59, 130, 246, 0.1)' }}>
                  <h4 style={{ color: '#60a5fa', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    🎬 KỊCH BẢN VIDEO (REELS/TIKTOK):
                  </h4>
                  <div style={{ position: 'relative' }}>
                    <div style={{ 
                      whiteSpace: 'pre-wrap', 
                      color: '#e2e8f0', 
                      fontSize: '14px', 
                      lineHeight: '1.6', 
                      padding: '20px', 
                      background: 'rgba(0,0,0,0.3)', 
                      borderRadius: '16px',
                      borderLeft: '4px solid #60a5fa'
                    }}>
                      {selectedItem.metadata.videoScript}
                    </div>
                    <button 
                      onClick={() => copyToClipboard(selectedItem.metadata.videoScript, 'v-script')}
                      style={{ 
                        position: 'absolute', 
                        top: '12px', 
                        right: '12px', 
                        background: 'rgba(59, 130, 246, 0.2)', 
                        border: '1px solid rgba(59, 130, 246, 0.3)', 
                        color: '#60a5fa', 
                        padding: '6px 12px', 
                        borderRadius: '8px', 
                        cursor: 'pointer',
                        fontSize: '12px',
                        fontWeight: '700'
                      }}
                    >
                      {copiedId === 'v-script' ? '✅ COPIED' : '📋 COPY SCRIPT'}
                    </button>
                  </div>
                </div>
              )}

              {/* Hooks & Seeding */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div style={{ background: 'rgba(30, 41, 59, 0.4)', borderRadius: '24px', padding: '24px', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <h4 style={{ color: '#60a5fa', marginBottom: '16px' }}>🚀 Tiêu đề (Hooks):</h4>
                  {(selectedItem.metadata?.hooks || []).map((hook: string, i: number) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', background: 'rgba(0,0,0,0.2)', padding: '10px', borderRadius: '8px' }}>
                      <span style={{ fontSize: '13px' }}>{hook}</span>
                      <button style={{ background: 'none', border: 'none', color: '#60a5fa', cursor: 'pointer' }} onClick={() => copyToClipboard(hook, `h-${i}`)}>
                        {copiedId === `h-${i}` ? '✅' : '📋'}
                      </button>
                    </div>
                  ))}
                </div>
                <div style={{ background: 'rgba(16, 185, 129, 0.05)', borderRadius: '24px', padding: '24px', border: '1px solid rgba(16, 185, 129, 0.1)' }}>
                  <h4 style={{ color: '#10b981', marginBottom: '16px' }}>💬 Seeding:</h4>
                  {(selectedItem.metadata?.commentSeedings || []).map((seed: string, i: number) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', background: 'rgba(0,0,0,0.2)', padding: '10px', borderRadius: '8px' }}>
                      <span style={{ fontSize: '13px' }}>{seed}</span>
                      <button style={{ background: 'none', border: 'none', color: '#10b981', cursor: 'pointer' }} onClick={() => copyToClipboard(seed, `s-${i}`)}>
                        {copiedId === `s-${i}` ? '✅' : '📋'}
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* AI Prompts Section */}
              <div style={{ background: 'rgba(99, 102, 241, 0.05)', borderRadius: '24px', padding: '24px', border: '1px solid rgba(99, 102, 241, 0.1)' }}>
                <h4 style={{ color: '#818cf8', marginBottom: '16px' }}>🤖 AI Generation Prompts:</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {selectedItem.metadata?.imagePrompt && (
                    <div style={{ background: 'rgba(0,0,0,0.2)', padding: '16px', borderRadius: '12px' }}>
                      <div style={{ fontSize: '11px', fontWeight: '800', color: '#818cf8', marginBottom: '6px' }}>🎨 IMAGE PROMPT</div>
                      <div style={{ fontSize: '13px', fontStyle: 'italic', color: '#94a3b8' }}>{selectedItem.metadata.imagePrompt}</div>
                      <button onClick={() => copyToClipboard(selectedItem.metadata.imagePrompt, 'img-p')} style={{ marginTop: '10px', background: 'none', border: 'none', color: '#818cf8', cursor: 'pointer', fontSize: '12px', fontWeight: '700' }}>
                        {copiedId === 'img-p' ? '✅ ĐÃ COPY' : '📋 Copy Image Prompt'}
                      </button>
                    </div>
                  )}
                  {selectedItem.metadata?.videoPrompt && (
                    <div style={{ background: 'rgba(0,0,0,0.2)', padding: '16px', borderRadius: '12px' }}>
                      <div style={{ fontSize: '11px', fontWeight: '800', color: '#f59e0b', marginBottom: '6px' }}>🎥 VIDEO PROMPT</div>
                      <div style={{ fontSize: '13px', fontStyle: 'italic', color: '#94a3b8' }}>{selectedItem.metadata.videoPrompt}</div>
                      <button onClick={() => copyToClipboard(selectedItem.metadata.videoPrompt, 'vid-p')} style={{ marginTop: '10px', background: 'none', border: 'none', color: '#f59e0b', cursor: 'pointer', fontSize: '12px', fontWeight: '700' }}>
                        {copiedId === 'vid-p' ? '✅ ĐÃ COPY' : '📋 Copy Video Prompt'}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '100px 0', opacity: 0.3 }}>
              <div style={{ fontSize: '64px' }}>🖱️</div>
              <h3>Chọn một bài viết bên trái để xem lại</h3>
            </div>
          )}
        </main>
      </div>

      <FacebookConnectModal 
        isOpen={isConnectModalOpen} 
        onClose={() => setIsConnectModalOpen(false)} 
        onSuccess={fetchPages} 
      />
    </div>
  );
}
