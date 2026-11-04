/* Electron enhancement. The browser build keeps its normal download behavior. */
(() => {
  if (!window.framecraftDesktop?.saveFile || typeof window.download !== 'function') return;
  const browserDownload = window.download;
  window.download = (blob, name) => {
    if (!window.framecraftDesktop?.saveFile) return browserDownload(blob, name);
    void (async () => {
      try {
        message('Choose where to save '+name+'…');
        const result = await window.framecraftDesktop.saveFile({ bytes: await blob.arrayBuffer(), name, mimeType: blob.type });
        if (result.cancelled) { message('Save cancelled. Your project is unchanged.'); return; }
        const item = document.createElement('span');
        item.textContent = 'Saved: '+result.fileName;
        $('downloads').prepend(item);
      } catch (error) {
        console.error('Desktop save failed:', error);
        message('Could not save the file: '+error.message);
      }
    })();
  };
})();
