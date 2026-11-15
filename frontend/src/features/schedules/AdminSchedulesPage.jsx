import { useCallback, useEffect, useMemo, useState } from 'react';
import { CalendarDays, Eye, List, MapPin, MoreHorizontal, Pencil, Plus, Trash2 } from 'lucide-react';
import { Badge, Button, Card, Dropdown, EmptyState, Input, Modal, SearchInput, Select, Table, Textarea, Toast } from '../../components/ui/index.jsx';
import { PageHeader } from '../../components/layout/index.jsx';
import { useAuth } from '../../contexts/AuthContext.jsx';
import { extracurricularService } from '../../services/extracurricularService.js';
import { scheduleService, getWeekday, scheduleStatuses, validateSchedule } from '../../services/scheduleService.js';
import ScheduleCalendar from './ScheduleCalendar.jsx';
import './schedules.css';

function localToday() {
  const date = new Date();
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function emptySchedule(coachId = '') {
  const date = localToday();
  return { extracurricularId: '', date, day: getWeekday(date), startTime: '', endTime: '', location: '', coachId, status: 'scheduled', changeInformation: '' };
}

function ScheduleForm({ schedule, activities, onClose, onSaved, isCoach, signedInUser }) {
  const [values, setValues] = useState(() => schedule ? { ...schedule } : emptySchedule(isCoach ? signedInUser?.id : ''));
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');
  const isEdit = Boolean(schedule);

  function update(field, value) {
    setValues((current) => ({ ...current, [field]: value, ...(field === 'date' ? { day: getWeekday(value) } : {}) }));
    setErrors((current) => ({ ...current, [field]: '' }));
    setFormError('');
  }

  async function submit(event) {
    event.preventDefault();
    const nextErrors = validateSchedule(values);
    if (values.day !== getWeekday(values.date)) nextErrors.day = 'Hari tidak sesuai dengan tanggal.';
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    setSaving(true);
    try {
      if (isEdit) await scheduleService.update(schedule.id, values);
      else await scheduleService.create(values);
      onSaved(isEdit ? 'Jadwal berhasil diperbarui.' : 'Jadwal berhasil ditambahkan.');
    } catch (error) {
      setFormError(error.message || 'Jadwal belum dapat disimpan.');
    } finally {
      setSaving(false);
    }
  }

  const statusOptions = Object.entries(scheduleStatuses).map(([value, item]) => ({ value, label: item.label }));
  const activityOptions = activities.filter((activity) => activity.status === 'active').map((activity) => ({ value: activity.id, label: activity.name }));
  const selectedActivity = activities.find((activity) => activity.id === values.extracurricularId);
  if (selectedActivity && !activityOptions.some((option) => option.value === selectedActivity.id)) activityOptions.push({ value: selectedActivity.id, label: `${selectedActivity.name} (nonaktif)` });

  return (
    <form className="schedule-form" id="schedule-form" onSubmit={submit} noValidate>
      {formError && <p className="schedule-form__error" role="alert">{formError}</p>}
      <div className="schedule-form__grid">
        <Select label="Ekstrakurikuler" name="extracurricularId" placeholder="Pilih kegiatan" options={activityOptions} required value={values.extracurricularId} onChange={(event) => update('extracurricularId', event.target.value)} error={errors.extracurricularId} />
        <Input label="Tanggal" name="date" type="date" required value={values.date} onChange={(event) => update('date', event.target.value)} error={errors.date} />
        <Input label="Hari" name="day" value={values.day} readOnly hint="Hari mengikuti tanggal yang dipilih." error={errors.day} />
        {isCoach ? <><Input label="Pembina" value={schedule?.coachName || signedInUser?.name || 'Pembina'} readOnly hint="Jadwal ini akan ditugaskan kepada Anda." /><input type="hidden" name="coachId" value={values.coachId} /></> : <Select label="Pembina" name="coachId" placeholder="Pilih pembina" options={[{ value: 'demo-coach', label: 'Pembina Demo' }]} required value={values.coachId} onChange={(event) => update('coachId', event.target.value)} error={errors.coachId} />}
        <Input label="Waktu mulai" name="startTime" type="time" required value={values.startTime} onChange={(event) => update('startTime', event.target.value)} error={errors.startTime} />
        <Input label="Waktu selesai" name="endTime" type="time" required value={values.endTime} onChange={(event) => update('endTime', event.target.value)} error={errors.endTime} />
        <Input className="schedule-form__wide" label="Lokasi" name="location" autoComplete="off" required value={values.location} onChange={(event) => update('location', event.target.value)} error={errors.location} />
        <Select label="Status jadwal" name="status" options={statusOptions} required value={values.status} onChange={(event) => update('status', event.target.value)} error={errors.status} />
        <Textarea className="schedule-form__wide" label="Informasi perubahan" name="changeInformation" maxLength={300} hint="Wajib diisi jika jadwal diubah atau dibatalkan. Maksimal 300 karakter." value={values.changeInformation} onChange={(event) => update('changeInformation', event.target.value)} error={errors.changeInformation} />
      </div>
      <div className="schedule-form__footer"><Button type="button" variant="outline" disabled={saving} onClick={onClose}>Batal</Button><Button type="submit" loading={saving} disabled={saving}>{saving ? 'Menyimpan…' : isEdit ? 'Simpan perubahan' : 'Simpan jadwal'}</Button></div>
    </form>
  );
}

function formatScheduleDate(value) {
  const date = new Date(`${value}T12:00:00Z`);
  if (Number.isNaN(date.getTime())) return 'Tanggal tidak tersedia';
  return new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' }).format(date);
}

export default function AdminSchedulesPage({ role = 'admin' }) {
  const isCoach = role === 'coach';
  const { user: signedInUser } = useAuth();
  const [schedules, setSchedules] = useState([]);
  const [weeklySchedules, setWeeklySchedules] = useState([]);
  const [activities, setActivities] = useState([]);
  const [loadState, setLoadState] = useState('loading');
  const [loadError, setLoadError] = useState('');
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [view, setView] = useState('list');
  const [formOpen, setFormOpen] = useState(false);
  const [formSchedule, setFormSchedule] = useState(null);
  const [details, setDetails] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [toast, setToast] = useState(null);

  const load = useCallback(async () => {
    setLoadState('loading');
    setLoadError('');
    try {
      const [scheduleData, activityData, weeklyData] = await Promise.all([
        isCoach ? scheduleService.getMine() : scheduleService.getAll(),
        isCoach ? scheduleService.getMyActivities() : extracurricularService.getAll(),
        scheduleService.getTimetable(),
      ]);
      setSchedules(scheduleData);
      setActivities(activityData);
      setWeeklySchedules(weeklyData);
      setLoadState('success');
    } catch (error) {
      setLoadError(error.message || 'Jadwal belum dapat dimuat.');
      setLoadState('error');
    }
  }, [isCoach]);

  useEffect(() => { load(); }, [load]);

  const filtered = useMemo(() => {
    const term = query.trim().toLocaleLowerCase('id');
    return schedules.filter((schedule) => (statusFilter === 'all' || schedule.status === statusFilter) && [schedule.extracurricularName, schedule.coachName, schedule.location, schedule.date].join(' ').toLocaleLowerCase('id').includes(term));
  }, [query, schedules, statusFilter]);

  function openCreate() {
    setFormSchedule(null);
    setFormOpen(true);
  }

  function onSaved(message) {
    setFormOpen(false);
    setToast({ message, tone: 'success' });
    load();
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await scheduleService.remove(deleteTarget.id);
      setDeleteTarget(null);
      setToast({ message: 'Jadwal berhasil dihapus.', tone: 'success' });
      await load();
    } catch (error) {
      setToast({ message: error.message || 'Jadwal belum dapat dihapus.', tone: 'danger' });
    } finally {
      setDeleting(false);
    }
  }

  const columns = [
    { key: 'date', label: 'Tanggal', render: (schedule) => <span className="schedule-date-cell"><strong>{formatScheduleDate(schedule.date)}</strong><small>{schedule.day}</small></span> },
    { key: 'extracurricularName', label: 'Ekstrakurikuler' },
    { key: 'time', label: 'Waktu', render: (schedule) => `${schedule.startTime}–${schedule.endTime}` },
    { key: 'location', label: 'Lokasi', render: (schedule) => <span className="schedule-location-cell"><MapPin size={14} /> {schedule.location}</span> },
    { key: 'coachName', label: 'Pembina' },
    { key: 'status', label: 'Status', render: (schedule) => <Badge tone={scheduleStatuses[schedule.status]?.tone || 'neutral'}>{scheduleStatuses[schedule.status]?.label || schedule.status}</Badge> },
    { key: 'actions', label: 'Aksi', render: (schedule) => <Dropdown ariaLabel={`Aksi jadwal ${schedule.extracurricularName}`} label={<MoreHorizontal size={19} aria-hidden="true" />}>
      <button type="button" onClick={(event) => { event.currentTarget.closest('details').open = false; setDetails(schedule); }}><Eye size={16} /> Lihat detail</button>
      <button type="button" onClick={(event) => { event.currentTarget.closest('details').open = false; setFormSchedule(schedule); setFormOpen(true); }}><Pencil size={16} /> Ubah</button>
      <button className="is-danger" type="button" onClick={(event) => { event.currentTarget.closest('details').open = false; setDeleteTarget(schedule); }}><Trash2 size={16} /> Hapus</button>
    </Dropdown> },
  ];

  const weeklyColumns = [
    { key: 'day', label: 'Hari' },
    { key: 'extracurricularName', label: 'Ekstrakurikuler' },
    { key: 'studentClass', label: 'Kelas', render: (schedule) => `Kelas ${schedule.studentClass}` },
    { key: 'time', label: 'Waktu', render: (schedule) => `${schedule.startTime}–${schedule.endTime}` },
    { key: 'location', label: 'Lokasi' },
  ];

  const statusOptions = [{ value: 'all', label: 'Semua status' }, ...Object.entries(scheduleStatuses).map(([value, item]) => ({ value, label: item.label }))];

  return (
    <div className="schedule-page">
      <PageHeader eyebrow={isCoach ? 'JADWAL PEMBINA' : 'PENGELOLAAN KEGIATAN'} title={isCoach ? 'Jadwal kegiatan' : 'Jadwal'} description={isCoach ? 'Atur jadwal untuk ekstrakurikuler yang ditugaskan kepada Anda.' : 'Atur waktu, lokasi, pembina, dan perubahan kegiatan.'} actions={<Button onClick={openCreate}><Plus size={17} /> Tambah jadwal</Button>} />
      <Card className="schedule-table-card">
        <div className="schedule-toolbar"><SearchInput value={query} onChange={setQuery} label="Cari jadwal" placeholder="Cari kegiatan, lokasi, atau pembina" /><Select className="schedule-status-filter" label="Status" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} options={statusOptions} /><div className="schedule-view-toggle" role="group" aria-label="Tampilan jadwal"><Button variant={view === 'list' ? 'primary' : 'outline'} aria-pressed={view === 'list'} onClick={() => setView('list')}><List size={16} /> Daftar</Button><Button variant={view === 'calendar' ? 'primary' : 'outline'} aria-pressed={view === 'calendar'} onClick={() => setView('calendar')}><CalendarDays size={16} /> Kalender</Button></div></div>
        {loadState === 'loading' && <div className="schedule-load-state" role="status">Memuat jadwal…</div>}
        {loadState === 'error' && <EmptyState title="Jadwal belum dapat dimuat" description={loadError} action={<Button variant="outline" onClick={load}>Coba lagi</Button>} />}
        {loadState === 'success' && schedules.length === 0 && <EmptyState title="Belum ada jadwal" description={isCoach ? 'Buat jadwal untuk ekstrakurikuler yang ditugaskan kepada Anda.' : 'Tambahkan jadwal kegiatan ekstrakurikuler.'} action={<Button onClick={openCreate}><Plus size={16} /> Tambah jadwal</Button>} />}
        {loadState === 'success' && schedules.length > 0 && (view === 'calendar'
          ? <ScheduleCalendar schedules={filtered} onSelect={setDetails} />
          : <Table caption="Daftar jadwal ekstrakurikuler" columns={columns} rows={filtered} emptyMessage="Tidak ada jadwal yang cocok dengan pencarian atau filter." />)}
      </Card>

      <Card className="schedule-table-card">
        <div className="schedule-routine-heading"><p>JADWAL RUTIN</p><h2>Jadwal mingguan semua ekstrakurikuler</h2><span>Jadwal tetap dan pembagian kelas untuk seluruh kegiatan.</span></div>
        {loadState === 'loading' && <div className="schedule-load-state" role="status">Memuat jadwal rutin…</div>}
        {loadState === 'error' && <EmptyState title="Jadwal rutin belum dapat dimuat" description={loadError} />}
        {loadState === 'success' && <Table caption="Jadwal rutin mingguan ekstrakurikuler" columns={weeklyColumns} rows={weeklySchedules} emptyMessage="Belum ada jadwal rutin." />}
      </Card>

      <Modal open={formOpen} onClose={() => setFormOpen(false)} title={formSchedule ? 'Ubah jadwal' : 'Tambah jadwal'} className="schedule-form-modal" footer={null}>
        {formOpen && <ScheduleForm key={formSchedule?.id || 'new-schedule'} schedule={formSchedule} activities={activities} isCoach={isCoach} signedInUser={signedInUser} onClose={() => setFormOpen(false)} onSaved={onSaved} />}
      </Modal>
      <Modal open={Boolean(details)} onClose={() => setDetails(null)} title="Detail jadwal" footer={details && <><Button variant="outline" onClick={() => setDetails(null)}>Tutup</Button><Button onClick={() => { setFormSchedule(details); setDetails(null); setFormOpen(true); }}><Pencil size={16} /> Ubah jadwal</Button></>}>
        {details && <div className="schedule-detail">
          <div><span>Ekstrakurikuler</span><strong>{details.extracurricularName}</strong></div>
          <div><span>Tanggal dan hari</span><strong>{formatScheduleDate(details.date)} · {details.day}</strong></div>
          <div><span>Waktu</span><strong>{details.startTime}–{details.endTime}</strong></div>
          <div><span>Lokasi</span><strong>{details.location}</strong></div>
          <div><span>Pembina</span><strong>{details.coachName}</strong></div>
          <div><span>Status</span><Badge tone={scheduleStatuses[details.status]?.tone || 'neutral'}>{scheduleStatuses[details.status]?.label || details.status}</Badge></div>
          {details.changeInformation && <p className="schedule-change-note"><CalendarDays size={16} /> {details.changeInformation}</p>}
        </div>}
      </Modal>
      <Modal open={Boolean(deleteTarget)} onClose={() => !deleting && setDeleteTarget(null)} title="Hapus jadwal" footer={<><Button variant="outline" disabled={deleting} onClick={() => setDeleteTarget(null)}>Batal</Button><Button variant="danger" loading={deleting} onClick={confirmDelete}>Hapus</Button></>}>
        <p className="schedule-delete-copy">Hapus jadwal <strong>{deleteTarget?.extracurricularName}</strong> pada {deleteTarget && formatScheduleDate(deleteTarget.date)}?</p>
      </Modal>
      <Toast message={toast?.message} tone={toast?.tone} onDismiss={() => setToast(null)} />
    </div>
  );
}
