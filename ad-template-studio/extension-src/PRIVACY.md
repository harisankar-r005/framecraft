# Framecraft Offline privacy

The extension packages the editor and all runtime assets locally. It has no account system, telemetry, remote code, remote fonts or website access permissions. Its content security policy disables network connections from the editor (`connect-src 'none'`).

You choose image/video/audio files using the browser’s file picker. Projects and original media are saved locally using IndexedDB in this extension’s origin. Exported videos and packages use the browser’s normal downloads. The toolbar/service worker only opens the extension’s own editor tab.

The sole declared permission is `unlimitedStorage`, used for locally saved video/audio projects. It does not provide website, browsing-history, camera or microphone access.

Nothing in the extension automatically uploads your projects. Files you deliberately share outside it are under your control. Complete packages contain your original attached media; share them with the intended colleagues.

This local package does not automatically synchronize with the hosted website or another Chrome profile. Maintain separate project-package backups.
