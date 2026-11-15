import { useEffect, useState } from 'react';
import { ArrowLeft, ArrowRight, Eye, EyeOff, GraduationCap, ShieldCheck, Sparkles } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button, Input } from '../components/ui/index.jsx';
import { useAuth } from '../contexts/AuthContext.jsx';
import { roleHome } from '../routes/RequireAuth.jsx';
import './login-page.css';

const demoAccounts = [
  ['Admin', 'admin', 'admin123'],
  ['Pembina', 'pembina', 'pembina123'],
  ['Siswa', 'siswa', 'siswa123'],
  ['Kepala sekolah', 'kepala', 'kepala123'],
];

export default function LoginPage() {
  const { user: signedInUser, login, completeLogin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState('idle');
  const [pendingUser, setPendingUser] = useState(null);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (signedInUser && status?.phase !== 'success') navigate(roleHome[signedInUser.role] || '/', { replace: true });
  }, [navigate, signedInUser, status]);

  useEffect(() => {
    if (status?.phase !== 'success') return undefined;
    const rolePath = roleHome[status.userRole] || '/';
    const requestedPath = location.state?.from;
    const destination = requestedPath?.startsWith(`/${status.userRole}/`) ? requestedPath : rolePath;
    const timeout = window.setTimeout(() => {
      if (pendingUser) completeLogin(pendingUser);
      navigate(destination, { replace: true });
    }, 350);
    return () => window.clearTimeout(timeout);
  }, [completeLogin, location.state?.from, navigate, pendingUser, status]);

  async function handleSubmit(event) {
    event.preventDefault();
    const nextErrors = {};
    if (!username.trim()) nextErrors.username = 'Nama pengguna atau email wajib diisi.';
    if (!password) nextErrors.password = 'Kata sandi wajib diisi.';
    setErrors(nextErrors);
    setMessage('');
    if (Object.keys(nextErrors).length) {
      setStatus({ phase: 'error' });
      return;
    }

    setLoading(true);
    setStatus({ phase: 'loading' });
    try {
      const user = await login({ username: username.trim(), password });
      setPendingUser(user);
      setStatus({ phase: 'success', userRole: user.role });
      setMessage('Berhasil masuk. Mengalihkan ke ruang Anda…');
    } catch (error) {
      setStatus({ phase: 'error' });
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="login-page">
      <section className="login-brand-panel" aria-label="Informasi sekolah">
        <Link className="login-back" to="/" aria-label="Kembali ke beranda"><ArrowLeft size={17} /> Beranda</Link>
        <div className="login-brand-panel__content">
          <div className="login-brand-mark"><GraduationCap size={27} /></div>
          <span className="login-eyebrow">SD N 2 GIRIHARJO</span>
          <h1>Ruang untuk<br /><em>tumbuh bersama.</em></h1>
          <p>Kelola kegiatan, temukan minat, dan dukung perkembangan siswa dalam satu tempat.</p>
          <div className="login-brand-art" aria-hidden="true">
            <div className="login-brand-art__circle login-brand-art__circle--back" />
            <div className="login-brand-art__circle login-brand-art__circle--front" />
            <div className="login-brand-art__card"><Sparkles size={20} /><span>Belajar hal baru,<br />setiap hari.</span></div>
            <div className="login-brand-art__seal"><ShieldCheck size={22} /></div>
          </div>
        </div>
        <small className="login-brand-panel__footer">Sistem Informasi Ekstrakurikuler</small>
      </section>

      <section className="login-form-panel">
        <div className="login-card">
          <Link className="login-mobile-brand" to="/"><GraduationCap size={21} /> SIM Ekskul</Link>
          <span className="login-eyebrow">SELAMAT DATANG</span>
          <h2>Masuk ke sistem</h2>
          <p className="login-card__intro">Gunakan akun Anda untuk melanjutkan.</p>

          {message && <div className={`login-feedback login-feedback--${status?.phase === 'success' ? 'success' : 'error'}`} role={status?.phase === 'success' ? 'status' : 'alert'}>{message}</div>}

          <form className="login-form" onSubmit={handleSubmit} noValidate>
            <Input label="Nama pengguna atau email" name="username" autoComplete="username" placeholder="Masukkan nama pengguna" value={username} onChange={(event) => { setUsername(event.target.value); setErrors((current) => ({ ...current, username: '' })); }} error={errors.username} required />
            <div className="login-password-field">
              <Input label="Kata sandi" name="password" type={showPassword ? 'text' : 'password'} autoComplete="current-password" placeholder="Masukkan kata sandi" value={password} onChange={(event) => { setPassword(event.target.value); setErrors((current) => ({ ...current, password: '' })); }} error={errors.password} required />
              <button className="login-password-toggle" type="button" aria-label={showPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'} aria-pressed={showPassword} onClick={() => setShowPassword((visible) => !visible)}>{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button>
            </div>
            <Button className="login-submit" type="submit" loading={loading} disabled={loading}>{loading ? 'Memeriksa akun…' : <>Masuk <ArrowRight size={17} /></>}</Button>
          </form>

          {import.meta.env.DEV && <details className="login-demo"><summary>Akun demo untuk pengembangan</summary><div className="login-demo__list">{demoAccounts.map(([role, account, demoPassword]) => <p key={account}><strong>{role}</strong><span>{account} / {demoPassword}</span></p>)}</div></details>}
          <p className="login-card__privacy">Akses sistem hanya untuk warga sekolah yang memiliki akun.</p>
          {location.state?.from && <span className="login-redirect-note">Silakan masuk untuk melanjutkan.</span>}
        </div>
        <Link className="login-mobile-back" to="/"><ArrowLeft size={15} /> Kembali ke beranda</Link>
      </section>
    </main>
  );
}
