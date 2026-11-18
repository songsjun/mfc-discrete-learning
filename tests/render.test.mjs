// 这是模块渲染与事件契约测试。宿主是内存桩，不是浏览器，不覆盖CSS布局、原生表单或真实键盘操作。
import test from 'node:test';
import assert from 'node:assert/strict';
import {core,optional,lessonById} from '../web/course.js';
import {storageKey} from '../web/learning.js';
const memory=new Map(),appEvents=new Map(),windowEvents=new Map(),elements=new Map();
const app={innerHTML:'',addEventListener:(type,callback)=>appEvents.set(type,callback)};
function element(selector){if(!elements.has(selector))elements.set(selector,{textContent:'',hidden:false,focus(){},addEventListener(){},showModal(){}});return elements.get(selector);}
globalThis.document={title:'',querySelector:selector=>selector==='#app'?app:element(selector)};
globalThis.localStorage={getItem:key=>memory.get(key)||null,setItem:(key,value)=>memory.set(key,value)};
globalThis.location={hash:'#/path'};
globalThis.matchMedia=()=>({matches:true});
globalThis.scrollTo=()=>{};
globalThis.window={addEventListener:(type,callback)=>windowEvents.set(type,callback)};
globalThis.FormData=class{constructor(form){this.values=form.values;}get(key){return this.values[key] ?? null;}};
await import('../web/app.js');
function route(hash){location.hash=hash;windowEvents.get('hashchange')();}
function click(dataset){appEvents.get('click')({target:{closest:()=>({dataset})}});}
function submit(id,value,reasoning=''){
  const form={dataset:{question:id},values:{value,reasoning}};
  appEvents.get('submit')({target:{closest:()=>form},preventDefault(){}});
}
const saved=()=>JSON.parse(memory.get(storageKey));

test('首页及所有20节的四阶段可以产生完整页面，而非空壳',()=>{
  route('#/path');assert.match(app.innerHTML,/六段路径/);
  for(const lesson of [...core,...optional]){
    route('#/lesson/'+lesson.id);
    assert.ok(app.innerHTML.includes(lesson.title));
    for(const stage of ['learn','example','practice','review']){
      click({action:'stage',stage});
      assert.match(app.innerHTML,/<main id="main"/);
      assert.ok(!app.innerHTML.includes('undefined'));
      if(stage==='practice'){
        assert.ok(app.innerHTML.includes('id="question-'+lesson.exercises[0].id+'"'));
        assert.ok(!app.innerHTML.includes('id="solution-'+lesson.exercises[0].id+'"'));
      }
    }
  }
});

test('真实应用事件链保留错误首次作答，提示后修订并显示对应反馈',()=>{
  route('#/lesson/L05');click({action:'stage',stage:'practice'});
  const question=lessonById('L05').exercises[0],wrong=question.options.find(o=>o.id!==question.answer);
  submit(question.id,wrong.id,'我的第一份理由');
  click({action:'hint',id:question.id});
  submit(question.id,question.answer,'修订后的理由');
  const record=saved().questions[question.id];
  assert.equal(record.firstAttempt.value,wrong.id);
  assert.equal(record.attempts.length,2);
  assert.equal(record.hints,1);
  assert.match(app.innerHTML,/修订后答对/);
  route('#/records');
  assert.ok(app.innerHTML.includes(wrong.text));
  assert.ok(app.innerHTML.includes('我的第一份理由'));
});

test('证明事件不自动判对，新修订要求重新自评',()=>{
  route('#/lesson/L04');click({action:'stage',stage:'practice'});
  const question=lessonById('L04').exercises[1];
  submit(question.id,'<script>原始推理</script>');
  assert.equal(saved().questions[question.id].firstAttempt.correct,null);
  click({action:'self-assess',id:question.id,rating:'understood'});
  assert.match(app.innerHTML,/自评已理解/);
  submit(question.id,'修改后的推理');
  assert.match(app.innerHTML,/待自评/);
  route('#/records');
  assert.ok(!app.innerHTML.includes('<script>原始推理</script>'));
  assert.ok(app.innerHTML.includes('&lt;script&gt;原始推理&lt;/script&gt;'));
});

test('应用安排稍后题，提前打开后留下曝光记录；未知地址给出恢复入口',()=>{
  route('#/lesson/L18');click({action:'stage',stage:'review'});click({action:'finish',id:'L18'});
  assert.ok(saved().reviews.L18);
  route('#/review/L18');
  assert.match(app.innerHTML,/还没到建议时间/);
  assert.ok(saved().questions['L18-R1'].openedAt);
  route('#/review');assert.match(app.innerHTML,/曾经打开/);
  route('#/nothing');assert.match(app.innerHTML,/没有找到这个学习位置/);
  route('#/about');assert.match(app.innerHTML,/正式先修/);assert.match(app.innerHTML,/实际学习强度仍未知/);
});

test('旧页面点击自评时若另一标签已经修订，会要求重看而不写入自评',async()=>{
  const {recordAttempt,attemptIdentity}=await import('../web/learning.js');
  route('#/lesson/L04');click({action:'stage',stage:'practice'});
  const question=lessonById('L04').exercises[1];
  submit(question.id,'当前页面看到的版本');
  const displayed=attemptIdentity(saved().questions[question.id].attempts.at(-1));
  const remote=saved();
  recordAttempt(remote,question,{value:'另一标签新提交但本页尚未显示的版本'},Date.now()+100);
  memory.set(storageKey,JSON.stringify(remote));
  windowEvents.get('storage')({key:storageKey});
  click({action:'self-assess',id:question.id,rating:'understood',attempt:displayed});
  assert.equal(saved().questions[question.id].selfAssessment,null);
  assert.match(app.innerHTML,/请重新核对当前推理/);
});
