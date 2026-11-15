import { useCallback, useEffect, useMemo, useState } from 'react';
import { CalendarDays, Clock3, Save, UsersRound } from 'lucide-react';
import { Button, Card, EmptyState, Select, Table, Toast } from '../../components/ui/index.jsx';
import { PageHeader } from '../../components/layout/index.jsx';
import { scheduleService, scheduleStatuses } from '../../services/scheduleService.js';
import { attendanceService } from '../../services/attendanceService.js';
import { AttendanceBadge, attendanceStatuses, formatAttendanceDate } from './attendanceUtils.jsx';
import './attendance.css';

function AttendanceRoster({ students, onChange }) {
  if (!students.length) return <EmptyState title="Belum ada peserta diterima" description="Daftar peserta muncul setelah pendaftaran disetujui admin." />;
  return (
    <div className="attendance-roster">
      <div className="attendance-roster__header"><span>Nama siswa</span><span>Status kehadiran</span><span>Catatan (opsional)</span></div>
      {students.map((student) => <div className="attendance-roster__row" key={student.studentId}>
        <strong>{student.studentName}</strong>
        <div className="attendance-roster__field"><span className="attendance-roster__mobile-label" aria-hidden="true">Kehadiran</span>
        <label className="ui-visually-hidden" htmlFor={`attendance-${student.studentId}`}>Status kehadiran {student.studentName}</label>
        <select id={`attendance-${student.studentId}`} className="ui-control" aria-label={`Status kehadiran ${student.studentName}`} value={student.status} onChange={(event) => onChange(student.studentId, 'status', event.target.value)}>
          <option value="">Pilih status</option>
          {Object.entries(attendanceStatuses).map(([value, item]) => <option key={value} value={value}>{item.label}</option>)}
        </select>
        </div>
        <div className="attendance-roster__field"><span className="attendance-roster__mobile-label" aria-hidden="true">Catatan</span>
        <label className="ui-visually-hidden" htmlFor={`notes-${student.studentId}`}>Catatan kehadiran {student.studentName}</label>
        <input id={`notes-${student.studentId}`} className="ui-control" aria-label={`Catatan kehadiran ${student.studentName}`} value={student.notes} maxLength={300} placeholder="Tambah catatan" onChange={(event) => onChange(student.studentId, 'notes', event.target.value)} />
        </div>
      </div>)}
    </div>
  );
}

