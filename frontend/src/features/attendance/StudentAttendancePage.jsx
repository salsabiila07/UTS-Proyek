import { useCallback, useEffect, useState } from 'react';
import { Button, Card, EmptyState, Table } from '../../components/ui/index.jsx';
import { PageHeader } from '../../components/layout/index.jsx';
import { attendanceService } from '../../services/attendanceService.js';
import { AttendanceBadge, formatAttendanceDate } from './attendanceUtils.jsx';
import './attendance.css';

export default function StudentAttendancePage() {
  const [records, setRecords] = useState([]);
  const [state, setState] = useState('loading');
  const [error, setError] = useState('');

  const loadRecords = useCallback(async () => {
    setState('loading');
    setError('');
    try {
      setRecords(await attendanceService.getMine());
      setState('success');
    } catch (loadError) {
      setError(loadError.message || 'Riwayat absensi belum dapat dimuat.');
      setState('error');
    }
  }, []);

  useEffect(() => { loadRecords(); }, [loadRecords]);

  const columns = [
    { key: 'date', label: 'Tanggal', render: (record) => <span className="attendance-date-cell">{formatAttendanceDate(record.date)}<small>{record.scheduleDay}</small></span> },
    { key: 'extracurricularName', label: 'Ekstrakurikuler' },
    { key: 'status', label: 'Kehadiran', render: (record) => <AttendanceBadge status={record.status} /> },
    { key: 'notes', label: 'Catatan', render: (record) => record.notes || '—' },
  ];

  return (
    <div className="attendance-page">
      <PageHeader eyebrow="SISWA · ABSENSI" title="Riwayat absensi" description="Lihat catatan kehadiranmu pada kegiatan ekstrakurikuler." />
      <Card className="admin-attendance-card">
        {state === 'loading' && <div className="attendance-state" role="status">Memuat riwayat absensi…</div>}
        {state === 'error' && <EmptyState title="Riwayat belum dapat dimuat" description={error} action={<Button variant="outline" onClick={loadRecords}>Coba lagi</Button>} />}
        {state === 'success' && records.length === 0 && <EmptyState title="Belum ada catatan absensi" description="Catatan kehadiran akan tampil setelah pembina menyimpan absensi kegiatanmu." />}
        {state === 'success' && records.length > 0 && <Table caption="Riwayat absensi siswa" columns={columns} rows={records} />}
      </Card>
    </div>
  );
}
