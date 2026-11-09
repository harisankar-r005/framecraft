const { app, BrowserWindow, dialog, ipcMain } = require('electron');
const fs = require('node:fs/promises');
const path = require('node:path');
const MAX_SAVE_BYTES = 1024 * 1024 * 1024;
const pendingSaves = new Map();
function saveToken() { return `${Date.now()}-${Math.random().toString(36).slice(2)}`; }
async function discardPendingSave(token) {
  const pending = pendingSaves.get(token);
  if (!pending) return;
  pendingSaves.delete(token);
  await pending.handle.close().catch(() => {});
  await fs.unlink(pending.tempPath).catch(() => {});
}
function createWindow() {
  const window = new BrowserWindow({ width: 1500, height: 960, minWidth: 1100, minHeight: 720, autoHideMenuBar: true, title: 'Framecraft', icon: path.join(__dirname, 'app', 'assets', 'brand-icon.png'), webPreferences: { preload: path.join(__dirname, 'preload.cjs'), contextIsolation: true, nodeIntegration: false, sandbox: true, webSecurity: true } });
  window.loadFile(path.join(__dirname, 'app', 'index.html'));
}
app.whenReady().then(() => {
  ipcMain.handle('framecraft:begin-save', async (event, { name, mimeType, size }) => {
    if (!Number.isFinite(size) || size < 0 || size > MAX_SAVE_BYTES) throw new Error('Files larger than 1 GB cannot be saved.');
    const safeName = path.basename(String(name || 'framecraft-export'));
    const { canceled, filePath } = await dialog.showSaveDialog(BrowserWindow.fromWebContents(event.sender), { title: 'Save Framecraft export', defaultPath: path.join(app.getPath('downloads'), safeName), filters: [{ name: String(mimeType || 'Framecraft export'), extensions: [path.extname(safeName).slice(1) || 'bin'] }] });
    if (canceled || !filePath) return { cancelled: true };
    const token = saveToken();
    const tempPath = path.join(path.dirname(filePath), `.${path.basename(filePath)}.${token}.tmp`);
    const handle = await fs.open(tempPath, 'w');
    pendingSaves.set(token, { handle, tempPath, filePath, bytes: 0 });
    return { cancelled: false, token };
  });
  ipcMain.handle('framecraft:append-save', async (_event, { token, bytes }) => {
    const pending = pendingSaves.get(token);
    if (!pending || !(bytes instanceof ArrayBuffer)) throw new Error('Save session is no longer available.');
    if (pending.bytes + bytes.byteLength > MAX_SAVE_BYTES) { await discardPendingSave(token); throw new Error('Files larger than 1 GB cannot be saved.'); }
    await pending.handle.write(Buffer.from(bytes));
    pending.bytes += bytes.byteLength;
  });
  ipcMain.handle('framecraft:finish-save', async (_event, token) => {
    const pending = pendingSaves.get(token);
    if (!pending) throw new Error('Save session is no longer available.');
    pendingSaves.delete(token);
    try {
      await pending.handle.close();
      await fs.rename(pending.tempPath, pending.filePath);
      return { cancelled: false, fileName: path.basename(pending.filePath) };
    } catch (error) {
      await fs.unlink(pending.tempPath).catch(() => {});
      throw error;
    }
  });
  ipcMain.handle('framecraft:cancel-save', (_event, token) => discardPendingSave(token));
  createWindow();
  app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) createWindow(); });
});
app.on('before-quit', () => { for (const token of pendingSaves.keys()) void discardPendingSave(token); });
app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });
