import { useCallback, useEffect, useState } from 'react';
import { CalendarDays, List } from 'lucide-react';
import { Button, Card, EmptyState } from '../../components/ui/index.jsx';
import { PageHeader } from '../../components/layout/index.jsx';
import { ScheduleCard } from '../../components/shared/Cards.jsx';
import ScheduleCalendar from './ScheduleCalendar.jsx';
import { scheduleService, scheduleStatuses } from '../../services/scheduleService.js';
import './schedules.css';

function formatDate(value) {
  const date = new Date(`${value}T12:00:00Z`);
  if (Number.isNaN(date.getTime())) return 'Tanggal tidak tersedia';
  return new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }).format(date);
}

export default function RoleSchedulesPage({ role }) {
  const isCoach = role === 'coach';
  const isPrincipal = role === 'principal';
  const [state, setState] = useState({ status: 'loading', schedules: [], error: '' });
  const [view, setView] = useState('list');

  const load = useCallback(async () => {
    setState((current) => ({ ...current, status: 'loading', error: '' }));
    try {
      setState({ status: 'success', schedules: await scheduleService.getTimetable(), error: '' });
    } catch (error) {
      setState((current) => ({ ...current, status: 'error', error: error.message || 'Jadwal belum dapat dimuat.' }));
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  return (
    <div className="role-schedules-page">
      <PageHeader eyebrow={isPrincipal ? 'JADWAL SEKOLAH' : isCoach ? 'JADWAL PEMBINA' : 'JADWAL SISWA'} title={isPrincipal ? 'Jadwal ekstrakurikuler' : isCoach ? 'Jadwal kegiatan' : 'Jadwal ekstrakurikuler'} description="Jadwal rutin semua kegiatan beserta pembagian kelas." />
      {state.status === 'loading' && <div className="schedule-load-state" role="status">Memuat jadwal…</div>}
      {state.status === 'error' && <Card><EmptyState title="Jadwal belum dapat dimuat" description={state.error} action={<Button variant="outline" onClick={load}>Coba lagi</Button>} /></Card>}
      {state.status === 'success' && state.schedules.length === 0 && <Card><EmptyState title="Belum ada jadwal" description="Jadwal kegiatan akan tampil di sini setelah tersedia." /></Card>}
      {state.status === 'success' && state.schedules.length > 0 && <div className="role-schedule-view">
        <div className="schedule-view-toggle" role="group" aria-label="Tampilan jadwal">
          <Button variant={view === 'list' ? 'primary' : 'outline'} aria-pressed={view === 'list'} onClick={() => setView('list')}><List size={16} /> Daftar</Button>
          <Button variant={view === 'calendar' ? 'primary' : 'outline'} aria-pressed={view === 'calendar'} onClick={() => setView('calendar')}><CalendarDays size={16} /> Kalender</Button>
        </div>
        {view === 'calendar' ? <ScheduleCalendar schedules={state.schedules} /> : <div className="role-schedule-grid">
        {state.schedules.map((schedule) => {
          const status = scheduleStatuses[schedule.status] || { label: schedule.status, tone: 'neutral' };
          return <ScheduleCard key={schedule.id} className="role-schedule-card" title={schedule.extracurricularName} date={`${schedule.day}, ${formatDate(schedule.date)}`} time={`${schedule.startTime}–${schedule.endTime}`} location={schedule.location} coach={schedule.coachName} status={status.label} statusTone={status.tone}>
            <p className="role-schedule-card__class">Kelas {schedule.studentClass}{schedule.recurring ? ' · Jadwal rutin mingguan' : ''}</p>
            {schedule.changeInformation && <p className={`role-schedule-card__change${schedule.status === 'cancelled' ? ' is-cancelled' : ''}`}>{schedule.changeInformation}</p>}
          </ScheduleCard>;
        })}
        </div>}
      </div>}
    </div>
  );
}
