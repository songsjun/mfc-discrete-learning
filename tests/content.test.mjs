import test from 'node:test';
import assert from 'node:assert/strict';
import {lessons,core,optional,groups,lessonById} from '../web/course.js';
import {residue,pairs,mappingProperties,mappingCases,renderVisual} from '../web/visuals.js';
import {routeFromHash} from '../web/routing.js';
const filled=value=>typeof value==='string' && value.trim().length>0;

test('18节核心和2张可选卡覆盖约定范围，可选不进入核心进度',()=>{
  assert.deepEqual(core.map(l=>l.id),Array.from({length:18},(_,i)=>'L'+String(i+1).padStart(2,'0')));
  assert.deepEqual(optional.map(l=>l.id),['B01','B02']);
  assert.equal(groups.flatMap(g=>g.ids).length,18);
  for(const lesson of core) assert.ok(lesson.minutes>=35 && lesson.minutes<=45);
  for(const lesson of optional) assert.ok(lesson.minutes>=20 && lesson.minutes<=30);
  const titles=core.map(l=>l.title).join(' ');
  for(const term of ['直接证明','逆否','反证','归纳','集合','映射','单射','满射','双射','关系','等价类','排列','组合','鸽巢']) assert.ok(titles.includes(term),term);
  for(const term of ['图论','布尔代数','有限自动机','递推关系求解']) assert.ok(!titles.includes(term));
});

test('每个知识点都有完整教学闭环，所有题都有提示、完整解和核对要点',()=>{
  const ids=new Set();
  for(const lesson of lessons){
    assert.ok(lesson.goals.length>=2,lesson.id);
    assert.ok(filled(lesson.intuition.lead));
    assert.ok(lesson.intuition.paragraphs.length>=2);
    assert.ok(lesson.definitions.length>=1);
    assert.ok(lesson.example.steps.length>=3);
    for(const step of lesson.example.steps) assert.ok(filled(step.text)&&filled(step.why));
    assert.ok(filled(lesson.example.conclusion));
    assert.ok(filled(lesson.misconception.claim)&&filled(lesson.misconception.correction));
    assert.equal(lesson.exercises.length,2);
    assert.equal(lesson.exercises[0].kind,'choice');
    for(const question of [...lesson.exercises,lesson.transfer]){
      assert.ok(!ids.has(question.id),'重复题ID '+question.id);ids.add(question.id);
      assert.ok(filled(question.prompt)&&filled(question.solution));
      assert.ok(question.hints.length>=2&&question.hints.every(filled));
      assert.ok(question.rubric.length>=2&&question.rubric.every(filled));
      if(question.kind==='choice'){
        assert.ok(question.options.length>=3);
        assert.equal(new Set(question.options.map(o=>o.id)).size,question.options.length);
        assert.ok(question.options.some(o=>o.id===question.answer));
        for(const option of question.options) assert.ok(filled(option.text)&&filled(option.feedback));
      }
    }
    for(const source of lesson.sources) assert.equal(new URL(source.url).protocol,'https:');
    assert.ok(!lesson.exercises.some(q=>q.prompt===lesson.transfer.prompt));
  }
  assert.equal(ids.size,60);
});

test('所有先修可定位且无循环，使用余数的鸽巢题确实依赖同余课',()=>{
  const finished=new Set(),active=new Set();
  function visit(id){
    assert.ok(lessonById(id),'缺失先修 '+id);
    assert.ok(!active.has(id),'先修成环 '+id);
    if(finished.has(id))return;
    active.add(id);for(const parent of lessonById(id).prerequisites)visit(parent);
    active.delete(id);finished.add(id);
  }
  for(const lesson of lessons)visit(lesson.id);
  assert.ok(lessonById('L18').prerequisites.includes('L15'));
});

test('可视映射的陪域改变会改变满射结论，碰撞会破坏单射',()=>{
  assert.deepEqual(mappingProperties(mappingCases[0].outputs,mappingCases[0].codomain),{injective:true,surjective:true});
  assert.deepEqual(mappingProperties(mappingCases[1].outputs,mappingCases[1].codomain),{injective:true,surjective:false});
  assert.deepEqual(mappingProperties(mappingCases[2].outputs,mappingCases[2].codomain),{injective:false,surjective:false});
  assert.deepEqual(mappingProperties(mappingCases[3].outputs,mappingCases[3].codomain),{injective:false,surjective:true});
  assert.match(renderVisual('mapping',{mapping:1}),/不是满射/);
});

test('负数余数与计数的交互例子符合业务样例',()=>{
  assert.equal(residue(-6,4),2);assert.equal(residue(-1,3),2);
  assert.equal(pairs(false).length,10);assert.equal(pairs(true).length,20);
  assert.ok(pairs(false).every(([a,b])=>a!==b));
  assert.match(renderVisual('residues',{modulus:4}),/−6 属于 \[2\]/);
  assert.match(renderVisual('counting',{ordered:true}),/共 20 种/);
});

test('概率数值用独立枚举核验，不依赖课程给出的答案',()=>{
  function repeated(labels,draws){
    let total=0,repeats=0;
    function visit(sequence){
      if(sequence.length===draws){total++;if(new Set(sequence).size<sequence.length)repeats++;return;}
      for(let i=0;i<labels;i++)visit([...sequence,i]);
    }
    visit([]);return [repeats,total];
  }
  assert.deepEqual(repeated(4,2),[4,16]);
  assert.deepEqual(repeated(4,3),[40,64]);
  assert.deepEqual(repeated(8,3),[176,512]);
});

test('合法深链接可定位，未知或注入样式地址不会解释为课节',()=>{
  assert.deepEqual(routeFromHash('#/lesson/L05'),{view:'lesson',id:'L05'});
  assert.deepEqual(routeFromHash('#/review/B02'),{view:'review',id:'B02'});
  assert.deepEqual(routeFromHash('#/unknown'),{view:'missing'});
  assert.deepEqual(routeFromHash('#/lesson/<script>'),{view:'missing'});
});
