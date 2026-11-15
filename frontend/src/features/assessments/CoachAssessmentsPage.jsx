import { useCallback, useEffect, useMemo, useState } from 'react';
import { Save } from 'lucide-react';
import { Button, Card, EmptyState, Select, Toast } from '../../components/ui/index.jsx';
import { PageHeader } from '../../components/layout/index.jsx';
import { scheduleService } from '../../services/scheduleService.js';
import { assessmentService } from '../../services/assessmentService.js';
import './assessments.css';

function currentPeriod() {
  return `${new Date().getFullYear()}-${new Date().getMonth() < 6 ? '1' : '2'}`;
}

function periodOptions() {
  const year = new Date().getFullYear();
  return [year - 1, year, year + 1].flatMap((item) => [
    { value: `${item}-1`, label: `Semester 1 ${item}` },
    { value: `${item}-2`, label: `Semester 2 ${item}` },
  ]);
}

const scoreFields = [
  { key: 'skillScore', label: 'Skill' },
  { key: 'disciplineScore', label: 'Disiplin' },
  { key: 'activityScore', label: 'Keaktifan' },
];

export default function CoachAssessmentsPage() {
  const [activities, setActivities] = useState([]);
  const [activityId, setActivityId] = useState('');
  const [period, setPeriod] = useState(currentPeriod);
  const [students, setStudents] = useState([]);
  const [state, setState] = useState('loading');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);

  const loadActivities = useCallback(async () => {
    setState('loading');
    setError('');
    try {
      const schedules = await scheduleService.getMine();
      const unique = [...new Map(schedules.map((item) => [item.extracurricularId, { id: item.extracurricularId, name: item.extracurricularName }])).values()];
      setActivities(unique);
      setActivityId((current) => unique.some((item) => item.id === current) ? current : unique[0]?.id || '');
      setState('success');
    } catch (loadError) {
      setError(loadError.message || 'Kegiatan tugas belum dapat dimuat.');
      setState('error');
    }
  }, []);

  useEffect(() => { loadActivities(); }, [loadActivities]);

  const loadRoster = useCallback(async () => {
    if (!activityId) { setStudents([]); return; }
    setState('loading');
    setError('');
    try {
      const [roster, existing] = await Promise.all([
        assessmentService.getRoster(activityId),
        assessmentService.getMine({ extracurricularId: activityId, period }),
      ]);
      const previous = new Map(existing.map((item) => [item.studentId, item]));
      setStudents(roster.students.map((student) => {
        const item = previous.get(student.studentId);
        return {
          ...student,
          skillScore: item?.skillScore ?? '',
          disciplineScore: item?.disciplineScore ?? '',
          activityScore: item?.activityScore ?? '',
          developmentNotes: item?.developmentNotes ?? '',
        };
      }));
      setState('success');
    } catch (loadError) {
      setError(loadError.message || 'Daftar peserta belum dapat dimuat.');
      setStudents([]);
      setState('error');
    }
  }, [activityId, period]);

  useEffect(() => { if (activityId) loadRoster(); }, [activityId, period, loadRoster]);

  function updateStudent(studentId, field, value) {
    setStudents((current) => current.map((student) => student.studentId === studentId ? { ...student, [field]: value } : student));
  }

  async function save() {
    setSaving(true);
    try {
      await assessmentService.save({ extracurricularId: activityId, period, entries: students.map(({ studentId, skillScore, disciplineScore, activityScore, developmentNotes }) => ({ studentId, skillScore, disciplineScore, activityScore, developmentNotes })) });
      setToast({ message: 'Penilaian berhasil disimpan.', tone: 'success' });
      await loadRoster();
    } catch (saveError) {
      setToast({ message: saveError.message || 'Penilaian belum dapat disimpan.', tone: 'danger' });
    } finally { setSaving(false); }
  }

  const canSave = state === 'success' && students.length > 0 && students.every((student) => scoreFields.every(({ key }) => student[key] !== '') && scoreFields.every(({ key }) => Number.isInteger(Number(student[key])) && Number(student[key]) >= 0 && Number(student[key]) <= 100)) && !saving;
  const activityOptions = useMemo(() => activities.map(({ id, name }) => ({ value: id, label: name })), [activities]);

  return (
    <div className="assessments-page">
      <PageHeader eyebrow="PEMBINA · PENILAIAN" title="Penilaian peserta" description="Catat keterampilan, disiplin, keaktifan, dan perkembangan siswa per semester." />
      <Card>
        <div className="assessment-toolbar">
          <Select label="Ekstrakurikuler" value={activityId} options={activityOptions} placeholder="Pilih kegiatan" onChange={(event) => setActivityId(event.target.value)} />
          <Select label="Periode" value={period} options={periodOptions()} onChange={(event) => setPeriod(event.target.value)} />
          {state === 'error' && <div className="assessment-state" role="alert">{error} <Button variant="outline" size="sm" onClick={activityId ? loadRoster : loadActivities}>Coba lagi</Button></div>}
        </div>
        {state === 'loading' && <div className="assessment-state" role="status">Memuat peserta dan penilaian…</div>}
        {state === 'success' && activities.length === 0 && <EmptyState title="Belum ada kegiatan tugas" description="Kegiatan yang memiliki jadwal tugas kepada Anda akan tampil di sini." />}
        {state === 'success' && activityId && students.length === 0 && <EmptyState title="Belum ada peserta diterima" description="Daftar peserta muncul setelah pendaftaran kegiatan disetujui admin." />}
        {state === 'success' && students.length > 0 && <>
          <div className="assessment-context"><strong>{students.length} peserta</strong><span>Nilai menggunakan skala 0–100.</span></div>
          <div className="assessment-student-list">
            {students.map((student) => <div className="assessment-student" key={student.studentId}>
              <strong className="assessment-student__name">{student.studentName}</strong>
              {scoreFields.map(({ key, label }) => <div className="assessment-student__field" key={key}>
                <label htmlFor={`${key}-${student.studentId}`}>{label}</label>
                <input id={`${key}-${student.studentId}`} className="ui-control" type="number" min="0" max="100" step="1" inputMode="numeric" value={student[key]} onChange={(event) => updateStudent(student.studentId, key, event.target.value)} aria-label={`${label} ${student.studentName}`} />
              </div>)}
              <div className="assessment-student__field assessment-notes-field">
                <label htmlFor={`development-${student.studentId}`}>Catatan perkembangan</label>
                <textarea id={`development-${student.studentId}`} className="ui-control" maxLength={500} value={student.developmentNotes} onChange={(event) => updateStudent(student.studentId, 'developmentNotes', event.target.value)} aria-label={`Catatan perkembangan ${student.studentName}`} />
              </div>
            </div>)}
          </div>
          <div className="assessment-save"><span>Lengkapi tiga nilai untuk setiap peserta sebelum menyimpan.</span><Button disabled={!canSave} loading={saving} onClick={save}><Save size={17} /> Simpan penilaian</Button></div>
        </>}
      </Card>
      <Toast message={toast?.message} tone={toast?.tone} onDismiss={() => setToast(null)} />
    </div>
  );
}
