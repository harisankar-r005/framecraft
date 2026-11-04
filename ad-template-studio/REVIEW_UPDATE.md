# Framecraft: ten-point review update

Completed locally before online publication, 4 November 2026.

| Review item | Implemented behavior | Verification |
|---|---|---|
| 1. Project reopening | Clear old media before opening another project; restore the correct attachments from saved sessions/packages. Imports become separate local projects. | Reopened packages containing clips, end-card video, music, voiceover, normal SFX and end-card SFX, then exported without reattaching. |
| 2. Export consistency/recovery | New fixed-30-fps H.264/AAC MP4 path, with codec/size checks. Browser recording remains an explicitly labeled variable-frame-rate fallback. Cancellation, timeouts and cleanup remain available. | A 2-second output contains exactly 60 evenly spaced video frames; MP4 audio is AAC. Tested precise cancellation and browser-recording fallback. |
| 3. Autosave/undo/projects | IndexedDB library saves settings, images and original attached media. New/copy/open projects. Session undo/redo up to 30 snapshots, with a memory budget. | Reload restored music, voiceover, custom timings and crops. Undo/redo restored timing; undo restored a removed voiceover and the project exported. |
| 4. Complete packages | Portable `.framecraft.zip` with editable manifest, images and original attached media. Missing attachments block complete packaging. JSON backups remain available. | Inspected ZIP contents and reopened both image and framed-video packages through the UI. All six media categories were present in the framed package. |
| 5. Scene timing | Separate image-template scene durations; total and timeline update. Framed videos retain per-scene trim/duration plus end-card duration. Effects and dedicated end-card sound use the edited timing. | 1,010 timing-map cases, edited 2-second project and trimmed 1.6-second video project exports. |
| 6. Crop/position | Per-image zoom and horizontal/vertical position for results, originals, partner, end-card image and framed circular portraits. | Geometry tests; crop metadata survives package and reload; stage and export share the drawing function. |
| 7. Brands/batches | Named brand presets for logo/text/colors/watermark. Batch selected sizes and up to 20 image/scene-order variations per size, with optional hook list. ZIP delivery; original edit restored. | Saved/applied a brand; exported a four-video portrait/square batch plus landscape; inspected dimensions and 30 fps. Tested batch cancellation and original-edit restoration. |
| 8. Template controls | Step 3 hides irrelevant image/video/original controls; step 6 remains contextual. Framed end-card duration appears for framed videos. | Verified image controls hidden and clip controls visible in framed mode. Missing-asset navigation now validates the selected template. |
| 9. Safe areas | Conservative preview-only guide presets for vertical, square and landscape ads. | Exported with guides on/off: decoded first-frame MD5 hashes matched. Guide bounds tested. These are estimates, not official platform guarantees. |
| 10. Audio finishing | Separate voiceover, timing/offset/length/volume, music/voice fades and adjustable music ducking. Same graph used for preview, browser recording and offline mixing. | Decoded exported audio: voice tone present; music during voiceover measured 0.249 of its normal amplitude for a selected 25% ducking level. Fade/duck/recovery unit checks pass. |

The supplied multicolor logo now appears in the editor header and browser favicon. Existing fonts and encoder/ZIP dependencies are bundled locally, with license notices, for offline use.

## Where to find things

- Local app: `dist/index.html`
- Portable app: `dist.zip` (extract and open `dist/index.html`; keep the whole folder)
- Updated user guide: `dist/guide.html` (also linked in step 9)
- Smoke checks: `node tests/loading-smoke.cjs`
- New regression checks: `node tests/studio-regression.cjs`

## Practical limits

- Precise export requires browser H.264/AAC encoding support at the selected dimensions. It does not silently downgrade. Browser recording is the compatibility fallback and has a variable frame rate.
- Autosaves, project libraries and brand presets stay on this browser/origin. They do not sync between local and online copies or between colleagues. Use complete packages to transfer work.
- JSON backups exclude original video/audio. Complete packages have a 1 GB limit; batch ZIPs have a 512 MB limit and preserve completed files as a partial batch when interrupted.
- Captions and manually timed SFX keep absolute times when scene lengths change. The dedicated end-card SFX stays anchored to the end card.
- Safe guides are conservative estimates. Verify final placement with the intended ad platform.
- Live tests used short synthetic media over local HTTP. Long 4K projects and every browser/operating system have not been stress-tested. Existing automated rendering checks cover the templates, preset/custom dimensions, loaders and end-card combinations.
- The earlier PDF manual predates this update; the HTML guide is the current manual.


## UI readability update — 4 November 2026
- Open Sans interface with Arial fallback; Open Sans added to video text/font choices. Existing saved font selections remain supported.
- Main labels are 14 px and inputs 15 px; helper text and template descriptions are larger with stronger contrast.
- Scene labels no longer shrink according to duration. Equal-size cards show number, duration and name, and highlight the selected scene. A separate strip preserves duration proportions.
- Framed-video scene navigation uses the same readable cards. Playback and guides share a compact toolbar.
- Fixed malformed CSS left over from the old font import, and versioned changed assets to avoid stale browser files.
- Browser verified five readable scene cards, loaded Open Sans, 14/15 px field text and scene-jump/highlight behavior; existing rendering and timing regressions passed.
