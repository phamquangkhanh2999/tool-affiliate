/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useEffect, useState } from 'react';

interface FBPageInfo {
  id: string;
  pageId: string;
  pageName: string;
  pageAvatar: string | null;
  isActive: boolean;
  createdAt: string;
}

export default function FacebookConnectPage() {
  const [token, setToken] = useState('');
  const [checking, setChecking] = useState(false);
  const [connecting, setConnecting] = useState<string | null>(null);
  const [connectedPages, setConnectedPages] = useState<FBPageInfo[]>([]);
  const [discoveredPages, setDiscoveredPages] = useState<any[]>([]);
  const [msg, setMsg] = useState<{ t: 'ok' | 'err'; text: string } | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchPages = async () => {
    try {
      const res = await fetch('/api/facebook/pages');
      const j = await res.json();
      if (j.success) setConnectedPages(j.data);
    } catch {
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPages();
  }, []);

  const handleCheck = async () => {
    if (!token.trim()) return;
    setChecking(true);
    setMsg(null);
    setDiscoveredPages([]);
    try {
      const res = await fetch('/api/facebook/token-check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accessToken: token }),
      });
      const j = await res.json();
      if (j.success) {
        setDiscoveredPages(j.data.pages || []);
        setMsg({ t: 'ok', text: `✅ Token hợp lệ! User: ${j.data.user.name}` });
      } else {
        setMsg({ t: 'err', text: j.error || 'Token không hợp lệ' });
      }
    } catch {
      setMsg({ t: 'err', text: 'Lỗi server' });
    } finally {
      setChecking(false);
    }
  };

  const handleConnect = async (p: any) => {
    setConnecting(p.id);
    try {
      const res = await fetch('/api/facebook/pages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pageId: p.id,
          pageName: p.name,
          accessToken: p.accessToken,
          pageAvatar: p.avatar,
        }),
      });
      const j = await res.json();
      if (j.success) {
        setMsg({ t: 'ok', text: `✅ Kết nối "${p.name}" thành công!` });
        fetchPages();
      }
    } catch {
      setMsg({ t: 'err', text: 'Lỗi kết nối' });
    } finally {
      setConnecting(null);
    }
  };

  const handleDisconnect = async (pageId: string) => {
    await fetch('/api/facebook/pages', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pageId }),
    });
    fetchPages();
    setMsg({ t: 'ok', text: 'Đã ngắt kết nối' });
  };

  const iStyle: React.CSSProperties = {
    width: '100%',
    padding: '16px',
    borderRadius: '14px',
    background: 'rgba(0,0,0,0.3)',
    border: '1px solid rgba(255,255,255,0.08)',
    color: '#fff',
    fontSize: '14px',
    outline: 'none',
    fontFamily: 'monospace',
  };

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto' }}>
      <header style={{ marginBottom: '50px' }}>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '10px',
            padding: '6px 16px',
            borderRadius: '100px',
            background: 'rgba(24,119,242,0.1)',
            border: '1px solid rgba(24,119,242,0.2)',
            marginBottom: '20px',
          }}
        >
          <span
            style={{
              fontSize: '10px',
              fontWeight: '900',
              color: '#1877F2',
              letterSpacing: '0.1em',
            }}
          >
            FACEBOOK INTEGRATION
          </span>
        </div>
        <h1
          style={{ fontSize: '48px', fontWeight: '900', color: '#fff', letterSpacing: '-0.04em' }}
        >
          FB <span style={{ color: '#1877F2' }}>Connect.</span>
        </h1>
        <p style={{ color: '#64748b', fontSize: '16px' }}>
          Kết nối Facebook Page để tự động đăng bài và comment seeding.
        </p>
      </header>

      {msg && (
        <div
          style={{
            padding: '16px 20px',
            borderRadius: '16px',
            marginBottom: '24px',
            background: msg.t === 'ok' ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
            border: `1px solid ${msg.t === 'ok' ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)'}`,
            color: msg.t === 'ok' ? '#10b981' : '#ef4444',
            fontSize: '14px',
            fontWeight: '600',
          }}
        >
          {msg.text}
        </div>
      )}

      {/* Connected Pages */}
      <section
        className='glass-panel'
        style={{ padding: '30px', borderRadius: '24px', marginBottom: '30px' }}
      >
        <h3
          style={{
            fontSize: '14px',
            fontWeight: '800',
            color: '#fff',
            marginBottom: '20px',
            letterSpacing: '0.05em',
          }}
        >
          📘 PAGES ĐÃ KẾT NỐI
        </h3>
        {loading ? (
          <div style={{ color: '#64748b', padding: '20px', textAlign: 'center' }}>Đang tải...</div>
        ) : connectedPages.filter((p) => p.isActive).length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {connectedPages
              .filter((p) => p.isActive)
              .map((page) => (
                <div
                  key={page.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '16px 20px',
                    borderRadius: '16px',
                    background: 'rgba(24,119,242,0.05)',
                    border: '1px solid rgba(24,119,242,0.1)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <div
                      style={{
                        width: '42px',
                        height: '42px',
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg,#1877F2,#00C6FF)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#fff',
                        fontWeight: '800',
                        fontSize: '16px',
                      }}
                    >
                      {page.pageName[0]}
                    </div>
                    <div>
                      <div style={{ fontWeight: '700', color: '#fff', fontSize: '15px' }}>
                        {page.pageName}
                      </div>
                      <div style={{ fontSize: '12px', color: '#64748b' }}>ID: {page.pageId}</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <span
                      style={{
                        fontSize: '11px',
                        fontWeight: '700',
                        color: '#10b981',
                        padding: '4px 10px',
                        background: 'rgba(16,185,129,0.1)',
                        borderRadius: '8px',
                      }}
                    >
                      ACTIVE
                    </span>
                    <button
                      onClick={() => handleDisconnect(page.pageId)}
                      style={{
                        padding: '8px 16px',
                        borderRadius: '10px',
                        background: 'rgba(239,68,68,0.1)',
                        color: '#ef4444',
                        border: '1px solid rgba(239,68,68,0.2)',
                        cursor: 'pointer',
                        fontSize: '12px',
                        fontWeight: '700',
                      }}
                    >
                      Ngắt
                    </button>
                  </div>
                </div>
              ))}
          </div>
        ) : (
          <div
            style={{
              padding: '30px',
              textAlign: 'center',
              color: '#475569',
              fontSize: '14px',
              border: '2px dashed rgba(255,255,255,0.05)',
              borderRadius: '16px',
            }}
          >
            Chưa có Page nào. Nhập Token bên dưới.
          </div>
        )}
      </section>

      {/* Next Steps - only show when pages are connected */}
      {!loading && connectedPages.filter((p) => p.isActive).length > 0 && (
        <section
          style={{
            marginBottom: '30px',
            padding: '30px',
            borderRadius: '24px',
            background: 'linear-gradient(135deg, rgba(16,185,129,0.08), rgba(34,211,238,0.08))',
            border: '1px solid rgba(16,185,129,0.15)',
          }}
        >
          <h3
            style={{ fontSize: '16px', fontWeight: '800', color: '#10b981', marginBottom: '8px' }}
          >
            ✅ Kết nối thành công! Bước tiếp theo:
          </h3>
          <p style={{ color: '#94a3b8', fontSize: '13px', marginBottom: '20px' }}>
            Chọn 1 trong 3 cách để đăng bài lên Facebook Page đã kết nối:
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px' }}>
            <a href='/dashboard/facebook-expert' style={{ textDecoration: 'none' }}>
              <div
                style={{
                  padding: '20px',
                  borderRadius: '16px',
                  background: 'rgba(0,0,0,0.2)',
                  border: '1px solid rgba(24,119,242,0.2)',
                  cursor: 'pointer',
                  height: '100%',
                }}
              >
                <div style={{ fontSize: '28px', marginBottom: '10px' }}>🤖</div>
                <div
                  style={{
                    fontWeight: '700',
                    color: '#fff',
                    fontSize: '15px',
                    marginBottom: '6px',
                  }}
                >
                  Tạo bài AI + Đăng
                </div>
                <div style={{ color: '#94a3b8', fontSize: '12px', lineHeight: '1.5' }}>
                  AI tự tạo nội dung chất lượng cao → Xem trước → Đăng lên Page + Auto Comment
                </div>
                <div
                  style={{
                    marginTop: '12px',
                    padding: '8px 14px',
                    borderRadius: '10px',
                    background: 'rgba(24,119,242,0.15)',
                    color: '#1877F2',
                    fontSize: '12px',
                    fontWeight: '700',
                    display: 'inline-block',
                  }}
                >
                  Mở Studio →
                </div>
              </div>
            </a>
            <a href='/dashboard/facebook-expert#quick-post' style={{ textDecoration: 'none' }}>
              <div
                style={{
                  padding: '20px',
                  borderRadius: '16px',
                  background: 'rgba(0,0,0,0.2)',
                  border: '1px solid rgba(16,185,129,0.2)',
                  cursor: 'pointer',
                  height: '100%',
                }}
              >
                <div style={{ fontSize: '28px', marginBottom: '10px' }}>⚡</div>
                <div
                  style={{
                    fontWeight: '700',
                    color: '#fff',
                    fontSize: '15px',
                    marginBottom: '6px',
                  }}
                >
                  Đăng nhanh
                </div>
                <div style={{ color: '#94a3b8', fontSize: '12px', lineHeight: '1.5' }}>
                  Gõ/dán nội dung tự soạn → Chọn Page → Đăng luôn không cần AI
                </div>
                <div
                  style={{
                    marginTop: '12px',
                    padding: '8px 14px',
                    borderRadius: '10px',
                    background: 'rgba(16,185,129,0.15)',
                    color: '#10b981',
                    fontSize: '12px',
                    fontWeight: '700',
                    display: 'inline-block',
                  }}
                >
                  Đăng nhanh →
                </div>
              </div>
            </a>
            <a href='/dashboard/facebook-expert/history' style={{ textDecoration: 'none' }}>
              <div
                style={{
                  padding: '20px',
                  borderRadius: '16px',
                  background: 'rgba(0,0,0,0.2)',
                  border: '1px solid rgba(168,85,247,0.2)',
                  cursor: 'pointer',
                  height: '100%',
                }}
              >
                <div style={{ fontSize: '28px', marginBottom: '10px' }}>📚</div>
                <div
                  style={{
                    fontWeight: '700',
                    color: '#fff',
                    fontSize: '15px',
                    marginBottom: '6px',
                  }}
                >
                  Đăng từ lịch sử
                </div>
                <div style={{ color: '#94a3b8', fontSize: '12px', lineHeight: '1.5' }}>
                  Xem lại bài đã tạo trước đó → Chọn bài → Đăng lên Page
                </div>
                <div
                  style={{
                    marginTop: '12px',
                    padding: '8px 14px',
                    borderRadius: '10px',
                    background: 'rgba(168,85,247,0.15)',
                    color: '#a855f7',
                    fontSize: '12px',
                    fontWeight: '700',
                    display: 'inline-block',
                  }}
                >
                  Xem lịch sử →
                </div>
              </div>
            </a>
          </div>
        </section>
      )}

      {/* Token Input */}
      <section
        className='glass-panel'
        style={{ padding: '30px', borderRadius: '24px', marginBottom: '30px' }}
      >
        <h3 style={{ fontSize: '14px', fontWeight: '800', color: '#fff', marginBottom: '8px' }}>
          🔑 KẾT NỐI PAGE MỚI
        </h3>
        <p style={{ color: '#64748b', fontSize: '13px', marginBottom: '20px' }}>
          Dán token từ{' '}
          <a
            href='https://developers.facebook.com/tools/explorer/'
            target='_blank'
            rel='noopener noreferrer'
            style={{ color: '#1877F2' }}
          >
            Graph API Explorer
          </a>
          .
        </p>
        <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
          <input
            type='password'
            placeholder='Dán Access Token...'
            value={token}
            onChange={(e) => setToken(e.target.value)}
            style={{ ...iStyle, flex: 1 }}
          />
          <button
            onClick={handleCheck}
            disabled={checking || !token.trim()}
            className='btn-tech'
            style={{ padding: '16px 28px', whiteSpace: 'nowrap', opacity: checking ? 0.5 : 1 }}
          >
            {checking ? 'Đang kiểm tra...' : '🔍 Kiểm tra'}
          </button>
        </div>
        {discoveredPages.length > 0 && (
          <div>
            <h4
              style={{
                fontSize: '12px',
                fontWeight: '800',
                color: '#22d3ee',
                marginBottom: '12px',
              }}
            >
              PAGES TÌM THẤY ({discoveredPages.length})
            </h4>
            {discoveredPages.map((p: any) => (
              <div
                key={p.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '14px 18px',
                  borderRadius: '14px',
                  background: 'rgba(0,0,0,0.2)',
                  border: '1px solid rgba(255,255,255,0.05)',
                  marginBottom: '8px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div
                    style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '50%',
                      background: '#1877F2',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#fff',
                      fontWeight: '700',
                    }}
                  >
                    {p.name[0]}
                  </div>
                  <div>
                    <div style={{ fontWeight: '600', color: '#fff', fontSize: '14px' }}>
                      {p.name}
                    </div>
                    <div style={{ fontSize: '11px', color: '#64748b' }}>ID: {p.id}</div>
                  </div>
                </div>
                <button
                  onClick={() => handleConnect(p)}
                  disabled={connecting === p.id}
                  className='btn-tech'
                  style={{
                    padding: '10px 20px',
                    fontSize: '13px',
                    opacity: connecting === p.id ? 0.5 : 1,
                  }}
                >
                  {connecting === p.id ? '...' : '🔌 Kết nối'}
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Detailed Guide */}
      <section
        className='glass-panel'
        style={{ padding: '30px', borderRadius: '24px', marginBottom: '30px' }}
      >
        <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#fff', marginBottom: '8px' }}>
          📖 HƯỚNG DẪN CHI TIẾT LẤY TOKEN FACEBOOK
        </h3>
        <p style={{ color: '#64748b', fontSize: '13px', marginBottom: '24px' }}>
          Làm theo 7 bước dưới đây để lấy Page Access Token và kết nối Page vào hệ thống.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Step 1 */}
          <div
            style={{
              padding: '20px',
              borderRadius: '16px',
              background: 'rgba(0,0,0,0.15)',
              border: '1px solid rgba(255,255,255,0.03)',
            }}
          >
            <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  flexShrink: 0,
                  background: 'linear-gradient(135deg,#1877F2,#00C6FF)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '14px',
                  fontWeight: '900',
                  color: '#fff',
                }}
              >
                1
              </div>
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    fontWeight: '800',
                    color: '#fff',
                    fontSize: '15px',
                    marginBottom: '8px',
                  }}
                >
                  Tạo tài khoản Facebook Developer
                </div>
                <div style={{ color: '#94a3b8', fontSize: '13px', lineHeight: '1.8' }}>
                  • Truy cập{' '}
                  <a
                    href='https://developers.facebook.com'
                    target='_blank'
                    rel='noopener noreferrer'
                    style={{ color: '#1877F2', fontWeight: '600' }}
                  >
                    developers.facebook.com
                  </a>
                  <br />
                  • Đăng nhập bằng tài khoản Facebook cá nhân của bạn
                  <br />• Nếu chưa có tài khoản Developer, nhấn{' '}
                  <b style={{ color: '#fff' }}>&quot;Bắt đầu&quot;</b> (Get Started) và làm theo
                  hướng dẫn xác minh
                </div>
              </div>
            </div>
          </div>

          {/* Step 2 */}
          <div
            style={{
              padding: '20px',
              borderRadius: '16px',
              background: 'rgba(0,0,0,0.15)',
              border: '1px solid rgba(255,255,255,0.03)',
            }}
          >
            <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  flexShrink: 0,
                  background: 'linear-gradient(135deg,#1877F2,#00C6FF)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '14px',
                  fontWeight: '900',
                  color: '#fff',
                }}
              >
                2
              </div>
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    fontWeight: '800',
                    color: '#fff',
                    fontSize: '15px',
                    marginBottom: '8px',
                  }}
                >
                  Tạo Facebook App mới
                </div>
                <div style={{ color: '#94a3b8', fontSize: '13px', lineHeight: '1.8' }}>
                  • Nhấn <b style={{ color: '#fff' }}>&quot;My Apps&quot;</b> (góc trên phải) →{' '}
                  <b style={{ color: '#fff' }}>&quot;Create App&quot;</b>
                  <br />• Chọn loại App: <b style={{ color: '#22d3ee' }}>
                    &quot;Business&quot;
                  </b>{' '}
                  (hoặc &quot;Other&quot; → &quot;Business&quot;)
                  <br />• Đặt tên App (ví dụ:{' '}
                  <code
                    style={{
                      background: 'rgba(0,0,0,0.3)',
                      padding: '2px 8px',
                      borderRadius: '4px',
                      color: '#22d3ee',
                    }}
                  >
                    Tool Affiliate Auto Post
                  </code>
                  )<br />• Nhấn <b style={{ color: '#fff' }}>&quot;Create App&quot;</b> → Xác nhận
                  mật khẩu
                </div>
              </div>
            </div>
          </div>

          {/* Step 3 */}
          <div
            style={{
              padding: '20px',
              borderRadius: '16px',
              background: 'rgba(0,0,0,0.15)',
              border: '1px solid rgba(255,255,255,0.03)',
            }}
          >
            <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  flexShrink: 0,
                  background: 'linear-gradient(135deg,#1877F2,#00C6FF)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '14px',
                  fontWeight: '900',
                  color: '#fff',
                }}
              >
                3
              </div>
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    fontWeight: '800',
                    color: '#fff',
                    fontSize: '15px',
                    marginBottom: '8px',
                  }}
                >
                  Mở Graph API Explorer
                </div>
                <div style={{ color: '#94a3b8', fontSize: '13px', lineHeight: '1.8' }}>
                  • Truy cập{' '}
                  <a
                    href='https://developers.facebook.com/tools/explorer/'
                    target='_blank'
                    rel='noopener noreferrer'
                    style={{ color: '#1877F2', fontWeight: '600' }}
                  >
                    developers.facebook.com/tools/explorer
                  </a>
                  <br />• Ở dropdown <b style={{ color: '#fff' }}>&quot;Facebook App&quot;</b> (góc
                  trên phải) → Chọn App bạn vừa tạo ở Bước 2<br />• Ở dropdown{' '}
                  <b style={{ color: '#fff' }}>&quot;User or Page&quot;</b> → Chọn{' '}
                  <b style={{ color: '#22d3ee' }}>&quot;Get Page Access Token&quot;</b>
                </div>
              </div>
            </div>
          </div>

          {/* Step 4 */}
          <div
            style={{
              padding: '20px',
              borderRadius: '16px',
              background: 'rgba(24,119,242,0.05)',
              border: '1px solid rgba(24,119,242,0.15)',
            }}
          >
            <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  flexShrink: 0,
                  background: 'linear-gradient(135deg,#1877F2,#00C6FF)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '14px',
                  fontWeight: '900',
                  color: '#fff',
                }}
              >
                4
              </div>
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    fontWeight: '800',
                    color: '#fff',
                    fontSize: '15px',
                    marginBottom: '8px',
                  }}
                >
                  ⭐ Thêm quyền (Permissions) — QUAN TRỌNG
                </div>
                <div style={{ color: '#94a3b8', fontSize: '13px', lineHeight: '1.8' }}>
                  • Nhấn nút <b style={{ color: '#fff' }}>&quot;Add a Permission&quot;</b> (bên
                  phải)
                  <br />• Tìm và tick chọn <b>3 quyền bắt buộc</b> sau:
                </div>
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px',
                    marginTop: '12px',
                    marginBottom: '12px',
                  }}
                >
                  <div
                    style={{
                      padding: '10px 16px',
                      borderRadius: '10px',
                      background: 'rgba(0,0,0,0.3)',
                      border: '1px solid rgba(24,119,242,0.2)',
                    }}
                  >
                    <code style={{ color: '#1877F2', fontWeight: '700' }}>pages_manage_posts</code>
                    <span style={{ color: '#64748b', fontSize: '12px', marginLeft: '12px' }}>
                      → Cho phép đăng bài lên Page
                    </span>
                  </div>
                  <div
                    style={{
                      padding: '10px 16px',
                      borderRadius: '10px',
                      background: 'rgba(0,0,0,0.3)',
                      border: '1px solid rgba(24,119,242,0.2)',
                    }}
                  >
                    <code style={{ color: '#1877F2', fontWeight: '700' }}>
                      pages_manage_engagement
                    </code>
                    <span style={{ color: '#64748b', fontSize: '12px', marginLeft: '12px' }}>
                      → Cho phép comment trên bài viết
                    </span>
                  </div>
                  <div
                    style={{
                      padding: '10px 16px',
                      borderRadius: '10px',
                      background: 'rgba(0,0,0,0.3)',
                      border: '1px solid rgba(24,119,242,0.2)',
                    }}
                  >
                    <code style={{ color: '#1877F2', fontWeight: '700' }}>
                      pages_read_engagement
                    </code>
                    <span style={{ color: '#64748b', fontSize: '12px', marginLeft: '12px' }}>
                      → Cho phép đọc tương tác trên Page
                    </span>
                  </div>
                </div>
                <div style={{ color: '#94a3b8', fontSize: '13px', lineHeight: '1.8' }}>
                  • Nếu cần, thêm thêm:{' '}
                  <code
                    style={{
                      background: 'rgba(0,0,0,0.3)',
                      padding: '2px 6px',
                      borderRadius: '4px',
                      color: '#94a3b8',
                    }}
                  >
                    pages_read_user_content
                  </code>
                </div>
              </div>
            </div>
          </div>

          {/* Step 5 */}
          <div
            style={{
              padding: '20px',
              borderRadius: '16px',
              background: 'rgba(16,185,129,0.05)',
              border: '1px solid rgba(16,185,129,0.15)',
            }}
          >
            <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  flexShrink: 0,
                  background: 'linear-gradient(135deg,#10b981,#22d3ee)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '14px',
                  fontWeight: '900',
                  color: '#fff',
                }}
              >
                5
              </div>
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    fontWeight: '800',
                    color: '#fff',
                    fontSize: '15px',
                    marginBottom: '8px',
                  }}
                >
                  ✅ Tạo Token và chọn Page
                </div>
                <div style={{ color: '#94a3b8', fontSize: '13px', lineHeight: '1.8' }}>
                  • Nhấn nút <b style={{ color: '#10b981' }}>&quot;Generate Access Token&quot;</b>{' '}
                  (nút xanh lá)
                  <br />
                  • Facebook sẽ hiện popup yêu cầu bạn chọn Page muốn kết nối
                  <br />• <b style={{ color: '#fff' }}>Tick chọn Page</b> bạn muốn tự động đăng bài
                  → Nhấn <b style={{ color: '#fff' }}>&quot;Done&quot;</b>
                  <br />• Nhấn <b style={{ color: '#fff' }}>&quot;OK&quot;</b> để xác nhận
                  <br />• Token sẽ hiển thị trong ô{' '}
                  <b style={{ color: '#fff' }}>&quot;Access Token&quot;</b> →{' '}
                  <b style={{ color: '#10b981' }}>Copy toàn bộ token này</b>
                </div>
              </div>
            </div>
          </div>

          {/* Step 6 */}
          <div
            style={{
              padding: '20px',
              borderRadius: '16px',
              background: 'rgba(0,0,0,0.15)',
              border: '1px solid rgba(255,255,255,0.03)',
            }}
          >
            <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  flexShrink: 0,
                  background: 'linear-gradient(135deg,#1877F2,#00C6FF)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '14px',
                  fontWeight: '900',
                  color: '#fff',
                }}
              >
                6
              </div>
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    fontWeight: '800',
                    color: '#fff',
                    fontSize: '15px',
                    marginBottom: '8px',
                  }}
                >
                  Dán Token vào Tool Affiliate
                </div>
                <div style={{ color: '#94a3b8', fontSize: '13px', lineHeight: '1.8' }}>
                  • Quay lại trang này (Kết nối Facebook)
                  <br />• Dán token vào ô{' '}
                  <b style={{ color: '#fff' }}>&quot;Dán Access Token&quot;</b> ở phần trên
                  <br />• Nhấn <b style={{ color: '#fff' }}>&quot;🔍 Kiểm tra&quot;</b> → Hệ thống
                  sẽ hiển thị danh sách Pages
                  <br />• Nhấn <b style={{ color: '#22d3ee' }}>&quot;🔌 Kết nối&quot;</b> bên cạnh
                  Page bạn muốn dùng
                  <br />• Khi thấy thông báo{' '}
                  <span style={{ color: '#10b981' }}>✅ Kết nối thành công</span> → Hoàn tất!
                </div>
              </div>
            </div>
          </div>

          {/* Step 7 */}
          <div
            style={{
              padding: '20px',
              borderRadius: '16px',
              background: 'rgba(245,158,11,0.05)',
              border: '1px solid rgba(245,158,11,0.15)',
            }}
          >
            <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  flexShrink: 0,
                  background: 'linear-gradient(135deg,#f59e0b,#ef4444)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '14px',
                  fontWeight: '900',
                  color: '#fff',
                }}
              >
                7
              </div>
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    fontWeight: '800',
                    color: '#fff',
                    fontSize: '15px',
                    marginBottom: '8px',
                  }}
                >
                  ⚡ (Nâng cao) Gia hạn Token lên 60 ngày
                </div>
                <div style={{ color: '#94a3b8', fontSize: '13px', lineHeight: '1.8' }}>
                  Token mặc định chỉ sống <b style={{ color: '#f59e0b' }}>~1-2 giờ</b>. Để gia hạn:
                  <br />• Truy cập{' '}
                  <a
                    href='https://developers.facebook.com/tools/debug/accesstoken/'
                    target='_blank'
                    rel='noopener noreferrer'
                    style={{ color: '#1877F2', fontWeight: '600' }}
                  >
                    Access Token Debugger
                  </a>
                  <br />• Dán token vừa copy → Nhấn{' '}
                  <b style={{ color: '#fff' }}>&quot;Debug&quot;</b>
                  <br />• Cuộn xuống nhấn{' '}
                  <b style={{ color: '#fff' }}>&quot;Extend Access Token&quot;</b>
                  <br />• Copy token mới (sống <b style={{ color: '#10b981' }}>~60 ngày</b>) → Dán
                  lại vào Tool Affiliate
                  <br />• <b style={{ color: '#f59e0b' }}>Lưu ý:</b> Sau 60 ngày, bạn cần lặp lại
                  bước 5-7 để lấy token mới
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className='glass-panel' style={{ padding: '30px', borderRadius: '24px' }}>
        <h3 style={{ fontSize: '14px', fontWeight: '800', color: '#fff', marginBottom: '20px' }}>
          ❓ CÂU HỎI THƯỜNG GẶP
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {[
            {
              q: 'Token bị lỗi "Invalid OAuth access token"?',
              a: 'Token đã hết hạn. Quay lại Graph API Explorer tạo token mới và gia hạn (Bước 7).',
            },
            {
              q: 'Không thấy Page trong danh sách?',
              a: 'Kiểm tra bạn là Admin của Page đó. Vào Facebook → Page Settings → Page Roles để xác nhận.',
            },
            {
              q: 'Đăng bài bị lỗi "pages_manage_posts permission"?',
              a: 'Token thiếu quyền. Quay lại Graph API Explorer → Thêm quyền pages_manage_posts → Tạo token mới.',
            },
            {
              q: 'Comment bị lỗi spam?',
              a: 'Tăng delay giữa các comment (60-120 giây). Giảm số comment xuống còn 2-3 bình luận/bài.',
            },
            {
              q: 'App chưa được review, có đăng bài được không?',
              a: 'Được! Nếu bạn là Admin/Developer của App, bạn có thể đăng bài lên Page mà mình quản lý mà không cần App Review.',
            },
            {
              q: 'Token sống được bao lâu?',
              a: 'Token ngắn hạn: ~1-2 giờ. Token dài hạn (sau khi Extend): ~60 ngày. Page Token "never expire" chỉ có khi dùng System User (Business).',
            },
          ].map((faq, i) => (
            <div
              key={i}
              style={{
                padding: '16px 20px',
                borderRadius: '14px',
                background: 'rgba(0,0,0,0.15)',
                border: '1px solid rgba(255,255,255,0.03)',
              }}
            >
              <div
                style={{ fontWeight: '700', color: '#fff', fontSize: '14px', marginBottom: '6px' }}
              >
                💬 {faq.q}
              </div>
              <div style={{ color: '#94a3b8', fontSize: '13px', lineHeight: '1.6' }}>→ {faq.a}</div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
