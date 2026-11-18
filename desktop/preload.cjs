const { contextBridge, ipcRenderer } = require('electron');
contextBridge.exposeInMainWorld('framecraftDesktop', {
  advancedAvailable: () => ipcRenderer.invoke('framecraft:advanced-available'),
  openAdvanced: () => ipcRenderer.invoke('framecraft:open-advanced'),
  beginSave: payload => ipcRenderer.invoke('framecraft:begin-save', payload),
  appendSave: payload => ipcRenderer.invoke('framecraft:append-save', payload),
  finishSave: token => ipcRenderer.invoke('framecraft:finish-save', token),
  cancelSave: token => ipcRenderer.invoke('framecraft:cancel-save', token)
});
