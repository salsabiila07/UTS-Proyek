import { BookOpen, CalendarDays, ChartColumn, ClipboardCheck, ClipboardList, FileText, LayoutDashboard, Users } from 'lucide-react';

export const roleNames = {
  admin: 'Administrator',
  coach: 'Pembina',
  student: 'Siswa',
  principal: 'Kepala Sekolah',
};

export const roleNavigation = {
  admin: [
    { path: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: 'extracurriculars', label: 'Ekstrakurikuler', icon: BookOpen },
    { path: 'registrations', label: 'Pendaftaran', icon: ClipboardList },
    { path: 'schedules', label: 'Jadwal', icon: CalendarDays },
    { path: 'attendance', label: 'Absensi', icon: ClipboardCheck },
    { path: 'assessments', label: 'Penilaian', icon: ChartColumn },
    { path: 'reports', label: 'Laporan', icon: FileText },
  ],
  coach: [
    { path: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: 'students', label: 'Peserta', icon: Users },
    { path: 'extracurriculars', label: 'Ekstrakurikuler', icon: BookOpen },
    { path: 'schedules', label: 'Jadwal', icon: CalendarDays },
    { path: 'attendance', label: 'Absensi', icon: ClipboardCheck },
    { path: 'assessments', label: 'Penilaian', icon: ChartColumn },
  ],
  student: [
    { path: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: 'extracurriculars', label: 'Ekstrakurikuler', icon: BookOpen },
    { path: 'registrations', label: 'Pendaftaran Saya', icon: ClipboardList },
    { path: 'schedules', label: 'Jadwal', icon: CalendarDays },
    { path: 'attendance', label: 'Absensi', icon: ClipboardCheck },
  ],
  principal: [
    { path: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: 'schedules', label: 'Jadwal', icon: CalendarDays },
    { path: 'reports', label: 'Laporan', icon: FileText },
  ],
};
