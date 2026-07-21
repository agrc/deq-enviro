# Cloud Run Service

## Development

To get started, open this project in VSCode and run "Dev Containers: Open Folder in Container" from the command palette.

For emulator-only development, add these values to `cloudrun/.env`:

```dotenv
BUCKET=local-downloads
RUN_WORKER_LOCALLY=1
```

With `RUN_WORKER_LOCALLY=1`, `/create_job` runs the worker in a background thread and does not call Cloud Run. The default development container uses the Firestore and Storage emulators, so this mode keeps the complete workflow local. The worker still performs the real export and needs its normal ArcGIS credentials and network access.

1. Start the firebase emulators in a separate terminal at the root of this project: `pnpm run dev:firebase`
1. Run the dev front end by executing `pnpm run dev:vite` also in a separate terminal at the root of this project
1. Run and debug the "Python: Flask" launch task from VSCode

Open the dev site at [http://localhost:5173](http://localhost:5173) and initiate a download to test the service.
