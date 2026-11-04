const { contextBridge, ipcRenderer } = require('electron');
contextBridge.exposeInMainWorld('framecraftDesktop', { saveFile: payload => ipcRenderer.invoke('framecraft:save-file', payload) });
