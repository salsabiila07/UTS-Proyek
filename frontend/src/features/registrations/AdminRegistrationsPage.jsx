import { useCallback, useEffect, useMemo, useState } from 'react';
import { Eye } from 'lucide-react';
import { Button, Card, EmptyState, Modal, Pagination, SearchInput, Select, Table, Toast } from '../../components/ui/index.jsx';
import { PageHeader } from '../../components/layout/index.jsx';
import { registrationService } from '../../services/registrationService.js';
import { RegistrationBadge, formatRegistrationDate } from './registrationUtils.jsx';
import './registrations.css';

const PAGE_SIZE = 10;

export default function AdminRegistrationsPage() {
  const [filter, setFilter] = useState('all');
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const [state, setState] = useState({ status: 'loading', registrations: [], error: '' });
  const [details, setDetails] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [toast, setToast] = useState(null);

  const load = useCallback(async () => {
    setState((current) => ({ ...current, status: 'loading', error: '' }));
    try {
      setState({ status: 'success', registrations: await registrationService.getAll(filter), error: '' });
    } catch (error) {
      setState((current) => ({ ...current, status: 'error', error: error.message || 'Daftar pendaftaran belum dapat dimuat.' }));
    }
  }, [filter]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { setPage(1); }, [filter, query]);

  const filtered = useMemo(() => {
    const term = query.trim().toLocaleLowerCase('id');
    return state.registrations.filter((registration) => [registration.studentName, registration.studentClass, registration.extracurricularName].join(' ').toLocaleLowerCase('id').includes(term));
  }, [query, state.registrations]);
  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageItems = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  async function decide(status) {
    if (!details || details.status !== 'pending') return;
    setProcessing(true);
    try {
      await registrationService.updateStatus(details.id, status);
      setDetails(null);
      setToast({ message: `Pendaftaran berhasil ${status === 'accepted' ? 'diterima' : 'ditolak'}.`, tone: 'success' });
      await load();
    } catch (error) {
      setToast({ message: error.message || 'Status pendaftaran belum dapat diperbarui.', tone: 'danger' });
    } finally {
      setProcessing(false);
    }
  }

  const columns = [
    { key: 'studentName', label: 'Siswa', render: (registration) => <span className="registration-table__name"><strong>{registration.studentName}</strong><small>Kelas {registration.studentClass}</small></span> },
    { key: 'extracurricularName', label: 'Ekstrakurikuler' },
    { key: 'registrationDate', label: 'Tanggal daftar', render: (registration) => formatRegistrationDate(registration.registrationDate) },
    { key: 'status', label: 'Status', render: (registration) => <RegistrationBadge status={registration.status} /> },
    { key: 'actions', label: 'Aksi', render: (registration) => <Button variant="ghost" size="sm" aria-label={`Lihat pendaftaran ${registration.studentName} untuk ${registration.extracurricularName}`} onClick={() => setDetails(registration)}><Eye size={17} /> Detail</Button> },
  ];

  const statusOptions = [
    { value: 'all', label: 'Semua status' },
    { value: 'pending', label: 'Menunggu' },
    { value: 'accepted', label: 'Diterima' },
    { value: 'rejected', label: 'Ditolak' },
  ];

  return (
    <div className="admin-registration-page">
      <PageHeader eyebrow="PENGELOLAAN SISWA" title="Pendaftaran" description="Tinjau pendaftaran dan perbarui status pengajuan siswa." />
      <Card className="registration-table-card">
        <div className="registration-toolbar"><SearchInput value={query} onChange={setQuery} label="Cari pendaftaran" placeholder="Cari nama, kelas, atau kegiatan" /><Select className="registration-status-filter" label="Status" value={filter} onChange={(event) => setFilter(event.target.value)} options={statusOptions} /></div>
        {state.status === 'loading' && <div className="registration-load-state" role="status">Memuat pendaftaran…</div>}
        {state.status === 'error' && <EmptyState title="Daftar belum dapat dimuat" description={state.error} action={<Button variant="outline" onClick={load}>Coba lagi</Button>} />}
        {state.status === 'success' && state.registrations.length === 0 && <EmptyState title="Belum ada pendaftaran" description="Pengajuan siswa akan tampil di sini." />}
        {state.status === 'success' && state.registrations.length > 0 && <>
          <Table caption="Daftar pendaftaran siswa" columns={columns} rows={pageItems} emptyMessage="Tidak ada pendaftaran yang cocok dengan pencarian." />
          {filtered.length > 0 && <Pagination page={page} pageCount={pageCount} onPageChange={setPage} />}
        </>}
      </Card>

      <Modal open={Boolean(details)} onClose={() => !processing && setDetails(null)} title="Detail pendaftaran" footer={details?.status === 'pending' ? <><Button variant="outline" disabled={processing} onClick={() => decide('rejected')}>Tolak</Button><Button loading={processing} disabled={processing} onClick={() => decide('accepted')}>Terima pendaftaran</Button></> : <Button variant="outline" onClick={() => setDetails(null)}>Tutup</Button>}>
        {details && <div className="registration-detail">
          <div><span>Siswa</span><strong>{details.studentName}</strong></div>
          <div><span>Kelas</span><strong>{details.studentClass}</strong></div>
          <div><span>Ekstrakurikuler</span><strong>{details.extracurricularName}</strong></div>
          <div><span>Tanggal pendaftaran</span><strong>{formatRegistrationDate(details.registrationDate)}</strong></div>
          <div><span>Status saat ini</span><RegistrationBadge status={details.status} /></div>
          {details.status !== 'pending' && <p className="registration-detail__note">Pendaftaran ini sudah diproses.</p>}
        </div>}
      </Modal>
      <Toast message={toast?.message} tone={toast?.tone} onDismiss={() => setToast(null)} />
    </div>
  );
}
