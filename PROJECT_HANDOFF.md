# App ad assets and Framecraft — colleague handoff

Updated: 3 November 2026

This document summarizes the work completed in the chat. It is a handoff, not a verbatim transcript. Share the project files along with this document; the Markdown file alone does not contain the videos or application.

## 1. Project purpose

The user plans to create approximately 10–20 promotional videos per day for their apps without installing video-editing software. We first downloaded reference ads, studied a couple-photo ad, and built a browser-based template editor called **Framecraft Ad Studio**.

The current priority is improving and testing reusable templates. The tool assembles prepared images into videos. It does **not** generate new people, outfits, poses, or AI photos. Those result images must be supplied separately.

## 2. What to share

Original workspace:

```text
C:\Users\haris\OneDrive\Documents\ChatGPT\APPs\App ad assets
```

For a colleague testing the editor, send the entire folder:

```text
ad-template-studio/dist/
  index.html
  app.js
  style.css
  effects.js
```

Keep all four files together. They are the latest editable application source and require no build step.

For a colleague continuing all work, also share:

```text
PROJECT_HANDOFF.md                  This document
VIDEO_DOWNLOAD_HANDOFF.md           Detailed download workflow and reference inventory notes
download_videos.py                  Downloader; requires Python and collected source JSON
video-ad-links.json                 Saved ordered inventory of ad-page links
video-sources.json                  Collected variation sources and statuses
download-results.json               Outcomes, duplicate references, file paths and hashes
download-progress.json              Last completed download checkpoint
videos/                            Downloaded MP4 files, separated into sets
ad-template-studio/dist/            Browser editor source
```

The `.video-analysis-tools` folder contains temporary libraries installed to inspect the reference video; colleagues do not need it to run the editor. Source repository metadata, generated deployment archives and `.git` are also unnecessary for local editor testing.

## 3. Run the editor on another computer

1. Copy `dist` onto the colleague's computer and extract it if sent as a ZIP.
2. Open `index.html` in a recent Chrome or Edge browser.
3. Keep `app.js` and `style.css` beside it. Refresh after replacing updated files.
4. Upload result images, select a template and output size, then edit the text and branding.
5. Preview, export, and inspect the downloaded video.

The local editor performs image handling and rendering in the browser. Internet is not required for its core local editing logic; Google Fonts is an external stylesheet and falls back to system fonts offline. A complete offline export test has **not** yet been performed. Browser recording support must be checked on the colleague's computer.

The hosted version is:

https://framecraft-ad-studio-haris.grandolm21.chatgpt.site

It is private to the owner's account. Sharing that link alone does not grant colleagues access. Use the local folder for their testing, or have the owner explicitly arrange hosted sharing. Do not make the hosted Site public without instruction.

## 4. Editor features implemented

### Five reusable templates

| Template | Structure |
| --- | --- |
| Couple collage | Pose/result collage, changing result groups, optional animated two-photo upload sequence, result reveal, app end card |
| Before → after | Original photo with a sliding result reveal, followed by an app end card |
| One photo, many styles | Original/result image sequence with different looks |
| Three-step demo | Upload, choose a look, reveal a result, then app end card |
| Result showcase | Full-image results with hook text and an app end card |

### Required output sizes

| Format | Export canvas |
| --- | --- |
| Portrait | 1080 × 1920 |
| Square | 1080 × 1080 |
| Landscape | 1920 × 1080 |

Use the **Video size** selector. Square and landscape have adapted layouts. The selected size is saved with the project and appears in the export filename.

### Assets and controls

- Up to 12 result images in JPG, PNG or WebP format.
- Drag image cards to reorder; remove individual result images.
- Original / before photo.
- Separate partner / second-person photo.
- Optional app logo.
- Opening hook, supporting instruction, app name, and call to action.
- Accent and background colors.
- Durations of 8, 12, 15 or 20 seconds.
- Fill-frame or show-full-image fit setting.
- Optional AI-generated disclosure.
- Optional uploaded audio. Audio starts at the beginning and is trimmed to the video duration.
- Live preview, play/pause, restart and timeline scrubbing.
- A variation button rotates result-image order and changes the hook; it does not generate new images.

