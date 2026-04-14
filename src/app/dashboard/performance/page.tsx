'use client';

import { useState } from 'react';

interface VideoMetric {
  title: string; type: string; hook: string;
  views: number; likes: number; comments: number; shares: number;
  clicks: number; conversions: number;
}

interface PerformanceAnalysis {
  overview: string;
  diagnosis: { primary: string; issues: string[] };
  improvements: string[];
  rewrittenScript: string;
  patterns: { viral: string[]; weak: string[] };
  nextActions: { hook: string; format: string; cta: string };
  conversionForecast: string;
}

const EMPTY_VIDEO: VideoMetric = {
  title: '', type: 'review', hook: '', views: 0, likes: 0,
  comments: 0, shares: 0, clicks: 0, conversions: 0,
};

const VIDEO_TYPES = ['shock', 'curiosity', 'problem_solution', 'review', 'unboxing', 'story'];

function MetricInput({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  return (
    <div>
      <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginBottom: '3px', fontWeight: '700' }}>{label}</div>
      <input type="number" className="input" style={{ padding: '6px 10px', fontSize: '13px' }}
        value={value || ''} placeholder="0" onChange={e => onChange(parseInt(e.target.value) || 0)} />
    </div>
  );
}

export default function PerformancePage() {
  const [videos, setVideos] = useState<VideoMetric[]>([{ ...EMPTY_VIDEO }, { ...EMPTY_VIDEO }]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PerformanceAnalysis | null>(null);
  const [error, setError] = useState('');

  function updateVideo(idx: number, field: keyof VideoMetric, value: string | number) {
    setVideos(prev => prev.map((v, i) => i === idx ? { ...v, [field]: value } : v));
  }

  function addVideo() {
    if (videos.length < 10) setVideos(prev => [...prev, { ...EMPTY_VIDEO }]);
  }

  function removeVideo(idx: number) {
    if (videos.length > 1) setVideos(prev => prev.filter((_, i) => i !== idx));
  }

  async function handleAnalyze() {
    const valid = videos.filter(v => v.title.trim() && v.views > 0);
    if (valid.length === 0) return setError('Nhập ít nhất 1 video có title và views');
    setError(''); setLoading(true); setResult(null);
    try {
      const res = await fetch('/api/analytics/performance', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ metrics: valid }),
      });
      const json = await res.json();
      if (json.success) setResult(json.data);
      else setError(json.error || 'Lỗi phân tích');
    } catch { setError('Không thể kết nối server'); }
    finally { setLoading(false); }
  }

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">📊 Performance Analysis</h1>
          <p className="page-subtitle">STEP 6+7 — Nhập metrics → AI chẩn đoán + tìm pattern + viết lại script</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        {/* INPUT */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <h2 style={{ fontSize: '15px', fontWeight: '700' }}>🎬 Dữ liệu video ({videos.length}/10)</h2>
            <button className="btn btn-secondary btn-sm" onClick={addVideo} disabled={videos.length >= 10}>
              + Thêm video
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '16px' }}>
            {videos.map((video, idx) => (
              <div key={idx} className="card" style={{ padding: '14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <span style={{
                    fontSize: '12px', fontWeight: '700', padding: '3px 10px',
                    background: 'var(--gradient-brand)', color: 'white', borderRadius: '6px'
                  }}>Video {idx + 1}</span>
                  {videos.length > 1 && (
                    <button className="btn btn-ghost btn-sm" onClick={() => removeVideo(idx)} style={{ color: 'var(--red)', fontSize: '18px' }}>×</button>
                  )}
                </div>

                <div className="form-group">
                  <label className="label" style={{ fontSize: '11px' }}>Tiêu đề video</label>
                  <input className="input" placeholder="Tên/mô tả video..." value={video.title}
                    onChange={e => updateVideo(idx, 'title', e.target.value)} style={{ fontSize: '13px' }} />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '12px' }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="label" style={{ fontSize: '11px' }}>Loại content</label>
                    <select className="input select" style={{ fontSize: '13px' }} value={video.type}
                      onChange={e => updateVideo(idx, 'type', e.target.value)}>
                      {VIDEO_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="label" style={{ fontSize: '11px' }}>Hook đã dùng</label>
                    <input className="input" placeholder="Câu hook..." value={video.hook} style={{ fontSize: '13px' }}
                      onChange={e => updateVideo(idx, 'hook', e.target.value)} />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', marginBottom: '8px' }}>
                  <MetricInput label="👁️ VIEWS" value={video.views} onChange={v => updateVideo(idx, 'views', v)} />
                  <MetricInput label="❤️ LIKES" value={video.likes} onChange={v => updateVideo(idx, 'likes', v)} />
                  <MetricInput label="💬 COMMENTS" value={video.comments} onChange={v => updateVideo(idx, 'comments', v)} />
                  <MetricInput label="🔁 SHARES" value={video.shares} onChange={v => updateVideo(idx, 'shares', v)} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  <MetricInput label="🔗 CLICKS" value={video.clicks} onChange={v => updateVideo(idx, 'clicks', v)} />
                  <MetricInput label="🛒 ĐƠN HÀNG" value={video.conversions} onChange={v => updateVideo(idx, 'conversions', v)} />
                </div>
                {video.views > 0 && (
                  <div style={{ marginTop: '8px', display: 'flex', gap: '8px' }}>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                      CTR: <strong style={{ color: 'var(--orange)' }}>{((video.clicks / video.views) * 100).toFixed(2)}%</strong>
                    </span>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                      CR: <strong style={{ color: 'var(--green)' }}>{video.clicks > 0 ? ((video.conversions / video.clicks) * 100).toFixed(2) : 0}%</strong>
                    </span>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                      ER: <strong style={{ color: 'var(--blue)' }}>{(((video.likes + video.comments + video.shares) / video.views) * 100).toFixed(1)}%</strong>
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>

          {error && <div style={{ padding: '10px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '8px', color: '#f87171', fontSize: '13px', marginBottom: '12px' }}>❌ {error}</div>}

          <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '14px', fontSize: '15px' }} onClick={handleAnalyze} disabled={loading}>
            {loading ? '🤖 AI đang phân tích...' : '📊 Phân tích Performance + Tối ưu (STEP 6+7)'}
          </button>
        </div>

        {/* OUTPUT */}
        <div>
          {loading && (
            <div className="card" style={{ textAlign: 'center', padding: '70px' }}>
              <div className="loading-spinner" style={{ margin: '0 auto 20px' }} />
              <div style={{ fontSize: '16px', fontWeight: '700', marginBottom: '8px' }}>AI đang phân tích dữ liệu...</div>
              <div style={{ color: 'var(--text-muted)', fontSize: '13px', lineHeight: '1.7' }}>
                Chẩn đoán điểm yếu • Tìm pattern virus<br />
                Tối ưu hook + CTA • Viết lại script
              </div>
            </div>
          )}

          {!loading && !result && (
            <div className="empty-state" style={{ padding: '80px' }}>
              <div className="empty-state-icon">📊</div>
              <div className="empty-state-title">Nhập metrics video</div>
              <div className="empty-state-text">AI sẽ chẩn đoán tại sao không ra đơn và đề xuất cải tiến</div>
            </div>
          )}

          {result && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {/* Overview */}
              <div style={{ padding: '14px 18px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '14px' }}>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '700', marginBottom: '6px' }}>📋 TỔNG QUAN</div>
                <p style={{ fontSize: '14px', color: 'var(--text-primary)', margin: 0, lineHeight: '1.6' }}>{result.overview}</p>
              </div>

              {/* Diagnosis */}
              <div className="card" style={{ border: '1px solid rgba(239,68,68,0.3)', background: 'rgba(239,68,68,0.04)' }}>
                <div style={{ fontSize: '14px', fontWeight: '700', color: 'var(--red)', marginBottom: '10px' }}>🚨 Chẩn đoán — Tại sao không ra đơn?</div>
                <div style={{ padding: '10px 14px', background: 'rgba(239,68,68,0.08)', borderRadius: '10px', marginBottom: '12px', fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)' }}>
                  {result.diagnosis.primary}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {result.diagnosis.issues.map((issue, i) => (
                    <div key={i} style={{ display: 'flex', gap: '8px', fontSize: '13px', color: 'var(--text-secondary)' }}>
                      <span style={{ color: 'var(--red)' }}>•</span> {issue}
                    </div>
                  ))}
                </div>
              </div>

              {/* Patterns - STEP 7 */}
              <div className="card">
                <div style={{ fontSize: '14px', fontWeight: '700', marginBottom: '12px' }}>🔁 Pattern (STEP 7 — Optimization Engine)</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <div style={{ fontSize: '11px', color: 'var(--green)', fontWeight: '700', marginBottom: '6px' }}>✅ VIDEO LÀM TỐT</div>
                    {result.patterns.viral.map((p, i) => (
                      <div key={i} style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px' }}>✓ {p}</div>
                    ))}
                  </div>
                  <div>
                    <div style={{ fontSize: '11px', color: 'var(--red)', fontWeight: '700', marginBottom: '6px' }}>❌ VIDEO KÉM</div>
                    {result.patterns.weak.map((p, i) => (
                      <div key={i} style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px' }}>× {p}</div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Next Actions */}
              <div className="card" style={{ border: '1px solid rgba(16,185,129,0.3)', background: 'rgba(16,185,129,0.04)' }}>
                <div style={{ fontSize: '14px', fontWeight: '700', color: 'var(--green)', marginBottom: '12px' }}>⚡ Next Actions — Hook + Format + CTA mới</div>
                {[
                  { label: '🎣 Hook mới', value: result.nextActions.hook, color: 'var(--orange)' },
                  { label: '🎬 Format mới', value: result.nextActions.format, color: 'var(--blue)' },
                  { label: '👉 CTA mới', value: result.nextActions.cta, color: 'var(--green)' },
                ].map(item => (
                  <div key={item.label} style={{ marginBottom: '10px', padding: '10px 14px', background: 'var(--bg-secondary)', borderRadius: '10px', borderLeft: `3px solid ${item.color}` }}>
                    <div style={{ fontSize: '10px', fontWeight: '700', color: item.color, marginBottom: '3px' }}>{item.label}</div>
                    <div style={{ fontSize: '13px', color: 'var(--text-primary)' }}>{item.value}</div>
                  </div>
                ))}
                <div style={{ padding: '10px 14px', background: 'rgba(255,107,53,0.08)', borderRadius: '10px', border: '1px solid rgba(255,107,53,0.2)' }}>
                  <div style={{ fontSize: '10px', color: 'var(--orange)', fontWeight: '700', marginBottom: '3px' }}>📈 DỰ ĐOÁN</div>
                  <div style={{ fontSize: '13px', color: 'var(--text-primary)', fontWeight: '600' }}>{result.conversionForecast}</div>
                </div>
              </div>

              {/* Rewritten Script */}
              <div className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <div style={{ fontSize: '14px', fontWeight: '700' }}>✍️ Script viết lại (dựa trên data)</div>
                  <button className="btn btn-sm btn-secondary" onClick={() => navigator.clipboard.writeText(result.rewrittenScript)}>
                    📋 Copy
                  </button>
                </div>
                <pre style={{
                  fontSize: '13px', color: 'var(--text-secondary)',
                  background: 'var(--bg-secondary)', padding: '14px', borderRadius: '10px',
                  whiteSpace: 'pre-wrap', lineHeight: '1.7', fontFamily: 'inherit', margin: 0
                }}>{result.rewrittenScript}</pre>
              </div>

              {/* Improvements */}
              <div className="card">
                <div style={{ fontSize: '14px', fontWeight: '700', marginBottom: '12px' }}>💡 Cách cải thiện cụ thể</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {result.improvements.map((imp, i) => (
                    <div key={i} style={{
                      display: 'flex', gap: '10px', padding: '10px 14px',
                      background: 'var(--bg-secondary)', borderRadius: '10px',
                      border: '1px solid var(--border)', fontSize: '13px'
                    }}>
                      <span style={{ color: 'var(--orange)', fontWeight: '700', flexShrink: 0 }}>{i + 1}.</span>
                      <span style={{ color: 'var(--text-secondary)' }}>{imp}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
