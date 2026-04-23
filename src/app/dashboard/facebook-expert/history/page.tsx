/* eslint-disable react-hooks/immutability */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function FacebookExpertHistory() {
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<any | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    loadHistory();
  }, []);

  async function loadHistory() {
    try {
      const res = await fetch('/api/content/expert');
      if (res.ok) {
        const json = await res.json();
        if (json.success) {
          // Lấy các bài có metadata (để đảm bảo là bài expert)
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

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '32px', color: '#f1f5f9' }}>
      <header
        style={{
          marginBottom: '40px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <div>
          <h1
            style={{
              fontSize: '32px',
              fontWeight: '800',
              background: 'linear-gradient(to right, #60a5fa, #c084fc)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            CMS Lịch sử Facebook Expert
          </h1>
          <p style={{ color: '#94a3b8' }}>Quản lý và sử dụng lại các nội dung AI đã tạo</p>
        </div>
        <Link href='/dashboard/facebook-expert'>
          <button
            style={{
              padding: '12px 24px',
              borderRadius: '12px',
              background: '#334155',
              color: 'white',
              border: 'none',
              cursor: 'pointer',
              fontWeight: '600',
            }}
          >
            + Tạo bài mới
          </button>
        </Link>
      </header>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '400px 1fr',
          gap: '32px',
          alignItems: 'start',
        }}
      >
        {/* List Panel */}
        <aside
          style={{
            background: 'rgba(30, 41, 59, 0.7)',
            borderRadius: '24px',
            padding: '20px',
            border: '1px solid rgba(255,255,255,0.1)',
            height: 'calc(100vh - 200px)',
            overflowY: 'auto',
          }}
        >
          {loading ? (
            <p style={{ textAlign: 'center', padding: '20px' }}>Đang tải...</p>
          ) : history.length === 0 ? (
            <p style={{ textAlign: 'center', padding: '20px', color: '#64748b' }}>
              Chưa có bài viết nào được lưu.
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {history.map((item) => (
                <div
                  key={item.id}
                  onClick={() => setSelectedItem(item)}
                  style={{
                    padding: '16px',
                    borderRadius: '16px',
                    background:
                      selectedItem?.id === item.id
                        ? 'rgba(59, 130, 246, 0.2)'
                        : 'rgba(15, 23, 42, 0.5)',
                    border:
                      selectedItem?.id === item.id
                        ? '1px solid #3b82f6'
                        : '1px solid rgba(255,255,255,0.05)',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                >
                  <div
                    style={{
                      fontWeight: '700',
                      fontSize: '14px',
                      marginBottom: '4px',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {item.metadata?.productName || 'Sản phẩm không tên'}
                  </div>
                  <div style={{ fontSize: '12px', color: '#64748b' }}>
                    {new Date(item.createdAt).toLocaleString('vi-VN')}
                  </div>
                </div>
              ))}
            </div>
          )}
        </aside>

        {/* Detail Panel */}
        <main>
          {selectedItem ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
              {/* Facebook Mockup */}
              <div
                style={{
                  background: 'white',
                  borderRadius: '16px',
                  color: '#1c1e21',
                  overflow: 'hidden',
                  maxWidth: '600px',
                  width: '100%',
                  boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
                }}
              >
                <div
                  style={{
                    padding: '12px 16px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                  }}
                >
                  <div
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      background: '#1877F2',
                      color: 'white',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 'bold',
                    }}
                  >
                    D
                  </div>
                  <div>
                    <div style={{ fontWeight: '700', fontSize: '15px' }}>Deal Ngon Mỗi Ngày</div>
                    <div style={{ fontSize: '13px', color: '#65676b' }}>
                      Đã lưu lúc {new Date(selectedItem.createdAt).toLocaleTimeString('vi-VN')}
                    </div>
                  </div>
                </div>
                <div style={{ padding: '4px 16px 16px', fontSize: '15px', whiteSpace: 'pre-wrap' }}>
                  {selectedItem.content}
                </div>
                <div style={{ padding: '0 16px 16px' }}>
                  <button
                    style={{
                      width: '100%',
                      padding: '12px',
                      borderRadius: '8px',
                      background: '#1877F2',
                      color: 'white',
                      fontWeight: '700',
                      border: 'none',
                      cursor: 'pointer',
                    }}
                    onClick={() => copyToClipboard(selectedItem.content, 'main')}
                  >
                    {copiedId === 'main' ? '✅ ĐÃ COPY!' : '📋 Copy bài viết chính'}
                  </button>
                </div>
              </div>

              {/* Hooks & Seeding */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div
                  style={{
                    background: 'rgba(30, 41, 59, 0.4)',
                    borderRadius: '24px',
                    padding: '24px',
                    border: '1px solid rgba(255,255,255,0.05)',
                  }}
                >
                  <h4 style={{ color: '#60a5fa', marginBottom: '16px' }}>🚀 Tiêu đề (Hooks):</h4>
                  {(selectedItem.metadata?.hooks || []).map((hook: string, i: number) => (
                    <div
                      key={i}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '8px',
                        background: 'rgba(0,0,0,0.2)',
                        padding: '10px',
                        borderRadius: '8px',
                      }}
                    >
                      <span style={{ fontSize: '13px' }}>{hook}</span>
                      <button
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#60a5fa',
                          cursor: 'pointer',
                        }}
                        onClick={() => copyToClipboard(hook, `h-${i}`)}
                      >
                        {copiedId === `h-${i}` ? '✅' : '📋'}
                      </button>
                    </div>
                  ))}
                </div>

                <div
                  style={{
                    background: 'rgba(16, 185, 129, 0.05)',
                    borderRadius: '24px',
                    padding: '24px',
                    border: '1px solid rgba(16, 185, 129, 0.1)',
                  }}
                >
                  <h4 style={{ color: '#10b981', marginBottom: '16px' }}>💬 Seeding:</h4>
                  {(selectedItem.metadata?.commentSeedings || []).map((seed: string, i: number) => (
                    <div
                      key={i}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '8px',
                        background: 'rgba(0,0,0,0.2)',
                        padding: '10px',
                        borderRadius: '8px',
                      }}
                    >
                      <span style={{ fontSize: '13px' }}>{seed}</span>
                      <button
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#10b981',
                          cursor: 'pointer',
                        }}
                        onClick={() => copyToClipboard(seed, `s-${i}`)}
                      >
                        {copiedId === `s-${i}` ? '✅' : '📋'}
                      </button>
                    </div>
                  ))}
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
    </div>
  );
}
