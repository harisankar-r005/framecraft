# Framecraft Advanced

This is a source fork of [OpenFilm](https://github.com/openfilm/openfilm), pinned to the commit in `FRAMECRAFT_UPSTREAM.json`. The timeline, direct manipulation, canvas, media library, AI chat, project history and FFmpeg rendering are upstream code. Local changes are branding, isolated app state, packaging and access to the original Framecraft editor.

Use Node 22.18+ and the pinned pnpm version:

```powershell
cd advanced
npx --yes pnpm@9.15.9 install --frozen-lockfile
npx --yes pnpm@9.15.9 run dev:desktop
```

Open **File → Framecraft template editor** (Ctrl+Shift+E) to use the original six templates. On Windows, press Alt to reveal the native menu. The original JSON/ZIP projects open there. Advanced projects use OpenFilm's `film.html` format; this fork does not convert existing template projects into separate timeline layers. The template window has its own local storage; transfer an existing edit using its Complete project package.

The advanced editor uses its own Framecraft data and project folders. It does not replace an installed OpenFilm app, share its login settings, or register an official OpenFilm update feed. The `openfilm` protocol/package names are retained internally for compatibility and upstream agent tools. Connect your own coding agent or service key in Settings to enable AI features. No keys are bundled. Source runs download Chromium and FFmpeg when needed; release builds bundle those runtimes.

Windows installer:

```powershell
npx --yes pnpm@9.15.9 --filter @openfilm/desktop release --platform=win --arch=x64
```

Build output is under `apps/desktop/.release/win-x64/out`. The release includes the legacy editor and upstream licenses. No release is published automatically. Keep OpenFilm's MIT notice and each bundled dependency's notices when redistributing. Consult `LICENSE`, `THIRD_PARTY_NOTICES.md`, and the bundled runtime notices.

Validation: `pnpm build`, `pnpm typecheck`, and `node --test tests/framecraft.test.mjs apps/desktop/src/menu.test.mjs apps/desktop/src/flavor.test.mjs`. Core timeline, manual-edit preservation and checkpoint tests live in `packages/openfilm`. `tests/framecraft-smoke.cjs` additionally launches an isolated desktop instance and exports a 60-frame H.264/AAC MP4; it requires Chromium and the FFmpeg runtime in `.dev/runtime/ffmpeg`. AI chat is included from upstream; paid generation needs a connected account and is not exercised by these tests.

To update the upstream code, compare against the pinned commit and preserve the Framecraft changes recorded in `FRAMECRAFT_UPSTREAM.json`. Do not overwrite this directory from `main` without reviewing that diff.
