/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState } from 'react';

interface FacebookConnectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function FacebookConnectModal({
  isOpen,
  onClose,
  onSuccess,
}: FacebookConnectModalProps) {
  const [token, setToken] = useState('');
  const [checking, setChecking] = useState(false);
  const [connecting, setConnecting] = useState<string | null>(null);
  const [discoveredPages, setDiscoveredPages] = useState<any[]>([]);
  const [msg, setMsg] = useState<{ t: 'ok' | 'err'; text: string } | null>(null);

  if (!isOpen) return null;

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
        if (onSuccess) onSuccess();
        // Keep modal open for a moment to show success, then close? Or stay to connect more?
        // Let's stay for 1.5s then close if it's a reconnection flow
        setTimeout(() => {
          // If we only have 1 page discovered, auto close
          if (discoveredPages.length <= 1) onClose();
        }, 1500);
      }
    } catch {
      setMsg({ t: 'err', text: 'Lỗi kết nối' });
    } finally {
      setConnecting(null);
    }
  };

  const iStyle: React.CSSProperties = {
    width: '100%',
    padding: '14px',
    borderRadius: '12px',
    background: 'rgba(0,0,0,0.5)',
    border: '1px solid rgba(255,255,255,0.1)',
    color: '#fff',
    fontSize: '14px',
    outline: 'none',
    fontFamily: 'monospace',
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
      }}
    >
      <div
        onClick={onClose}
        style={{
          position: 'absolute',
          inset: 0,
          background: 'rgba(0,0,0,0.8)',
          backdropFilter: 'blur(8px)',
        }}
      />

      <div
        className='glass-panel'
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: '500px',
          padding: '32px',
          borderRadius: '24px',
          border: '1px solid rgba(255,255,255,0.1)',
          boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
          animation: 'modalIn 0.3s ease-out',
        }}
      >
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            background: 'none',
            border: 'none',
            color: '#64748b',
            fontSize: '24px',
            cursor: 'pointer',
          }}
        >
          &times;
        </button>

        <div style={{ marginBottom: '24px' }}>
          <h3 style={{ fontSize: '20px', fontWeight: '900', color: '#fff', marginBottom: '8px' }}>
            🔌 Kết nối Facebook Page
          </h3>
          <p style={{ color: '#94a3b8', fontSize: '13px' }}>
            Dán token mới để tiếp tục đăng bài mà không cần rời khỏi trang.
          </p>
        </div>

        {msg && (
          <div
            style={{
              padding: '12px 16px',
              borderRadius: '12px',
              marginBottom: '20px',
              background: msg.t === 'ok' ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
              border: `1px solid ${msg.t === 'ok' ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)'}`,
              color: msg.t === 'ok' ? '#10b981' : '#ef4444',
              fontSize: '13px',
              fontWeight: '600',
            }}
          >
            {msg.text}
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label
              style={{
                display: 'block',
                fontSize: '11px',
                fontWeight: '800',
                color: '#475569',
                marginBottom: '8px',
                letterSpacing: '0.05em',
              }}
            >
              ACCESS TOKEN
            </label>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                type='password'
                placeholder='Dán token từ Graph Explorer...'
                value={token}
                onChange={(e) => setToken(e.target.value)}
                style={{ ...iStyle, flex: 1 }}
              />
              <button
                onClick={handleCheck}
                disabled={checking || !token.trim()}
                className='btn-tech'
                style={{ padding: '0 20px', whiteSpace: 'nowrap', opacity: checking ? 0.5 : 1 }}
              >
                {checking ? '...' : '🔍 Check'}
              </button>
            </div>
          </div>

          {discoveredPages.length > 0 && (
            <div style={{ marginTop: '10px' }}>
              <h4
                style={{
                  fontSize: '11px',
                  fontWeight: '800',
                  color: '#22d3ee',
                  marginBottom: '12px',
                  letterSpacing: '0.05em',
                }}
              >
                CHỌN PAGE ĐỂ KẾT NỐI
              </h4>
              <div
                style={{
                  maxHeight: '200px',
                  overflowY: 'auto',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                }}
              >
                {discoveredPages.map((p: any) => (
                  <div
                    key={p.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '12px 16px',
                      borderRadius: '12px',
                      background: 'rgba(255,255,255,0.03)',
                      border: '1px solid rgba(255,255,255,0.05)',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div
                        style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '50%',
                          background: '#1877F2',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#fff',
                          fontWeight: '700',
                          fontSize: '12px',
                        }}
                      >
                        {p.name[0]}
                      </div>
                      <div style={{ fontWeight: '600', color: '#fff', fontSize: '13px' }}>
                        {p.name}
                      </div>
                    </div>
                    <button
                      onClick={() => handleConnect(p)}
                      disabled={connecting === p.id}
                      className='btn-tech'
                      style={{
                        padding: '6px 14px',
                        fontSize: '12px',
                        opacity: connecting === p.id ? 0.5 : 1,
                      }}
                    >
                      {connecting === p.id ? '...' : '🔌 Kết nối'}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div
            style={{
              marginTop: '10px',
              padding: '16px',
              borderRadius: '16px',
              background: 'rgba(24,119,242,0.05)',
              border: '1px solid rgba(24,119,242,0.1)',
            }}
          >
            <p style={{ color: '#64748b', fontSize: '12px', margin: 0, lineHeight: '1.6' }}>
              💡 <b>Mẹo:</b> Dán token vào{' '}
              <a
                href='https://developers.facebook.com/tools/debug/accesstoken/'
                target='_blank'
                rel='noopener noreferrer'
                style={{ color: '#1877F2', textDecoration: 'none' }}
              >
                Debugger
              </a>{' '}
              và nhấn <b>Extend</b> để lấy token sống 60 ngày.
            </p>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes modalIn {
          from {
            opacity: 0;
            transform: translateY(20px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
      `}</style>
    </div>
  );
}