export default function CoachAttendancePage() {
  const [schedules, setSchedules] = useState([]);
  const [scheduleState, setScheduleState] = useState('loading');
  const [scheduleError, setScheduleError] = useState('');
  const [selectedId, setSelectedId] = useState('');
  const [rosterState, setRosterState] = useState({ status: 'idle', schedule: null, students: [], error: '' });
  const [history, setHistory] = useState([]);
  const [historyState, setHistoryState] = useState('loading');
  const [historyError, setHistoryError] = useState('');
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);

  const loadHistory = useCallback(async () => {
    setHistoryState('loading');
    setHistoryError('');
    try {
      setHistory(await attendanceService.getMine());
      setHistoryState('success');
    } catch (error) {
      setHistoryError(error.message || 'Riwayat absensi belum dapat dimuat.');
      setHistoryState('error');
    }
  }, []);

  const loadSchedules = useCallback(async () => {
    setScheduleState('loading');
    setScheduleError('');
    try {
      const data = (await scheduleService.getMine()).filter((schedule) => schedule.status !== 'cancelled');
      setSchedules(data);
      setSelectedId((current) => data.some((schedule) => schedule.id === current) ? current : data[0]?.id || '');
      setScheduleState('success');
    } catch (error) {
      setScheduleError(error.message || 'Jadwal tugas belum dapat dimuat.');
      setScheduleState('error');
    }
  }, []);

  useEffect(() => { loadSchedules(); loadHistory(); }, [loadHistory, loadSchedules]);

  useEffect(() => {
    if (!selectedId) {
      setRosterState({ status: 'idle', schedule: null, students: [], error: '' });
      return undefined;
    }
    let active = true;
    setRosterState((current) => ({ ...current, status: 'loading', error: '' }));
    attendanceService.getForSchedule(selectedId).then((data) => {
      if (active) setRosterState({ status: 'success', schedule: data.schedule, students: data.students, error: '' });
    }).catch((error) => {
      if (active) setRosterState({ status: 'error', schedule: null, students: [], error: error.message || 'Peserta belum dapat dimuat.' });
    });
    return () => { active = false; };
  }, [selectedId]);

  const scheduleOptions = useMemo(() => schedules.map((schedule) => ({ value: schedule.id, label: `${schedule.extracurricularName} · ${schedule.day}, ${formatAttendanceDate(schedule.date)}` })), [schedules]);

  function updateStudent(studentId, field, value) {
    setRosterState((current) => ({ ...current, students: current.students.map((student) => student.studentId === studentId ? { ...student, [field]: value } : student) }));
  }

  async function saveAttendance() {
    setSaving(true);
    try {
      const saved = await attendanceService.saveForSchedule(selectedId, rosterState.students.map(({ studentId, status, notes }) => ({ studentId, status, notes })));
      const savedByStudent = new Map(saved.map((record) => [record.studentId, record]));
      setRosterState((current) => ({ ...current, students: current.students.map((student) => ({ ...student, ...(savedByStudent.get(student.studentId) || {}) })) }));
      setToast({ message: 'Absensi berhasil disimpan.', tone: 'success' });
      await loadHistory();
    } catch (error) {
      setToast({ message: error.message || 'Absensi belum dapat disimpan.', tone: 'danger' });
    } finally {
      setSaving(false);
    }
  }

  const canSave = rosterState.status === 'success' && rosterState.students.length > 0 && rosterState.students.every((student) => student.status) && !saving;
  const historyColumns = [
    { key: 'date', label: 'Tanggal', render: (record) => formatAttendanceDate(record.date) },
    { key: 'extracurricularName', label: 'Ekstrakurikuler' },
    { key: 'studentName', label: 'Siswa' },
    { key: 'status', label: 'Kehadiran', render: (record) => <AttendanceBadge status={record.status} /> },
    { key: 'notes', label: 'Catatan', render: (record) => record.notes || '—' },
  ];

  return (
    <div className="attendance-page">
      <PageHeader eyebrow="PEMBINA · ABSENSI" title="Catat absensi" description="Pilih jadwal kegiatan, lalu catat kehadiran pesertanya." />
      <Card className="attendance-entry-card">
        {scheduleState === 'loading' && <div className="attendance-state" role="status">Memuat jadwal pembina…</div>}
        {scheduleState === 'error' && <EmptyState title="Jadwal belum dapat dimuat" description={scheduleError} action={<Button variant="outline" onClick={loadSchedules}>Coba lagi</Button>} />}
        {scheduleState === 'success' && schedules.length === 0 && <EmptyState title="Belum ada jadwal tugas" description="Jadwal yang ditugaskan kepada Anda akan muncul di sini." />}
        {scheduleState === 'success' && schedules.length > 0 && <>
          <Select label="Kegiatan dan tanggal" value={selectedId} options={scheduleOptions} onChange={(event) => setSelectedId(event.target.value)} />
          {rosterState.status === 'loading' && <div className="attendance-state" role="status">Memuat peserta…</div>}
          {rosterState.status === 'error' && <div className="attendance-error" role="alert">{rosterState.error}</div>}
          {rosterState.status === 'success' && <>
            <div className="attendance-context"><span><CalendarDays size={16} /> {rosterState.schedule.day}, {formatAttendanceDate(rosterState.schedule.date)}</span><span><Clock3 size={16} /> {rosterState.schedule.startTime}–{rosterState.schedule.endTime}</span><span><UsersRound size={16} /> {rosterState.students.length} peserta</span></div>
            {rosterState.schedule.status === 'changed' && <p className="attendance-change-note">Jadwal diubah: {rosterState.schedule.changeInformation}</p>}
            <AttendanceRoster students={rosterState.students} onChange={updateStudent} />
            {rosterState.students.length > 0 && <div className="attendance-save-row"><span>Pastikan setiap peserta memiliki status kehadiran.</span><Button disabled={!canSave} loading={saving} onClick={saveAttendance}><Save size={17} /> Simpan absensi</Button></div>}
          </>}
        </>}
      </Card>

      <Card className="attendance-history-card">
        <div className="attendance-history-card__heading"><div><h2>Riwayat absensi</h2><p>Catatan kehadiran pada jadwal yang Anda tangani.</p></div></div>
        {historyState === 'loading' && <div className="attendance-state" role="status">Memuat riwayat…</div>}
        {historyState === 'error' && <EmptyState title="Riwayat belum dapat dimuat" description={historyError} action={<Button variant="outline" onClick={loadHistory}>Coba lagi</Button>} />}
        {historyState === 'success' && history.length === 0 && <EmptyState title="Belum ada riwayat absensi" description="Absensi yang disimpan akan tampil di sini." />}
        {historyState === 'success' && history.length > 0 && <Table caption="Riwayat absensi pembina" columns={historyColumns} rows={history} />}
      </Card>
      <Toast message={toast?.message} tone={toast?.tone} onDismiss={() => setToast(null)} />
    </div>
  );
}
