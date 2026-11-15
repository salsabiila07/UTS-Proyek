import { useCallback, useEffect, useMemo, useState } from 'react';
import { Button, Card, EmptyState, SearchInput, Table } from '../../components/ui/index.jsx';
import { PageHeader } from '../../components/layout/index.jsx';
import { registrationService } from '../../services/registrationService.js';
import { formatRegistrationDate } from '../registrations/registrationUtils.jsx';
import './coach-participants.css';

export default function CoachParticipantsPage() {
  const [state, setState] = useState({ status: 'loading', participants: [], error: '' });
  const [query, setQuery] = useState('');

  const loadParticipants = useCallback(async () => {
    setState((current) => ({ ...current, status: 'loading', error: '' }));
    try {
      const participants = await registrationService.getCoachParticipants();
      setState({ status: 'success', participants, error: '' });
    } catch (error) {
      setState({ status: 'error', participants: [], error: error.message || 'Daftar peserta belum dapat dimuat.' });
    }
  }, []);

  useEffect(() => { loadParticipants(); }, [loadParticipants]);

  const filtered = useMemo(() => {
    const term = query.trim().toLocaleLowerCase('id');
    return state.participants.filter((participant) => [participant.studentName, participant.studentClass, participant.extracurricularName].join(' ').toLocaleLowerCase('id').includes(term));
  }, [query, state.participants]);

  const columns = [
    { key: 'studentName', label: 'Nama siswa' },
    { key: 'studentClass', label: 'Kelas' },
    { key: 'extracurricularName', label: 'Ekstrakurikuler' },
    { key: 'registrationDate', label: 'Tanggal diterima', render: (participant) => formatRegistrationDate(participant.registrationDate) },
  ];

  return (
    <div className="coach-participants-page">
      <PageHeader eyebrow="DATA PEMBINA" title="Peserta" description="Daftar siswa dengan pendaftaran yang telah diterima pada kegiatan yang Anda bimbing." />
      <Card className="coach-participants-card">
        <div className="coach-participants-toolbar">
          <div><strong>{state.status === 'success' ? state.participants.length.toLocaleString('id-ID') : '—'} peserta</strong><span>Pendaftaran diterima</span></div>
          <SearchInput value={query} onChange={setQuery} label="Cari peserta" placeholder="Cari nama, kelas, atau ekstrakurikuler" />
        </div>
        {state.status === 'loading' && <p className="coach-participants-state" role="status" aria-busy="true">Memuat daftar peserta…</p>}
        {state.status === 'error' && <EmptyState title="Daftar peserta belum dapat dimuat" description={state.error} action={<Button variant="outline" onClick={loadParticipants}>Coba lagi</Button>} />}
        {state.status === 'success' && state.participants.length === 0 && <EmptyState title="Belum ada peserta diterima" description="Siswa akan tampil setelah pendaftaran kegiatan Anda diterima admin." />}
        {state.status === 'success' && state.participants.length > 0 && <Table caption="Daftar peserta kegiatan pembina" columns={columns} rows={filtered} emptyMessage="Tidak ada peserta yang cocok dengan pencarian." />}
      </Card>
    </div>
  );
}
