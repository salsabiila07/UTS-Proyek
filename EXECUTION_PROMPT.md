# Initial Codex Execution Prompt

You are implementing **SIM Ekstrakurikuler SD N 2 Giriharjo**.

First read `AGENTS.md`, then read all files in `SOT/` in this order:
1. `SOT/PRD.md`
2. `SOT/UI-GUIDELINE.md`
3. `SOT/IMPLEMENTATION_PLAN.md`

Treat them as the approved source of truth. Do not expand scope or redesign the product.

Start **only STEP 01 — Project Foundation** from IMPLEMENTATION_PLAN.md.

For this first execution:
- Inspect the current repository before changing anything.
- Preserve useful existing files where compatible.
- Initialize/configure the React + Vite frontend and Node.js backend required by the SOT.
- Establish the minimum folder structure, routing foundation, global design-token CSS, and run scripts needed for later steps.
- Do NOT implement the design-system component library, landing page, login UI, dashboard, or later business features yet.
- Do not add a database or choose an ORM unless already established by the repository or explicitly approved.
- Keep dependencies minimal.
- Verify the frontend/backend can run/build as applicable and fix errors introduced by this step.

When STEP 01 is complete, STOP. Respond only with the concise report format required by `AGENTS.md`, ending with `WAITING FOR USER APPROVAL`.

Do not begin STEP 02 until I reply with `ACC` or explicitly instruct you to continue.
