# IMPLEMENTATION_PLAN — SIM Ekstrakurikuler SD N 2 Giriharjo

## Stack & Principles
React + Vite frontend, Node.js backend, JavaScript, React Router, Lucide React. Modular, reusable, responsive, maintainable, role-based, minimal dependencies. Order: Foundation → Design System → Public Pages → Auth → Shell → Core Features → Reports → QA.

## Target Structure
```text
project-root/
├── AGENTS.md
├── EXECUTION_PROMPT.md
├── SOT/{PRD.md,UI-GUIDELINE.md,IMPLEMENTATION_PLAN.md}
├── frontend/src/{assets,components/{ui,layout,shared},features,layouts,pages,routes,services,hooks,utils,data,styles}
└── backend/src/{controllers,routes,services,middleware,models,utils,config,server.js}
```
Do not create empty abstractions solely to match structure.

## Routing
Public `/`, `/login`.
Admin `/admin/dashboard`, `/admin/extracurriculars`, `/admin/extracurriculars/create`, `/admin/extracurriculars/:id/edit`, `/admin/registrations`, `/admin/schedules`, `/admin/attendance`, `/admin/assessments`, `/admin/reports`.
Coach `/coach/dashboard`, `/coach/students`, `/coach/extracurriculars`, `/coach/extracurriculars/create`, `/coach/extracurriculars/:id/edit`, `/coach/schedules`, `/coach/attendance`, `/coach/assessments`.
Student `/student/dashboard`, `/student/extracurriculars`, `/student/extracurriculars/:id`, `/student/registrations`, `/student/schedules`, `/student/attendance`.
Principal `/principal/dashboard`, `/principal/schedules`, `/principal/reports`. Include protected/role routes and not-found.

## Execution Steps
1. **Foundation** — initialize frontend/backend, routing, global CSS/tokens, folder structure, scripts. Verify both run and no fatal errors.
2. **Design System** — reusable components and states per UI guideline; responsive and keyboard focus.
3. **Landing Page** — navbar, hero, benefits, attributed testimonial, extracurricular preview, CTA, footer; responsive; login CTA works.
4. **Login/Auth** — validation, password visibility, loading/error/success, four-role redirect, protected routes.
5. **Application Shell** — role-aware sidebar/topbar, responsive drawer/collapse, active route, logout.
6. **Admin Dashboard** — five stats, charts/visual summaries, upcoming schedules, activity; mock-first service abstraction.
7. **Extracurricular Management** — list/search/filter/create/edit/delete/detail; confirmation modal; validation.
8. **Registration** — student browse/detail/register/status; admin filter/detail/accept/reject.
9. **Schedule** — admin CRUD; coach CRUD limited to assigned extracurriculars; student role-scoped read view; changed schedule indicator.
10. **Attendance** — coach select activity/date, mark status, notes/save/history; admin monitoring.
11. **Assessment** — coach assessment/development entry; filter by activity/period; admin monitoring.
12. **Reports** — participant/registration/attendance/assessment/activity/recap filters, preview, print, PDF.
13. **Responsive QA**.
14. **Accessibility QA**.
15. **Integration QA**.
16. **Role Dashboards & Registration Identity** — student dashboard for own registration statuses/schedules; coach dashboard for assigned participants/schedules; principal dashboard for report summaries; required name/class fields on each student registration, visible to admin. Update approved SOT contracts and verify role access and data flow.
17. **Update Default Extracurricular Offerings** — seed and public previews contain only Tari, Pramuka, IT, Bahasa Inggris, and BTQ; remove sample schedules for retired activities and verify references.
18. **All-Role Extracurricular Timetable** — show the weekly class schedules for all five approved activities in every role's Jadwal menu; keep role-specific schedule management and provide the principal with read-only access.
19. **Coach Extracurricular Management & Student Attendance History** — coaches create extracurriculars assigned to themselves and manage only their assigned activities; students view only their own attendance history. Enforce role and ownership in routes/API and verify data flow.

## Initial Data Contracts
**User:** id, name, username/email, password, role (`admin|coach|student|principal`), status.  
**Extracurricular:** id, name, description, coachId, day, startTime, endTime, location, quota, status, image.  
**Registration:** id, studentId, studentName, studentClass, extracurricularId, registrationDate, status (`pending|accepted|rejected`). Student name and free-text class are required on each registration.
**Schedule:** id, extracurricularId, date, day, startTime, endTime, location, coachId, status, changeInformation.  
**Attendance:** id, studentId, extracurricularId, scheduleId, date, status (`present|permission|sick|absent`), notes.  
**Assessment:** id, studentId, extracurricularId, period, skillScore, disciplineScore, activityScore, developmentNotes.

## API Direction
`/api/auth`, `/api/users`, `/api/dashboard`, `/api/extracurriculars`, `/api/registrations`, `/api/schedules`, `/api/attendance`, `/api/assessments`, `/api/reports`. GET read, POST create, PUT/PATCH update, DELETE delete. Responses: `{ success, message, data }`; errors `{ success:false, message, errors:[] }`.

## Frontend Data Layer
Use services: authService, dashboardService, extracurricularService, registrationService, scheduleService, attendanceService, assessmentService, reportService. UI must not scatter API calls. Mock data may be used first but must be replaceable by services.

## Role Contract
Admin manages extracurriculars/registrations/schedules, monitors attendance/assessment, reports. Coach dashboard shows assigned participants and schedules; coach views assigned participants, manages schedules only for assigned extracurriculars, and manages attendance/assessments. Student dashboard shows own registration status/schedules; student browses/registers/views status/schedule. Principal dashboard summarizes report data; principal views the all-activity timetable read-only, reports, and print/export. Enforce on navigation, routes and backend—not navigation alone.

Additional approved role rules: coaches may create activities assigned to their own account and may manage only activities assigned to them. Students may read only their own attendance history; recording attendance remains coach-only.

## Quality Rules
Required-field/format/length/date/time/quota/status validation; inline field errors. Student registration requires a 2–80 character name and non-empty free-text class up to 30 characters. Every data page handles loading/success/empty/error. Use semantic HTML, visible focus and accessible controls. Keep dependencies minimal. No stack traces to users. Report print CSS hides app chrome and includes school identity/title/period/data/generated date.

## Approval Gate
Each major step: `PLAN → IMPLEMENT → VERIFY → REPORT → WAIT`. After a step, stop and report only:

```text
STEP COMPLETED
Files changed: ...
Verification: ...
Issues: ...
Next proposed step: ...
WAITING FOR USER APPROVAL
```
Continue only after explicit `ACC`/instruction.

## Token Efficiency
Do not repeat SOT, explain code line-by-line, output full files unnecessarily, create unsolicited docs or add dependencies without reason. Progress format: STEP / FILES CHANGED / RESULT / TEST / NEXT.

## Scope Lock
Do not add payment, chat, AI assistant, push notification, e-learning, academic grading, payroll, inventory, dark mode, native mobile app or other academic modules without explicit PRD change.
