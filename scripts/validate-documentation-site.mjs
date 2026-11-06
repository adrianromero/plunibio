// Validate a Jekyll build without fetching external resources or changing it.
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
const project=process.cwd();
const require=createRequire(path.join(project,'package.json'));
const {JSDOM}=require('jsdom');
const YAML=require('yaml');
const root=path.resolve(process.argv[2]??'automation/output/website-preview');
const config=YAML.parse(fs.readFileSync('website/_config.yml','utf8'));
const catalogue=YAML.parse(fs.readFileSync('website/_data/docs.yml','utf8'));
const manifest=JSON.parse(fs.readFileSync('website/_data/docs_images.json','utf8')).images;
const websiteImages=JSON.parse(fs.readFileSync('website/_data/website_images.json','utf8'));
const release=YAML.parse(fs.readFileSync('website/_data/releases.yml','utf8'));
const installLabels=YAML.parse(fs.readFileSync('website/_data/installation.yml','utf8'));
const referencedWebsiteImages=new Set();
const base=config.baseurl;
const cache=new Map(), external=new Set(), externalDocs=new Set(), referencedImages=new Set();
const read=file=>{if(!cache.has(file))cache.set(file,new JSDOM(fs.readFileSync(file,'utf8')).window.document);return cache.get(file);};
const built=url=>path.join(root,url,'index.html');
const documents=fs.readdirSync(root,{recursive:true}).filter(f=>f.endsWith('.html'));
for(const relative of documents){
 const filename=path.join(root,relative), doc=read(filename);
 const current=new URL('https://local.invalid/'+relative);
 for(const img of doc.querySelectorAll('img[src]')){
  const filename=path.basename(img.getAttribute('src'));
  const capture=websiteImages[filename];
  if(!capture)continue;
  assert.equal(img.width,capture.width,relative+': website image width');
  assert.equal(img.height,capture.height,relative+': website image height');
  assert.ok(img.alt,relative+': missing image alternative text');
  assert.equal(capture.language,doc.documentElement.lang);
  const flow=JSON.parse(fs.readFileSync(capture.flow,'utf8'));
  const checkpoint=flow.steps[capture.captureStep-1];
  assert.equal(checkpoint.action,'capture');assert.equal(checkpoint.scope,'viewport');
  assert.equal(checkpoint.name+'.webp',filename);
  referencedWebsiteImages.add(filename);
 }
 const ids=[...doc.querySelectorAll('[id]')].map(e=>e.id);
 assert.equal(new Set(ids).size,ids.length,`${relative}: duplicate IDs`);
 if(/\/(es|en)\/docs\//.test('/'+relative))assert.equal(doc.querySelectorAll('h1').length,1,`${relative}: H1`);
 for(const el of doc.querySelectorAll('[href],[src]')){
  const raw=el.getAttribute('href')??el.getAttribute('src');
  const url=new URL(raw,current);
  if(url.origin!==current.origin){
   if(el.matches('main a'))external.add(url.href);
   if(doc.body.classList.contains('page-docs')&&el.matches('a'))externalDocs.add(url.href);
   continue;
  }
  let target=path.join(root,decodeURIComponent(url.pathname));
  assert.ok(fs.existsSync(target),`${relative}: missing ${raw}`);
  if(fs.statSync(target).isDirectory())target=path.join(target,'index.html');
  assert.ok(fs.existsSync(target),`${relative}: missing index ${raw}`);
  if(url.hash&&target.endsWith('.html'))assert.ok(read(target).getElementById(decodeURIComponent(url.hash.slice(1))),`${relative}: fragment ${raw}`);
 }
}
// Internal maintenance documents and templates must never become public pages.
assert.ok(!fs.existsSync(path.join(root,base,'maintenance')),'maintenance artifacts were published');
for(const section of ['index','features','install','docs','about']){
 const pair={};
 for(const lang of ['es','en']){
  const filename=path.join('website',lang,section+'.md');
  const source=fs.readFileSync(filename,'utf8');
  const front=YAML.parse(source.match(/^---\n([\s\S]*?)\n---/)[1]);
  const doc=read(built(base+front.permalink));
  assert.equal(front.lang,lang);assert.equal(doc.documentElement.lang,lang);
  assert.equal(doc.querySelector('.language-switcher a').getAttribute('href'),base+YAML.parse(fs.readFileSync(path.join('website',lang==='es'?'en':'es',section+'.md'),'utf8').match(/^---\n([\s\S]*?)\n---/)[1]).permalink);
  pair[lang]=front.translation_key;
 }
 assert.equal(pair.es,pair.en,section+': translation key');
}
assert.ok(catalogue.chapters.length>0);
assert.equal(new Set(catalogue.chapters.map(c=>c.docs_key)).size,catalogue.chapters.length);
assert.equal(release.version,JSON.parse(fs.readFileSync('package.json','utf8')).version);
assert.equal(release.version,JSON.parse(fs.readFileSync('src-tauri/tauri.conf.json','utf8')).version);
assert.equal(release.version,fs.readFileSync('src-tauri/Cargo.toml','utf8').match(/^version = "([^"]+)"/m)[1]);
assert.equal(release.tag,'v'+release.version);
assert.equal(new Set(release.assets.map(a=>a.name)).size,release.assets.length);
const downloadBase=config.github_url+'/releases/download/'+release.tag+'/';
for(const asset of release.assets){
 assert.equal(asset.url,downloadBase+asset.name);
 assert.ok(asset.name.includes('_'+release.version+'_'));
 assert.match(asset.sha256,/^[a-f0-9]{64}$/);assert.ok(asset.size>0);
 assert.equal(typeof asset.tested,'boolean');
}
for(const lang of ['es','en']){
 const install=read(built(base+'/'+lang+'/install/'));
 const cards=[...install.querySelectorAll('[data-release-asset]')];
 assert.equal(cards.length,release.assets.length);
 for(const asset of release.assets){
  const card=cards.find(c=>c.getAttribute('data-release-asset')===asset.name);assert.ok(card);
  assert.equal(card.querySelector('.release-download-link').getAttribute('href'),asset.url);
  assert.equal(card.querySelector('.release-test-status').textContent.trim(),installLabels[lang][asset.tested?'tested':'untested']);
  assert.equal(card.querySelector('.release-checksum code').textContent,asset.sha256);
 }
 assert.ok(install.querySelector('.release-notice a[href="'+config.license_url+'"]'));
 assert.ok(!/Próximamente|Coming soon/.test(install.querySelector('main').textContent));
 for(const pre of install.querySelectorAll('pre'))assert.equal(pre.getAttribute('tabindex'),'0');
 const sourceCommands=[...install.querySelectorAll('pre')].filter(p=>p.textContent.includes('git clone'));
 assert.equal(sourceCommands.length,3);
 for(const command of sourceCommands)assert.ok(command.textContent.includes('git checkout '+release.tag));
 const docsIndex=read(built(base+'/'+lang+'/docs/'));
 const notice=docsIndex.querySelector('.docs-callout');assert.ok(notice.textContent.includes(release.version));
 assert.ok(notice.textContent.includes(release.docs_reviewed_on));
 assert.ok(notice.querySelector('a[href="'+release.url+'"]'));
 assert.ok(!/pending confirmation|pendiente de confirmar/.test(notice.textContent));
}
const count=doc=>({h2:doc.querySelectorAll('article h2').length,h3:doc.querySelectorAll('article h3').length,steps:doc.querySelectorAll('ol.docs-steps li').length,figures:doc.querySelectorAll('figure.docs-figure').length,tables:doc.querySelectorAll('article table').length,warnings:doc.querySelectorAll('.docs-callout-warning').length});
const normalize=s=>s.replaceAll('Mayús','Shift').replaceAll('Intro','Enter').replaceAll('Espacio','Space').replaceAll('⇧','Shift').replaceAll('⌥','Alt').replaceAll('⌘','Ctrl');
const report=[];
for(const [index,chapter] of catalogue.chapters.entries()){
 const pair={};
 for(const lang of ['es','en']){
  const route=base+chapter[lang].url;
  const doc=read(built(route));pair[lang]=doc;
  assert.equal(doc.documentElement.lang,lang);
  assert.ok(doc.querySelector('.github-link').getAttribute('aria-label'));
  for(const table of doc.querySelectorAll('article table'))assert.equal((table.closest('.docs-table-scroll')??table).getAttribute('tabindex'),'0',route+': scrollable table focus');
  for(const pre of doc.querySelectorAll('article pre'))assert.equal(pre.getAttribute('tabindex'),'0',route+': code focus');
  assert.equal(doc.querySelector('h1').textContent.trim(),chapter[lang].title);
  const sourceFile=path.join('website',lang,'docs',path.basename(chapter[lang].url.slice(0,-1))+'.md');
  const source=fs.readFileSync(sourceFile,'utf8');
  const front=YAML.parse(source.match(/^---\n([\s\S]*?)\n---/)[1]);
  assert.equal(front.docs_key,chapter.docs_key);assert.equal(front.permalink,chapter[lang].url);
  pair[lang+'Key']=front.translation_key;
  assert.equal(doc.querySelector('.language-switcher a').getAttribute('href'),base+chapter[lang==='es'?'en':'es'].url);
  const previous=doc.querySelector('.docs-pagination-previous'), next=doc.querySelector('.docs-pagination-next');
  assert.equal(previous?.getAttribute('href')??null,index?base+catalogue.chapters[index-1][lang].url:null);
  assert.equal(next?.getAttribute('href')??null,index<catalogue.chapters.length-1?base+catalogue.chapters[index+1][lang].url:null);
  for(const nav of doc.querySelectorAll('.docs-nav'))assert.equal(nav.querySelectorAll('a[aria-current="page"]').length,1);
  let level=1;
  for(const heading of doc.querySelectorAll('article h2, article h3, article h4')){const nextLevel=Number(heading.tagName[1]);assert.ok(nextLevel<=level+1,`${route}: skipped heading`);level=nextLevel;}
  for(const img of doc.querySelectorAll('figure img')){
   assert.ok(img.alt&&img.width&&img.height&&img.getAttribute('loading')==='lazy');
   assert.equal(img.parentElement.style.maxWidth,`${img.width}px`);
   const imagePath=img.getAttribute('src').slice(base.length);
   const record=manifest.find(m=>m.path===imagePath);assert.ok(record,`${route}: unowned image`);
   assert.equal(record.language,lang);referencedImages.add(record.id);
  }
 }
 assert.equal(pair.esKey,pair.enKey);
 assert.deepEqual(count(pair.es),count(pair.en),chapter.docs_key+': structure parity');
 const shortcuts=doc=>[...doc.querySelectorAll('article table')].map(table=>[...table.querySelectorAll('tbody tr')].map(row=>[...row.querySelectorAll('td')].map(cell=>[...cell.querySelectorAll('kbd')].map(k=>normalize(k.textContent)))));
 assert.deepEqual(shortcuts(pair.es),shortcuts(pair.en),chapter.docs_key+': keyboard parity');
 report.push({chapter:chapter.docs_key,...count(pair.en)});
}
// The language catalogue includes Markdown, which is routed to its visual editor.
const languageSource=fs.readFileSync('src/features/editors/text/CodeLanguages.ts','utf8');
const sourceExtensions=new Set([...languageSource.matchAll(/extensions:\s*\[([\s\S]*?)\]/g)].flatMap(m=>[...m[1].matchAll(/"([^"\n]+)"/g)].map(v=>'.'+v[1])));
for(const lang of ['es','en']){
 const entry=catalogue.chapters.find(c=>c.docs_key==='edit-text-code');
 const doc=read(built(base+entry[lang].url));
 const published=new Set([...doc.querySelectorAll('article code')].map(e=>e.textContent).filter(v=>/^\.[a-z0-9]+$/.test(v)));
 assert.deepEqual([...published].sort(),[...sourceExtensions].sort(),lang+': extension catalogue');
 const help=catalogue.chapters.find(c=>c.docs_key==='shortcuts-troubleshooting');
 const table=read(built(base+help[lang].url)).querySelector('article table');
 const rows=[...table.querySelectorAll('tbody tr')];
 const app=fs.readFileSync('src/app/AppContext.tsx','utf8').split('const shortcuts = [')[1].split('] satisfies')[0];
 const definitions=[...app.matchAll(/id: "([^"]+)"[\s\S]*?(key|code): "([^"]+)"([\s\S]*?)(?=\n        \},)/g)];
 assert.equal(rows.length,definitions.length);
 for(const match of definitions){
  const body=match[4], expected=[];
  if(!body.includes('primary: false'))expected.push('Ctrl');
  if(body.includes('shift: true'))expected.push('Shift');
  if(body.includes('alt: true'))expected.push('Alt');
  expected.push(match[3]==='Comma'?',':match[3]==='Period'?'.':match[3].toUpperCase());
  const row=rows.find(r=>JSON.stringify([...r.querySelectorAll('td')[1].querySelectorAll('kbd')].map(k=>normalize(k.textContent)))===JSON.stringify(expected));
  assert.ok(row,lang+': missing '+match[1]);
  for(const column of [1,2])assert.deepEqual([...row.querySelectorAll('td')[column].querySelectorAll('kbd')].map(k=>normalize(k.textContent)),expected,lang+': '+match[1]);
 }
}
assert.equal(new Set(manifest.map(m=>m.id)).size,manifest.length);
assert.equal(new Set(manifest.map(m=>m.path)).size,manifest.length);
assert.ok(manifest.every(m=>m.scope!=='native-window'),'OS window frames are not publishable');
const unused=manifest.filter(m=>!referencedImages.has(m.id));
assert.equal(referencedWebsiteImages.size,Object.keys(websiteImages).length);
console.log(JSON.stringify({html:documents.length,release:release.version,releaseAssets:release.assets.length,maintainerReportedTested:release.assets.filter(a=>a.tested).length,chapters:report,images:manifest.length,referencedImages:referencedImages.size,websiteImages:referencedWebsiteImages.size,unused:unused.map(m=>m.id),extensions:sourceExtensions.size,externalDocs:[...externalDocs].sort(),external:[...external].sort()},null,2));
