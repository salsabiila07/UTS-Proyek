import { useCallback, useEffect, useState } from 'react';
import { ArrowLeft, MapPin, UsersRound } from 'lucide-react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { Badge, Button, Card, EmptyState, Input, Modal, Toast } from '../../components/ui/index.jsx';
import { PageHeader } from '../../components/layout/index.jsx';
import { extracurricularService } from '../../services/extracurricularService.js';
import { registrationService } from '../../services/registrationService.js';
import { useAuth } from '../../contexts/AuthContext.jsx';
import { RegistrationBadge } from './registrationUtils.jsx';
import { ClassScheduleList } from './ClassScheduleList.jsx';
import './registrations.css';

export default function StudentExtracurricularDetailPage() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [state, setState] = useState({ status: 'loading', activity: null, registration: null, registrations: [], error: '' });
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [identity, setIdentity] = useState({ studentName: '', studentClass: '' });
  const [identityErrors, setIdentityErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState(null);

  const load = useCallback(async () => {
    setState((current) => ({ ...current, status: 'loading', error: '' }));
    try {
      const [activity, registrations] = await Promise.all([extracurricularService.getById(id), registrationService.getMine()]);
      if (!activity) {
        setState({ status: 'missing', activity: null, registration: null, error: 'Ekstrakurikuler tidak ditemukan.' });
        return;
      }
      setState({ status: 'success', activity, registration: registrations.find((item) => item.extracurricularId === id) || null, registrations, error: '' });
    } catch (error) {
      setState((current) => ({ ...current, status: 'error', error: error.message || 'Detail ekstrakurikuler belum dapat dimuat.' }));
    }
  }, [id]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    if (state.status !== 'success' || !location.state?.openRegistration) return;
    const canRegister = state.activity.status === 'active' && (!state.registration || state.registration.status === 'rejected');
    navigate(location.pathname, { replace: true, state: null });
    if (!canRegister) return;
    const previousRegistration = state.registrations.find((item) => item.status !== 'rejected');
    setIdentity({ studentName: user?.name || previousRegistration?.studentName || '', studentClass: previousRegistration?.studentClass || '' });
    setIdentityErrors({});
    setConfirmOpen(true);
  }, [state.status, location.key]);

  function openRegistrationForm() {
    const existingRegistration = state.registrations.find((item) => item.status !== 'rejected');
    setIdentity({ studentName: user?.name || existingRegistration?.studentName || '', studentClass: existingRegistration?.studentClass || '' });
    setIdentityErrors({});
    setConfirmOpen(true);
  }

  async function submitRegistration(event) {
    event?.preventDefault();
    const studentName = identity.studentName.trim();
    const studentClass = identity.studentClass.trim();
    const errors = {};
    if (studentName.length < 2 || studentName.length > 80) errors.studentName = 'Nama wajib diisi (2–80 karakter).';
    if (studentClass.length < 1 || studentClass.length > 30) errors.studentClass = 'Kelas wajib diisi (maksimal 30 karakter).';
    setIdentityErrors(errors);
    if (Object.keys(errors).length) return;

    setSubmitting(true);
    try {
      const registration = await registrationService.create(id, { studentName, studentClass });
      setState((current) => ({ ...current, registration, registrations: [...current.registrations, registration] }));
      setConfirmOpen(false);
      setToast({ message: 'Pendaftaran berhasil dikirim dan menunggu persetujuan admin.', tone: 'success' });
    } catch (error) {
      setToast({ message: error.message || 'Pendaftaran belum dapat dikirim.', tone: 'danger' });
    } finally {
      setSubmitting(false);
    }
  }

  if (state.status === 'loading') return <div className="registration-load-state" role="status">Memuat detail kegiatan…</div>;
  if (state.status === 'error' || state.status === 'missing') return <Card><EmptyState title={state.status === 'missing' ? 'Kegiatan tidak ditemukan' : 'Detail belum dapat dimuat'} description={state.error} action={<Link className="ui-button ui-button--outline" to="/student/extracurriculars"><ArrowLeft size={16} /> Kembali ke kegiatan</Link>} /></Card>;

  const { activity, registration, registrations } = state;
  const canRegister = activity.status === 'active' && (!registration || registration.status === 'rejected');

  return (
    <div className="student-detail-page">
      <Link className="registration-back-link" to="/student/extracurriculars"><ArrowLeft size={16} /> Kembali ke kegiatan</Link>
      <PageHeader eyebrow="DETAIL EKSTRAKURIKULER" title={activity.name} description="Kenali kegiatan dan informasi pendaftarannya." />
      <Card className="student-activity-detail">
        {activity.image ? <img className="student-activity-detail__image" src={activity.image} alt={`Kegiatan ${activity.name}`} /> : <div className="student-activity-detail__image student-activity-detail__image--empty" aria-hidden="true"><UsersRound size={36} /></div>}
        <div className="student-activity-detail__body">
          <div className="student-activity-card__heading"><h2>Tentang kegiatan</h2><span className="student-activity-card__badges">{activity.mandatory && <Badge tone="warning">Wajib</Badge>}{registration ? <RegistrationBadge status={registration.status} /> : <Badge tone={activity.status === 'active' ? 'info' : 'neutral'}>{activity.status === 'active' ? 'Pendaftaran dibuka' : 'Nonaktif'}</Badge>}</span></div>
          <p>{activity.description || 'Informasi kegiatan akan diperbarui oleh admin.'}</p>
          <ClassScheduleList schedules={activity.classSchedules} />
          <dl className="student-activity-detail__meta"><div><dt><MapPin size={16} /> Lokasi</dt><dd>{activity.location}</dd></div><div><dt><UsersRound size={16} /> Kuota</dt><dd>{activity.quota} siswa</dd></div><div><dt>Pembina</dt><dd>{activity.coach}</dd></div></dl>
          {registration?.status === 'pending' && <p className="student-activity-detail__notice">Pendaftaranmu sedang menunggu persetujuan admin.</p>}
          {registration?.status === 'accepted' && <p className="student-activity-detail__notice student-activity-detail__notice--success">Pendaftaranmu telah diterima.</p>}
          {registration?.status === 'rejected' && <p className="student-activity-detail__notice student-activity-detail__notice--danger">Pendaftaran sebelumnya ditolak. Kamu dapat mengajukan kembali.</p>}
          {canRegister && <Button onClick={openRegistrationForm}>{registration?.status === 'rejected' ? 'Daftar kembali' : 'Daftar kegiatan'}</Button>}
          {registration && registration.status !== 'rejected' && <Link className="ui-button ui-button--outline" to="/student/registrations">Lihat pendaftaran saya</Link>}
          {activity.status !== 'active' && <p className="student-activity-detail__notice">Kegiatan ini sedang tidak membuka pendaftaran.</p>}
        </div>
      </Card>
      <Modal open={confirmOpen} onClose={() => !submitting && setConfirmOpen(false)} title="Konfirmasi pendaftaran" footer={<><Button type="button" variant="outline" disabled={submitting} onClick={() => setConfirmOpen(false)}>Batal</Button><Button type="submit" form="student-registration-form" loading={submitting} disabled={submitting}>Kirim pendaftaran</Button></>}>
        <form id="student-registration-form" className="registration-confirm-form" onSubmit={submitRegistration} noValidate>
          <p className="registration-confirm-copy">Isi identitas untuk pendaftaran kegiatan <strong>{activity.name}</strong>. Status pengajuan akan menunggu persetujuan admin.</p>
          <Input label="Nama siswa" value={identity.studentName} onChange={(event) => { setIdentity((current) => ({ ...current, studentName: event.target.value })); setIdentityErrors((current) => ({ ...current, studentName: '' })); }} error={identityErrors.studentName} maxLength={80} autoComplete="name" required />
          <Input label="Kelas" value={identity.studentClass} onChange={(event) => { setIdentity((current) => ({ ...current, studentClass: event.target.value })); setIdentityErrors((current) => ({ ...current, studentClass: '' })); }} error={identityErrors.studentClass} placeholder="Contoh: 5A atau VI A" maxLength={30} required />
        </form>
      </Modal>
      <Toast message={toast?.message} tone={toast?.tone} onDismiss={() => setToast(null)} />
    </div>
  );
}