### Project saving

- **Save project:** stores one project in that browser's local storage. It does not sync between accounts, browsers or computers.
- **Project backup:** downloads a `.framecraft.json` file with settings and embedded images.
- **Open project:** restores a downloaded backup.
- Audio is **not** embedded in project backups. Reattach it after reopening.
- Download backups for each creative/version that needs to be retained; browser storage alone is not a durable cross-device archive.

### Video export

- Uses browser canvas rendering and `MediaRecorder`.
- Exports MP4 when supported by the current browser; otherwise offers supported WebM formats.
- Does not disguise WebM as MP4 or perform server-side conversion.
- Renders in real time; keep the tab visible and wait for completion.
- Exports at the selected canvas dimensions, nominally 30 fps.
- Demo artwork is preview-only; add at least one result image to export.
- Export download links remain visible below the preview.

## 5. Latest addition: reference-style upload animation

The user supplied four screenshots from the reference ad and pointed out that this scene was missing. It has now been added to **Couple collage**:

1. Black background with the heading “Upload photos of you with your partner”.
2. Two empty rounded slots with dashed outlines and plus signs.
3. The two original photos appear in the slots.
4. The scene dims and green dots move together.
5. The dots merge into a soft three-lobed loading shape.
6. The result collage returns, followed by the app end card.

Controls added:

- **Partner / second person photo** upload.
- **Include animated couple upload scene** checkbox.
- **Upload scene heading** text.
- **Loading animation color** picker.
- **Preview upload animation** button, which selects Couple collage and jumps to the upload sequence.

Use **Original / before photo** for the first person and **Partner / second person photo** for the second. Empty slots remain placeholders if those photos are missing. These original photos are separate from the finished result images.

The animation works in the code paths for portrait, square and landscape. Its timing scales with the selected video duration. Partner images and these settings are included in project backups.

### Reference effects dropdown

The **Effects** selector includes Off, All reference effects, blur-to-sharp, slow zoom/reframing, camera flash with horizontal flare, white flash wipe, fade through black, photo upload entrance, colored blob loader, multicolor light leak, golden light sweep, floating hearts, sparkling text reveal, and animated end card. Intensity, speed and color controls plus Preview selected effect are provided. Settings are saved in project backups. Transitions follow template cut points; hearts, sparkles and animated end-card treatment run at the ending. Upload/loader choices select Couple collage and enable its upload scene. The existing Loading animation color controls the blob color. Effects are deterministic for scrubbing and export. Include the new `effects.js` file when sharing the local tool.

### Animation improvements added after the initial handoff

- Continuous fluid loading effect: three dots stretch and merge into one shaded, gently pulsing blob.
- Staggered first-person and partner-photo entrances.
- Soft crossfades and gentle image movement between result/style groups.
- Eased before/after wipe.
- Subtle heading entrances and an animated call-to-action button.
- **Animation style** selector: Smooth, Energetic, or Minimal; saved in project backups. Minimal disables added entrance and transition motion, while the loading sequence remains animated.
- Changes are implemented in local source and published privately. Actual exported playback still needs real-browser verification.

## 6. Reference-video study

Reference file:

```text
videos/set_001-010/CR06545213817582780417_v1.mp4
```

- Approximately 10.22 seconds; vertical 360 × 640 source.
- A repeated couple-pose collage changes from casual outfits to evening/formal looks.
- A black upload-instruction scene shows two portrait inputs and a green loading animation.
- The casual result collage returns near the end.
- Creative pattern: **results → style variations → upload instruction/loading → result**.
- The study sampled frames across the clip. Audio was not assessed.

The screenshot sequence guided the new upload animation. It is a recreated template effect, not a claim of exact pixel-for-pixel matching.

## 7. Downloaded-ad work and current checkpoint

Source advertiser: **Instant Design, LLC**.

https://adstransparency.google.com/advertiser/AR02935435882812932097?region=IN&format=VIDEO

Filters: India, any time, all platforms, video format.

