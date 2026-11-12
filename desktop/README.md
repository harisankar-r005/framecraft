# Framecraft desktop build

This Electron wrapper packages the existing editor without changing its UI.

```powershell
cd desktop
pnpm install
pnpm start
pnpm run dist
```

The installer is written to `desktop/release/`. The build copies `../ad-template-studio/dist` into generated `desktop/app`; edit the source editor, never that generated folder.
