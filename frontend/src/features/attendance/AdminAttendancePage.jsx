import { useCallback, useEffect, useMemo, useState } from 'react';
import { Button, Card, EmptyState, Input, SearchInput, Select, Table } from '../../components/ui/index.jsx';
import { PageHeader } from '../../components/layout/index.jsx';
import { extracurricularService } from '../../services/extracurricularService.js';
import { attendanceService } from '../../services/attendanceService.js';
import { AttendanceBadge, attendanceStatuses, formatAttendanceDate } from './attendanceUtils.jsx';
import './attendance.css';

export default function AdminAttendancePage() {
  const [filter, setFilter] = useState({ status: 'all', date: '', extracurricularId: 'all' });
  const [query, setQuery] = useState('');
  const [activities, setActivities] = useState([]);
  const [state, setState] = useState({ status: 'loading', records: [], error: '' });

  const load = useCallback(async () => {
    setState((current) => ({ ...current, status: 'loading', error: '' }));
    try {
      const [records, activityData] = await Promise.all([attendanceService.getAdmin(filter), extracurricularService.getAll()]);
      setActivities(activityData);
      setState({ status: 'success', records, error: '' });
    } catch (error) {
      setState((current) => ({ ...current, status: 'error', error: error.message || 'Riwayat absensi belum dapat dimuat.' }));
    }
  }, [filter]);

  useEffect(() => { load(); }, [load]);

  const filtered = useMemo(() => {
    const term = query.trim().toLocaleLowerCase('id');
    return state.records.filter((record) => [record.studentName, record.extracurricularName, record.coachName, record.notes].join(' ').toLocaleLowerCase('id').includes(term));
  }, [query, state.records]);

  const columns = [
    { key: 'date', label: 'Tanggal kegiatan', render: (record) => <span className="attendance-date-cell">{formatAttendanceDate(record.date)}<small>{record.scheduleDay}{record.startTime ? ` · ${record.startTime}` : ''}</small></span> },
    { key: 'extracurricularName', label: 'Ekstrakurikuler' },
    { key: 'studentName', label: 'Siswa' },
    { key: 'status', label: 'Kehadiran', render: (record) => <AttendanceBadge status={record.status} /> },
    { key: 'notes', label: 'Catatan', render: (record) => record.notes || '—' },
    { key: 'coachName', label: 'Pembina' },
  ];

  const statusOptions = [{ value: 'all', label: 'Semua status' }, ...Object.entries(attendanceStatuses).map(([value, item]) => ({ value, label: item.label }))];
  const activityOptions = [{ value: 'all', label: 'Semua ekstrakurikuler' }, ...activities.map((activity) => ({ value: activity.id, label: activity.name }))];

  return (
    <div className="attendance-page">
      <PageHeader eyebrow="PEMANTAUAN KEHADIRAN" title="Absensi" description="Pantau catatan kehadiran siswa pada setiap kegiatan." />
      <Card className="admin-attendance-card">
        <div className="attendance-filter-grid">
          <SearchInput value={query} onChange={setQuery} label="Cari absensi" placeholder="Cari nama siswa, kegiatan, atau catatan" />
          <Select label="Status kehadiran" value={filter.status} options={statusOptions} onChange={(event) => setFilter((current) => ({ ...current, status: event.target.value }))} />
          <Select label="Ekstrakurikuler" value={filter.extracurricularId} options={activityOptions} onChange={(event) => setFilter((current) => ({ ...current, extracurricularId: event.target.value }))} />
          <Input label="Tanggal kegiatan" type="date" value={filter.date} onChange={(event) => setFilter((current) => ({ ...current, date: event.target.value }))} />
        </div>
        {state.status === 'loading' && <div className="attendance-state" role="status">Memuat riwayat absensi…</div>}
        {state.status === 'error' && <EmptyState title="Riwayat belum dapat dimuat" description={state.error} action={<Button variant="outline" onClick={load}>Coba lagi</Button>} />}
        {state.status === 'success' && state.records.length === 0 && <EmptyState title="Belum ada catatan absensi" description="Catatan yang disimpan pembina akan tampil di sini." />}
        {state.status === 'success' && state.records.length > 0 && <Table caption="Riwayat absensi siswa" columns={columns} rows={filtered} emptyMessage="Tidak ada catatan yang cocok dengan pencarian." />}
      </Card>
    </div>
  );
}