**100 distinct ad entries processed; 102 unique MP4 files saved.** The user chose to stop here and process these references, then provide a new advertiser link. Do not automatically continue with ad 101.

| Set folder | Unique files |
| --- | ---: |
| `set_001-010` | 12 |
| `set_011-020` | 12 |
| `set_021-030` | 10 |
| `set_031-040` | 12 |
| `set_041-050` | 10 |
| `set_051-060` | 9 |
| `set_061-070` | 8 |
| `set_071-080` | 10 |
| `set_081-090` | 10 |
| `set_091-100` | 9 |
| **Total** | **102** |

An ad may have several variations, duplicate videos, non-video variations, or unavailable sources. Therefore ad counts do not equal video counts. The original sample is included in `set_011-020`.

Download workflow: inspect and download one sample first, then process 10 ad entries at a time, complete each batch before collecting the next, save in a separate set folder, deduplicate by content hash, and checkpoint the outcomes. Preserve the saved creative-ID ordering because live listing order can change.

The page continually loads more entries on scroll. Do not spend the whole session collecting the complete inventory before downloading the first batch. Media URLs appear after activating playback, can expire, and may depend on the originating network. Colleagues should collect fresh sources in their own session.

`download_videos.py` downloads sources already present in JSON; it does not browse or collect them. Browser helper functions used in this chat are temporary session state, not reusable files. Existing result paths are absolute and must be adjusted if copied to another computer. See `VIDEO_DOWNLOAD_HANDOFF.md` for the detailed download procedure.

## 8. What has and has not been tested

### Completed checks

- JavaScript syntax checks passed.
- Mocked canvas/DOM smoke checks exercised all five templates across all three resolutions and several timeline positions.
- Latest checks covered 135 template/size/timeline combinations and the upload animation's slot, photo and loading drawing paths.
- Partner-photo data and upload-animation settings were checked for inclusion in project backups.
- Local source files were updated, and the latest hosted version deployed successfully.
- The 102 downloaded reference videos had distinct SHA-256 hashes; MP4 box-boundary checks found `moov` and `mdat` and reported no invalid files.

### Verification still needed on a real browser

- Full editor visual QA with real uploaded photos in all three sizes.
- Actual MP4/WebM export and decoded playback at the correct resolution.
- Offline opening/export on a colleague's computer.
- Audio timing, duration, and playback in exported files.
- Save/reopen/backup workflows with real large projects.
- Mobile layout and usability.

The preview browser could not reach the original local server. The hosted browser encountered a ChatGPT sign-in gate, so full live export testing was not completed. Mocked rendering checks do not substitute for that test. MP4 structure validation of reference downloads does not mean every reference was manually watched or fully decoded.

## 9. Suggested first colleague test

1. Open the local `index.html` in Chrome or Edge.
2. Select Couple collage and Portrait.
3. Add a small set of finished result images.
4. Upload a first-person and a partner photo separately.
5. Click Preview upload animation; check the empty slots, photo reveal, dim overlay, merging dots and final result.
6. Repeat in Square and Landscape. Check text wrapping, faces, slot sizing and safe margins.
7. Export a short video without audio. Confirm actual file type, dimensions, duration and playback.
8. Repeat with permitted audio.
9. Save a project backup, refresh, reopen the backup and confirm images/settings return. Reattach audio.
10. Test offline and record browser/version, selected format, template, reproduction steps and screenshots for any issue.

## 10. Starter prompt for continuing with an assistant

> Read PROJECT_HANDOFF.md and inspect the current `ad-template-studio/dist` files before making changes. This is an existing browser-based ad-template editor, not a new project. Preserve the five templates, three exact output sizes, separate couple-photo inputs, animated upload/loading sequence, project backups and per-set download organization. First help me test the local editor, including actual export and playback. Be clear about what is verified. Do not restart reference downloads or change hosted access unless I ask. My next requested change is: [describe change].

If the colleague works in a different account, use their local copy. The private hosted Site remains associated with the original owner and its deployment credentials are not included in this handoff.


## Latest local-only updates

The owner has requested **local-only development**. Do not publish further changes until explicitly asked. The local `dist` folder is newer than the hosted copy.

