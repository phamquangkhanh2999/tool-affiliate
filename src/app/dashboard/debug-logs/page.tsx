/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/set-state-in-effect */
'use client';

import { useEffect, useRef, useState } from 'react';

export default function DebugLogsPage() {
  const [logs, setLogs] = useState('');
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const scrollRef = useRef<HTMLPreElement>(null);

  const fetchLogs = async () => {
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
    fetchLogs();
    let interval: any;
    if (autoRefresh) {
      interval = setInterval(fetchLogs, 3000); // Tự động làm mới mỗi 3 giây
    }
    return () => clearInterval(interval);
  }, [autoRefresh]);

  useEffect(() => {
    if (scrollRef.current && autoRefresh) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs, autoRefresh]);

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
