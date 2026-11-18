# Framecraft desktop build

For the OpenFilm-based advanced editor, first follow [Framecraft Advanced setup](../advanced/FRAMECRAFT.md). After its dependencies are installed, `pnpm run advanced` launches it. A built advanced editor is also accessible from the template editor's **Advanced editor** button.

This Electron wrapper packages the existing editor without changing its UI.

```powershell
cd desktop
pnpm install
pnpm start
pnpm run dist
```

The installer is written to `desktop/release/`. The build copies `../ad-template-studio/dist` into generated `desktop/app`; edit the source editor, never that generated folder.
