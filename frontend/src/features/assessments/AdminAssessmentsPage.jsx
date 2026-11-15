import { useCallback, useEffect, useMemo, useState } from 'react';
import { Button, Card, EmptyState, SearchInput, Select, Table } from '../../components/ui/index.jsx';
import { PageHeader } from '../../components/layout/index.jsx';
import { extracurricularService } from '../../services/extracurricularService.js';
import { assessmentService } from '../../services/assessmentService.js';
import './assessments.css';

function periodOptions(periods) {
  return [{ value: 'all', label: 'Semua periode' }, ...periods.map((period) => ({ value: period, label: `Semester ${period.slice(-1)} ${period.slice(0, 4)}` }))];
}

export default function AdminAssessmentsPage() {
  const [activities, setActivities] = useState([]);
  const [filter, setFilter] = useState({ extracurricularId: 'all', period: 'all' });
  const [query, setQuery] = useState('');
  const [state, setState] = useState({ status: 'loading', records: [], periods: [], error: '' });

  const load = useCallback(async () => {
    setState((current) => ({ ...current, status: 'loading', error: '' }));
    try {
      const [records, activityData] = await Promise.all([
        assessmentService.getAdmin({ extracurricularId: filter.extracurricularId, period: filter.period }),
        extracurricularService.getAll(),
      ]);
      setActivities(activityData);
      setState({ status: 'success', records, periods: [...new Set(records.map((item) => item.period))].sort().reverse(), error: '' });
    } catch (error) {
      setState((current) => ({ ...current, status: 'error', error: error.message || 'Data penilaian belum dapat dimuat.' }));
    }
  }, [filter]);

  useEffect(() => { load(); }, [load]);

  const rows = useMemo(() => {
    const term = query.trim().toLocaleLowerCase('id');
    return state.records.filter((item) => [item.studentName, item.extracurricularName, item.developmentNotes].join(' ').toLocaleLowerCase('id').includes(term));
  }, [query, state.records]);

  const columns = [
    { key: 'studentName', label: 'Siswa' },
    { key: 'extracurricularName', label: 'Ekstrakurikuler' },
    { key: 'period', label: 'Periode', render: (item) => `Semester ${item.period.slice(-1)} ${item.period.slice(0, 4)}` },
    { key: 'skillScore', label: 'Skill', render: (item) => <span className="assessment-score">{item.skillScore}</span> },
    { key: 'disciplineScore', label: 'Disiplin', render: (item) => <span className="assessment-score">{item.disciplineScore}</span> },
    { key: 'activityScore', label: 'Keaktifan', render: (item) => <span className="assessment-score">{item.activityScore}</span> },
    { key: 'developmentNotes', label: 'Catatan perkembangan', render: (item) => <span className="assessment-notes-cell">{item.developmentNotes || '—'}</span> },
  ];

  return (
    <div className="assessments-page">
      <PageHeader eyebrow="PEMANTAUAN PENILAIAN" title="Penilaian" description="Tinjau nilai keterampilan dan perkembangan peserta ekstrakurikuler." />
      <Card>
        <div className="assessment-toolbar">
          <SearchInput value={query} onChange={setQuery} label="Cari penilaian" placeholder="Cari nama siswa, kegiatan, atau catatan" />
          <Select label="Ekstrakurikuler" value={filter.extracurricularId} options={[{ value: 'all', label: 'Semua ekstrakurikuler' }, ...activities.map(({ id, name }) => ({ value: id, label: name }))]} onChange={(event) => setFilter((current) => ({ ...current, extracurricularId: event.target.value }))} />
          <Select label="Periode" value={filter.period} options={periodOptions(state.periods)} onChange={(event) => setFilter((current) => ({ ...current, period: event.target.value }))} />
        </div>
        {state.status === 'loading' && <div className="assessment-state" role="status">Memuat penilaian…</div>}
        {state.status === 'error' && <EmptyState title="Penilaian belum dapat dimuat" description={state.error} action={<Button variant="outline" onClick={load}>Coba lagi</Button>} />}
        {state.status === 'success' && state.records.length === 0 && <EmptyState title="Belum ada penilaian" description="Penilaian yang disimpan pembina akan tampil di sini." />}
        {state.status === 'success' && state.records.length > 0 && <Table caption="Monitoring penilaian peserta" columns={columns} rows={rows} emptyMessage="Tidak ada penilaian yang cocok dengan pencarian." />}
      </Card>
    </div>
  );
}
