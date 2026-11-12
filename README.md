# Framecraft Ad Studio

A Windows desktop editor for making app promotional videos from your own finished images and clips.

## Start using it

**Windows desktop app:** download [Framecraft-Setup-1.0.1.exe](desktop/release/Framecraft-Setup-1.0.1.exe) and run the installer. For development, use `desktop` to launch or rebuild the Electron app.

All runtime scripts, fonts and media-container helpers are bundled. Video export capabilities depend on the bundled Electron/Chromium codec support.

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
| `ad-template-studio/tests` | Rendering and timing checks |
| `desktop` | Electron wrapper, packaging scripts and Windows installer |
| `videos` | 102 downloaded reference video files in ten set folders, plus batch metadata |
| `video-analysis` | Contact sheets and animation/reference previews |
| `output/pdf` | Earlier PDF manual; use the HTML guide for current instructions |

Reference ads are included as study material from the original project. Third-party media and bundled dependencies retain their respective rights and licenses. See [software/font notices](ad-template-studio/dist/THIRD_PARTY.txt).

## Development checks

From the repository root, with Node available:

```sh
node ad-template-studio/tests/loading-smoke.cjs
node ad-template-studio/tests/studio-regression.cjs
cd desktop
pnpm run dist
```

## Saved projects and sharing

Editing projects and brand presets are saved locally in the desktop app. They are not automatically synchronized or committed to this repository. Transfer editing work using **Complete project package → Open project**. JSON backups omit original video/audio attachments.

## Guides and verification

- [Current user guide](ad-template-studio/dist/guide.html) — open the local HTML file in a browser.
- [Feature update and test report](ad-template-studio/REVIEW_UPDATE.md).
- [Reference-download handoff](VIDEO_DOWNLOAD_HANDOFF.md).
