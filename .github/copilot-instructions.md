# Copilot Cloud Agent Onboarding

Use this document as the primary source of truth for working in this repository. Trust these instructions first, and only search the codebase when information here is incomplete or proven incorrect.

## Keep This File Updated

- Always update this file when a change affects setup, bootstrap, build, test, lint, run, CI workflows, runtime/tool versions, environment requirements, or project layout.
- If you discover a command failure, warning, new prerequisite, or workaround while implementing a change, add or revise the relevant section here in the same PR.
- Before finishing work, quickly verify whether your code changes made any part of this document stale and patch it if needed.

## Repository Summary

- `deq-enviro` is the Utah DEQ Environmental Interactive Map.
- It is a multi-runtime repo with:
  - React + Vite frontend in `src/`.
  - Firebase Functions (Node) in `functions/`.
  - Python Cloud Run download service in `cloudrun/`.
  - Legacy data ETL utilities in `forklift/` and map artifacts in `maps/`.
- Primary languages: JavaScript/JSX, Python, YAML, shell.
- Package manager: `pnpm` workspaces.
- Deployment targets: Firebase Hosting/Functions + Google Cloud Run/Eventarc.

## Toolchain And Runtime Requirements

- Always use Node 22 for consistent behavior across workspace packages.
  - Evidence: `functions/package.json` has `"engines": { "node": "22" }`.
  - Running root install on Node 24 worked but emitted unsupported engine warnings for `functions`.
- Use `pnpm` 11.x (CI uses `pnpm/action-setup@v5` with `version: 11`).
- Docker is required for Cloud Run local dev scripts.
- Firebase CLI is run via `pnpm exec firebase` from project scripts.
- For scripts touching remote config, you need:
  - Root `.env` populated from `.env.template`.
  - GCP credentials available to Google Auth (for remote config API access).

## Recommended Agent Workflow (Fast + CI-aligned)

Always follow this sequence before opening a PR:

1. `pnpm install --frozen-lockfile`
2. `cd functions && pnpm install --frozen-lockfile && cd ..`
3. `pnpm test --run`
4. `pnpm run lint`
5. `pnpm run build`

If your change touches Storybook stories or remote config behavior, also run:

6. `pnpm run build:stage`

If touching Cloud Run download code, additionally validate:

7. `pnpm run build:cloudrun`

## CI/Validation Pipelines To Replicate

- PR workflow: `.github/workflows/pull_request.yml`
  - Installs deps (root + `functions/`).
  - Runs unit tests.
  - Runs lint (`eslint` + `tsc`).
  - Then runs preview deploy job.
- Release workflow: `.github/workflows/release.yml`
  - Deploys Firebase site and Cloud Run service.
  - Updates Eventarc trigger.

Minimum confidence checks for most code changes:

- `pnpm test --run`
- `pnpm run lint`
- `pnpm run build`

## High-Value Project Layout

- Root app entry and composition:
  - `src/main.jsx` (React root, Firebase app provider, query client).
  - `src/App.jsx` (main layout and providers).
- Core app configuration:
  - `src/app-config.js` (map symbols, service URLs, app constants).
  - `src/remote_config_defaults.json` (generated defaults consumed by app and Storybook).
- Frontend build and test config:
  - `vite.config.js` (Vite + Vitest config, ArcGIS aliasing, dedupe settings).
  - `eslint.config.mjs`.
  - `tailwind.config.js`.
  - `tsconfig*.json`.
- Firebase and functions:
  - `firebase.json` (hosting rewrites, emulator ports, rules/indexes pointers).
  - `functions/index.js` (exported callable/request handlers).
  - `functions/configs.js`, `functions/search.js`, shared code in `functions/common/`.
- Cloud Run service:
  - `cloudrun/src/download/main.py` (Flask endpoints: `/create_job`, `/process_job`, `/download/<id>/data.zip`).
  - `cloudrun/Dockerfile`, `cloudrun/setup.py`, `cloudrun/pyproject.toml`.
- Operational scripts:
  - `scripts/start-emulators.sh` (filters noisy emulator stderr lines).
  - `build-scripts/updateRemoteConfigDefaults.js` (remote defaults sync).

## Root Structure Quick Reference

Most important top-level paths for agent edits:

- `src/`
- `functions/`
- `cloudrun/`
- `.github/workflows/`
- `build-scripts/`
- `scripts/`
- `firebase.json`
- `package.json`
- `pnpm-workspace.yaml`
- `README.md`

## Known Pitfalls

- Do not rely on `pnpm run test` in local automation; use `pnpm test --run`.
- Do not assume emulator ports are free (8080, 9199, etc.).
- Do not run `dev:cloudrun` unless port 5010 is available and image `download` exists.
- Do not run remote-config sync scripts without `.env` and valid auth context.
- Keep changes scoped; this repository may be in a dirty working tree during active development.
