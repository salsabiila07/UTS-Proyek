# AGENTS.md — SIM Ekstrakurikuler SD N 2 Giriharjo

## Mission
Implement the project strictly from the approved SOT with minimal token use and explicit approval gates.

## Source of Truth
Before every implementation step read:
1. `SOT/PRD.md` — scope/requirements.
2. `SOT/UI-GUIDELINE.md` — visual/UX contract.
3. `SOT/IMPLEMENTATION_PLAN.md` — architecture/order.

Priority on conflict: PRD scope > UI guideline for presentation > implementation plan for execution. If ambiguity would require a major assumption, STOP and ask the user.

## Hard Rules
- Do not add features outside PRD.
- Do not redesign the approved cream/light-brown SaaS direction.
- Use React + Vite frontend and Node.js backend.
- Use JavaScript unless the user explicitly changes the stack.
- Use React Router and Lucide React.
- Prefer native CSS/reusable components and minimal dependencies.
- Keep API/data access out of presentation components.
- Enforce role authorization beyond hidden navigation.
- Preserve responsive/accessibility/error/loading/empty states.
- Never silently change SOT files.

## Execution Protocol
Work on exactly one numbered implementation step at a time.

For each step:
1. PLAN: inspect existing repo and state the smallest implementation plan.
2. IMPLEMENT: edit only files needed for the active step.
3. VERIFY: run relevant build/lint/tests/manual checks available in the repo.
4. REPORT: concise result.
5. WAIT: do not start the next step without user approval.

Required completion report:
```text
STEP COMPLETED: <number/name>
FILES CHANGED: <concise list>
RESULT: <what now works>
TEST: <commands/checks + result>
ISSUES: <none or concise blockers>
NEXT: <next numbered step>
WAITING FOR USER APPROVAL
```

## Token Discipline
Do not restate requirements, dump full files, narrate obvious edits, or generate extra documentation. Prefer concise diffs/actions and verification results.

## Scope Change
If the user asks for a new feature or visual direction outside SOT, flag it as a proposed SOT change before implementation and wait for approval.