- Main text: template-default, left, center or right alignment; fonts DM Sans, Arial, Arial Black, Georgia, Impact, Verdana and Trebuchet MS. Local font fallbacks apply. Alignment affects editable headings/supporting messages within their layout areas.
- Watermark editing is independent: text, font, color, size, position, opacity and border. Main text styling does not affect it.
- Dedicated **End-card image** upload, full-image or fill-frame fit, preview and remove controls. A custom image replaces the generated end-card contents; the watermark and selected overlay effects can still apply. For a clean finished card choose Effects → Off and turn off the watermark if it is already part of the artwork.
- Three finished result images are supported under **Add result images** (up to 12 total). Result images are distinct from original/before photos and end-card images.
- Loading animation library includes the original fluid merge plus orbiting dots, liquid ring, bouncing bubbles, morphing blob, photo scan and sparkle reveal, with color, speed and size controls.
- Share the **entire `dist` folder**, including `effects.js` in addition to `index.html`, `app.js`, and `style.css`.
- New controls and the custom end-card asset are included in project backups. Actual exported playback of the latest changes still needs browser verification.


### Guided local workflow

The editor now groups settings into collapsible steps: 1. Choose a template (left panel); 2. Video setup; 3. Add images; 4. Main text; 5. Watermark; 6. Animations; 7. Branding and end card; 8. Audio; 9. Review and export. Back/Next buttons move through the settings, and the final step offers backup and export. Include `workflow.js` when sharing the entire `dist` folder. The desktop editor uses independent panel scrolling and a viewport-scaled preview; mobile uses page scrolling. These latest UI changes are local-only and need visual checking on the user's browser.


### Local audio and captions

Step 8 now contains background volume, source trim and loop controls, plus up to 12 uploaded SFX tracks. Each SFX has start time, source trim, length (0 means available full sound), volume and Upload/Loading/Reveal timing presets. Those presets match the Couple collage upload timeline; other templates need manual timing. Main Play previews the audio mix from the current timeline position. Restart playback after changing audio settings. Export mixes music and SFX using browser Web Audio scheduling.

Step 4 now supports manually timed captions or SRT import, with caption color, background, size and top/middle/bottom position. Captions are burned into the output and use the selected main-text font. SRT import replaces the existing caption list. Automatic transcription and waveform editing are not included.

Caption text, cue timings and audio settings are saved in project backups; audio file bytes are not. Reattach background and SFX files after reopening. Missing SFX files block export with a reattachment message. Include `audio-captions.js` in the shared `dist` folder. Audio/caption scheduling checks passed with simulated browser APIs; real audible preview and exported playback still need local browser testing. These changes were not published.


### Local Framed Couple Video template

A sixth template, **Framed Couple Video**, was added after reviewing the PicsBuddy reference Short. It uses supplied, muted video clips; it does not create kissing motion or generate people from photos.

1. Select Framed Couple Video in step 1.
2. Choose Portrait, Square or Landscape. Other templates now also offer 25, 30, 45 and 60-second durations. Framed template duration is calculated from its scene lengths plus end-card duration.
3. In step 3 upload up to six result clips (150 MB maximum each; browser-decodable MP4/WebM recommended). Default scenes use up to 7 seconds each. Set each clip's trim start, scene duration and optional heading. Add a left and right circular portrait per scene; global original/partner photos are fallbacks. Reorder clips with the arrow buttons.
4. Main text font, color, outline and alignment apply to scene headings. Step 6 has frame border color/width, tilt, shadow, gradient background and connector-symbol controls.
5. Step 7 accepts an end-card video, end-card image, or a generated 2D logo reveal. Set a 1–10 second end-card duration for the framed template. A short end-card video holds its last frame. An uploaded clip is needed for a complex pre-rendered 3D logo effect.
6. Add music, SFX and captions as before. Original video audio is muted. SFX timing presets still match Couple collage; set manual times for other templates.
7. Preview and export. Keep the browser tab visible; export captures real-time playback.

