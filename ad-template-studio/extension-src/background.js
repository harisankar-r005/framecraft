// No website access is needed: the toolbar opens our own packaged editor.
function openEditor(){
 chrome.tabs.create({url:chrome.runtime.getURL('app/index.html')}).catch(error=>console.error('Could not open Framecraft:',error));
}
chrome.action.onClicked.addListener(openEditor);
chrome.runtime.onInstalled.addListener(details=>{if(details.reason==='install')openEditor()});
