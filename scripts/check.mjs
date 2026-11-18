import {readdir,readFile} from 'node:fs/promises';
import {spawnSync} from 'node:child_process';
import {join} from 'node:path';
async function collect(directory) {
  const result=[];
  for (const entry of await readdir(directory,{withFileTypes:true})) {
    const path=join(directory,entry.name);
    if(entry.isDirectory()) result.push(...await collect(path));
    else if(/\.(m?js)$/.test(path)) result.push(path);
  }
  return result;
}
const files=[...await collect('web'),...await collect('scripts')];
for(const file of files){
  const result=spawnSync(process.execPath,['--check',file],{encoding:'utf8'});
  if(result.status!==0){console.error(result.stderr);process.exit(1);}
}
const html=await readFile('web/index.html','utf8');
if(!html.includes('lang="zh-CN"') || !html.includes('type="module"')) throw new Error('入口缺少语言或模块声明');
console.log('语法与入口检查通过：'+files.length+' 个 JavaScript 文件。');