Clip files are not embedded in project backups. Clip names, trim/duration settings, headings and embedded portrait images are saved. Reattach the videos on another computer or after reopening. Missing clip files block framed exports with a message. Use the entire dist folder, including the new `framed-video.js` file.

Checks cover timeline totals and boundaries, scene-order timing edits, effect cuts, asset protection, multiple sizes and saved metadata. Actual video decoding, audible mix synchronization and exported playback have not yet been verified in the local browser. All changes remain local-only.


### Local clip trim editor

Each uploaded result clip in step 3 now has a **Trim clip** button. The dialog provides a source-video preview with native scrubbing, numeric In/Out times, Mark start/end here, Play selected range, Reset range and Use selected range. Trims update that scene's offset/length and the total ad timeline, and are saved in backups. The source file is unchanged; trimming is applied while composing the ad, not saved as a separate cut video file. Each selected range must be at least 0.10 seconds and at most 60 seconds, within the source duration. Native playback and export still require local browser verification.


### Upload-scene heading customization

Step 6 now has an independent Upload heading style panel: show/hide, font, size, color, left/center/right alignment, vertical percentage position, optional background box with color/opacity, and optional text border with color/thickness. Preview heading pauses on the photo-upload scene. These controls do not change main text or watermark styling. The heading is drawn after the loading scene dim overlay so it stays readable. Upload layout also supports automatic detection, one centered photo, or two photos. All settings are included in project backups. Changes remain local-only.


### Loading color gradients

Step 6 supports Solid color or Two-color gradient for loading animations. Choose Color 1, Gradient color 2, and Left–Right, Top–Bottom, Diagonal or Center–Edge direction. It applies to fluid effects, liquid ring, photo scan and sparkle reveal. Gradient settings are included in saved projects and backups. Local-only change.


### Simplified animations panel

Step 6 is now grouped into Motion & transitions (all templates), Photo upload & loading (Couple collage only), and Frame layout (Framed Couple Video only). A top-level Preview this template button restarts playback without switching templates. Advanced upload-heading styles are collapsed, and gradient/effect parameters are hidden when not needed. Existing settings remain saved even while their group is hidden. Changes are local-only.


### Independent local end-card effects — 4 November 2026

Step 7 has an End-card animation & particles section, separate from main-scene effects. Card entrances: none, fade, zoom, slide, reveal wipe, with duration. Generated-logo animation: still, pulse, bounce-in, spin-in, fade-in. Generated button animation: template, pulse, bounce, slide, still. Particle styles: off, sparkles, hearts, confetti, bubbles and stars; adjustable color, amount, size, speed and opacity.

An end-card SFX file can be uploaded directly in step 7, with volume, source trim, length and delay relative to the end-card start. The anchor is recalculated at playback/export, so scene-duration changes move the sound. Preview end card with sound starts the preview at the end-card boundary with the normal music/SFX mix. Other audio tracks also remain audible. End-card SFX bytes are not included in backups and must be reattached.

Whole-card entrances and particles work over generated cards, images or uploaded video. Logo/button controls cannot animate elements baked into an uploaded image/video; they apply to generated elements. Effects use deterministic timeline values for scrubbing and export. Checks covered 90 size/entrance/particle combinations, logo variants, saved fields and automatic SFX anchor updates. Audible playback and actual exported output still need browser testing. Share the whole dist folder, including `endcard-effects.js`. No online publishing was performed.


### Custom video size

Step 2 now offers Custom dimensions with width, height and content layout selection. Use even whole-number dimensions, 256 to 3840 pixels per side, at most 8.29 megapixels. Standard layouts scale uniformly into the custom canvas; unused space uses the background color. Settings are saved in project backups.


## 2026-11-04 — Stability pass after site review
- Opening a backup clears background audio, SFX attachments, clip media and end-card video from the previous project. Same backup can be reopened repeatedly.
- Export controller adds cancellation, catches renderer failures, preparation/recorder timeouts and hidden-tab recovery; restores prior disabled-control states and stops media tracks.
- Browser verified old audio clears, cancellation unlocks editor, and a complete 8-second portrait MP4 with AAC audio exports (7.98 s, 1080x1920, approximately 29.73 fps in this test; fixed frame rate is not guaranteed by browser recording).
- Existing smoke checks plus async media-isolation, cancellation and renderer-failure regressions pass.
- Autosave/undo, multi-project library, complete media bundle, adjustable scene timings, crop controls, batch export and safe guides remain future improvements.


