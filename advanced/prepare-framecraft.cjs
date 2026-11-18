/* Copy the existing template editor into the advanced desktop distribution. */
const fs=require('node:fs');
const path=require('node:path');
const desktop=path.resolve(__dirname,'apps/desktop');
const source=path.resolve(__dirname,'../ad-template-studio/dist');
const target=path.join(desktop,'legacy');
if(!target.startsWith(desktop+path.sep))throw Error('Template destination is outside the desktop source.');
fs.mkdirSync(target,{recursive:true});
fs.cpSync(source,path.join(target,'app'),{recursive:true});
fs.copyFileSync(path.resolve(__dirname,'../desktop/preload.cjs'),path.join(target,'preload.cjs'));
console.log('Prepared the Framecraft template editor.');
