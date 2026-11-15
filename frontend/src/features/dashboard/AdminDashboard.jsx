import { useCallback, useEffect, useState } from 'react';
import { Activity, BookOpen, CalendarDays, ClipboardCheck, Clock3, MapPin, UserRound, UserRoundPlus } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext.jsx';
import { Avatar, Button, Card, EmptyState, Skeleton, StatCard } from '../../components/ui/index.jsx';
import { PageHeader } from '../../components/layout/index.jsx';
import { dashboardService } from '../../services/dashboardService.js';
import './admin-dashboard.css';

const statIcons = {
  activities: BookOpen,
  coaches: UserRound,
  applicants: UserRoundPlus,
  active: Activity,
};

function formatScheduleDate(value) {
  const date = new Date(`${value}T12:00:00`);
  return new Intl.DateTimeFormat('id-ID', { weekday: 'long', day: 'numeric', month: 'short' }).format(date);
}

function RegistrationChart({ data }) {
  if (!data.length) return <EmptyState title="Belum ada data pendaftaran" description="Ringkasan pendaftaran akan tampil setelah data tersedia." />;
  const max = Math.max(...data.map((item) => item.value), 1);
  return (
    <ol className="dashboard-registration-chart" aria-label="Jumlah pendaftar dalam enam bulan terakhir">
      {data.map(({ label, value }) => <li key={label} aria-label={`${label}: ${value} pendaftar`}>
        <span className="dashboard-registration-chart__value">{value}</span>
        <span className="dashboard-registration-chart__track" aria-hidden="true"><span style={{ height: `${Math.max((value / max) * 100, 5)}%` }} /></span>
        <span className="dashboard-registration-chart__month">{label}</span>
      </li>)}
    </ol>
  );
}

function ParticipantsChart({ data }) {
  if (!data.length) return <EmptyState title="Belum ada peserta" description="Ringkasan peserta tampil setelah ada siswa di kegiatan." />;
  const max = Math.max(...data.map((item) => item.value), 1);
  return (
    <ul className="dashboard-participant-chart" aria-label="Jumlah peserta per ekstrakurikuler">
      {data.map(({ name, value }) => <li key={name}>
        <div className="dashboard-participant-chart__label"><span>{name}</span><strong>{value}</strong></div>
        <div className="dashboard-participant-chart__track" role="progressbar" aria-label={`${name}: ${value} peserta`} aria-valuemin="0" aria-valuemax={max} aria-valuenow={value}><span style={{ width: `${(value / max) * 100}%` }} /></div>
      </li>)}
    </ul>
  );
}

function UpcomingSchedules({ data }) {
  if (!data.length) return <EmptyState title="Belum ada jadwal mendatang" description="Jadwal yang akan datang tampil di sini." />;
  return (
    <ul className="dashboard-schedule-list">
      {data.map((item) => <li key={item.id} className="dashboard-schedule">
        <span className="dashboard-schedule__date"><CalendarDays size={17} /><span>{formatScheduleDate(item.date)}</span></span>
        <div className="dashboard-schedule__main"><strong>{item.name}</strong><span><Clock3 size={14} /> {item.time}</span><span><MapPin size={14} /> {item.location}</span></div>
        <small>{item.coach}</small>
      </li>)}
    </ul>
  );
}

function RecentActivity({ data }) {
  if (!data.length) return <EmptyState title="Belum ada aktivitas terbaru" description="Aktivitas terbaru akan tampil di sini." />;
  return (
    <ul className="dashboard-activity-list">
      {data.map((item) => <li key={item.id} className="dashboard-activity">
        <span className={`dashboard-activity__icon dashboard-activity__icon--${item.tone}`} aria-hidden="true"><ClipboardCheck size={17} /></span>
        <div className="dashboard-activity__body"><strong>{item.title}</strong><span>{item.detail}</span><time>{item.time}</time></div>
      </li>)}
    </ul>
  );
}

