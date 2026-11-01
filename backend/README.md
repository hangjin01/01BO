# 01BO backend source snapshot

Express / Oracle API source maintained with the mobile frontend. This snapshot comes from the local `server-work/backend` working copy; server credentials and database contents are not included.

Install dependencies with `npm ci`, provide the server environment, then run `npm start`. `DB_PASSWORD` is required. Keep OAuth secrets, token encryption keys and model API keys in private server configuration. Never put them in Vite variables.

The existing AWS deployment runs this backend separately; adding this directory does not deploy or restart the service. Environment and integration tests must be run against an explicitly configured test instance. Offline DB readiness checks: `node tests/db-readiness.js`.
