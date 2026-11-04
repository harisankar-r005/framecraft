const { app, BrowserWindow, dialog, ipcMain } = require('electron');
const fs = require('node:fs/promises');
const path = require('node:path');
const MAX_SAVE_BYTES = 1024 * 1024 * 1024;
function createWindow() {
  const window = new BrowserWindow({ width: 1500, height: 960, minWidth: 1100, minHeight: 720, autoHideMenuBar: true, title: 'Framecraft', icon: path.join(__dirname, 'app', 'assets', 'brand-icon.png'), webPreferences: { preload: path.join(__dirname, 'preload.cjs'), contextIsolation: true, nodeIntegration: false, sandbox: true, webSecurity: true } });
  window.loadFile(path.join(__dirname, 'app', 'index.html'));
}
app.whenReady().then(() => {
  ipcMain.handle('framecraft:save-file', async (event, { bytes, name, mimeType }) => {
    if (!(bytes instanceof ArrayBuffer)) throw new Error('Invalid file data.');
    if (bytes.byteLength > MAX_SAVE_BYTES) throw new Error('Files larger than 1 GB cannot be saved.');
    const safeName = path.basename(String(name || 'framecraft-export'));
    const { canceled, filePath } = await dialog.showSaveDialog(BrowserWindow.fromWebContents(event.sender), { title: 'Save Framecraft export', defaultPath: path.join(app.getPath('downloads'), safeName), filters: [{ name: String(mimeType || 'Framecraft export'), extensions: [path.extname(safeName).slice(1) || 'bin'] }] });
    if (canceled || !filePath) return { cancelled: true };
    await fs.writeFile(filePath, Buffer.from(bytes));
    return { cancelled: false, fileName: path.basename(filePath) };
  });
  createWindow();
  app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) createWindow(); });
});
app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });
