# Framecraft — complete colleague handoff

Prepared 4 November 2026.

## Start here

1. Extract the entire ZIP to a folder on your computer.
2. Read `PROJECT_HANDOFF.md` for the history, completed work and known limits.
3. Read `ad-template-studio/REVIEW_UPDATE.md` for the latest feature and UI changes.
4. For development, open the `ad-template-studio` folder in your own Codex/ChatGPT local project.
5. Give your agent this instruction:

> Continue developing Framecraft. Read the parent folder's PROJECT_HANDOFF.md and the app's REVIEW_UPDATE.md first, inspect the existing source code, and preserve current features. Work locally first. Publish a separate site under my account only when I request it. Do not reuse the original owner's hosting identity from historical notes.

## What is included

- `ad-template-studio/dist/`: complete editable HTML/CSS/JavaScript app, logo, bundled fonts, export/ZIP libraries and licenses. Open `index.html` in a compatible browser for offline use. The current manual is `guide.html`.
- `ad-template-studio/extension-src/`: Chrome extension source, icons, manifest and installation/privacy/testing notes. The manifest's public key is an extension identity, not a private credential.
- `ad-template-studio/tools/`: extension build script.
- `ad-template-studio/tests/`: automated rendering, timing and extension-package checks.
- `framecraft-chrome-extension/`: ready-to-load offline Chrome extension, version 1.0.1. Follow its `INSTALL.md`; choose this folder, which contains `manifest.json`, in Chrome's Load unpacked dialog.
- `videos/`: original downloaded reference videos, grouped into sets of ten, plus batch results.
- `video-analysis/`: reference contact sheets and animation previews/data.
- Download scripts, source lists, progress/results JSON and `VIDEO_DOWNLOAD_HANDOFF.md` for the earlier reference-video work.
- `output/pdf/Framecraft_User_Manual.pdf`: historical PDF manual. It predates the latest features; use `ad-template-studio/dist/guide.html` for current instructions.
- `FILE_MANIFEST.json`: relative filenames, sizes and SHA-256 hashes for checking the package contents.

## Using the Chrome extension

In desktop Chrome, open `chrome://extensions`, enable Developer mode, click Load unpacked, and select `framecraft-chrome-extension`. Pin its toolbar icon to launch it later. The app and fonts are packaged locally; no local web server is required after installation. Browser codec capabilities still determine available export methods.

The extension was checked for package/launcher correctness and loaded under an identical restrictive content security policy on local HTTP. It has not been installed or media-export tested in the original user's Chrome profile: the browser declined access to the synthetic upload used for that test. See its `TEST_REPORT.md` for the precise verification scope.

## Developer commands

From this extracted package's root:

```text
node ad-template-studio/tests/loading-smoke.cjs
node ad-template-studio/tests/studio-regression.cjs
node ad-template-studio/tools/build-extension.cjs
node ad-template-studio/tests/extension-package.cjs
```

The app itself is buildless. Node is only needed for developer checks and rebuilding the extension. Keep the existing public identity key in `extension-src/manifest.json` when updating that extension.

## Bring saved editor projects across

Saved editing projects and brand presets live in the original browser's local storage/IndexedDB. They are not files in this package. To transfer a saved editing project, its owner must download a Complete project package from the editor; the colleague then imports that ZIP using Open project. This preserves original clips, music, voiceover and SFX. JSON backups omit those media files.

## Chat history and online access

`PROJECT_HANDOFF.md` is a detailed handoff summary, not a verbatim chat export. This ZIP does not transfer the original ChatGPT account, private conversation history or permission to edit the original hosted site. Files outside the original project workspace and browser-only saved projects are not silently collected.

Git history, `.openai` deployment configuration, temporary analysis tools/caches, QA scratch files and redundant ZIP/build archives are excluded. Historical handoff notes may mention the original website and local file paths as context; those paths should be adapted to your computer.
