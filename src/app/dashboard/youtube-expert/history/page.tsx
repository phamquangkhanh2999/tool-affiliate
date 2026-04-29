'use client';

import { useState, useEffect } from 'react';

export default function YouTubeHistoryPage() {
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/content/youtube-expert').then(r => r.json()).then(j => {
      if (j.success) setHistory(j.data);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const copy = (text: string, id: string) => { navigator.clipboard.writeText(text); setCopied(id); setTimeout(() => setCopied(null), 2000); };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <header style={{ marginBottom: '40px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: '900', color: '#fff', marginBottom: '8px' }}>🎬 YouTube Content Archive</h1>
        <p style={{ color: '#94a3b8' }}>Lịch sử nội dung YouTube đã tạo bằng AI</p>
      </header>
      {loading ? <div style={{ textAlign: 'center', padding: '100px', color: '#64748b' }}>Đang tải...</div> :
        history.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {history.map((item, i) => {
              const meta = item.metadata as any;
              return (
                <div key={item.id || i} className="glass-panel" style={{ padding: '24px', borderRadius: '20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ fontSize: '10px', fontWeight: '800', color: '#FF0000', padding: '4px 10px', borderRadius: '6px', background: 'rgba(255,0,0,0.1)' }}>YOUTUBE</span>
                      <span style={{ color: '#fff', fontWeight: '700' }}>{meta?.productName || 'N/A'}</span>
                    </div>
                    <span style={{ fontSize: '12px', color: '#64748b' }}>{new Date(item.createdAt).toLocaleDateString('vi-VN')}</span>
                  </div>
                  {meta?.titles && (
                    <div style={{ marginBottom: '12px' }}>
                      <div style={{ fontSize: '11px', fontWeight: '800', color: '#FF0000', marginBottom: '6px' }}>TITLES:</div>
                      {(meta.titles as string[]).slice(0, 3).map((t: string, ti: number) => (
                        <div key={ti} style={{ color: '#e2e8f0', fontSize: '14px', fontWeight: '600', marginBottom: '4px' }}>• {t}</div>
                      ))}
                    </div>
                  )}
                  <div style={{ whiteSpace: 'pre-wrap', color: '#94a3b8', fontSize: '14px', lineHeight: '1.6', padding: '16px', background: 'rgba(0,0,0,0.2)', borderRadius: '12px', marginBottom: '12px', maxHeight: '150px', overflow: 'auto' }}>
                    {meta?.script?.hook || meta?.description || item.content || 'No content'}
                  </div>
                  <button onClick={() => copy(JSON.stringify(meta, null, 2), `h-${i}`)} style={{ padding: '8px 16px', borderRadius: '10px', background: copied === `h-${i}` ? '#10b981' : 'rgba(255,0,0,0.1)', border: 'none', color: copied === `h-${i}` ? '#fff' : '#FF0000', cursor: 'pointer', fontSize: '12px', fontWeight: '700', marginRight: '10px' }}>
                    {copied === `h-${i}` ? '✅ Copied' : '📋 Copy All Data'}
                  </button>
                  {meta?.imagePrompt && (
                    <button onClick={() => copy(meta.imagePrompt, `img-${i}`)} style={{ padding: '8px 16px', borderRadius: '10px', background: 'rgba(255,107,107,0.1)', border: 'none', color: '#FF6B6B', cursor: 'pointer', fontSize: '12px', fontWeight: '700', marginRight: '10px' }}>
                      {copied === `img-${i}` ? '✅ Copied' : '🎨 Copy Thumbnail Prompt'}
                    </button>
                  )}
                  {meta?.videoPrompt && (
                    <button onClick={() => copy(meta.videoPrompt, `vid-${i}`)} style={{ padding: '8px 16px', borderRadius: '10px', background: 'rgba(16,185,129,0.1)', border: 'none', color: '#10b981', cursor: 'pointer', fontSize: '12px', fontWeight: '700' }}>
                      {copied === `vid-${i}` ? '✅ Copied' : '🎥 Copy Video Prompt'}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '80px', background: 'rgba(30,41,59,0.5)', borderRadius: '32px', border: '2px dashed #334155', color: '#64748b' }}>
            Chưa có nội dung YouTube nào. <a href="/dashboard/youtube-expert" style={{ color: '#FF0000' }}>Tạo ngay →</a>
          </div>
        )
      }
    </div>
  );
}
