import { useCallback, useEffect, useState } from 'react';
import { Activity, CalendarDays, ClipboardList, FileText, UsersRound } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Badge, Button, Card, EmptyState, Skeleton, StatCard, Table } from '../../components/ui/index.jsx';
import { PageHeader } from '../../components/layout/index.jsx';
import { useAuth } from '../../contexts/AuthContext.jsx';
import { dashboardService } from '../../services/dashboardService.js';
import { RegistrationBadge, formatRegistrationDate } from '../registrations/registrationUtils.jsx';
import './role-dashboard.css';

const icons = { registrations: ClipboardList, accepted: ClipboardList, pending: Activity, schedules: CalendarDays, participants: UsersRound, activities: Activity };

function formatScheduleDate(value) {
  return new Intl.DateTimeFormat('id-ID', { weekday: 'long', day: 'numeric', month: 'long', timeZone: 'UTC' }).format(new Date(`${value}T12:00:00Z`));
}

function ScheduleList({ schedules, emptyMessage }) {
  if (!schedules.length) return <EmptyState title="Belum ada jadwal mendatang" description={emptyMessage} />;
  return <ul className="role-dashboard-schedule-list">{schedules.map((schedule) => <li className="role-dashboard-schedule" key={schedule.id}>
    <span className="role-dashboard-schedule__date"><CalendarDays size={17} aria-hidden="true" />{formatScheduleDate(schedule.date)}</span>
    <div><strong>{schedule.extracurricularName}</strong><span>{schedule.startTime}–{schedule.endTime} · {schedule.location}</span></div>
    {schedule.status === 'changed' && <Badge tone="warning">Jadwal diubah</Badge>}
  </li>)}</ul>;
}

function DashboardLoading() {
  return <div className="role-dashboard" role="status" aria-busy="true" aria-label="Memuat dashboard"><div className="role-dashboard-stats">{[1, 2, 3].map((item) => <Card key={item}><Skeleton width="60%" /><Skeleton width="35%" height={28} /></Card>)}</div><Card><Skeleton width="40%" height={22} /><Skeleton width="100%" height={130} /></Card></div>;
}

export default function RoleDashboardPage({ role }) {
  const { user } = useAuth();
  const [state, setState] = useState({ status: 'loading', data: null, error: '' });
  const load = useCallback(async () => {
    setState((current) => ({ ...current, status: 'loading', error: '' }));
    try {
      const data = await dashboardService.getRoleOverview();
      if (data.role !== role) throw new Error('Data dashboard tidak sesuai dengan akun.');
      setState({ status: 'success', data, error: '' });
    } catch (error) {
      setState({ status: 'error', data: null, error: error.message || 'Dashboard belum dapat dimuat.' });
    }
  }, [role]);

  useEffect(() => { load(); }, [load]);

  if (state.status === 'loading') return <DashboardLoading />;
  if (state.status === 'error') return <Card><EmptyState title="Dashboard belum dapat dimuat" description={state.error} action={<Button variant="outline" onClick={load}>Coba lagi</Button>} /></Card>;

  const data = state.data;
  const title = role === 'student' ? 'Dashboard siswa' : role === 'coach' ? 'Dashboard pembina' : 'Dashboard kepala sekolah';
  const stats = data.stats.map((item) => { const Icon = icons[item.key] || FileText; return <StatCard key={item.key} label={item.label} value={item.value.toLocaleString('id-ID')} detail={item.detail} icon={<Icon size={19} />} />; });

  return (
    <div className={`role-dashboard role-dashboard--${role}`}>
      <PageHeader eyebrow="RINGKASAN KEGIATAN" title={`Selamat datang, ${user?.name || ''}`} description={title} />
      <section className="role-dashboard-stats" aria-label="Ringkasan dashboard">{stats}</section>

      {role === 'student' && <div className="role-dashboard-grid">
        <Card className="role-dashboard-panel">
          <div className="role-dashboard-panel__heading"><div><h2>Status pendaftaran</h2><p>Status pengajuan kegiatan ekstrakurikuler Anda.</p></div><Link to="/student/registrations">Semua pendaftaran</Link></div>
          {data.registrations.length ? <Table caption="Status pendaftaran siswa" columns={[
            { key: 'extracurricularName', label: 'Ekstrakurikuler' },
            { key: 'registrationDate', label: 'Tanggal daftar', render: (item) => formatRegistrationDate(item.registrationDate) },
            { key: 'status', label: 'Status', render: (item) => <RegistrationBadge status={item.status} /> },
          ]} rows={data.registrations} /> : <EmptyState title="Belum ada pendaftaran" description="Kegiatan yang Anda daftarkan akan muncul di sini." action={<Link className="ui-button ui-button--outline" to="/student/extracurriculars">Jelajahi ekstrakurikuler</Link>} />}
        </Card>
        <Card className="role-dashboard-panel">
          <div className="role-dashboard-panel__heading"><div><h2>Jadwal mendatang</h2><p>Jadwal dari kegiatan yang diterima.</p></div><Link to="/student/schedules">Lihat jadwal</Link></div>
          <ScheduleList schedules={data.schedules} emptyMessage="Jadwal kegiatan yang pendaftarannya diterima akan tampil di sini." />
        </Card>
      </div>}

      {role === 'coach' && <div className="role-dashboard-grid">
        <Card className="role-dashboard-panel">
          <div className="role-dashboard-panel__heading"><div><h2>Peserta kegiatan</h2><p>Siswa dengan pendaftaran diterima pada kegiatan tugas Anda.</p></div><Link to="/coach/attendance">Absensi</Link></div>
          {data.participants.length ? <Table caption="Peserta kegiatan pembina" columns={[
            { key: 'studentName', label: 'Siswa' }, { key: 'studentClass', label: 'Kelas' }, { key: 'extracurricularName', label: 'Ekstrakurikuler' },
          ]} rows={data.participants} /> : <EmptyState title="Belum ada peserta diterima" description="Peserta akan tampil setelah pendaftaran kegiatan tugas Anda disetujui admin." />}
        </Card>
        <Card className="role-dashboard-panel">
          <div className="role-dashboard-panel__heading"><div><h2>Jadwal tugas</h2><p>Jadwal kegiatan mendatang yang ditugaskan kepada Anda.</p></div><Link to="/coach/schedules">Semua jadwal</Link></div>
          <ScheduleList schedules={data.schedules} emptyMessage="Belum ada jadwal tugas mendatang." />
          <div className="role-dashboard-actions"><Link className="ui-button ui-button--outline" to="/coach/assessments">Penilaian peserta</Link><Link className="ui-button ui-button--outline" to="/coach/attendance">Catat absensi</Link></div>
        </Card>
      </div>}

      {role === 'principal' && <Card className="role-dashboard-panel">
        <div className="role-dashboard-panel__heading"><div><h2>Ringkasan laporan</h2><p>Jumlah data yang tersedia pada laporan sekolah.</p></div><Link to="/principal/reports">Buka laporan</Link></div>
        <div className="role-dashboard-report-list">{data.reports.map((report) => <div key={report.type}><span>{report.label}</span><strong>{report.count.toLocaleString('id-ID')}</strong></div>)}</div>
        <div className="role-dashboard-actions"><Link className="ui-button ui-button--primary" to="/principal/reports"><FileText size={17} /> Lihat dan cetak laporan</Link></div>
      </Card>}
    </div>
  );
}
