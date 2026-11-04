const fs=require('fs'),path=require('path'),crypto=require('crypto');
const root=path.resolve(__dirname,'..'),source=path.join(root,'extension-src'),output=path.resolve(root,'..','framecraft-chrome-extension');
const manifestPath=path.join(source,'manifest.json');
if(!fs.existsSync(manifestPath)){
 const {publicKey}=crypto.generateKeyPairSync('rsa',{modulusLength:2048});
 const key=publicKey.export({type:'spki',format:'der'}).toString('base64');
 const icons=Object.fromEntries([16,32,48,128].map(size=>[String(size),'icons/icon-'+size+'.png']));
 const manifest={manifest_version:3,name:'Framecraft Offline — Ad Studio',version:'1.0.0',description:'Create app promo videos offline with templates, captions, music, voiceover and batch exports.',minimum_chrome_version:'120',key,permissions:['unlimitedStorage'],background:{service_worker:'background.js'},action:{default_title:'Open Framecraft Offline',default_icon:icons},icons,options_page:'app/guide.html',content_security_policy:{extension_pages:"default-src 'self'; script-src 'self'; object-src 'none'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; media-src 'self' blob: data:; font-src 'self'; connect-src 'none'; base-uri 'self'; frame-src 'none'; form-action 'none'"}};
 fs.writeFileSync(manifestPath,JSON.stringify(manifest,null,2)+'\n');
}
fs.mkdirSync(output,{recursive:true});fs.cpSync(source,output,{recursive:true});fs.cpSync(path.join(root,'dist'),path.join(output,'app'),{recursive:true});
// Strip cache-busting queries from packaged files; every resource is a local file.
const indexPath=path.join(output,'app/index.html');let html=fs.readFileSync(indexPath,'utf8').replace(/(\.(?:js|css))\?v=[^"']+/g,'$1');
html=html.replace('<title>Framecraft — Ad Studio</title>','<title>Framecraft Offline — Ad Studio</title>').replace('<span class="pill">AD STUDIO</span>','<span class="pill">OFFLINE</span>');fs.writeFileSync(indexPath,html);
// JSZip's setImmediate polyfill accepts string callbacks via Function(). Our
// editor only uses functions; reject string callbacks in the extension build.
const zipPath=path.join(output,'app/vendor/jszip.min.js');let zip=fs.readFileSync(zipPath,'utf8');const fallback='"function"!=typeof e&&(e=new Function(""+e));';
if(!zip.includes(fallback))throw Error('Review the updated JSZip polyfill before packaging.');
zip=zip.replace(fallback,'if("function"!=typeof e)throw new TypeError("Callback must be a function");');fs.writeFileSync(zipPath,zip);
fs.appendFileSync(path.join(output,'app/THIRD_PARTY.txt'),'\nExtension build modification: JSZip setImmediate string callbacks are rejected instead of compiled dynamically, for the extension content security policy.\n');
const guide=path.join(output,'app/guide.html');fs.appendFileSync(guide,'\n<!-- This guide is included in the offline Chrome extension. See ../INSTALL.md. -->\n');
const manifest=JSON.parse(fs.readFileSync(manifestPath,'utf8'));const hash=crypto.createHash('sha256').update(Buffer.from(manifest.key,'base64')).digest('hex').slice(0,32);const id=hash.replace(/[0-9a-f]/g,d=>String.fromCharCode(97+parseInt(d,16)));
console.log(JSON.stringify({output,extensionId:id,version:manifest.version}));
