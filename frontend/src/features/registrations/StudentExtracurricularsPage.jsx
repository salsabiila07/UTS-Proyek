import { useCallback, useEffect, useState } from 'react';
import { ArrowRight, BookOpen, MapPin, UsersRound } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Badge, Button, Card, EmptyState, Skeleton } from '../../components/ui/index.jsx';
import { PageHeader } from '../../components/layout/index.jsx';
import { extracurricularService } from '../../services/extracurricularService.js';
import { registrationService } from '../../services/registrationService.js';
import { RegistrationBadge } from './registrationUtils.jsx';
import { ClassScheduleList } from './ClassScheduleList.jsx';
import './registrations.css';

function ActivitySkeleton() {
  return <Card className="student-activity-card"><Skeleton height={150} /><Skeleton width="55%" height={22} /><Skeleton width="90%" /><Skeleton width="70%" /><Skeleton width="100%" height={42} /></Card>;
}

export default function StudentExtracurricularsPage() {
  const [state, setState] = useState({ status: 'loading', activities: [], registrations: [], error: '' });

  const load = useCallback(async () => {
    setState((current) => ({ ...current, status: 'loading', error: '' }));
    try {
      const [activities, registrations] = await Promise.all([extracurricularService.getAll(), registrationService.getMine()]);
      setState({ status: 'success', activities: activities.filter((activity) => activity.status === 'active'), registrations, error: '' });
    } catch (error) {
      setState((current) => ({ ...current, status: 'error', error: error.message || 'Daftar ekstrakurikuler belum dapat dimuat.' }));
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const registrationByActivity = state.registrations.reduce((map, registration) => {
    if (!map.has(registration.extracurricularId)) map.set(registration.extracurricularId, registration);
    return map;
  }, new Map());

  return (
    <div className="student-registration-page">
      <PageHeader eyebrow="KEGIATAN SEKOLAH" title="Ekstrakurikuler" description="Pilih kegiatan yang sesuai dengan minatmu." actions={<Link className="ui-button ui-button--outline" to="/student/registrations">Pendaftaran saya</Link>} />
      {state.status === 'loading' && <div className="student-activity-grid" aria-busy="true" role="status">{Array.from({ length: 3 }, (_, index) => <ActivitySkeleton key={index} />)}</div>}
      {state.status === 'error' && <Card><EmptyState title="Daftar belum dapat dimuat" description={state.error} action={<Button variant="outline" onClick={load}>Coba lagi</Button>} /></Card>}
      {state.status === 'success' && state.activities.length === 0 && <Card><EmptyState title="Belum ada kegiatan yang dibuka" description="Ekstrakurikuler aktif akan tampil di sini." /></Card>}
      {state.status === 'success' && state.activities.length > 0 && <div className="student-activity-grid">
        {state.activities.map((activity) => {
          const registration = registrationByActivity.get(activity.id);
          return <Card className="student-activity-card" key={activity.id}>
            {activity.image ? <img className="student-activity-card__image" src={activity.image} alt={`Kegiatan ${activity.name}`} /> : <div className="student-activity-card__image student-activity-card__image--empty" aria-hidden="true"><BookOpen size={28} /></div>}
            <div className="student-activity-card__content">
              <div className="student-activity-card__heading"><h2>{activity.name}</h2><span className="student-activity-card__badges">{activity.mandatory && <Badge tone="warning">Wajib</Badge>}{registration ? <RegistrationBadge status={registration.status} /> : <Badge tone="info">Pendaftaran dibuka</Badge>}</span></div>
              <p className="student-activity-card__description">{activity.description}</p>
              <ClassScheduleList schedules={activity.classSchedules} />
              <div className="student-activity-card__meta"><span><MapPin size={15} /> {activity.location}</span><span><UsersRound size={15} /> Kuota {activity.quota} siswa</span></div>
              <div className="student-activity-card__actions">
                <Link className="ui-button ui-button--outline student-activity-card__action" to={`/student/extracurriculars/${activity.id}`}>{registration?.status === 'pending' || registration?.status === 'accepted' ? 'Lihat pendaftaran' : 'Lihat detail'}</Link>
                {(!registration || registration.status === 'rejected') && <Link className="ui-button ui-button--primary student-activity-card__action student-activity-card__register" to={`/student/extracurriculars/${activity.id}`} state={{ openRegistration: true }}>{registration?.status === 'rejected' ? 'Daftar kembali' : 'Daftar sekarang'}<ArrowRight size={16} aria-hidden="true" /></Link>}
              </div>
            </div>
          </Card>;
        })}
      </div>}
    </div>
  );
}
