const { contextBridge, ipcRenderer } = require('electron');
contextBridge.exposeInMainWorld('framecraftDesktop', {
  beginSave: payload => ipcRenderer.invoke('framecraft:begin-save', payload),
  appendSave: payload => ipcRenderer.invoke('framecraft:append-save', payload),
  finishSave: token => ipcRenderer.invoke('framecraft:finish-save', token),
  cancelSave: token => ipcRenderer.invoke('framecraft:cancel-save', token)
});
