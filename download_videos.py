import json,pathlib,urllib.request,hashlib,urllib.parse
root=pathlib.Path.cwd(); folder=root/'videos';folder.mkdir(exist_ok=True)
rows=json.loads((root/'video-sources.json').read_text()); seen={}
ad_order={url:i+1 for i,url in enumerate(json.loads((root/'video-ad-links.json').read_text()))}
prior=json.loads((root/'download-results.json').read_text()) if (root/'download-results.json').exists() else []
known={urllib.parse.parse_qs(urllib.parse.urlparse(r.get('src','')).query).get('id',[''])[0]:r for r in prior if r.get('file') and pathlib.Path(r['file']).exists()}
for p in list(folder.rglob('*.mp4'))+list(root.glob('sample-*.mp4')):
 h=hashlib.sha256(p.read_bytes()).hexdigest()
 if h not in seen:seen[h]=str(p)
for r in rows:
 if not r.get('src'):
  r['status']=r.get('status','source-unavailable');continue
 if r['src'].startswith('//'):r['src']='https:'+r['src']
 key=urllib.parse.parse_qs(urllib.parse.urlparse(r['src']).query).get('id',[''])[0]
 if key and key in known:
  prev=known[key];r.update(file=prev['file'],bytes=prev['bytes'],sha256=prev.get('sha256'),status='saved' if (r['ad'],r['variation'])==(prev['ad'],prev['variation']) else 'duplicate');continue
 ad=r['ad'].split('/creative/')[1].split('?')[0]
 start=((ad_order[r['ad']]-1)//10)*10+1
 batch_folder=folder/f'set_{start:03d}-{start+9:03d}';batch_folder.mkdir(exist_ok=True)
 p=batch_folder/f'{ad}_v{r["variation"]}.mp4'
 try:
  if not p.exists():
   with urllib.request.urlopen(r['src'],timeout=30) as resp:p.write_bytes(resp.read())
  b=p.read_bytes()
  if b[4:8]!=b'ftyp':raise ValueError('Invalid MP4')
  h=hashlib.sha256(b).hexdigest();other=seen.get(h)
  if other and other!=str(p):p.unlink();r.update(file=other,bytes=len(b),sha256=h,status='duplicate')
  else:seen[h]=str(p);r.update(file=str(p),bytes=len(b),sha256=h,status='saved')
  if key:known[key]=dict(r)
 except Exception as e:r.update(status='failed',error=str(e))
(root/'download-results.json').write_text(json.dumps(rows,indent=2))
from collections import Counter
print(dict(Counter(r['status'] for r in rows)));print('Video files:',len(list(folder.rglob('*.mp4'))))