function DashboardSkeleton() {
  return (
    <div className="admin-dashboard" role="status" aria-busy="true" aria-label="Memuat dashboard">
      <div className="dashboard-skeleton-stats">{Array.from({ length: 4 }, (_, index) => <Card key={index}><Skeleton width="65%" /><Skeleton width="38%" height={28} /><Skeleton width="52%" /></Card>)}</div>
      <div className="dashboard-skeleton-panels"><Card><Skeleton width="42%" height={22} /><Skeleton width="100%" height={180} /></Card><Card><Skeleton width="42%" height={22} /><Skeleton width="100%" height={180} /></Card></div>
    </div>
  );
}

export default function AdminDashboard() {
  const { user } = useAuth();
  const [state, setState] = useState({ status: 'loading', data: null, error: '' });

  const loadOverview = useCallback(async () => {
    setState({ status: 'loading', data: null, error: '' });
    try {
      const data = await dashboardService.getOverview();
      setState({ status: 'success', data, error: '' });
    } catch {
      setState({ status: 'error', data: null, error: 'Ringkasan dashboard belum dapat dimuat.' });
    }
  }, []);

  useEffect(() => { loadOverview(); }, [loadOverview]);

  if (state.status === 'loading') return <DashboardSkeleton />;
  if (state.status === 'error') return <div className="dashboard-error" role="alert"><p>{state.error}</p><Button variant="outline" onClick={loadOverview}>Coba lagi</Button></div>;

  const { stats, registrations, participants, schedules, activity } = state.data;
  const greeting = new Intl.DateTimeFormat('id-ID', { hour: 'numeric', hour12: false }).format(new Date());
  const greetingText = Number(greeting) < 11 ? 'Selamat pagi' : Number(greeting) < 15 ? 'Selamat siang' : Number(greeting) < 18 ? 'Selamat sore' : 'Selamat malam';

  return (
    <div className="admin-dashboard">
      <PageHeader eyebrow="DATA SIMULASI" title={`${greetingText}, ${user?.name || 'Admin'}`} description="Pantau kegiatan ekstrakurikuler sekolah hari ini." actions={<Avatar name={user?.name || 'Admin'} size="lg" />} />
      <section className="dashboard-stat-grid" aria-label="Statistik utama">
        {stats.filter((stat) => stat.key !== 'students').map((stat) => { const Icon = statIcons[stat.key]; return <StatCard key={stat.key} label={stat.label} value={stat.value.toLocaleString('id-ID')} detail={stat.detail} icon={Icon && <Icon size={19} />} />; })}
      </section>

      <section className="dashboard-chart-grid" aria-label="Ringkasan statistik">
        <Card className="dashboard-panel">
          <div className="dashboard-panel__heading"><div><h2>Statistik pendaftaran</h2><p>Jumlah pendaftar dalam 6 bulan terakhir</p></div><span className="dashboard-panel__legend"><i /> Pendaftar</span></div>
          <RegistrationChart data={registrations} />
        </Card>
        <Card className="dashboard-panel">
          <div className="dashboard-panel__heading"><div><h2>Peserta per ekstrakurikuler</h2><p>Jumlah siswa yang mengikuti setiap kegiatan</p></div></div>
          <ParticipantsChart data={participants} />
        </Card>
      </section>

      <section className="dashboard-detail-grid" aria-label="Informasi kegiatan terbaru">
        <Card className="dashboard-panel">
          <div className="dashboard-panel__heading"><div><h2>Jadwal mendatang</h2><p>Kegiatan ekstrakurikuler berikutnya</p></div><CalendarDays size={19} aria-hidden="true" /></div>
          <UpcomingSchedules data={schedules} />
        </Card>
        <Card className="dashboard-panel">
          <div className="dashboard-panel__heading"><div><h2>Aktivitas terbaru</h2><p>Pembaruan dalam sistem</p></div><Activity size={19} aria-hidden="true" /></div>
          <RecentActivity data={activity} />
        </Card>
      </section>
    </div>
  );
}
