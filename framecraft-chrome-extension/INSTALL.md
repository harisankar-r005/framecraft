# Framecraft Offline — Chrome extension

## Install on your computer

1. Extract `Framecraft-Offline-Chrome-Extension.zip` to a permanent folder.
2. In Chrome, type `chrome://extensions` into the address bar.
3. Turn on **Developer mode** at the top right.
4. Click **Load unpacked** and choose the extracted **framecraft-chrome-extension** folder. Select the folder containing `manifest.json`, not the `app` subfolder and not the ZIP.
5. The editor opens in a normal tab. You can also click Chrome’s puzzle icon, pin **Framecraft Offline — Ad Studio**, and click its icon whenever you want to work.

You can disconnect from the internet after installation. The editor, logo, fonts, user guide, ZIP helpers and video encoder helpers are inside the extension folder. No local web server or separate editing software is needed. Video/audio codec availability is checked by the editor; use a current desktop Chrome version.

## Bring your existing work

The extension keeps its own saved projects. It does not automatically read the website’s project library.

1. In your current website/local editor, open **Projects & recovery**.
2. Download a **Complete project package**.
3. Open the extension, click **Open project**, and choose that package ZIP.

This transfers your editable images, clips, audio and settings. A JSON backup transfers settings/images but requires video and audio to be reattached.

## Save and export

Autosave and the named project library work inside the extension. Exported videos and project packages download through Chrome normally. The extension requests `unlimitedStorage` to support locally saved video/audio projects. It has no permissions to read websites, browsing history or other tabs’ contents.

Keep independent complete project packages before removing the extension or moving work to another computer. Saved projects are local to this Chrome profile.

## Share with a colleague

Send the extension ZIP and any complete project packages they need. They follow the same installation steps on their computer. They do not need your ChatGPT account or the online website.

## Update the extension later

Keep the extracted extension folder. Back up projects, close editor tabs, replace its files with the new version, and click **Reload** on its card at `chrome://extensions`. This package includes a stable public identity key; keep that key in future versions to preserve the extension ID. Do not remove/reinstall the extension as the routine update method.

This is a locally loadable extension package, not a Chrome Web Store listing. Opening the ZIP alone does not install it.

## Files and notices

- `app/guide.html`: current editing manual.
- `app/THIRD_PARTY.txt`: bundled software and font licenses.
- `PRIVACY.md`: local storage and network behavior.
- `TEST_REPORT.md`: verification scope.

Official Chrome instructions: https://developer.chrome.com/docs/extensions/get-started/tutorial/hello-world#load-unpacked
