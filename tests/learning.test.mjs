import test from 'node:test';
import assert from 'node:assert/strict';
import {freshState,loadState,saveState,storageKey,openQuestion,setPriorSeen,revealHint,revealSolution,recordAttempt,evidenceLabel,scheduleReview,reviewStatus,checkResponse,mergeStates,assessProof,attemptIdentity} from '../web/learning.js';
import {dateLabel,escapeHTML} from '../web/utils.js';
const choice={id:'L05-Q1',kind:'choice',options:[{id:'a'},{id:'b'},{id:'c'}],answer:'b',hints:['先写假设','再写目标']};
const proof={id:'L05-Q2',kind:'proof',hints:['写论域','展开定义']};
function memory(){const values=new Map();return {getItem:key=>values.get(key)||null,setItem:(key,value)=>values.set(key,value)};}

test('空白和非法选项不生成作答；首次错误及后续修订分别保留',()=>{
  const state=freshState();
  assert.equal(recordAttempt(state,choice,{value:''},100).valid,false);
  assert.equal(recordAttempt(state,choice,{value:'wrong'},100).valid,false);
  assert.equal(state.questions[choice.id],undefined);
  recordAttempt(state,choice,{value:'a',reasoning:'原来的理由'},101);
  const original=structuredClone(state.questions[choice.id].firstAttempt);
  revealHint(state,choice,102);
  recordAttempt(state,choice,{value:'b',reasoning:'修正的理由'},103);
  assert.deepEqual(state.questions[choice.id].firstAttempt,original);
  assert.equal(state.questions[choice.id].attempts.length,2);
  assert.match(evidenceLabel(state.questions[choice.id]),/首次未答对；修订后答对/);
});

test('答案曝光跨刷新保留，不能重新取得首次无帮助证据',()=>{
  const storage=memory(),state=freshState();
  setPriorSeen(state,choice.id,'no');
  revealSolution(state,choice.id,100);
  assert.equal(saveState(storage,state),true);
  const restored=loadState(storage).state;
  recordAttempt(restored,choice,{value:'b'},200);
  assert.equal(restored.questions[choice.id].firstAttempt.helpBefore,true);
  assert.match(evidenceLabel(restored.questions[choice.id]),/使用过帮助/);
});

test('既往见题未知不认作未见；已声明见过不能降为未见',()=>{
  const state=freshState();
  recordAttempt(state,choice,{value:'b'},100);
  assert.match(evidenceLabel(state.questions[choice.id]),/未知/);
  setPriorSeen(state,choice.id,'yes');
  setPriorSeen(state,choice.id,'no');
  assert.equal(state.questions[choice.id].priorSeen,'yes');
  assert.match(evidenceLabel(state.questions[choice.id]),/曾见过/);
});

test('自由证明不自动判对；修订使旧自评失效，刷新仍待重新自评',()=>{
  const state=freshState(),storage=memory();
  recordAttempt(state,proof,{value:'任取整数 n，展开定义。'},100);
  assert.equal(state.questions[proof.id].firstAttempt.correct,null);
  assessProof(state,proof.id,'understood',110);
  assert.match(evidenceLabel(state.questions[proof.id]),/自评已理解/);
  recordAttempt(state,proof,{value:'我换一个证明，先作分类。'},120);
  assert.equal(state.questions[proof.id].selfAssessment,null);
  assert.match(evidenceLabel(state.questions[proof.id]),/待自评/);
  saveState(storage,state);
  assert.equal(loadState(storage).state.questions[proof.id].selfAssessment,null);
});

test('陈旧标签页保存前合并已存帮助，首次成功不能抹掉答案曝光',()=>{
  const storage=memory(),a=freshState(),b=freshState();
  setPriorSeen(b,choice.id,'no');
  revealSolution(a,choice.id,100);
  saveState(storage,a);
  recordAttempt(b,choice,{value:'b'},200);
  saveState(storage,b);
  const record=loadState(storage).state.questions[choice.id];
  assert.equal(record.solutionSeen,true);
  assert.equal(record.firstAttempt.helpBefore,true);
  assert.doesNotMatch(evidenceLabel(record),/首次无提示/);
});

test('两个标签的不同作答、首次作答与最新草稿均保留',()=>{
  const storage=memory(),a=freshState(),b=freshState();
  recordAttempt(a,choice,{value:'a'},100);
  a.notes.L05='较新的便签';a.noteUpdatedAt.L05=300;
  a.drafts[choice.id]={value:'b',reasoning:'新版草稿',updatedAt:300};
  saveState(storage,a);
  recordAttempt(b,choice,{value:'b'},200);
  b.notes.L05='旧便签';b.noteUpdatedAt.L05=50;
  b.drafts[choice.id]={value:'a',reasoning:'旧草稿',updatedAt:50};
  saveState(storage,b);
  const restored=loadState(storage).state;
  assert.equal(restored.questions[choice.id].firstAttempt.value,'a');
  assert.equal(restored.questions[choice.id].attempts.length,2);
  assert.equal(restored.notes.L05,'较新的便签');
  assert.equal(restored.drafts[choice.id].reasoning,'新版草稿');
});

