import { useCallback, useEffect, useState } from 'react';
import { ArrowRight, ClipboardList } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button, Card, EmptyState } from '../../components/ui/index.jsx';
import { PageHeader } from '../../components/layout/index.jsx';
import { registrationService } from '../../services/registrationService.js';
import { RegistrationBadge, formatRegistrationDate } from './registrationUtils.jsx';
import './registrations.css';

export default function MyRegistrationsPage() {
  const [state, setState] = useState({ status: 'loading', registrations: [], error: '' });

  const load = useCallback(async () => {
    setState((current) => ({ ...current, status: 'loading', error: '' }));
    try {
      setState({ status: 'success', registrations: await registrationService.getMine(), error: '' });
    } catch (error) {
      setState((current) => ({ ...current, status: 'error', error: error.message || 'Pendaftaran belum dapat dimuat.' }));
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  return (
    <div className="student-registration-page">
      <PageHeader eyebrow="STATUS PENDAFTARAN" title="Pendaftaran saya" description="Lihat status pendaftaran kegiatan ekstrakurikulermu." actions={<Link className="ui-button ui-button--outline" to="/student/extracurriculars">Jelajahi kegiatan</Link>} />
      {state.status === 'loading' && <div className="registration-load-state" role="status">Memuat pendaftaran…</div>}
      {state.status === 'error' && <Card><EmptyState title="Pendaftaran belum dapat dimuat" description={state.error} action={<Button variant="outline" onClick={load}>Coba lagi</Button>} /></Card>}
      {state.status === 'success' && state.registrations.length === 0 && <Card><EmptyState title="Belum ada pendaftaran" description="Kegiatan yang kamu daftarkan akan tercatat di sini." action={<Link className="ui-button ui-button--primary" to="/student/extracurriculars">Lihat ekstrakurikuler <ArrowRight size={16} /></Link>} /></Card>}
      {state.status === 'success' && state.registrations.length > 0 && <div className="my-registration-list">
        {state.registrations.map((registration) => <Card className="my-registration" key={registration.id}>
          <span className="my-registration__icon" aria-hidden="true"><ClipboardList size={20} /></span>
          <div className="my-registration__body"><strong>{registration.extracurricularName}</strong><span>{registration.studentName} · Kelas {registration.studentClass}</span><span>Didaftarkan {formatRegistrationDate(registration.registrationDate)}</span></div>
          <RegistrationBadge status={registration.status} />
          <Link className="my-registration__link" to={`/student/extracurriculars/${registration.extracurricularId}`} aria-label={`Lihat ${registration.extracurricularName}`}><ArrowRight size={18} /></Link>
        </Card>)}
      </div>}
    </div>
  );
}
