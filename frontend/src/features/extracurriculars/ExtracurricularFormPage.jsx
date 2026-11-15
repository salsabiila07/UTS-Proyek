import { useEffect, useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Button, Card, EmptyState, Input, Select, Textarea } from '../../components/ui/index.jsx';
import { PageHeader } from '../../components/layout/index.jsx';
import { extracurricularService, validateExtracurricular } from '../../services/extracurricularService.js';
import { useAuth } from '../../contexts/AuthContext.jsx';
import './extracurriculars.css';

const emptyForm = { name: '', description: '', coach: '', day: '', startTime: '', endTime: '', location: '', quota: '30', status: 'active', image: '' };
const days = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'].map((day) => ({ value: day, label: day }));

export default function ExtracurricularFormPage({ mode = 'create', role = 'admin' }) {
  const { user } = useAuth();
  const isEdit = mode === 'edit';
  const isCoach = role === 'coach';
  const basePath = `/${role}/extracurriculars`;
  const { id } = useParams();
  const navigate = useNavigate();
  const [values, setValues] = useState(() => ({ ...emptyForm, coach: isCoach ? user?.name || '' : '' }));
  const [errors, setErrors] = useState({});
  const [pageState, setPageState] = useState(isEdit ? 'loading' : 'ready');
  const [pageError, setPageError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isEdit) return undefined;
    let active = true;
    extracurricularService.getById(id).then((activity) => {
      if (!active) return;
      if (!activity) {
        setPageError('Ekstrakurikuler yang dicari tidak ditemukan.');
        setPageState('missing');
        return;
      }
      setValues({ ...emptyForm, ...activity, quota: String(activity.quota) });
      setPageState('ready');
    }).catch(() => {
      if (!active) return;
      setPageError('Data ekstrakurikuler belum dapat dimuat.');
      setPageState('error');
    });
    return () => { active = false; };
  }, [id, isEdit]);

  function updateField(field, value) {
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: '' }));
    setPageError('');
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const nextErrors = validateExtracurricular(values);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    setSaving(true);
    setPageError('');
    try {
      if (isEdit) await extracurricularService.update(id, values);
      else await extracurricularService.create(values);
      navigate(basePath, { replace: true, state: { notice: `Ekstrakurikuler berhasil ${isEdit ? 'diperbarui' : 'ditambahkan'}.` } });
    } catch (error) {
      setPageError(error.message || 'Data ekstrakurikuler gagal disimpan.');
    } finally {
      setSaving(false);
    }
  }

  if (pageState === 'loading') return <div className="extracurricular-state" role="status">Memuat data ekstrakurikuler…</div>;
  if (pageState === 'missing' || pageState === 'error') return <EmptyState title={pageError} action={<Link className="ui-button ui-button--outline" to={basePath}><ArrowLeft size={16} /> Kembali ke daftar</Link>} />;

  return (
    <div className="extracurricular-form-page">
      <PageHeader eyebrow={isCoach ? 'PEMBINA · PENGELOLAAN KEGIATAN' : 'PENGELOLAAN KEGIATAN'} title={isEdit ? 'Ubah ekstrakurikuler' : 'Tambah ekstrakurikuler'} description={isEdit ? 'Perbarui informasi kegiatan ekstrakurikuler.' : 'Lengkapi informasi kegiatan ekstrakurikuler baru.'} />
      <Card className="extracurricular-form-card">
        {pageError && <p className="extracurricular-form-error" role="alert">{pageError}</p>}
        <form onSubmit={handleSubmit} noValidate>
          <div className="extracurricular-form-grid">
            <Input label="Nama ekstrakurikuler" name="name" autoComplete="off" maxLength={60} required value={values.name} onChange={(event) => updateField('name', event.target.value)} error={errors.name} />
            <Input label="Pembina" name="coach" autoComplete="off" required value={values.coach} disabled={isCoach} onChange={(event) => updateField('coach', event.target.value)} error={errors.coach} />
            <Textarea className="extracurricular-form-grid__wide" label="Deskripsi" name="description" maxLength={300} hint="Maksimal 300 karakter." value={values.description} onChange={(event) => updateField('description', event.target.value)} error={errors.description} />
            <Select label="Hari kegiatan" name="day" placeholder="Pilih hari" options={days} required value={values.day} onChange={(event) => updateField('day', event.target.value)} error={errors.day} />
            <Input label="Lokasi" name="location" autoComplete="off" required value={values.location} onChange={(event) => updateField('location', event.target.value)} error={errors.location} />
            <Input label="Waktu mulai" name="startTime" type="time" required value={values.startTime} onChange={(event) => updateField('startTime', event.target.value)} error={errors.startTime} />
            <Input label="Waktu selesai" name="endTime" type="time" required value={values.endTime} onChange={(event) => updateField('endTime', event.target.value)} error={errors.endTime} />
            <Input label="Kuota peserta" name="quota" type="number" min="1" max="999" step="1" required value={values.quota} onChange={(event) => updateField('quota', event.target.value)} error={errors.quota} />
            <Select label="Status kegiatan" name="status" options={[{ value: 'active', label: 'Aktif' }, { value: 'inactive', label: 'Nonaktif' }]} required value={values.status} onChange={(event) => updateField('status', event.target.value)} error={errors.status} />
            <Input className="extracurricular-form-grid__wide" label="URL gambar (opsional)" name="image" type="url" autoComplete="url" placeholder="https://contoh.id/gambar.jpg" value={values.image} onChange={(event) => updateField('image', event.target.value)} error={errors.image} />
          </div>
          <div className="extracurricular-form-actions">
            <Link className="ui-button ui-button--outline" to={basePath}>Batal</Link>
            <Button type="submit" loading={saving} disabled={saving}>{saving ? 'Menyimpan…' : isEdit ? 'Simpan perubahan' : 'Simpan ekstrakurikuler'}</Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