test('参考解在首次无帮助答对之后才打开，不改写首次时间关系',()=>{
  const a=freshState(),b=freshState();
  setPriorSeen(a,choice.id,'no');
  recordAttempt(a,choice,{value:'b'},100);
  revealSolution(b,choice.id,200);
  const merged=mergeStates(a,b);
  assert.equal(merged.questions[choice.id].firstAttempt.helpBefore,false);
  assert.match(evidenceLabel(merged.questions[choice.id]),/首次无提示/);
  assert.equal(merged.questions[choice.id].solutionSeen,true);
});

test('跨标签合并不能让旧自评套到新的证明上',()=>{
  const old=freshState();
  recordAttempt(old,proof,{value:'第一版'},100);
  assessProof(old,proof.id,'understood',110);
  const newer=structuredClone(old);
  recordAttempt(newer,proof,{value:'新证明'},200);
  const merged=mergeStates(newer,old);
  assert.equal(merged.questions[proof.id].selfAssessment,null);
  assert.notEqual(attemptIdentity(merged.questions[proof.id].attempts[0]),attemptIdentity(merged.questions[proof.id].attempts[1]));
});

test('复验按可控时间安排，改设置不会重置已排日期，开过不再当新题',()=>{
  const state=freshState(),lesson={id:'L05',transfer:{id:'L05-R1'}};
  scheduleReview(state,lesson.id,1000);
  const due=1000+24*3600000;
  assert.equal(state.reviews.L05.dueAt,due);
  assert.equal(reviewStatus(state,lesson,due-1),'upcoming');
  assert.equal(reviewStatus(state,lesson,due),'due');
  state.settings.reviewHours=72;scheduleReview(state,lesson.id,2000);
  assert.equal(state.reviews.L05.dueAt,due);
  openQuestion(state,lesson.transfer.id,3000);
  assert.equal(reviewStatus(state,lesson,3001),'opened');
  const storage=memory();saveState(storage,state);
  assert.equal(reviewStatus(loadState(storage).state,lesson,4000),'opened');
});

test('分组仅计新题，不把同题修订重复计入',()=>{
  const state=freshState();
  recordAttempt(state,choice,{value:'a'},100);
  recordAttempt(state,choice,{value:'b'},200);
  assert.equal(state.group.ids.length,1);
  state.group.ids=[];
  recordAttempt(state,choice,{value:'b'},300);
  assert.equal(state.group.ids.length,0);
  recordAttempt(state,proof,{value:'第一步'},400);
  assert.deepEqual(state.group.ids,[proof.id]);
});

test('损坏或禁用存储可继续学习；极端日期不会造成白屏',()=>{
  const bad={getItem:()=>'{broken',setItem:()=>{throw new Error('blocked');}};
  assert.ok(loadState(bad).warning);
  const denied={getItem:()=>{throw new Error('blocked');},setItem:()=>{throw new Error('blocked');}};
  assert.ok(loadState(denied).warning);
  assert.equal(saveState(denied,freshState()),false);
  const storage=memory(),raw=freshState();
  raw.reviews.L05={scheduledAt:100,dueAt:1e100};
  raw.questions.L05={};
  storage.setItem(storageKey,JSON.stringify(raw));
  assert.equal(loadState(storage).state.reviews.L05,undefined);
  assert.equal(dateLabel(1e100),'时间未知');
});

test('数字检查接受等值分数，拒绝除零、表达式和接近但不等于的数',()=>{
  const question={kind:'number',answer:'1/4'};
  assert.equal(checkResponse(question,'2/8').correct,true);
  assert.equal(checkResponse(question,'0.25').correct,true);
  assert.equal(checkResponse(question,'1/0').valid,false);
  assert.equal(checkResponse(question,'2+2').valid,false);
  assert.equal(checkResponse({kind:'number',answer:'10'},'10.00000000001').correct,false);
});

test('用户原文保存，但渲染时转义HTML',()=>{
  const text='<img src=x onerror=alert(1)>';
  const state=freshState();recordAttempt(state,proof,{value:text},100);
  assert.equal(state.questions[proof.id].firstAttempt.value,text);
  assert.equal(escapeHTML(text),'&lt;img src=x onerror=alert(1)&gt;');
});

test('旧页面的自评不能套到另一个标签页的新作答上',()=>{
  const state=freshState();
  recordAttempt(state,proof,{value:'学生看过的版本'},100);
  const displayed=attemptIdentity(state.questions[proof.id].attempts.at(-1));
  recordAttempt(state,proof,{value:'另一个标签页的新版本'},200);
  assert.equal(assessProof(state,proof.id,'understood',300,displayed),false);
  assert.equal(state.questions[proof.id].selfAssessment,null);
  const latest=attemptIdentity(state.questions[proof.id].attempts.at(-1));
  assert.equal(assessProof(state,proof.id,'understood',400,latest),true);
  assert.equal(state.questions[proof.id].selfAssessment.forAttempt,latest);
});