## 2026-11-04 — All ten review points + supplied icon
- Completed local implementation and browser QA before publishing online.
- Details, usage and limits: `ad-template-studio/REVIEW_UPDATE.md` and `ad-template-studio/dist/guide.html`. Earlier PDF manual predates this update.
- Added fixed-30-fps MP4 encoding (Mediabunny, browser H.264/AAC support required), IndexedDB autosave with media, multi-project library, media-aware undo/redo, full ZIP packages, scene timing, image crops, brand presets, batch ZIP export, contextual assets UI, preview-safe guides and voice/music fade/ducking controls.
- New supplied multicolor icon copied unchanged from Downloads/images.png to dist/assets/brand-icon.png; header and favicon updated. Fonts and dependencies bundled locally, with license notices.
- Browser tests verified exact 60 frames / 2 seconds, mixed AAC audio with measured 0.249 ducking ratio at 25%, preset/custom resolutions, four-video batch, full six-category media package round trip, reload recovery, media undo, cancellation and fallback recording. Smoke and 1,010 new timing-map regression checks pass.
- Portable distribution refreshed: ad-template-studio/dist.zip (extract, open dist/index.html). The local test server on 127.0.0.1:8768 remains available for the user currently viewing it.
- Published source commit bb877306224eff03de9c7b87a9f3bf71e345b690, version 14: appgprj_6ae990beefb88191a9de5bdc54310ef6~appgver_f68bc54416988191a52af0224afa1f3e. Deployment appgdep_6aea9c1056ec8191b51feaa8a6873d3c succeeded. Public audience preserved.
- URL: https://framecraft-ad-studio-haris.grandolm21.chatgpt.site/ . Live header/logo, fixed-30-fps option and guide link verified; no browser script errors.


## 2026-11-04 — Readable UI update
- User requested bigger text and Open Sans / Arial. Added locally bundled Open Sans; interface now uses Open Sans, Arial fallback, 14 px main labels and 15 px inputs. Added Open Sans to video font selectors while preserving old choices.
- Fixed malformed CSS following the old font import that caused the default editor font to fail.
- Scene cards now keep readable widths with separate duration labels and active selection. Proportional timing is shown on a separate strip. Framed scenes use the same buttons. Playback and guide controls share a compact toolbar.
- Added editor-ui.css, query-versioned changed assets, updated guide and portable dist.zip.
- Existing tests passed; browser verified real Open Sans loading, 14/15 px field text, scene jumps/highlights and a successful fixed-30-fps Open Sans video-text export. Live browser showed five readable cards with no script errors.
- Published version 15, commit 6f1ac593b986c5bf02a8def046be59481f0ca314. Saved version appgprj_6ae990beefb88191a9de5bdc54310ef6~appgver_7e5560470e9c8191895daa5b7870b686. Deployment appgdep_6aea9f8c997881919f7b60bc89a4c877 succeeded.


## 2026-11-04 — Transparent replacement logo and hosting question
- Replaced header/favicon with Downloads/logo.png, copied unchanged to dist/assets/brand-logo.png (RGBA, alpha range 0–255); retained brand-icon.png copy for backward references.
- Website version 16 deployed successfully: source 3ee71f15e294828e437f181b7c80201006dffe66, saved version appgprj_6ae990beefb88191a9de5bdc54310ef6~appgver_6ec7f71bb59881918fd7725a406e9c03, deployment appgdep_6aeab134de8c8191a9bae1273054a09c. Live header uses assets/brand-logo.png and loads at 447 px.
- User asked whether online hosting stays free forever. Checked official https://learn.chatgpt.com/docs/sites#pricing: hosting free through December 31, 2026; metering and overages above plan allowance start January 1, 2027. Do not promise permanent free hosting or availability. Plan-specific allowance not verified. Offline local copy does not rely on online hosting.
