import { Navigate, Route, Routes } from 'react-router-dom';
import LandingPage from './pages/LandingPage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import { RequireAuth } from './routes/RequireAuth.jsx';
import ApplicationShell from './layouts/ApplicationShell.jsx';
import { roleNavigation } from './layouts/navigation.js';
import AdminDashboard from './features/dashboard/AdminDashboard.jsx';
import ExtracurricularListPage from './features/extracurriculars/ExtracurricularListPage.jsx';
import ExtracurricularFormPage from './features/extracurriculars/ExtracurricularFormPage.jsx';
import StudentExtracurricularsPage from './features/registrations/StudentExtracurricularsPage.jsx';
import StudentExtracurricularDetailPage from './features/registrations/StudentExtracurricularDetailPage.jsx';
import MyRegistrationsPage from './features/registrations/MyRegistrationsPage.jsx';
import AdminRegistrationsPage from './features/registrations/AdminRegistrationsPage.jsx';
import AdminSchedulesPage from './features/schedules/AdminSchedulesPage.jsx';
import RoleSchedulesPage from './features/schedules/RoleSchedulesPage.jsx';
import CoachAttendancePage from './features/attendance/CoachAttendancePage.jsx';
import AdminAttendancePage from './features/attendance/AdminAttendancePage.jsx';
import StudentAttendancePage from './features/attendance/StudentAttendancePage.jsx';
import CoachAssessmentsPage from './features/assessments/CoachAssessmentsPage.jsx';
import AdminAssessmentsPage from './features/assessments/AdminAssessmentsPage.jsx';
import ReportsPage from './features/reports/ReportsPage.jsx';
import RoleDashboardPage from './features/dashboard/RoleDashboardPage.jsx';
import CoachParticipantsPage from './features/participants/CoachParticipantsPage.jsx';

function ShellPlaceholder({ title }) {
  return <section className="shell-placeholder" aria-label={title} />;
}

function NotFound() {
  return <section className="not-found"><h1>Halaman tidak ditemukan</h1></section>;
}

function rolePage(role, path, label) {
  if (role === 'admin' && path === 'dashboard') return <AdminDashboard />;
  if (path === 'dashboard' && ['student', 'coach', 'principal'].includes(role)) return <RoleDashboardPage role={role} />;
  if (['admin', 'coach'].includes(role) && path === 'extracurriculars') return <ExtracurricularListPage role={role} />;
  if (role === 'admin' && path === 'registrations') return <AdminRegistrationsPage />;
  if (role === 'coach' && path === 'students') return <CoachParticipantsPage />;
  if (role === 'student' && path === 'extracurriculars') return <StudentExtracurricularsPage />;
  if (role === 'student' && path === 'registrations') return <MyRegistrationsPage />;
  if (path === 'schedules' && ['admin', 'coach'].includes(role)) return <AdminSchedulesPage role={role} />;
  if (path === 'schedules' && ['student', 'principal'].includes(role)) return <RoleSchedulesPage role={role} />;
  if (path === 'attendance' && role === 'admin') return <AdminAttendancePage />;
  if (path === 'attendance' && role === 'coach') return <CoachAttendancePage />;
  if (path === 'attendance' && role === 'student') return <StudentAttendancePage />;
  if (path === 'assessments' && role === 'coach') return <CoachAssessmentsPage />;
  if (path === 'assessments' && role === 'admin') return <AdminAssessmentsPage />;
  if (path === 'reports' && ['admin', 'principal'].includes(role)) return <ReportsPage />;
  return <ShellPlaceholder title={label} />;
}

function roleRoutes(role) {
  return (
    <Route key={role} path={role} element={<RequireAuth roles={[role]}><ApplicationShell role={role} /></RequireAuth>}>
      <Route index element={<Navigate to="dashboard" replace />} />
      {roleNavigation[role].map(({ path, label }) => <Route key={path} path={path} element={rolePage(role, path, label)} />)}
      {['admin', 'coach'].includes(role) && <>
        <Route path="extracurriculars/create" element={<ExtracurricularFormPage mode="create" role={role} />} />
        <Route path="extracurriculars/:id/edit" element={<ExtracurricularFormPage mode="edit" role={role} />} />
      </>}
      {role === 'student' && <Route path="extracurriculars/:id" element={<StudentExtracurricularDetailPage />} />}
      <Route path="*" element={<NotFound />} />
    </Route>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      {roleRoutes('admin')}
      {roleRoutes('coach')}
      {roleRoutes('student')}
      {roleRoutes('principal')}
      <Route path="/404" element={<NotFound />} />
      <Route path="*" element={<Navigate to="/404" replace />} />
    </Routes>
  );
}
