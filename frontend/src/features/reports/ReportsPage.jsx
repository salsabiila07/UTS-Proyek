import { useCallback, useEffect, useMemo, useState } from 'react';
import { Printer } from 'lucide-react';
import { Button, Card, EmptyState, Input, Select, Table } from '../../components/ui/index.jsx';
import { PageHeader } from '../../components/layout/index.jsx';
import { extracurricularService } from '../../services/extracurricularService.js';
import { reportService, reportTypes } from '../../services/reportService.js';
import './reports.css';

const attendanceStatuses = [
  { value: 'present', label: 'Hadir' }, { value: 'permission', label: 'Izin' },
  { value: 'sick', label: 'Sakit' }, { value: 'absent', label: 'Alfa' },
];
const registrationStatuses = [
  { value: 'pending', label: 'Menunggu' }, { value: 'accepted', label: 'Diterima' }, { value: 'rejected', label: 'Ditolak' },
];

function periodOptions() {
  const year = new Date().getFullYear();
  return [year - 1, year, year + 1].flatMap((item) => [
    { value: `${item}-1`, label: `Semester 1 ${item}` },
    { value: `${item}-2`, label: `Semester 2 ${item}` },
  ]);
}

function reportFilterSummary(type, filter, activityName) {
  const parts = [activityName || 'Semua ekstrakurikuler'];
  if (type === 'assessments') parts.push(`Semester ${filter.period.slice(-1)} ${filter.period.slice(0, 4)}`);
  else if (filter.from || filter.to) parts.push(`Tanggal ${filter.from || 'awal'} s.d. ${filter.to || 'akhir'}`);
  return parts.join(' · ');
}

export default function ReportsPage() {
  const [filter, setFilter] = useState({ type: 'recap', extracurricularId: 'all', from: '', to: '', status: 'all', period: `${new Date().getFullYear()}-${new Date().getMonth() < 6 ? '1' : '2'}` });
  const [activities, setActivities] = useState([]);
  const [activityError, setActivityError] = useState('');
  const [state, setState] = useState({ status: 'loading', report: null, error: '' });

  useEffect(() => {
    extracurricularService.getAll().then(setActivities).catch((error) => setActivityError(error.message || 'Daftar ekstrakurikuler belum dapat dimuat.'));
  }, []);

  const loadReport = useCallback(async () => {
    setState((current) => ({ ...current, status: 'loading', error: '' }));
    try {
      const { type, extracurricularId, from, to, status, period } = filter;
      const report = await reportService.get({ type, extracurricularId, from: type === 'assessments' ? '' : from, to: type === 'assessments' ? '' : to, status, period: type === 'assessments' ? period : '' });
      setState({ status: 'success', report, error: '' });
    } catch (error) {
      setState((current) => ({ ...current, status: 'error', error: error.message || 'Laporan belum dapat dimuat.' }));
    }
  }, [filter]);

  useEffect(() => { loadReport(); }, [loadReport]);

  const selectedActivity = activities.find(({ id }) => id === filter.extracurricularId);
  const currentType = reportTypes.find(({ value }) => value === filter.type);
  const statusOptions = filter.type === 'attendance' ? attendanceStatuses : registrationStatuses;
  const columns = useMemo(() => state.report?.columns.map((column) => ({ ...column, render: (row) => row[column.key] ?? '—' })) || [], [state.report]);

  function updateFilter(key, value) {
    setFilter((current) => ({ ...current, [key]: value, ...(key === 'type' ? { status: 'all' } : {}) }));
  }

  return (
    <div className="reports-page">
      <PageHeader eyebrow="LAPORAN SEKOLAH" title="Laporan" description="Filter dan tinjau data kegiatan ekstrakurikuler untuk dicetak atau disimpan sebagai PDF." actions={<Button onClick={() => window.print()} disabled={state.status !== 'success' || !state.report?.rows.length}><Printer size={17} /> Cetak / Simpan PDF</Button>} />
      <Card className="reports-controls">
        <div className="reports-filter-grid">
          <Select label="Jenis laporan" value={filter.type} options={reportTypes} onChange={(event) => updateFilter('type', event.target.value)} />
          <Select label="Ekstrakurikuler" value={filter.extracurricularId} options={[{ value: 'all', label: 'Semua ekstrakurikuler' }, ...activities.map(({ id, name }) => ({ value: id, label: name }))]} onChange={(event) => updateFilter('extracurricularId', event.target.value)} />
          {filter.type !== 'assessments' && <Input label="Dari tanggal" type="date" value={filter.from} max={filter.to || undefined} onChange={(event) => updateFilter('from', event.target.value)} />}
          {filter.type !== 'assessments' && <Input label="Sampai tanggal" type="date" value={filter.to} min={filter.from || undefined} onChange={(event) => updateFilter('to', event.target.value)} />}
          {['registrations', 'attendance'].includes(filter.type) && <Select label="Status" value={filter.status} options={[{ value: 'all', label: 'Semua status' }, ...statusOptions]} onChange={(event) => updateFilter('status', event.target.value)} />}
          {filter.type === 'assessments' && <Select label="Periode penilaian" value={filter.period} options={periodOptions()} onChange={(event) => updateFilter('period', event.target.value)} />}
        </div>
        {activityError && <p className="reports-filter-error" role="status">{activityError}</p>}
      </Card>

      <Card className="reports-preview-card">
        <header className="reports-print-header">
          <p>SD N 2 Giriharjo · Sistem Informasi Ekstrakurikuler</p>
          <h1>{state.report?.title || currentType?.label || 'Laporan'}</h1>
          <p>{reportFilterSummary(filter.type, filter, selectedActivity?.name)}</p>
          <small>Dicetak: {new Intl.DateTimeFormat('id-ID', { dateStyle: 'long', timeStyle: 'short' }).format(new Date())}</small>
        </header>
        {state.status === 'loading' && <div className="reports-state" role="status">Menyiapkan preview laporan…</div>}
        {state.status === 'error' && <EmptyState title="Laporan belum dapat dimuat" description={state.error} action={<Button variant="outline" onClick={loadReport}>Coba lagi</Button>} />}
        {state.status === 'success' && state.report.rows.length === 0 && <EmptyState title="Tidak ada data untuk filter ini" description="Ubah filter atau pilih rentang tanggal yang berbeda." />}
        {state.status === 'success' && state.report.rows.length > 0 && <>
          <div className="reports-screen-summary"><h2>{state.report.title}</h2><p>{reportFilterSummary(filter.type, filter, selectedActivity?.name)}</p><span>{state.report.rows.length} baris data</span></div>
          <Table caption={state.report.title} columns={columns} rows={state.report.rows} />
          <footer className="reports-print-footer">SD N 2 Giriharjo · {new Intl.DateTimeFormat('id-ID', { dateStyle: 'long' }).format(new Date())}</footer>
        </>}
      </Card>
    </div>
  );
}
