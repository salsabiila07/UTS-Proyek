import { ArrowDown, ArrowRight, BookOpen, CalendarDays, Check, ClipboardCheck, Compass, GraduationCap, Languages, Monitor, Quote, Sparkles, UsersRound } from 'lucide-react';
import { Link } from 'react-router-dom';
import './landing-page.css';

const benefits = [
  { icon: Compass, title: 'Pilihan kegiatan', text: 'Temukan kegiatan yang sesuai dengan minat dan semangat siswa.' },
  { icon: CalendarDays, title: 'Jadwal lebih jelas', text: 'Informasi kegiatan tersusun agar siswa dan pembina mudah bersiap.' },
  { icon: ClipboardCheck, title: 'Perkembangan terpantau', text: 'Dukung proses belajar, kehadiran, dan perkembangan setiap siswa.' },
];

const extracurriculars = [
  { name: 'Tari', icon: Sparkles, tone: 'lilac', description: 'Mengekspresikan kreativitas lewat gerak dan seni.' },
  { name: 'Pramuka', icon: Compass, tone: 'sand', description: 'Belajar mandiri, bekerja sama, dan mencintai alam.' },
  { name: 'IT', icon: Monitor, tone: 'blue', description: 'Mengenal komputer dan keterampilan teknologi.' },
  { name: 'Bahasa Inggris', icon: Languages, tone: 'green', description: 'Berlatih kosakata dan percakapan bahasa Inggris.' },
  { name: 'BTQ', icon: BookOpen, tone: 'gold', description: 'Belajar membaca dan memahami Al-Qur’an.' },
];

function Brand() {
  return <Link className="landing-brand" to="/" aria-label="SIM Ekstrakurikuler SD N 2 Giriharjo — Beranda"><span className="landing-brand__mark"><GraduationCap size={22} /></span><span><strong>Manajemen Ekstrakurikuler</strong><small>SD N 2 Giriharjo</small></span></Link>;
}

function HeroVisual() {
  return (
    <div className="landing-visual" aria-label="Ilustrasi kegiatan ekstrakurikuler sekolah" role="img">
      <div className="landing-visual__shape landing-visual__shape--one" />
      <div className="landing-visual__shape landing-visual__shape--two" />
      <div className="landing-visual__orbit landing-visual__orbit--one" />
      <div className="landing-visual__orbit landing-visual__orbit--two" />
      <div className="landing-visual__main-card">
        <div className="landing-visual__card-heading"><span className="landing-visual__icon"><BookOpen size={20} /></span><span className="landing-visual__dots" aria-hidden="true">•••</span></div>
        <p className="landing-visual__eyebrow">RUANG BERTUMBUH</p>
        <h2>Banyak cara<br />untuk berkembang.</h2>
        <div className="landing-visual__activity"><span className="landing-visual__activity-icon"><Compass size={18} /></span><span><strong>Pramuka</strong><small>Belajar bersama di luar kelas</small></span><span className="landing-visual__check"><Check size={14} /></span></div>
        <div className="landing-visual__activity"><span className="landing-visual__activity-icon landing-visual__activity-icon--green"><Sparkles size={18} /></span><span><strong>Tari</strong><small>Ruang untuk berekspresi</small></span><span className="landing-visual__check"><Check size={14} /></span></div>
      </div>
      <div className="landing-visual__note"><span className="landing-visual__note-icon"><UsersRound size={18} /></span><span><strong>Tumbuh bersama</strong><small>Setiap minat punya ruang</small></span></div>
      <div className="landing-visual__star landing-visual__star--one" aria-hidden="true">✳</div>
      <div className="landing-visual__star landing-visual__star--two" aria-hidden="true">✳</div>
    </div>
  );
}

