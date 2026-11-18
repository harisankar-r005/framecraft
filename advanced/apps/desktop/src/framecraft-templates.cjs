/* Framecraft's original editor, hosted alongside the reused OpenFilm desktop. */
const {app,BaseWindow,BrowserWindow,dialog,ipcMain}=require('electron');
const fs=require('node:fs/promises');
const path=require('node:path');
const root=path.resolve(__dirname,'../legacy');
const windows=new Set(),saves=new Map();
const MAX=1024*1024*1024;
let registered=false;
function trusted(event){const win=BrowserWindow.fromWebContents(event.sender);if(!windows.has(win)||event.senderFrame!==event.sender.mainFrame)throw Error('This action is only available in the template editor.');return win}
async function discard(token){const record=saves.get(token);if(!record)return;saves.delete(token);await record.handle.close().catch(()=>{});await fs.unlink(record.temp).catch(()=>{})}
function register(){
 if(registered)return;registered=true;
 ipcMain.handle('framecraft:advanced-available',()=>true);
 ipcMain.handle('framecraft:open-advanced',event=>{trusted(event);const win=BaseWindow.getAllWindows().find(w=>!windows.has(w));if(win){if(win.isMinimized())win.restore();win.show();win.focus()}return {opened:!!win}});
 ipcMain.handle('framecraft:begin-save',async(event,{name,mimeType,size})=>{
  const win=trusted(event);if(!Number.isFinite(size)||size<0||size>MAX)throw Error('Files larger than 1 GB cannot be saved.');
  const filename=path.basename(String(name||'Framecraft-export'));
  const result=await dialog.showSaveDialog(win,{title:'Save Framecraft export',defaultPath:path.join(app.getPath('downloads'),filename),filters:[{name:String(mimeType||'Framecraft export'),extensions:[path.extname(filename).slice(1)||'bin']}]});
  if(result.canceled||!result.filePath)return {cancelled:true};
  const token=require('node:crypto').randomUUID(),temp=path.join(path.dirname(result.filePath),'.'+path.basename(result.filePath)+'.'+token+'.tmp');
  saves.set(token,{sender:event.sender.id,temp,target:result.filePath,handle:await fs.open(temp,'wx'),bytes:0});return {cancelled:false,token};
 });
 function own(event,token){trusted(event);const record=saves.get(token);if(!record||record.sender!==event.sender.id)throw Error('The save session is no longer available.');return record}
 ipcMain.handle('framecraft:append-save',async(event,{token,bytes})=>{const record=own(event,token);if(!(bytes instanceof ArrayBuffer)||record.bytes+bytes.byteLength>MAX)throw Error('Invalid export data or the file is larger than 1 GB.');await record.handle.write(Buffer.from(bytes));record.bytes+=bytes.byteLength});
 ipcMain.handle('framecraft:finish-save',async(event,token)=>{const record=own(event,token);try{await record.handle.close();await fs.rename(record.temp,record.target);saves.delete(token);return {cancelled:false,fileName:path.basename(record.target)}}catch(error){await discard(token);throw error}});
 ipcMain.handle('framecraft:cancel-save',async(event,token)=>{own(event,token);await discard(token)});
 app.on('before-quit',()=>{for(const token of saves.keys())void discard(token)});
}
function openTemplateEditor(){
 register();const existing=[...windows].find(w=>!w.isDestroyed());if(existing){existing.show();existing.focus();return existing}
 const win=new BrowserWindow({title:'Framecraft · Template editor',width:1500,height:960,minWidth:1100,minHeight:720,icon:path.join(root,'app/assets/brand-icon.png'),autoHideMenuBar:false,webPreferences:{preload:path.join(root,'preload.cjs'),contextIsolation:true,nodeIntegration:false,sandbox:true,webSecurity:true,partition:'persist:framecraft-templates'}});
 const sender=win.webContents.id;windows.add(win);win.on('closed',()=>windows.delete(win));win.webContents.on('destroyed',()=>{for(const [token,record] of saves)if(record.sender===sender)void discard(token)});
 win.loadFile(path.join(root,'app/index.html')).catch(error=>dialog.showErrorBox('Framecraft template editor',error.message));return win;
}
function showFramecraftAbout(){void dialog.showMessageBox({type:'info',title:'About Framecraft',message:'Framecraft Advanced',detail:'A Framecraft fork powered by the OpenFilm editor and rendering core.\n\nOpenFilm source: https://github.com/openfilm/openfilm\nUpstream commit: 589953539de2c8c8c119e29f9c6033c1e90ed1fd\nCopyright © 2026 OpenFilm contributors · MIT license.\n\nFramecraft is independently maintained. The bundled LICENSE-OPENFILM.txt and THIRD_PARTY_NOTICES.md contain the upstream notices.'})}
module.exports={openTemplateEditor,showFramecraftAbout};
