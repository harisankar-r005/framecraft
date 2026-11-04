# Google Ads video download handoff

Prepared: 3 November 2026

This is a practical summary of the chat and its completed work, rather than a verbatim transcript. It is intended for colleagues continuing the same workflow in their own accounts and workspaces.

## Request and agreed workflow

Download video ads from a Google Ads Transparency Center advertiser page. First inspect the site and successfully download one sample. Then process ads in sets of 10, downloading each set before moving to the next. Maintain a separate folder for every set, skip duplicate video content, and preserve progress.

The user has now stopped at the first 100 ad entries to review/process the downloaded videos. Wait for a new link before starting further downloads. Do not automatically continue with ad 101.

## Source used

- Advertiser: **Instant Design, LLC**; the page displayed a verified identity and United States location.
- Advertiser ID: `AR02935435882812932097`.
- Original link: https://adstransparency.google.com/advertiser/AR02935435882812932097?region=IN
- Video-filtered link: https://adstransparency.google.com/advertiser/AR02935435882812932097?region=IN&format=VIDEO
- Filters used: India, any time, all platforms, video format.
- The page displayed approximately 800 ads. That number was not verified as the total number of downloadable videos.

The listing loads additional entries as the user scrolls. Initial DOM results included repeated ad links, so count distinct creative IDs rather than raw link elements. A saved inventory contains more entries than were processed; the task completed only the first 100 entries in that saved order.

## Completed results

**100 ad entries processed; 102 unique MP4 files saved.**

Ad entries and video files are different counts: an entry may have multiple variations; some variations repeat a video, contain no video, or expose no usable source.

| Folder | Ad entries in saved order | Unique videos stored |
| --- | --- | ---: |
| `set_001-010` | 1–10 | 12 |
| `set_011-020` | 11–20 | 12 |
| `set_021-030` | 21–30 | 10 |
| `set_031-040` | 31–40 | 12 |
| `set_041-050` | 41–50 | 10 |
| `set_051-060` | 51–60 | 9 |
| `set_061-070` | 61–70 | 8 |
| `set_071-080` | 71–80 | 10 |
| `set_081-090` | 81–90 | 10 |
| `set_091-100` | 91–100 | 9 |
| **Total** | **100** | **102** |

The original sample is included in `set_011-020`. It is not an extra file outside the total. It was a Viyo video, about 13.5 seconds, 640 × 360 pixels, with video and audio tracks.

## Files and folders in the original workspace

Original workspace on the requester's computer:

```text
C:\Users\haris\OneDrive\Documents\ChatGPT\APPs\App ad assets
```

Colleagues should choose their own local workspace. This path will not automatically exist in another account.

```text
App ad assets/
  VIDEO_DOWNLOAD_HANDOFF.md
  download_videos.py
  video-ad-links.json
  video-sources.json
  download-results.json
  download-progress.json
  videos/
    set_001-010/
      *.mp4
      batch-results.json
    ...
    set_091-100/
      *.mp4
      batch-results.json
```

- `video-ad-links.json`: ordered ad-page inventory. Use it to preserve the original numbering; live page order may change.
- `video-sources.json`: collected variation sources and non-video statuses. Media URLs can expire and may be tied to the originating network.
- `download-results.json`: download outcomes, file references, sizes, and hashes where recorded; duplicates reference their retained file.
- `download-progress.json`: currently records 100 processed ads, next index 101, 102 unique files, and no invalid files from the structure check.
- Each `batch-results.json`: results for that set, including unavailable variations and duplicate references. A duplicate may reference a file in an earlier set.
- `download_videos.py`: downloader used after browser-based source collection. It does not discover ads or extract their sources by itself. It expects the JSON files in the current working directory.

The Markdown file alone does not transfer the videos, JSON records, or script. Share those separately if colleagues need the existing assets or exact continuation state. Existing result records contain absolute file paths and will need adjustment if moved to another computer.

## Workflow to repeat in another account

1. Receive the new advertiser link and select a local output workspace. Keep each advertiser's inventory and results separate to avoid mixing creative numbering.
2. Inspect the advertiser, region, date, platform, and format filters. Apply the requested filters before collecting links.
3. Collect the first 10 distinct ad links in their visible order. Record each creative ID and URL. Avoid loading the whole advertiser inventory before downloading the first batch.
4. Open the first ad and inspect all available variations. Use the visible variation counter to confirm the current position; a refresh may retain the selected variation.
5. Press Play on video previews. In the inspected ads, the MP4 source became available only after playback was activated.
6. Download one sample first and verify it. If successful, download the remaining videos in the current set.
7. Normalize protocol-relative sources beginning with `//` to `https://` before downloading.
8. Deduplicate against earlier files, using a content hash such as SHA-256. Keep a record linking each ad variation to its retained file.
9. Save new files under a set folder such as `videos/set_001-010/`. Use creative ID and variation in filenames, for example `CR123456789_v1.mp4`.
10. Verify saved files, write the batch results and progress checkpoint, then move to the next 10 entries when requested.

Use the browser and download tools available in the colleague's account. The original chat's browser handles and JavaScript helper functions are temporary session state and are not included in this handoff. Recreate source collection in the new session.

## Observed issues and recovery

- The ordinary web-reading tool could not access this interactive page; an interactive browser was used.
- The browser's media-download action timed out twice even though playback worked. Direct HTTP download of the player-exposed MP4 source succeeded after network access was permitted.
- Several previews needed a refresh or a return to the first variation before their controls responded. Always re-read the current variation counter after a failed action; do not assume it stayed on variation 1.
- Some variations had no usable source after playback activation. They were recorded as unavailable, not successfully downloaded. These can be retried later with fresh page loads.
- Some variations contained text or image content despite being inside a video-format ad entry. These were recorded as non-video.
- Some extracted source URLs omitted the protocol. Adding `https:` resolved those download failures.
- Signed media links are temporary. Colleagues should extract fresh sources in their own session instead of relying on old signed links.
- Any network-access approval depends on the local tool environment. Do not bypass access controls or browser security warnings.

## Verification and limits

All 102 retained files had distinct SHA-256 hashes. The final check parsed MP4 box boundaries and confirmed the presence of `moov` and `mdat` boxes; no invalid files were found by that check.

This verifies container structure, not complete decoding or audiovisual quality. Every video was not manually watched from start to finish. Unavailable variations remain unresolved; the download is not an exhaustive archive of every video on the advertiser page. No claim was made that the retrieved resolution is the highest available.

## Starter prompt for a colleague

Copy this into a new chat and provide the intended advertiser link and local output location:

> Read the attached VIDEO_DOWNLOAD_HANDOFF.md and follow the same workflow for this new advertiser link: [paste link]. Inspect the page first, then download and verify one sample. If it works, process 10 distinct ad entries at a time, including their available video variations. Download each set before collecting the next set. Save each set in its own numbered folder, skip duplicate video content, and keep per-batch results plus a progress checkpoint. Report unavailable variations honestly. Use fresh media sources from my browser session. Do not assume access to the previous chat's files or session state.

