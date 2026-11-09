/* Electron enhancement. The browser build keeps its normal download behavior. */
(() => {
  if (!window.framecraftDesktop?.beginSave || typeof window.download !== 'function') return;
  const browserDownload = window.download;
  window.download = async (blob, name) => {
    if (!window.framecraftDesktop?.beginSave) return browserDownload(blob, name);
    let token;
    try {
      message('Choose where to save '+name+'…');
      const start = await window.framecraftDesktop.beginSave({ name, mimeType: blob.type, size: blob.size });
      if (start.cancelled) { message('Save cancelled. Your project is unchanged.'); return start; }
      token = start.token;
      const reader = blob.stream().getReader();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        await window.framecraftDesktop.appendSave({ token, bytes: value.buffer.slice(value.byteOffset, value.byteOffset + value.byteLength) });
      }
      const result = await window.framecraftDesktop.finishSave(token);
      const item = document.createElement('span');
      item.textContent = 'Saved: '+result.fileName;
      $('downloads').prepend(item);
      return result;
    } catch (error) {
      if (token) await window.framecraftDesktop.cancelSave(token);
      message('Could not save the file: '+error.message);
      throw error;
    }
  };
})();
