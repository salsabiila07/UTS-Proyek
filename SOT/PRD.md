# PRD — SIM Ekstrakurikuler SD N 2 Giriharjo

## Product Overview
Web-based management information system for managing extracurricular activities at SD N 2 Giriharjo.

**Frontend:** React + Vite  
**Backend runtime:** Node.js  
**UI:** Modern Futuristic Educational SaaS  
**Brand:** Cream + Light Brown  
**Target:** Desktop-first, responsive tablet/mobile.

## Goals
- Centralize extracurricular management.
- Enable online student registration.
- Digitize attendance and schedules.
- Record student assessment/development.
- Provide monitoring dashboards and PDF/print reports.

## Roles
### Admin
Dashboard; CRUD extracurriculars; registration approval; schedule management; attendance/assessment monitoring; reports and PDF export.

### Pembina
View a dashboard of assigned participants and schedules; view participants; manage extracurricular data and schedules for assigned extracurriculars; record attendance; assess skills, discipline, activity, and development.

### Siswa
View a student dashboard with registration status and schedules; browse extracurriculars; register with a required name and free-text class; view registration status, schedules, and personal attendance history.

### Kepala Sekolah
View a dashboard summarizing reports; view reports and the extracurricular timetable; print/export reports.

## Core Features
1. **Landing Page** — navbar, hero, system overview with benefits and an attributed testimonial, extracurricular preview, CTA login, footer.
2. **Login** — username/email, password, role-based redirect.
3. **Admin Dashboard** — total students, extracurriculars, coaches, applicants, active activities; statistics, upcoming schedules, recent activity.
4. **Extracurricular Management** — CRUD name, description, coach, day/time, location, quota, status, image/icon. Initial examples: Tari, Pramuka, IT, Bahasa Inggris, BTQ.
5. **Registration** — student browse/detail/register/status; each registration requires the student's name and free-text class, visible to admin for review; admin accept/reject. Status: pending/accepted/rejected.
6. **Attendance** — coach records Hadir/Izin/Sakit/Alfa and history.
7. **Schedule** — day, date, time, location, coach, status/change information. All roles can view the weekly timetable for every extracurricular, including class-specific time slots; admin and coaches manage schedules according to their role, while the principal has read-only access.
8. **Assessment & Development** — skill, discipline, activity, development notes by period.
9. **Reports** — participants, registrations, attendance, assessments, activity, extracurricular recap; filters; print/export PDF.

## Information Architecture
**Public:** Landing, Login.  
**Admin:** Dashboard, Ekstrakurikuler, Pendaftaran, Jadwal, Absensi, Penilaian, Laporan.  
**Pembina:** Dashboard, Peserta, Ekstrakurikuler, Jadwal, Absensi, Penilaian.  
**Siswa:** Dashboard, Daftar/Detail Ekskul, Pendaftaran Saya, Jadwal, Absensi.  
**Kepala Sekolah:** Dashboard, Jadwal, Laporan.

## Functional Requirements
FR-01 landing page; FR-02 authentication; FR-03 role access; FR-04 admin dashboard; FR-05 extracurricular CRUD; FR-06 student registration; FR-07 admin registration processing; FR-08 registration status; FR-09 admin schedule management; FR-10 coach schedule view and management for assigned extracurriculars; FR-11 student schedule; FR-12 coach attendance; FR-13 attendance history; FR-14 assessment; FR-15 development notes; FR-16 admin assessment monitoring; FR-17 reports; FR-18 principal reports; FR-19 print; FR-20 PDF export.
FR-21 student dashboard showing the student's registration statuses and schedules; FR-22 coach dashboard showing assigned participants and schedules; FR-23 principal dashboard summarizing report data; FR-24 require and retain student name and free-text class on each registration; FR-25 principal can view the extracurricular timetable in read-only mode.

FR-26 coaches can create extracurriculars assigned to themselves and manage only extracurriculars assigned to them; FR-27 students can view their own attendance history, while attendance entry remains restricted to coaches.

## Non-functional Requirements
Responsive; simple usability; lightweight performance; consistent design system; accessible labels, contrast, focus states, keyboard support and action feedback.

## Technical Direction
React + Vite frontend and Node.js backend. Frontend uses reusable components and feature-based separation. Detailed dependencies, routing, data layer and execution order are governed by IMPLEMENTATION_PLAN.md.

## Scope Guard
No major feature outside: Landing, Login, Dashboard, Extracurricular Management, Registration, Attendance, Schedule, Assessment/Development, Reports. Any addition requires SOT change and user approval.

## Definition of Done
Landing/login/role access/dashboard/CRUD/registration/attendance/schedule/assessment/reports/PDF-print work; UI responsive; implementation follows UI-GUIDELINE and IMPLEMENTATION_PLAN.
