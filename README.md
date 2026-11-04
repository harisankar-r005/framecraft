# Framecraft Ad Studio

A browser-based editor for making app promotional videos from your own finished images and clips. Includes a standalone offline app and an unpacked Chrome extension.

## Start using it

**Offline app:** download/clone this repository and open `ad-template-studio/dist/index.html` in a compatible desktop browser. Keep its assets and vendor folders together. You can also serve that folder locally.

**Chrome extension:** open `chrome://extensions`, enable Developer mode, click **Load unpacked**, and select the `framecraft-chrome-extension` folder containing `manifest.json`. Pin the toolbar icon to open the editor in its own tab. See [extension installation instructions](framecraft-chrome-extension/INSTALL.md).

All runtime scripts, fonts and media-container helpers are bundled. The extension uses a restrictive offline policy and requests only local large-project storage permission. Video export capabilities depend on browser codec support.

## Features

- Six reusable ad templates, including framed video scenes, collage, before/after and result showcase.
- Portrait, square, landscape and custom output dimensions.
- Editable scene timing, image zoom/crop/position, video trimming and full-screen preview.
- Separate main-text, upload-heading and watermark styling.
- Loading effects, gradients, transitions and independent end-card effects/particles.
- Music, voiceover, SFX, fades, music ducking and manually timed or imported SRT captions.
- Fixed-30-fps MP4 export where H.264/AAC encoding is supported; variable-frame-rate browser recording fallback.
- Local autosave with media, named projects, session undo/redo, complete project ZIP packages and brand presets.
- Batch export across preset dimensions, image/scene-order variations and optional hooks.
- Conservative preview-only safe-area guides.

The editor assembles supplied assets. It does not generate new people, images, poses or voice recordings.

## Continue development with your colleague

1. Read [START_HERE.md](START_HERE.md).
2. Read [PROJECT_HANDOFF.md](PROJECT_HANDOFF.md) for the development history and [REVIEW_UPDATE.md](ad-template-studio/REVIEW_UPDATE.md) for recent changes and verification limits.
3. Open `ad-template-studio` as a local project in Codex and ask it to inspect the code before changing it.
4. Work locally first. Configure a separate hosted site under your own account when requested. Historical notes contain the original site's identifiers; deployment credentials and `.openai` configuration are not included here.

The handoff notes summarize the original conversation; this repository does not contain the private ChatGPT conversation or transfer access to the original account/site.

## Project structure

| Folder | Contents |
|---|---|
| `ad-template-studio/dist` | Standalone editor source and runtime assets |
| `ad-template-studio/extension-src` | Extension launcher, manifest, icons and docs |
| `ad-template-studio/tools` | Extension build script |
| `ad-template-studio/tests` | Rendering, timing and extension-package checks |
| `framecraft-chrome-extension` | Ready-to-load extension, version 1.0.1 |
| `videos` | 102 downloaded reference video files in ten set folders, plus batch metadata |
| `video-analysis` | Contact sheets and animation/reference previews |
| `output/pdf` | Earlier PDF manual; use the HTML guide for current instructions |

Reference ads are included as study material from the original project. Third-party media and bundled dependencies retain their respective rights and licenses. See [software/font notices](ad-template-studio/dist/THIRD_PARTY.txt).

## Development checks

From the repository root, with Node available:

```sh
node ad-template-studio/tests/loading-smoke.cjs
node ad-template-studio/tests/studio-regression.cjs
node ad-template-studio/tools/build-extension.cjs
node ad-template-studio/tests/extension-package.cjs
```

The editor is buildless. Preserve the public identity key in `ad-template-studio/extension-src/manifest.json` when updating the extension, so its ID remains stable.

## Saved projects and sharing

Editing projects and brand presets are saved in the browser/extension's own local storage. They are not automatically synchronized or committed to this repository. Transfer editing work using **Complete project package → Open project**. JSON backups omit original video/audio attachments.

## Guides and verification

- [Current user guide](ad-template-studio/dist/guide.html) — open the local HTML file in a browser.
- [Feature update and test report](ad-template-studio/REVIEW_UPDATE.md).
- [Extension privacy information](framecraft-chrome-extension/PRIVACY.md).
- [Extension test limitations](framecraft-chrome-extension/TEST_REPORT.md).
- [Reference-download handoff](VIDEO_DOWNLOAD_HANDOFF.md).

The installed-extension context still needs a media import/export test. The packaged editor loaded under its offline policy, but a browser permission decline prevented the original synthetic-file upload test. No workaround was attempted.
