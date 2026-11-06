// Instrument a disposable copy only. The publishable Jekyll output stays unchanged.
import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import {createRequire} from 'node:module';
const require=createRequire(path.join(process.cwd(),'package.json'));
const YAML=require('yaml');
const source=path.resolve(process.argv[2]??'automation/output/website-preview');
const config=YAML.parse(await fs.readFile('website/_config.yml','utf8'));
const base=config.baseurl;
const destination=await fs.mkdtemp(path.join(os.tmpdir(),'plunibio-docs-browser-qa-'));
await fs.cp(path.join(source,base),path.join(destination,base),{recursive:true});
await fs.mkdir(path.join(destination,'qa'));
await fs.copyFile(require.resolve('axe-core/axe.min.js'),path.join(destination,'qa/axe.min.js'));
const data=YAML.parse(await fs.readFile('website/_data/docs.yml','utf8'));
const releasePages=process.argv.includes('--release-pages');
const allPages=process.argv.includes('--all-pages');
const pages=['es','en'].flatMap(lang=>[
 {url:`${base}/${lang}/docs/`,title:`${lang}: Docs`},
 ...(allPages?['','features/','install/','about/'].map(route=>({url:`${base}/${lang}/${route}`,title:`${lang}: ${route||'Home'}`})):releasePages?[{url:`${base}/${lang}/install/`,title:`${lang}: Installation`}]:[]),
 ...(!releasePages||allPages?data.chapters.map(c=>({url:base+c[lang].url,title:`${lang}: ${c[lang].title}`})):[])
]);
for(const page of pages){
 const filename=path.join(destination,page.url,'index.html');
 let html=await fs.readFile(filename,'utf8');
 html=html.replace('</body>','<script src="/qa/axe.min.js"></script><script src="/qa/frame.js"></script></body>');
 await fs.writeFile(filename,html);
}
await fs.writeFile(path.join(destination,'qa/frame.js'),`(async()=>{
 try {
  await Promise.race([document.fonts.ready,new Promise(r=>setTimeout(r,3000))]);
  const result=await axe.run(document,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21aa','wcag22aa']}});
  parent.postMessage({type:'docs-qa',url:location.pathname,width:innerWidth,clientWidth:document.documentElement.clientWidth,scrollWidth:document.documentElement.scrollWidth,violations:result.violations.map(v=>({id:v.id,impact:v.impact,nodes:v.nodes.map(n=>({target:n.target,summary:n.failureSummary}))})),incomplete:result.incomplete.map(v=>v.id)},location.origin);
 } catch(error){parent.postMessage({type:'docs-qa',url:location.pathname,width:innerWidth,error:String(error)},location.origin);}
})();`);
await fs.writeFile(path.join(destination,'qa/index.html'),`<!doctype html><html lang="en"><meta charset="utf-8"><title>Docs browser QA</title>
<style>body{font:14px system-ui;margin:16px;background:#eee}header{position:sticky;top:0;background:white;padding:10px;z-index:2}iframe{display:block;border:1px solid #333;background:white;height:800px}pre{white-space:pre-wrap}button,select{font:inherit;margin:4px;padding:5px}</style>
<header><h1>Docs browser QA</h1><label>Page <select id="page"></select></label><label>Width <select id="width"><option>320</option><option selected>375</option><option>768</option><option>1280</option></select></label><button id="preview">Preview</button><button id="run">Run all ${pages.length*4} cases</button><button id="download">Download results</button><p id="status">Ready</p></header>
<iframe id="frame" title="Documentation preview" width="375"></iframe><pre id="results"></pre>
<script>
const pages=${JSON.stringify(pages)};const widths=[320,375,768,1280];const results=[];let queue=[],running=false;
const frame=document.querySelector('#frame'),page=document.querySelector('#page'),width=document.querySelector('#width');
pages.forEach((p,i)=>{const o=document.createElement('option');o.value=i;o.textContent=p.title;page.append(o)});
function load(p,w){frame.width=w;frame.src=pages[p].url+'?qa='+Date.now();document.querySelector('#status').textContent=pages[p].title+' at '+w+'px';}
function next(){if(queue.length){const [p,w]=queue.shift();load(p,w)}else{running=false;document.querySelector('#status').textContent='Complete: '+results.length+' cases; failures: '+results.filter(r=>r.error||r.scrollWidth>r.clientWidth||r.violations?.length).length;}}
document.querySelector('#preview').onclick=()=>{queue=[];running=false;load(Number(page.value),Number(width.value));};
document.querySelector('#run').onclick=()=>{results.length=0;queue=pages.flatMap((p,i)=>widths.map(w=>[i,w]));running=true;next();};
addEventListener('message',event=>{if(event.origin!==location.origin||event.data.type!=='docs-qa')return;results.push(event.data);document.querySelector('#results').textContent=JSON.stringify(results,null,2);if(running)next();else document.querySelector('#status').textContent='Preview: '+event.data.url+' width '+event.data.width+' scroll '+event.data.scrollWidth+' violations '+(event.data.violations?.length??'error');});
document.querySelector('#download').onclick=()=>{const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([JSON.stringify(results,null,2)],{type:'application/json'}));a.download='documentation-browser-qa.json';a.click();};
load(0,375);
</script></html>`);
console.log(destination);
