import { useMemo, useState } from 'react';
import { CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '../../components/ui/index.jsx';
import { scheduleStatuses } from '../../services/scheduleService.js';

const weekdayLabels = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];

function toDateKey(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

export default function ScheduleCalendar({ schedules, onSelect }) {
  const [month, setMonth] = useState(() => {
    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth(), 1);
  });
  const days = useMemo(() => {
    const first = new Date(month.getFullYear(), month.getMonth(), 1);
    const offset = (first.getDay() + 6) % 7;
    const count = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
    return [...Array(offset).fill(null), ...Array.from({ length: count }, (_, index) => index + 1)];
  }, [month]);
  const byDate = useMemo(() => schedules.reduce((grouped, schedule) => {
    (grouped[schedule.date] ||= []).push(schedule);
    return grouped;
  }, {}), [schedules]);
  const monthLabel = new Intl.DateTimeFormat('id-ID', { month: 'long', year: 'numeric' }).format(month);
  const today = toDateKey(new Date());
  const visibleScheduleCount = Object.entries(byDate).filter(([date]) => date.startsWith(`${month.getFullYear()}-${String(month.getMonth() + 1).padStart(2, '0')}-`)).reduce((total, [, items]) => total + items.length, 0);

  return <section className="schedule-calendar" aria-label={`Kalender jadwal ${monthLabel}`}>
    <div className="schedule-calendar__toolbar">
      <div><CalendarDays size={19} aria-hidden="true" /><h2>{monthLabel}</h2></div>
      <div className="schedule-calendar__navigation">
        <Button variant="outline" size="icon" aria-label="Bulan sebelumnya" onClick={() => setMonth((value) => new Date(value.getFullYear(), value.getMonth() - 1, 1))}><ChevronLeft size={18} /></Button>
        <Button variant="outline" onClick={() => { const now = new Date(); setMonth(new Date(now.getFullYear(), now.getMonth(), 1)); }}>Hari ini</Button>
        <Button variant="outline" size="icon" aria-label="Bulan berikutnya" onClick={() => setMonth((value) => new Date(value.getFullYear(), value.getMonth() + 1, 1))}><ChevronRight size={18} /></Button>
      </div>
    </div>
    <div className="schedule-calendar__grid" role="grid" aria-label={monthLabel}>
      {weekdayLabels.map((label) => <div className="schedule-calendar__weekday" role="columnheader" key={label}>{label}</div>)}
      {days.map((day, index) => {
        if (!day) return <div className="schedule-calendar__day is-outside" role="gridcell" aria-hidden="true" key={`empty-${index}`} />;
        const dateKey = toDateKey(new Date(month.getFullYear(), month.getMonth(), day));
        const events = byDate[dateKey] || [];
        return <div className={`schedule-calendar__day${dateKey === today ? ' is-today' : ''}`} role="gridcell" aria-label={`${day} ${monthLabel}, ${events.length} jadwal`} key={dateKey}>
          <span className="schedule-calendar__date">{day}</span>
          <div className="schedule-calendar__events">{events.map((schedule) => {
            const status = scheduleStatuses[schedule.status] || {};
            const content = <><strong>{schedule.startTime} · {schedule.extracurricularName}</strong><span>{schedule.location}</span>{status.label && schedule.status !== 'scheduled' && <small>{status.label}</small>}</>;
            return onSelect
              ? <button type="button" className={`schedule-calendar__event is-${schedule.status}`} onClick={() => onSelect(schedule)} key={schedule.id} aria-label={`${schedule.startTime}, ${schedule.extracurricularName}, ${status.label || ''}`}>{content}</button>
              : <div className={`schedule-calendar__event is-${schedule.status}`} key={schedule.id}>{content}</div>;
          })}</div>
        </div>;
      })}
    </div>
    {visibleScheduleCount === 0 && <p className="schedule-calendar__empty">Tidak ada jadwal yang cocok pada bulan ini.</p>}
  </section>;
}
