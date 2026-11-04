# Framecraft Offline extension verification

Version 1.0.1 — 4 November 2026.

## Passed

- Manifest V3 package, valid JSON and service-worker syntax.
- Toolbar action and first-install event open the packaged `app/index.html`; updates do not open unsolicited tabs.
- Stable public identity key retained in the source manifest for subsequent updates.
- Only `unlimitedStorage` permission; no host, browsing-history, active-tab or content-script permissions.
- All HTML script/style references and stylesheet font URLs resolve to packaged files.
- No inline JavaScript or dynamic `eval`/`Function` compilation in packaged dependencies. The unused JSZip string-callback fallback was changed to reject non-functions.
- Packaged editor loads and renders under its exact content-security-policy header on a local HTTP test origin. That policy uses `connect-src 'none'`, and only locally packaged scripts/fonts are permitted.
- Browser error logs were empty during that load check.

## Verification limits

The extension has not been installed into the user's Chrome profile. The browser declined permission to attach the synthetic test project at the local test origin, so media import/export was not tested in this packaged build. No alternate upload method was attempted.

The same editor/export engine was previously tested in the ordinary local/web build, including fixed-30-fps MP4/AAC output, complete media-package round trips, batch export and cancellation. That does not replace testing the installed extension context. After loading the extension, import a small complete project package and export one short video before starting a large batch.

## Repeatable package check

From the original development workspace:

`node ad-template-studio/tests/extension-package.cjs`

Rebuild after app updates with:

`node ad-template-studio/tools/build-extension.cjs`

Keep `extension-src/manifest.json` and its existing public key when rebuilding.

Logo-only update 1.0.1: header, favicon and toolbar icon files replaced with the newly supplied PNG. Public extension identity and permissions unchanged.
