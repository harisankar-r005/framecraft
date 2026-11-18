import test from 'node:test';
import assert from 'node:assert/strict';
import { applicationMenuTemplate } from '../apps/desktop/src/menu.mjs';
import { FLAVORS } from '../apps/desktop/src/flavor.mjs';
import { readFileSync } from 'node:fs';

test('Framecraft menu opens its template editor and credits without loading Electron in the menu model',()=>{
 let opened=0,credits=0;const noop=()=>{};
 const menu=applicationMenuTemplate({productName:'Framecraft Advanced',packaged:true,toggleChat:noop,openProject:noop,reload:noop,devTools:noop,openSettings:noop,tabs:{open:noop,close:noop,reopen:noop,step:noop,pick:noop},framecraft:{openTemplateEditor:()=>opened++,showFramecraftAbout:()=>credits++}},'win32');
 const file=menu.find(item=>item.label==='File').submenu;
 const templates=file.find(item=>item.label==='Framecraft template editor');
 assert.equal(templates.accelerator,'CmdOrCtrl+Shift+E');templates.click();
 file.find(item=>item.label==='About Framecraft / OpenFilm credits').click();
 assert.equal(opened,1);assert.equal(credits,1);
});
test('Framecraft identities are separate from each other and from upstream; official updates are disabled',()=>{
 const flavors=Object.values(FLAVORS);
 for(const key of ['productName','bundleId','studioPort','studioHome'])assert.equal(new Set(flavors.map(f=>f[key])).size,flavors.length,key);
 assert.deepEqual(JSON.parse(readFileSync(new URL('../packages/openfilm/product.json',import.meta.url))),{});
 for(const f of flavors){assert.ok(f.bundleId.startsWith('com.framecraft.'));assert.ok(!f.studioHome.endsWith('.openfilm'));assert.ok(f.library.includes('Framecraft'));}
 const meta=JSON.parse(readFileSync(new URL('../FRAMECRAFT_UPSTREAM.json',import.meta.url)));
 assert.equal(meta.commit.length,40);assert.equal(meta.license,'MIT');
});
