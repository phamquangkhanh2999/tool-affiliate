'use client';

import { useState, useEffect } from 'react';

export default function ContentCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [schedules, setSchedules] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchSchedules(currentDate.getMonth() + 1, currentDate.getFullYear());
  }, [currentDate]);

  const fetchSchedules = async (month: number, year: number) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/schedule?month=${month}&year=${year}`);
      const data = await res.json();
      if (data.success) {
        setSchedules(data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const getDaysInMonth = (month: number, year: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (month: number, year: number) => {
    return new Date(year, month, 1).getDay();
  };

  const renderCalendar = () => {
    const month = currentDate.getMonth();
    const year = currentDate.getFullYear();
    const daysInMonth = getDaysInMonth(month, year);
    const firstDay = getFirstDayOfMonth(month, year);
    
    const days: any[] = [];
    // Empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="calendar-cell empty" style={{ minHeight: '120px', padding: '10px', background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.05)' }}></div>);
    }

    // Days of the month
    for (let i = 1; i <= daysInMonth; i++) {
      const isToday = new Date().getDate() === i && new Date().getMonth() === month && new Date().getFullYear() === year;
      
      const daySchedules = schedules.filter(s => {
        const d = new Date(s.scheduledAt);
        return d.getDate() === i;
      });

      days.push(
        <div key={i} className="calendar-cell" style={{ minHeight: '120px', padding: '10px', background: isToday ? 'rgba(34,211,238,0.1)' : 'rgba(15,23,42,0.6)', border: isToday ? '1px solid rgba(34,211,238,0.5)' : '1px solid rgba(255,255,255,0.05)', position: 'relative' }}>
          <div style={{ fontWeight: '800', fontSize: '14px', color: isToday ? '#22d3ee' : '#94a3b8', marginBottom: '10px' }}>{i}</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
            {daySchedules.map((s, idx) => (
              <div key={idx} style={{ padding: '6px 8px', borderRadius: '6px', fontSize: '11px', background: s.platform === 'facebook' ? 'rgba(24,119,242,0.2)' : s.platform === 'tiktok' ? 'rgba(255,0,80,0.2)' : s.platform === 'zalo' ? 'rgba(0,104,255,0.2)' : 'rgba(255,255,255,0.1)', color: '#fff', borderLeft: `3px solid ${s.platform === 'facebook' ? '#1877F2' : s.platform === 'tiktok' ? '#ff0050' : s.platform === 'zalo' ? '#0068ff' : '#a855f7'}`, cursor: 'pointer', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={s.content}>
                {new Date(s.scheduledAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - {s.platform}
              </div>
            ))}
          </div>
        </div>
      );
    }

    return days;
  };

  const monthNames = ["Tháng 1", "Tháng 2", "Tháng 3", "Tháng 4", "Tháng 5", "Tháng 6", "Tháng 7", "Tháng 8", "Tháng 9", "Tháng 10", "Tháng 11", "Tháng 12"];

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', paddingBottom: '60px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
        <div>
          <h1 style={{ fontSize: '36px', fontWeight: '900', color: '#fff', marginBottom: '8px' }}>📅 Content Calendar</h1>
          <p style={{ color: '#64748b' }}>Lịch lên bài tự động đa nền tảng</p>
        </div>
        <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
          <button onClick={prevMonth} style={{ background: 'rgba(255,255,255,0.05)', border: 'none', padding: '10px 15px', borderRadius: '10px', color: '#fff', cursor: 'pointer', fontWeight: 'bold' }}>&lt;</button>
          <div style={{ fontSize: '20px', fontWeight: '800', width: '150px', textAlign: 'center' }}>
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </div>
          <button onClick={nextMonth} style={{ background: 'rgba(255,255,255,0.05)', border: 'none', padding: '10px 15px', borderRadius: '10px', color: '#fff', cursor: 'pointer', fontWeight: 'bold' }}>&gt;</button>
        </div>
      </div>

      <div className="glass-panel" style={{ borderRadius: '24px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', background: 'rgba(0,0,0,0.3)', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
          {['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'].map(day => (
            <div key={day} style={{ padding: '15px 10px', textAlign: 'center', fontWeight: '800', fontSize: '13px', color: '#94a3b8' }}>{day}</div>
          ))}
        </div>
        
        {loading ? (
          <div style={{ padding: '100px 0', textAlign: 'center', color: '#22d3ee' }}>Đang tải lịch...</div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)' }}>
            {renderCalendar()}
          </div>
        )}
      </div>
    </div>
  );
}
