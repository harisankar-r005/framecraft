# Fixes for the aman-works review

Base: aman-works at 5601bdb. Fix branch: codex/fix-aman-review.

- Keep One photo, many styles selected when previewing upload, loading, or heading scenes; use its scene timing.
- Restore gradient fields and the gradient swatch on project open, project switching, and undo/redo. Control refresh does not overwrite stored gradients. Synchronize color hex displays too.
- Migrate legacy custom text colors to hook/supporting controls, preserve background colors, and avoid adding the new overlay to older projects.
- Restore image crop/position controls and preview-only safe-area guides. Make SRT import visible again.

Validation: loading-smoke.cjs and studio-regression.cjs pass, including targeted template, gradient restoration/editing, legacy settings, switching, and crop tests. Git diff whitespace checks pass.

Desktop installer and end-to-end desktop export were not tested. Main, the live site, and published extension packages were not changed. These source fixes need a new build/package when released.