export default function LandingPage() {
  return (
    <div className="landing-page">
      <header className="landing-header">
        <div className="landing-container landing-header__inner">
          <Brand />
          <nav className="landing-nav" aria-label="Navigasi utama">
            <a className="is-current" href="#beranda">Beranda</a>
            <a href="#ekstrakurikuler">Ekstrakurikuler</a>
            <a href="#tentang">Tentang</a>
          </nav>
          <Link className="landing-login" to="/login">Masuk <ArrowRight size={16} /></Link>
        </div>
      </header>

      <main>
        <section className="landing-hero landing-container" id="beranda">
          <div className="landing-hero__copy">
            <span className="landing-kicker"><span /> SISTEM KEGIATAN SEKOLAH</span>
            <h1>Kelola Kegiatan Ekstrakurikuler <em>Lebih Mudah</em></h1>
            <p className="landing-hero__lead">Ruang untuk menemukan minat, belajar hal baru, dan tumbuh bersama di SD N 2 Giriharjo.</p>
            <div className="landing-hero__actions">
              <Link className="landing-button landing-button--primary" to="/login">Masuk ke Sistem <ArrowRight size={17} /></Link>
              <a className="landing-button landing-button--secondary" href="#ekstrakurikuler">Lihat Ekstrakurikuler <ArrowDown size={16} /></a>
            </div>
            <div className="landing-hero__note"><span className="landing-hero__note-icon"><UsersRound size={16} /></span> Kegiatan positif, pengalaman berharga.</div>
          </div>
          <HeroVisual />
        </section>

        <section className="landing-benefits" id="tentang">
          <div className="landing-container">
            <div className="landing-section-heading">
              <span className="landing-kicker">BELAJAR DI LUAR KELAS</span>
              <h2>Setiap kegiatan punya cerita.</h2>
              <p>Kelola kegiatan sekolah dengan informasi yang mudah ditemukan dan digunakan.</p>
            </div>
            <div className="landing-benefit-grid">
              {benefits.map(({ icon: Icon, title, text }, index) => <article className="landing-benefit" key={title}><span className={`landing-benefit__icon landing-benefit__icon--${index}`}><Icon size={21} /></span><h3>{title}</h3><p>{text}</p></article>)}
            </div>
            <blockquote className="landing-testimonial">
              <span className="landing-testimonial__icon" aria-hidden="true"><Quote size={21} /></span>
              <div><p>“Wadah terbaik bagi siswa untuk mengeksplorasi bakat, kepemimpinan, dan kemandirian sejak dini.”</p><cite>— Kepala SD N 2 Giriharjo</cite></div>
            </blockquote>
          </div>
        </section>

        <section className="landing-extracurriculars landing-container" id="ekstrakurikuler">
          <div className="landing-section-heading landing-section-heading--row">
            <div><span className="landing-kicker">PILIHAN KEGIATAN</span><h2>Temukan minatmu.</h2><p>Beragam kegiatan untuk belajar, berkarya, dan bertumbuh.</p></div>
            <Link className="landing-text-link" to="/login">Jelajahi bersama <ArrowRight size={17} /></Link>
          </div>
          <div className="landing-activity-grid">
            {extracurriculars.map(({ name, icon: Icon, tone, description }) => <article className="landing-activity" key={name}><span className={`landing-activity__icon landing-activity__icon--${tone}`}><Icon size={22} strokeWidth={1.8} /></span><h3>{name}</h3><p>{description}</p></article>)}
          </div>
        </section>

        <section className="landing-cta">
          <div className="landing-container landing-cta__inner"><div><span className="landing-kicker">MARI BERTUMBUH BERSAMA</span><h2>Mulai perjalanan seru di sekolah.</h2><p>Masuk ke sistem untuk melihat informasi kegiatan ekstrakurikuler.</p></div><Link className="landing-button landing-button--light" to="/login">Masuk ke Sistem <ArrowRight size={17} /></Link></div>
        </section>
      </main>

      <footer className="landing-footer"><div className="landing-container landing-footer__inner"><Brand /><p>Ruang tumbuh dan berkarya bagi siswa SD N 2 Giriharjo.</p><span>© SD N 2 Giriharjo</span></div></footer>
    </div>
  );
}
