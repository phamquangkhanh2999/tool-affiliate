/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/set-state-in-effect */
'use client';

import { useEffect, useRef, useState } from 'react';

export default function DebugLogsPage() {
  const [logs, setLogs] = useState('');
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const scrollRef = useRef<HTMLPreElement>(null);

  useEffect(() => {
    const auth = sessionStorage.getItem('admin_auth');
    if (auth === 'true') setIsAuthorized(true);
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (username === 'quangkhanh' && password === 'quangkhanh') {
      setIsAuthorized(true);
      sessionStorage.setItem('admin_auth', 'true');
    } else {
      alert('Sai tài khoản hoặc mật khẩu hệ thống!');
    }
  };

  const fetchLogs = async () => {
    if (!isAuthorized) return;
    try {
      const res = await fetch('/api/debug/logs');
      if (res.ok) {
        const json = await res.json();
        if (json.success) {
          setLogs(json.data.logs);
        }
      }
    } catch (err) {
      console.error('Failed to fetch logs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthorized) {
      fetchLogs();
      let interval: any;
      if (autoRefresh) {
        interval = setInterval(fetchLogs, 3000);
      }
      return () => clearInterval(interval);
    }
  }, [autoRefresh, isAuthorized]);

  // Logic tự động thoát sau 5 phút không hoạt động
  useEffect(() => {
    if (!isAuthorized) return;

    let timeoutId: any;

    const resetTimer = () => {
      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        sessionStorage.removeItem('admin_auth');
        setIsAuthorized(false);
        console.log('Session expired due to inactivity');
      }, 5 * 60 * 1000); // 5 phút
    };

    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    events.forEach(name => document.addEventListener(name, resetTimer));

    resetTimer();

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
      events.forEach(name => document.removeEventListener(name, resetTimer));
    };
  }, [isAuthorized]);

  if (!isAuthorized) {
    return (
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0f172a' }}>
        <form onSubmit={handleLogin} className="glass-panel" style={{ padding: '40px', borderRadius: '24px', width: '100%', maxWidth: '400px', textAlign: 'center' }}>
          <div style={{ fontSize: '48px', marginBottom: '20px' }}>🔐</div>
          <h2 style={{ fontSize: '24px', fontWeight: '800', color: '#fff', marginBottom: '8px' }}>ADMIN ACCESS</h2>
          <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '30px' }}>Trang này chỉ dành cho quản trị viên hệ thống.</p>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', textAlign: 'left' }}>
            <div>
              <label style={{ fontSize: '11px', fontWeight: '800', color: '#475569', marginBottom: '6px', display: 'block' }}>USERNAME</label>
              <input type="text" value={username} onChange={e => setUsername(e.target.value)} style={{ width: '100%', padding: '12px', borderRadius: '10px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }} />
            </div>
            <div>
              <label style={{ fontSize: '11px', fontWeight: '800', color: '#475569', marginBottom: '6px', display: 'block' }}>PASSWORD</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} style={{ width: '100%', padding: '12px', borderRadius: '10px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }} />
            </div>
            <button type="submit" style={{ marginTop: '10px', padding: '14px', borderRadius: '12px', background: 'linear-gradient(135deg, #f87171, #fb923c)', color: '#fff', border: 'none', fontWeight: '800', cursor: 'pointer' }}>
              XÁC MINH DANH TÍNH 🚀
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div
      style={{
        maxWidth: '1400px',
        margin: '0 auto',
        padding: '32px',
        color: '#f1f5f9',
        height: 'calc(100vh - 100px)',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <header
        style={{
          marginBottom: '24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <div>
          <h1
            style={{
              fontSize: '28px',
              fontWeight: '800',
              background: 'linear-gradient(to right, #f87171, #fb923c)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            📟 Hệ Thống Log AI (Real-time)
          </h1>
          <p style={{ color: '#94a3b8' }}>
            Giám sát trực tiếp các cuộc hội thoại giữa hệ thống và Google Gemini
          </p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            style={{
              padding: '10px 20px',
              borderRadius: '10px',
              background: autoRefresh ? '#059669' : '#334155',
              color: 'white',
              border: 'none',
              cursor: 'pointer',
              fontWeight: '600',
            }}
          >
            {autoRefresh ? '🟢 Đang Auto Refresh' : '⚪ Tắt Auto Refresh'}
          </button>
          <button
            onClick={fetchLogs}
            style={{
              padding: '10px 20px',
              borderRadius: '10px',
              background: '#3b82f6',
              color: 'white',
              border: 'none',
              cursor: 'pointer',
              fontWeight: '600',
            }}
          >
            🔄 Làm mới ngay
          </button>
          <button
            onClick={() => { sessionStorage.removeItem('admin_auth'); setIsAuthorized(false); }}
            style={{
              padding: '10px 20px',
              borderRadius: '10px',
              background: '#ef4444',
              color: 'white',
              border: 'none',
              cursor: 'pointer',
              fontWeight: '600',
            }}
          >
            🔒 Thoát
          </button>
        </div>
      </header>

      <div
        style={{
          flex: 1,
          background: '#0f172a',
          borderRadius: '16px',
          border: '1px solid #1e293b',
          position: 'relative',
          overflow: 'hidden',
          boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            padding: '12px 20px',
            background: '#1e293b',
            borderBottom: '1px solid #334155',
            display: 'flex',
            gap: '8px',
          }}
        >
          <div
            style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#ff5f56' }}
          ></div>
          <div
            style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#ffbd2e' }}
          ></div>
          <div
            style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#27c93f' }}
          ></div>
          <span
            style={{
              marginLeft: '12px',
              fontSize: '12px',
              color: '#64748b',
              fontFamily: 'monospace',
            }}
          >
            debug_api.log
          </span>
        </div>

        <pre
          ref={scrollRef}
          style={{
            height: '100%',
            padding: '60px 20px 20px',
            margin: 0,
            overflowY: 'auto',
            fontFamily: '"Fira Code", "Source Code Pro", monospace',
            fontSize: '13px',
            lineHeight: '1.6',
            color: '#cbd5e1',
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-all',
          }}
        >
          {loading ? 'Đang tải dữ liệu log...' : logs || 'Chưa có dữ liệu log nào.'}
        </pre>
      </div>

      <footer
        style={{ marginTop: '16px', textAlign: 'center', fontSize: '12px', color: '#64748b' }}
      >
        💡 Log hiển thị 50KB dữ liệu mới nhất. Các lỗi màu đỏ (ERROR) sẽ giúp bạn xác định vấn đề về
        API Key hoặc Model.
      </footer>
    </div>
  );
}
