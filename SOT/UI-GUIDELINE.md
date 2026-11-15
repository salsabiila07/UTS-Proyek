# UI-GUIDELINE — SIM Ekstrakurikuler SD N 2 Giriharjo

## Direction
Modern Futuristic Educational SaaS; warm, clean, soft, minimal, friendly, professional. Light mode only. Avoid heavy gradients/glassmorphism, dark shadows, thick borders, dense layouts and excessive animation.

## Tokens
- Primary Brown: `#9A7657`; hover `#7E6047`
- Secondary Light Brown: `#C9A98C`
- Background Cream: `#F8F4EE`
- Surface: `#FFFDF9`
- Soft Accent: `#EFE4D8`
- Text: `#332C27`; secondary `#746A62`; muted `#A0968E`
- Border: `#E8E0D8`; disabled `#D8D1CB`
- Success `#5D8A66` / bg `#EDF5EF`
- Warning `#C6924B` / bg `#FFF6E7`
- Danger `#B95F59` / bg `#FCEDEC`
- Info `#688AA3` / bg `#EDF4F8`

## Typography
Inter, fallback system-ui/sans-serif. Display 40/48/700; H1 30/38/700; H2 24/32/650; H3 20/28/600; body 14–16/22–24/400; small 13/18; caption 12/16/500.

## Spacing / Radius / Shadow
4px base scale: 4/8/12/16/20/24/32/40/48/64/80. Page gap 24; card padding 20–24; desktop padding 24–32; mobile 16. Radius: 8/12/16; cards 16; modal 20; pill 999. Use subtle borders before shadows.

## Icons
Lucide React only; outline, consistent stroke; 16/18/20/24px.

## App Shell
Desktop: 240–260px cream-background sidebar + 64–72px topbar + main content. Sidebar: logo/school, role-aware navigation, profile/logout. Active item uses soft brown background. Tablet collapsible; mobile drawer.

## Landing Page
Navbar (logo + Beranda/Ekstrakurikuler/Tentang + Masuk), 55/45 hero, headline “Kelola Kegiatan Ekstrakurikuler Lebih Mudah”, CTAs Masuk ke Sistem/Lihat Ekstrakurikuler, benefit cards with distinct icon colors and subtle elevation, an attributed testimonial in Tentang, extracurricular grid, CTA, footer.

## Login
Desktop split-screen: branding/educational visual left, login card right. Mobile: compact branding + single-column card. States: default/loading/error/success.

## Dashboard
Greeting header; 5 stat cards: siswa, ekskul, pembina, pendaftar, kegiatan aktif. Sections: registration statistics, participants per extracurricular, upcoming schedules, recent activity.

Role dashboards: student shows registration status and upcoming schedules; coach shows assigned participants and upcoming assigned schedules; principal shows report summary counts with a path to reports. Keep these views concise and use existing cards, status badges, lists, loading, empty, and error states.

## Components
Button, Input, Select, Textarea, Badge, Card, StatCard, Modal, Table, Pagination, SearchInput, Filter, Dropdown, Toast, EmptyState, Skeleton, Avatar, Sidebar, Topbar, PageHeader, ScheduleCard, ExtracurricularCard.

## Forms / Tables / Feedback
Inputs 42–44px, visible labels and focus ring. Tables in white surface with soft cream headers and subtle row hover. Toolbar: Search + Filter + primary action. Status badges are pill + text. Delete uses confirmation modal. Toast top-right desktop/top-center mobile. Data pages support loading, empty and error states.

## Feature UI
- Extracurricular management: PageHeader + search/filter + table + add/edit form.
- Student registration: visual cards with schedule, coach, quota, detail/register actions and status badges.
- Registration confirmation: visible required fields for student name and class; class is free text.
- Attendance: activity/date context + student list with Hadir/Izin/Sakit/Alfa selectable states + Save.
- Coach extracurricular management: searchable list and add/edit/delete actions limited to the signed-in coach's assigned activities.
- Student attendance: read-only attendance history for the signed-in student, with activity, date, status, and notes.
- Schedule: cards for students; coach schedule management for assigned extracurriculars; admin table management; principal read-only timetable for all extracurriculars; changed schedules get warning badge.
- Assessment: extracurricular/period filters + table + form for skill, discipline, activity, development notes.
- Reports: filter panel + preview + Print/Export PDF.

## Responsive
Desktop ≥1200; tablet 768–1199; mobile <768. Mobile is a reflow, not merely shrunken desktop. Wide tables may horizontally scroll or use cards.

## Accessibility / Interaction
150–200ms ease transitions. Semantic HTML, labels, alt text, keyboard access, visible focus, accessible modal/dropdown, sufficient contrast, status text not color-only.

## Scope Guard
PRD determines what; UI-GUIDELINE determines appearance/interaction; IMPLEMENTATION_PLAN determines architecture/order. No dark mode, new navigation model, random styles or features outside PRD without approval.
