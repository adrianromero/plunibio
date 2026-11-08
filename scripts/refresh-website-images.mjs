// Reproduce landing/features scenes using the same real-app runner as Docs.
import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {execFile} from 'node:child_process';
import {createHash} from 'node:crypto';
import {mkdtemp, readFile, readdir, stat, writeFile, copyFile, rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join, resolve, relative} from 'node:path';
import {promisify} from 'node:util';

const root=resolve(import.meta.dirname,'..');
const exec=promisify(execFile);
const args=process.argv.slice(2);
assert.ok(args.every(arg=>arg==='--verify-only'),'Only --verify-only is supported');
const verifyOnly=args.includes('--verify-only');
const images=join(root,'website/assets/images');
const manifestPath=join(root,'website/_data/website_images.json');
const directory=join(root,'automation/flows');
const files=(await readdir(directory)).filter(n=>/^website-(en|es)-(files|markdown)\.json$/.test(n)).sort();
assert.equal(files.length,4,'Expected paired Markdown and file/image flows');
const flows=await Promise.all(files.map(async name=>({name,flow:JSON.parse(await readFile(join(directory,name),'utf8'))})));
const owners=new Map();
for(const {name,flow} of flows){
    assert.equal(flow.app.workspaceMode,'temporary-copy');
    for(const [index,step] of flow.steps.entries()){
        if(step.action!=='capture')continue;
        assert.equal(step.scope,'viewport','Marketing images must exclude native window decorations');
        assert.match(step.name,/^plunibio-(editor|features-[a-z-]+)-(en|es)$/);
        const filename=step.name+'.webp';
        assert.ok(!owners.has(filename),'Duplicate capture '+filename);
        owners.set(filename,{flow:'automation/flows/'+name,captureStep:index+1,language:flow.app.preferences.locale});
    }
}
assert.equal(owners.size,16);
const existing=(await readdir(images)).filter(n=>/^plunibio-(editor|features-.+)-(en|es)\.webp$/.test(n)).sort();
assert.deepEqual([...owners.keys()].sort(),existing,'Every existing landing/features image must be owned');
for(const filename of existing){
    const pair=filename.replace(/-(en|es)\.webp$/,(_,lang)=>lang==='en'?'-es.webp':'-en.webp');
    assert.ok(owners.has(pair),'Missing locale pair '+filename);
}
async function snapshot(directory){
    const result={};
    async function walk(path){
        for(const item of (await readdir(path,{withFileTypes:true})).sort((a,b)=>a.name.localeCompare(b.name))){
            const file=join(path,item.name);
            if(item.isDirectory())await walk(file);
            else if(item.isFile()){
                const info=await stat(file);
                result[relative(directory,file)]={sha256:createHash('sha256').update(await readFile(file)).digest('hex'),mtimeMs:info.mtimeMs};
            }
        }
    }
    await walk(directory);return result;
}
const fixtureRoots=[...new Set(flows.map(({flow})=>resolve(root,flow.app.basePath)))];
const protectedRoots=[...fixtureRoots,join(images,'docs')];
const before=await Promise.all(protectedRoots.map(snapshot));
const publishedBefore=verifyOnly?await Promise.all(existing.map(n=>readFile(join(images,n)))):null;
const manifestBefore=verifyOnly?await readFile(manifestPath):null;
if(verifyOnly){
    const currentManifest=JSON.parse(manifestBefore.toString());
    assert.deepEqual(Object.keys(currentManifest).sort(),existing);
    for(const filename of existing){
        for(const [key,value] of Object.entries(owners.get(filename)))assert.equal(currentManifest[filename][key],value,'Stale website image provenance: '+filename);
    }
}
const temporary=await mkdtemp(join(tmpdir(),'plunibio-website-captures-'));
async function run(filename){
    let output='';
    const status=await new Promise((done,reject)=>{
        const child=spawn(join(root,'node_modules/.bin/tsx'),[join(root,'automation/run.ts'),filename,...(verifyOnly?['--verify-only']:[])],{cwd:root,env:process.env,stdio:['ignore','pipe','pipe']});
        const collect=data=>{output=(output+data).slice(-100000);};
        child.stdout.on('data',collect);child.stderr.on('data',collect);
        child.once('error',reject);child.once('exit',code=>done(code??1));
    });
    if(status!==0){process.stderr.write(output);throw new Error('Website flow failed: '+filename);}
}
try{
    for(const [index,{name,flow}] of flows.entries()){
        console.log(`[${index+1}/${flows.length}] ${verifyOnly?'Verify':'Capture'} ${name}`);
        const stagedFlow=join(temporary,name);
        await writeFile(stagedFlow,JSON.stringify({...flow,outputDir:temporary}));
        await run(stagedFlow);
    }
    for(const [index,path] of protectedRoots.entries())assert.deepEqual(await snapshot(path),before[index],'Source fixtures or Docs images changed: '+path);
    if(!verifyOnly){
        const manifest={};
        // Convert and compare the whole batch before replacing any published file.
        for(const filename of existing){
            const source=join(temporary,filename.replace(/\.webp$/,'.png'));
            const output=join(temporary,filename);
            await exec('convert',[source,'-strip','-define','webp:lossless=true','-define','webp:method=6','-quality','100',output]);
            const {stderr}=await exec('compare',['-metric','AE',source,output,'null:']);
            assert.equal(Number(stderr.trim()),0,'WebP must preserve every captured pixel');
            const {stdout}=await exec('identify',['-format','%w %h',output]);
            const [width,height]=stdout.trim().split(' ').map(Number);
            assert.ok(width>0&&height>0);
            manifest[filename]={...owners.get(filename),width,height,bytes:(await stat(output)).size};
        }
        for(const filename of existing)await copyFile(join(temporary,filename),join(images,filename));
        await writeFile(manifestPath,JSON.stringify(manifest,null,2)+'\n');
        console.log('Replaced 16 screenshots with pixel-identical lossless WebP; dimensions and ownership recorded.');
    }else{
        for(const [index,filename] of existing.entries())assert.deepEqual(await readFile(join(images,filename)),publishedBefore[index]);
        assert.deepEqual(await readFile(manifestPath),manifestBefore);
        console.log('Verified 16 capture checkpoints; published images and manifest unchanged.');
    }
}finally{
    try{
        for(const [index,path] of protectedRoots.entries())assert.deepEqual(await snapshot(path),before[index],'Protected source changed: '+path);
        if(verifyOnly){
            for(const [index,filename] of existing.entries())assert.deepEqual(await readFile(join(images,filename)),publishedBefore[index]);
            assert.deepEqual(await readFile(manifestPath),manifestBefore);
        }
    }finally{await rm(temporary,{recursive:true,force:true});}
}
console.log('Original examples and 148 Docs images unchanged (SHA-256 and modification times checked).');
