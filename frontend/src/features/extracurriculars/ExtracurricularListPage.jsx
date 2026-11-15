import { useCallback, useEffect, useMemo, useState } from 'react';
import { BookOpen, Eye, MoreHorizontal, Pencil, Plus, Trash2 } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Badge, Button, Card, Dropdown, EmptyState, Modal, Pagination, SearchInput, Select, Table, Toast } from '../../components/ui/index.jsx';
import { PageHeader } from '../../components/layout/index.jsx';
import { extracurricularService } from '../../services/extracurricularService.js';
import './extracurriculars.css';

const PAGE_SIZE = 10;

export default function ExtracurricularListPage({ role = 'admin' }) {
  const basePath = `/${role}/extracurriculars`;
  const location = useLocation();
  const navigate = useNavigate();
  const [activities, setActivities] = useState([]);
  const [loadState, setLoadState] = useState('loading');
  const [loadError, setLoadError] = useState('');
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [details, setDetails] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [toast, setToast] = useState(null);

  const loadActivities = useCallback(async () => {
    setLoadState('loading');
    setLoadError('');
    try {
      setActivities(await extracurricularService.getAll());
      setLoadState('success');
    } catch {
      setLoadError('Data ekstrakurikuler belum dapat dimuat.');
      setLoadState('error');
    }
  }, []);

  useEffect(() => { loadActivities(); }, [loadActivities]);

  useEffect(() => {
    if (!location.state?.notice) return;
    setToast({ message: location.state.notice, tone: 'success' });
    navigate(location.pathname, { replace: true, state: null });
  }, [location.pathname, location.state, navigate]);

  const filteredActivities = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase('id');
    return activities.filter((activity) => {
      const matchesStatus = statusFilter === 'all' || activity.status === statusFilter;
      const searchable = [activity.name, activity.description, activity.coach, activity.location].join(' ').toLocaleLowerCase('id');
      return matchesStatus && searchable.includes(normalizedQuery);
    });
  }, [activities, query, statusFilter]);
  const pageCount = Math.max(1, Math.ceil(filteredActivities.length / PAGE_SIZE));
  const pageItems = filteredActivities.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  useEffect(() => { setPage(1); }, [query, statusFilter]);

  async function confirmDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await extracurricularService.remove(deleteTarget.id);
      setDeleteTarget(null);
      await loadActivities();
      setToast({ message: `${deleteTarget.name} berhasil dihapus.`, tone: 'success' });
    } catch (error) {
      setToast({ message: error.message || 'Ekstrakurikuler gagal dihapus.', tone: 'danger' });
    } finally {
      setDeleting(false);
    }
  }

  const columns = [
    {
      key: 'name', label: 'Ekstrakurikuler', render: (activity) => <div className="extracurricular-name-cell">
        <span className="extracurricular-thumbnail">{activity.image ? <img src={activity.image} alt="" /> : <BookOpen size={19} aria-hidden="true" />}</span>
        <span><button className="extracurricular-name-link" type="button" onClick={() => setDetails(activity)}>{activity.name}</button><small>{activity.description || '—'}</small></span>
      </div>,
    },
    { key: 'coach', label: 'Pembina' },
    { key: 'schedule', label: 'Jadwal', render: (activity) => <span className="extracurricular-schedule-cell">{activity.day}, {activity.startTime}–{activity.endTime}<small>{activity.location}</small></span> },
    { key: 'quota', label: 'Kuota' },
    { key: 'status', label: 'Status', render: (activity) => <Badge tone={activity.status === 'active' ? 'success' : 'neutral'}>{activity.status === 'active' ? 'Aktif' : 'Nonaktif'}</Badge> },
    {
      key: 'actions', label: 'Aksi', render: (activity) => <Dropdown ariaLabel={`Aksi untuk ${activity.name}`} label={<MoreHorizontal size={19} aria-hidden="true" />}>
        <button type="button" onClick={(event) => { event.currentTarget.closest('details').open = false; setDetails(activity); }}><Eye size={16} /> Lihat detail</button>
        <Link to={`${basePath}/${activity.id}/edit`}><Pencil size={16} /> Ubah</Link>
        <button className="is-danger" type="button" onClick={(event) => { event.currentTarget.closest('details').open = false; setDeleteTarget(activity); }}><Trash2 size={16} /> Hapus</button>
      </Dropdown>,
    },
  ];

  return (
    <div className="extracurricular-page">
      <PageHeader eyebrow={role === 'coach' ? 'PEMBINA · PENGELOLAAN KEGIATAN' : 'DATA SIMULASI · PENGELOLAAN KEGIATAN'} title="Ekstrakurikuler" description={role === 'coach' ? 'Kelola ekstrakurikuler yang ditugaskan kepada Anda.' : 'Kelola pilihan kegiatan, pembina, dan jadwal sekolah.'} actions={<Link className="ui-button ui-button--primary" to={`${basePath}/create`}><Plus size={17} /> Tambah ekstrakurikuler</Link>} />

      <Card className="extracurricular-table-card">
        <div className="extracurricular-toolbar">
          <SearchInput value={query} onChange={setQuery} label="Cari ekstrakurikuler" placeholder="Cari nama, pembina, atau lokasi" />
          <Select className="extracurricular-status-filter" label="Status" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} options={[
            { value: 'all', label: 'Semua status' },
            { value: 'active', label: 'Aktif' },
            { value: 'inactive', label: 'Nonaktif' },
          ]} />
        </div>

        {loadState === 'loading' && <div className="extracurricular-state" role="status">Memuat data ekstrakurikuler…</div>}
        {loadState === 'error' && <div className="extracurricular-error" role="alert"><p>{loadError}</p><Button variant="outline" onClick={loadActivities}>Coba lagi</Button></div>}
        {loadState === 'success' && activities.length === 0 && <EmptyState title="Belum ada ekstrakurikuler" description={role === 'coach' ? 'Tambahkan kegiatan baru atau tunggu penugasan kegiatan dari admin.' : 'Tambahkan kegiatan pertama untuk mulai mengelola ekstrakurikuler.'} action={<Link className="ui-button ui-button--primary" to={`${basePath}/create`}><Plus size={16} /> Tambah ekstrakurikuler</Link>} />}
        {loadState === 'success' && activities.length > 0 && <>
          <Table caption="Daftar ekstrakurikuler" columns={columns} rows={pageItems} emptyMessage="Tidak ada kegiatan yang cocok dengan pencarian atau filter." />
          {filteredActivities.length > 0 && <Pagination page={page} pageCount={pageCount} onPageChange={setPage} />}
        </>}
      </Card>

      <Modal open={Boolean(details)} onClose={() => setDetails(null)} title={details?.name || 'Detail ekstrakurikuler'} footer={details && <><Button variant="outline" onClick={() => setDetails(null)}>Tutup</Button><Link className="ui-button ui-button--primary" to={`${basePath}/${details.id}/edit`}>Ubah data</Link></>}>
        {details && <div className="extracurricular-detail">
          {details.image && <img className="extracurricular-detail__image" src={details.image} alt={`Kegiatan ${details.name}`} />}
          <p>{details.description || 'Belum ada deskripsi.'}</p>
          <dl><div><dt>Pembina</dt><dd>{details.coach}</dd></div><div><dt>Hari dan waktu</dt><dd>{details.day}, {details.startTime}–{details.endTime}</dd></div><div><dt>Lokasi</dt><dd>{details.location}</dd></div><div><dt>Kuota peserta</dt><dd>{Number(details.quota).toLocaleString('id-ID')} siswa</dd></div><div><dt>Status</dt><dd><Badge tone={details.status === 'active' ? 'success' : 'neutral'}>{details.status === 'active' ? 'Aktif' : 'Nonaktif'}</Badge></dd></div></dl>
        </div>}
      </Modal>

      <Modal open={Boolean(deleteTarget)} onClose={() => !deleting && setDeleteTarget(null)} title="Hapus ekstrakurikuler" footer={<><Button variant="outline" disabled={deleting} onClick={() => setDeleteTarget(null)}>Batal</Button><Button variant="danger" loading={deleting} onClick={confirmDelete}>Hapus</Button></>}>
        <p className="extracurricular-delete-copy">Hapus <strong>{deleteTarget?.name}</strong>? Data kegiatan ini akan dihapus dari daftar.</p>
      </Modal>

      <Toast message={toast?.message} tone={toast?.tone} onDismiss={() => setToast(null)} />
    </div>
  );
}
