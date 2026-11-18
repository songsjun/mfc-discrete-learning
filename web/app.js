import {lessons,core,optional,groups,lessonById,questionById,curriculumVersion} from './course.js';
import {loadState,saveState,questionRecord,openQuestion,setPriorSeen,revealHint,revealSolution,recordAttempt,evidenceLabel,scheduleReview,reviewStatus,syncState,assessProof,storageKey,attemptIdentity} from './learning.js';
import {escapeHTML as e,dateLabel,lines} from './utils.js';
import {renderVisual} from './visuals.js';
import {routeFromHash} from './routing.js';

const storage = {getItem:key=>localStorage.getItem(key),setItem:(key,value)=>localStorage.setItem(key,value)};
const loaded = loadState(storage);
const state = loaded.state;
if (!lessonById(state.activeLesson)) state.activeLesson = 'L01';
let storageWarning = loaded.warning;
let visualSettings = {}, flash = '', paused = false, saveTimer;
const app = document.querySelector('#app');
const stages = [{id:'learn',title:'直觉与概念'},{id:'example',title:'跟着例题'},{id:'practice',title:'自己练习'},{id:'review',title:'稍后复验'}];
const answerText = (question,attempt) => question.kind==='choice' ? (question.options.find(option=>option.id===attempt.value)?.text || attempt.value) : attempt.value;
const lessonHref = id => `#/lesson/${id}`;
const completed = () => core.filter(lesson=>state.learned[lesson.id] !== undefined).length;
const dueReviews = () => lessons.filter(lesson=>reviewStatus(state,lesson)==='due');
const announce = text => { document.querySelector('#live-status').textContent = text; };

function persist() {
  if (!saveState(storage,state)) storageWarning = '当前浏览器不能保存学习记录。请保持本页打开，并用“导出记录”备份。';
  const warning = document.querySelector('#storage-warning');
  if (warning) { warning.hidden = !storageWarning; warning.textContent = storageWarning; }
  const saved = document.querySelector('#save-status');
  if (saved) saved.textContent = storageWarning ? '仅保留在当前页面' : '已保存在本机';
}

function currentRoute() {
  const route = routeFromHash(location.hash);
  if (route.id && !lessonById(route.id)) return {view:'missing'};
  return route;
}

function nav(route) {
  const active = route.view==='lesson' ? route.id : '';
  return `<aside class="sidebar"><details class="course-nav" ${matchMedia('(min-width: 1050px)').matches?'open':''}><summary>课程目录 <span>18 节核心</span></summary><nav aria-label="知识点目录">${groups.map((group,index)=>`<div class="nav-group"><h2><span>${index+1}</span>${group.title}</h2>${group.ids.map(id=>{const lesson=lessonById(id);return `<a href="${lessonHref(id)}" ${active===id?'aria-current="page"':''}><span class="lesson-code">${id.slice(1)}</span><span>${e(lesson.title)}</span><span class="nav-mark" aria-label="${state.learned[id]!==undefined?'已学习':'未标记学习'}">${state.learned[id]!==undefined?'✓':''}</span></a>`;}).join('')}</div>`).join('')}<div class="nav-group optional-nav"><h2>可选衔接</h2>${optional.map(lesson=>`<a href="${lessonHref(lesson.id)}" ${active===lesson.id?'aria-current="page"':''}><span class="lesson-code">＋</span><span>${e(lesson.title)}</span></a>`).join('')}</div></nav></details><div class="sidebar-note"><span class="tiny-book">∴</span><p>每次弄清一个概念，<br>再自己写出一步。</p><a href="#/about">课程边界与资料来源</a></div></aside>`;
}

function layout(body,route) {
  return `<header class="site-header"><a href="#/path" class="brand"><img src="./icon.svg" alt="" width="38" height="38"><span>离散学习室<small>MFC 第一阶段基础准备</small></span></a><nav aria-label="主要导航"><a href="#/path" ${route.view==='path'?'aria-current="page"':''}>学习路径</a><a href="#/review" ${route.view==='review'?'aria-current="page"':''}>稍后复验${dueReviews().length?`<b class="count-badge">${dueReviews().length}</b>`:''}</a><a href="#/records" ${route.view==='records'?'aria-current="page"':''}>学习记录</a></nav><span class="local-tag"><i></i>本机保存</span></header><div class="app-shell">${nav(route)}<main id="main" tabindex="-1"><div id="storage-warning" class="notice warning" role="status" ${storageWarning?'':'hidden'}>${e(storageWarning)}</div>${flash?`<div class="notice" role="status">${e(flash)}</div>`:''}${state.group.ids.length>=state.settings.groupSize?`<div class="rest-banner"><div><strong>这一组已经尝试了 ${state.group.ids.length} 道新题</strong><p>可以先歇一会儿，再换一道题检验。</p></div><button class="button small-button" data-action="pause">先休息一下</button><button class="text-button" data-action="continue-group">继续一组</button></div>`:''}${body}<footer class="page-footer"><span>离散基础只是 MFC 准备的一部分。</span><a href="#/about">了解范围与未知项</a></footer></main></div><dialog id="rest-dialog"><div class="rest-symbol">∴</div><h2>先让思路停一停</h2><p>你的草稿和学习位置已保留。可以关掉页面，回来再继续。</p><button class="button" data-action="resume">继续学习</button></dialog>`;
}

function pathPage() {
  const next = lessonById(state.activeLesson) || core[0];
  return `<div class="path-intro"><div><p class="section-label">一本可以动手的数学手册</p><h1 id="page-title" tabindex="-1">把概念想清楚，<br>把理由写下来。</h1><p class="lead">为 MFC 先补一层离散基础。<br>从一个具体问题出发，走到自己的第一份证明。</p><a class="button" href="${lessonHref(next.id)}">${Object.keys(state.questions).length?'继续':'开始'}学习 · ${e(next.title)}</a><p class="quiet-note">每节约 35–45 分钟，先做两道短练。<br>这是待试学的时间预算，可以放慢。</p></div><div class="opening-problem"><span class="problem-label">先看一个小问题</span><h2>偶数，一定是<br>4 的倍数吗？</h2><div class="thought-line"><span>4 ∣ n</span><b>⇒</b><span>2 ∣ n</span></div><div class="thought-line reverse"><span>2 ∣ n</span><b>?</b><span>4 ∣ n</span></div><p>n = 2 就能帮你分清两个方向。</p><a href="${lessonHref('L02')}">从条件命题开始想</a></div></div><section class="path-section"><div class="section-heading"><div><h2>六段路径，十八个小节</h2><p>按顺序学习，也可以先检查自己需要补哪里。</p></div><span class="progress-caption">已标记学习 ${completed()} / 18 <small>不是掌握率</small></span></div><div class="path-groups">${groups.map((group,index)=>`<article class="path-group"><div class="path-number">${String(index+1).padStart(2,'0')}</div><div><h3>${group.title}</h3><p>${group.description}</p><ul>${group.ids.map(id=>`<li><a href="${lessonHref(id)}">${e(lessonById(id).title)}</a>${state.learned[id]!==undefined?'<span class="read-label">已学习</span>':''}</li>`).join('')}</ul></div></article>`).join('')}</div></section><section class="optional-section"><div><h2>学有余力，再接一小步</h2><p>两张可选卡，不计入核心学习进度。每张约 20–30 分钟。</p></div><div class="optional-links">${optional.map(lesson=>`<a href="${lessonHref(lesson.id)}"><span>可选</span><strong>${e(lesson.title)}</strong><small>${e(lesson.subtitle)}</small></a>`).join('')}</div></section><details class="scope-note"><summary>学到这里，离 MFC 还有多远？</summary><p>本站只补证明与选定的离散数学语言。MFC 官方以计算机或数学本科前四学期的背景为起点。线性代数、分析及更完整的概率基础需要另查。</p><p>正式先修明细、学期讲义和实际学习强度仍未知；完成这十八节不代表已补齐 MFC 全部先修。</p><a href="#/about">查看课程依据</a></details>`;
}

function lessonRail(lesson) {
  return `<aside class="lesson-rail"><section><h2>本节要做到</h2><ul class="goal-list">${lesson.goals.map(goal=>`<li>${e(goal)}</li>`).join('')}</ul></section><section><h2>建议先学</h2>${lesson.prerequisites.length?`<ul class="prereq-list">${lesson.prerequisites.map(id=>`<li><a href="${lessonHref(id)}">${e(lessonById(id)?.title || id)}</a></li>`).join('')}</ul>`:'<p class="small">会简单整数运算即可开始。</p>'}</section><section class="notebook"><label for="lesson-note">留一句自己的理解</label><textarea id="lesson-note" data-note="${lesson.id}" rows="6" maxlength="12000" placeholder="用自己的话说：这个概念在区分什么？">${e(state.notes[lesson.id] || '')}</textarea><small id="save-status">${storageWarning?'仅保留在当前页面':'已保存在本机'}</small></section><section class="lesson-sources"><h2>继续阅读</h2>${lesson.sources.map(source=>`<a href="${e(source.url)}" target="_blank" rel="noopener noreferrer">${e(source.label)} ↗</a>`).join('')}<p class="small">本站讲解与题目为原创。外链用于参照，不是 MFC 实际题单。</p></section></aside>`;
}

function learnStage(lesson) {
  return `<section aria-labelledby="intuition-title"><div class="reading-heading"><span class="stage-index">1</span><h2 id="intuition-title">先建立一个直觉</h2></div><p class="intuition-lead">${e(lesson.intuition.lead)}</p>${lesson.intuition.paragraphs.map(paragraph=>lines(paragraph)).join('')}${renderVisual(lesson.visual,visualSettings[lesson.id])}<div class="reading-heading"><span class="stage-index">2</span><h2>再把概念说准确</h2></div><dl class="definitions">${lesson.definitions.map(definition=>`<div><dt>${e(definition.term)} <span>${e(definition.en)}</span></dt><dd>${lines(definition.meaning)}${definition.formula?`<div class="formula">${e(definition.formula)}</div>`:''}</dd></div>`).join('')}</dl><div class="misconception"><span>容易走偏的一步</span><h3>${e(lesson.misconception.claim)}</h3>${lines(lesson.misconception.correction)}</div></section><div class="stage-navigation"><span>先能用自己的话解释，再往下走。</span><button class="button" data-action="stage" data-stage="example">看一个完整例题</button></div>`;
}

function exampleStage(lesson) {
  return `<section aria-labelledby="example-title"><p class="section-label">把每一步的理由连起来</p><h2 id="example-title">${e(lesson.example.title)}</h2><div class="problem-statement">${lines(lesson.example.prompt)}</div><ol class="worked-steps">${lesson.example.steps.map((step,index)=>`<li><span class="step-marker">${index+1}</span><div>${lines(step.text)}<details class="step-reason"><summary>为什么这一步成立？</summary>${lines(step.why)}</details></div></li>`).join('')}</ol><div class="example-conclusion"><strong>回到题目</strong>${lines(lesson.example.conclusion)}</div><p class="small">遮住步骤，试着复述从假设到结论的连接。记住答案和能重建理由是两件事。</p></section><div class="stage-navigation"><button class="text-button" data-action="stage" data-stage="learn">回看概念</button><button class="button" data-action="stage" data-stage="practice">合上例题，自己试试</button></div>`;
}

function questionCard(question,number,review=false) {
  const record = openQuestion(state,question.id);
  const draft = state.drafts[question.id] || {value:'',reasoning:''};
  const last = record.attempts.at(-1);
  let feedback = '';
  if (last) {
    const option = question.options?.find(option=>option.id===last.value);
    feedback = question.kind === 'proof' ? '推理已保存。请对照参考解和核对要点，记录自己的判断；系统不自动判定证明正确。' : `${last.correct?'这次判断正确。':'这次还需要修正。'} ${option?.feedback || (last.correct?'请再解释这个数值是怎样得到的。':'检查计数条件和计算，再尝试一次。')}`;
  }
  return `<article class="exercise" id="question-${question.id}"><div class="exercise-meta"><span>${review?'稍后复验':`练习 ${number}`} <b>${question.kind==='proof'?'写出推理':question.kind==='number'?'计算并解释':'作一个判断'}</b></span><small>${record.hints||record.solutionSeen?'已使用本题帮助':'本题未使用提示'}</small></div><h3>${e(question.prompt)}</h3><form data-question="${question.id}" novalidate>${question.kind==='choice'?`<fieldset><legend class="sr-only">选择你的判断</legend>${question.options.map(option=>`<label class="answer-option"><input type="radio" name="value" value="${e(option.id)}" ${draft.value===option.id?'checked':''}><span>${e(option.text)}</span></label>`).join('')}</fieldset>`:question.kind==='number'?`<label class="input-label" for="answer-${question.id}">你的数值或分数</label><input id="answer-${question.id}" type="text" inputmode="text" class="numeric-answer" name="value" value="${e(draft.value)}" maxlength="100" autocomplete="off" placeholder="例如 10 或 1/4">`:`<label class="input-label" for="answer-${question.id}">你的推理</label><textarea id="answer-${question.id}" name="value" rows="5" maxlength="12000" placeholder="先写对象与假设，再写有把握的第一步。">${e(draft.value)}</textarea>`}${question.kind!=='proof'?`<label class="input-label" for="reason-${question.id}">补一句理由 <span>可选</span></label><textarea id="reason-${question.id}" name="reasoning" rows="2" maxlength="12000" placeholder="你是怎样判断的？">${e(draft.reasoning)}</textarea>`:''}<div class="question-history"><label for="seen-${question.id}">作答前，你在别处见过本题吗？</label><select id="seen-${question.id}" data-seen="${question.id}"><option value="unknown" ${record.priorSeen==='unknown'?'selected':''}>不确定</option><option value="no" ${record.priorSeen==='no'?'selected':''}>没有见过</option><option value="yes" ${record.priorSeen==='yes'?'selected':''}>见过或做过</option></select></div><div class="exercise-actions"><button class="button" type="submit">${question.kind==='proof'?'记录这份推理':'检查这次答案'}</button><button class="text-button" type="button" data-action="hint" data-id="${question.id}" ${record.hints>=question.hints.length?'disabled':''}>${record.hints>=question.hints.length?'提示已全部展开':record.hints?'再给一点提示':'给一点提示'}</button><button class="text-button" type="button" data-action="solution" data-id="${question.id}">${record.solutionSeen?'回看参考解':'查看参考解'}</button></div></form><div id="feedback-${question.id}" tabindex="-1" class="answer-feedback ${last?(last.correct===false?'retry':'recorded'):'empty'}" role="status">${e(feedback)}</div>${record.hints?`<details open class="help-panel"><summary>已经使用的提示 · ${record.hints} 级</summary><ol>${question.hints.slice(0,record.hints).map(hint=>`<li>${e(hint)}</li>`).join('')}</ol></details>`:''}${record.solutionSeen?`<details open class="solution-panel" id="solution-${question.id}"><summary>参考解与核对要点</summary>${lines(question.solution)}<h4>逐项对照自己的写法</h4><ul>${question.rubric.map(item=>`<li>${e(item)}</li>`).join('')}</ul><p class="small">不同的正确解法同样成立。这里的参考解不是唯一写法。</p></details>`:''}${question.kind==='proof' && last?`<div class="self-assessment"><h4>对照后，记录一次自评</h4><p class="small">先核对对象、关键步骤和结论。自评表示你的判断，不是外部批改。</p><div class="exercise-actions"><button class="secondary-button" data-action="self-assess" data-id="${question.id}" data-rating="understood" data-attempt="${e(attemptIdentity(last))}">自评：能解释每一步</button><button class="secondary-button" data-action="self-assess" data-id="${question.id}" data-rating="needs-help" data-attempt="${e(attemptIdentity(last))}">自评：仍需帮助</button></div></div>`:''}${last?`<p class="evidence-line" tabindex="-1">${e(evidenceLabel(record))} <a href="#/records">看首次作答与修订</a></p>`:''}</article>`;
}

function practiceStage(lesson) {
  return `<section><div class="section-heading"><div><h2>现在，换你来想</h2><p>先试两道题。卡住时可以只写第一步，也可以请求提示。</p></div></div>${lesson.exercises.map((question,index)=>questionCard(question,index+1)).join('')}</section><div class="stage-navigation"><button class="text-button" data-action="stage" data-stage="example">回看例题</button><button class="button" data-action="stage" data-stage="review">安排稍后的检验</button></div>`;
}

function reviewStage(lesson) {
  const scheduled = state.reviews[lesson.id];
  const status = reviewStatus(state,lesson);
  const next = core[core.findIndex(value=>value.id===lesson.id)+1];
  return `<section class="review-plan"><span class="review-symbol">↺</span><h2>留一道题，给稍后的自己</h2><p>刚看懂例题时，解法还很熟悉。隔一段时间，再试一道不同题面的问题。</p><p>默认至少隔一天。这是试教安排，可以调整，并不是已证实的最佳间隔。</p>${scheduled?`<div class="scheduled-review"><strong>已安排 ${dateLabel(scheduled.dueAt)}</strong><p>${status==='attempted'?'你已经尝试过这道复验题，可以查看记录。':status==='opened'?'你已经在本站打开过这道题；再次打开不会标为本站未见。':'题面尚未在这里展开。准备好时再打开。'}</p><a class="button" href="#/review/${lesson.id}">${status==='due'?'开始稍后复验':'查看复验安排'}</a></div>`:`<button class="button" data-action="finish" data-id="${lesson.id}">本节已学习，安排稍后复验</button><p class="small">“已学习”是阅读进度标记，不是掌握证明。</p>`}<div class="review-next"><a href="#/path">今天先到这里</a>${next?`<a href="${lessonHref(next.id)}">下一节：${e(next.title)}</a>`:''}</div></section>`;
}

function lessonPage(lesson) {
  const stage = stages.find(value=>value.id===state.stage) || stages[0];
  return `<header class="lesson-header"><div class="breadcrumb"><a href="#/path">学习路径</a><span>/</span><span>${lesson.optional?'可选衔接':groups.find(group=>group.id===lesson.unit)?.description || '基础'}</span></div><div class="lesson-title-row"><div><p class="section-label">${lesson.optional?'可选短卡':`第 ${Number(lesson.id.slice(1))} 节`} <span>${lesson.minutes} 分钟左右</span></p><h1 id="lesson-title" tabindex="-1">${e(lesson.title)}</h1><p class="lesson-subtitle">${e(lesson.subtitle)}</p></div><span class="lesson-number" aria-hidden="true">${lesson.optional?'＋':lesson.id.slice(1)}</span></div><nav class="stage-tabs" aria-label="本节学习阶段">${stages.map((value,index)=>`<button data-action="stage" data-stage="${value.id}" ${stage.id===value.id?'aria-current="step"':''}><span>${index+1}</span>${value.title}</button>`).join('')}</nav></header><div class="lesson-layout"><div class="lesson-body">${stage.id==='learn'?learnStage(lesson):stage.id==='example'?exampleStage(lesson):stage.id==='practice'?practiceStage(lesson):reviewStage(lesson)}</div>${lessonRail(lesson)}</div>`;
}

function reviewPage(id) {
  if (id) {
    const lesson = lessonById(id), scheduled = state.reviews[id];
    if (!scheduled) return `<div class="empty-state"><h1 id="page-title" tabindex="-1">先为这一节留一点间隔</h1><p>可以先读概念、试即时题，再安排稍后复验。</p><a class="button" href="${lessonHref(id)}">回到${e(lesson.title)}</a></div>`;
    const alreadyOpened = !!state.questions[lesson.transfer.id]?.openedAt;
    const early = scheduled.dueAt>Date.now();
    return `<div class="breadcrumb"><a href="#/review">稍后复验</a><span>/</span><span>${e(lesson.title)}</span></div><h1 id="page-title" tabindex="-1">不带方法标签，再想一次</h1><p class="lead small-lead">${e(lesson.title)} · 计划时间 ${dateLabel(scheduled.dueAt)}</p>${early?'<div class="notice">还没到建议时间。可以提前练习；这次不能作为间隔学习效果的证据。</div>':''}<p class="small">${alreadyOpened?'本题曾在本站打开过，已有曝光记录。':'这次打开会记录题目曝光。是否曾在别处见过，由你在作答前声明。'}</p>${questionCard(lesson.transfer,1,true)}<a class="secondary-button" href="#/review">返回复验清单</a>`;
  }
  const scheduledLessons = lessons.filter(lesson=>state.reviews[lesson.id]);
  const labels = {due:'可以开始',upcoming:'还可等一等',opened:'曾经打开',attempted:'已经作答'};
  return `<div class="page-heading"><p class="section-label">用不同题面，检验是否还能重建思路</p><h1 id="page-title" tabindex="-1">稍后复验</h1><p class="lead small-lead">复验不计掌握率。先不看提示，留下自己的第一份作答。</p></div>${scheduledLessons.length?`<div class="review-list">${scheduledLessons.map(lesson=>{const status=reviewStatus(state,lesson);return `<article><div><span class="status-label ${status==='due'?'due':''}">${labels[status]}</span><h2>${e(lesson.title)}</h2><p>计划 ${dateLabel(state.reviews[lesson.id].dueAt)} · ${state.questions[lesson.transfer.id]?.openedAt!==undefined && state.questions[lesson.transfer.id]?.openedAt!==null?'本题曾在本站打开':'本站尚未打开题面'}</p></div><a class="secondary-button" href="#/review/${lesson.id}">${status==='attempted'?'回看作答':status==='opened'?'继续这道题':'打开这道题'}</a></article>`;}).join('')}</div>`:`<div class="empty-state"><span class="review-symbol">↺</span><h2>先学习一节，再留一道稍后的题</h2><p>在小节最后选择“安排稍后复验”，题目就会来到这里。</p><a class="button" href="${lessonHref(state.activeLesson)}">继续当前小节</a></div>`}`;
}

function recordsPage() {
  const attempted = Object.entries(state.questions).filter(([,record])=>record.firstAttempt);
  return `<div class="page-heading"><p class="section-label">记录发生过的学习</p><h1 id="page-title" tabindex="-1">学习记录</h1><p class="lead small-lead">保留第一次，也保留后来想通的地方。</p></div><div class="record-overview"><p><strong>${completed()}</strong> / 18 节已标记学习</p><p><strong>${attempted.length}</strong> 道题留下作答</p><button class="secondary-button" data-action="export">导出学习记录</button></div><p class="small">记录仅在当前浏览器。正确的选择题答案、证明自评和学习进度，都不等于稳定掌握。</p><details class="settings"><summary>调整学习节奏</summary><label>每组新题数<select data-setting="groupSize"><option value="2" ${state.settings.groupSize===2?'selected':''}>2 道</option><option value="3" ${state.settings.groupSize===3?'selected':''}>3 道</option></select></label><label>新安排的复验间隔<select data-setting="reviewHours">${[24,48,72].map(hours=>`<option value="${hours}" ${state.settings.reviewHours===hours?'selected':''}>${hours} 小时</option>`).join('')}</select></label><p class="small">改变间隔只影响以后安排的题；已安排的日期保持不变。</p></details>${attempted.length?`<div class="attempt-list">${attempted.map(([id,record])=>{const question=questionById(id);if(!question)return '';return `<details><summary><span>${e(question.prompt)}</span><small>${e(evidenceLabel(record))}</small></summary><div class="attempt-detail"><p>本题帮助记录：${record.hints?`${record.hints} 级提示`: '未使用提示'}；${record.solutionSeen?'已看参考解':'未看参考解'}。</p><h3>首次作答 <small>${dateLabel(record.firstAttempt.at)}</small></h3><blockquote>${lines(answerText(question,record.firstAttempt))}${record.firstAttempt.reasoning?lines(record.firstAttempt.reasoning):''}</blockquote><p class="small">首次作答前：${record.firstAttempt.helpBefore?'已经用过本题帮助':'未用本题提示或参考解'}；既往见题：${{unknown:'不确定',no:'自述未见',yes:'自述见过'}[record.firstAttempt.priorSeen]}。</p>${record.attempts.length>1?`<h3>后续修订</h3>${record.attempts.slice(1).map(attempt=>`<div class="revision"><small>${dateLabel(attempt.at)} · ${attempt.correct===null?'推理待自评':attempt.correct?'本次答对':'本次仍需修正'}</small>${lines(answerText(question,attempt))}${attempt.reasoning?lines(attempt.reasoning):''}</div>`).join('')}`:''}${record.selfAssessment?`<p>最近自评：${record.selfAssessment.rating==='understood'?'能解释每一步':'仍需帮助'}。此项不是外部批改。</p>`:''}</div></details>`;}).join('')}</div>`:'<div class="empty-state"><h2>第一份推理，从一句话开始</h2><p>你在练习里提交的判断和推理会显示在这里。未提交的草稿保留在原题。</p><a class="button" href="'+lessonHref(state.activeLesson)+'">去试一道题</a></div>'}`;
}

function aboutPage() {
  return `<article class="about-page"><p class="section-label">范围、依据与使用方式</p><h1 id="page-title" tabindex="-1">为 MFC 打一层基础</h1><p class="lead small-lead">这是独立编写的学习资料，不是斯图加特大学的官方课程平台。</p><h2>先补哪些能力</h2><p>十八节核心只覆盖证明方法、集合与映射、关系与等价类、基础计数。图论、布尔代数、有限自动机和递推关系求解不进入本站。模逆与有限概率是可选短卡。</p><h2>课程边界</h2><p>目标课程是斯图加特大学信息安全研究所的硕士课 Mathematical Foundations of (Post-Quantum) Cryptography。官方以计算机或数学本科前四学期的背景为起点，并说明相关数学理论会自足讲授。</p><p>本站不补齐 MFC 全部先修。正式先修的具体字段、学期讲义及新生实际学习强度仍未知。官网介绍涉及的高阶领域不应全部提前塞进新生补习。</p><p><a href="https://www.sec.uni-stuttgart.de/teaching/mathematical-foundations-of-post-quantum-cryptography/" target="_blank" rel="noopener noreferrer">MFC 官方课程说明 ↗</a>　<a href="https://www.sec.uni-stuttgart.de/teaching/" target="_blank" rel="noopener noreferrer">研究所教学目录 ↗</a></p><h2>怎样判断自己会不会</h2><p>先独立作答，再按需要看提示。看过提示、解答或在别处见过本题时，请保留真实记录。自由证明通过参考解和核对要点自评，系统不自动认证证明正确，也不计算掌握率。</p><p>遇到不同的合理解法，可以保留自己的证明。若暂时不能解释关键步骤，把它写进便签，稍后再回来看。</p><h2>资料与许可</h2><ul class="source-list"><li><a href="https://aime.kapy.ca/" target="_blank" rel="noopener noreferrer">aime 学习室</a>：参考其知识点、直觉、例题、练习和复验的组织方式；不复制页面代码或竞赛题库。</li><li><a href="https://discrete.openmathbooks.org/dmoi4.html" target="_blank" rel="noopener noreferrer">Oscar Levin · Discrete Mathematics: An Open Introduction</a>：证明、归纳和函数的参照教材，作者标示 CC BY-NC-SA 4.0。</li><li><a href="https://richardhammack.github.io/BookOfProof/" target="_blank" rel="noopener noreferrer">Richard Hammack · Book of Proof</a>：集合、证明与等价类的外链阅读。作者标示 CC BY-NC-ND 4.0，不将其译文或改编当作本站可发布底稿。</li><li><a href="https://ocw.mit.edu/courses/6-042j-mathematics-for-computer-science-spring-2015/pages/readings/" target="_blank" rel="noopener noreferrer">MIT · Mathematics for Computer Science（2015）</a>：精选计数、数论与有限概率的参照。该版教材标示 CC BY-NC-SA 3.0。</li></ul><p>本站题目与讲解为原创的标准数学内容。各小节列出继续阅读的定位。它们不是 MFC 实际题单。课程研究核查日期为 2026 年 11 月 17 日。</p><h2>记录保存在这里</h2><p>草稿、便签、首次作答、修订及提示使用保存在当前浏览器，不上传到服务器。换浏览器、清除站点数据或浏览器限制存储时，记录可能不在。你可以在学习记录页导出备份。</p><p>每节 35–45 分钟、可选卡 20–30 分钟和默认一天的复验间隔都是待试学参数。随时可以休息，不必赶进度。</p><a class="button" href="#/path">回到学习路径</a></article>`;
}

function render(focus) {
  syncState(storage,state);
  const route = currentRoute();
  if (route.view==='lesson' && state.activeLesson!==route.id) { state.activeLesson=route.id;state.stage='learn'; }
  const body = route.view==='path'?pathPage():route.view==='lesson'?lessonPage(lessonById(route.id)):route.view==='review'?reviewPage(route.id):route.view==='records'?recordsPage():route.view==='about'?aboutPage():`<div class="empty-state"><h1 id="page-title" tabindex="-1">没有找到这个学习位置</h1><p>可以从目录重新选择一个小节，已保存的记录仍在。</p><a class="button" href="#/path">回到学习路径</a></div>`;
  document.title = `${route.view==='lesson'?lessonById(route.id).title:route.view==='records'?'学习记录':route.view==='review'?'稍后复验':route.view==='about'?'课程说明':'学习路径'} · 离散学习室`;
  app.innerHTML=layout(body,route);
  persist();
  if (focus) document.querySelector(focus)?.focus();
}

app.addEventListener('input',event=>{
  const target=event.target;
  if (target.dataset.note) {state.notes[target.dataset.note]=target.value;state.noteUpdatedAt[target.dataset.note]=Date.now();}
  else if (target.closest('form[data-question]')) {
    const form=target.closest('form'),data=new FormData(form);
    state.drafts[form.dataset.question]={value:String(data.get('value')||''),reasoning:String(data.get('reasoning')||''),updatedAt:Date.now()};
  } else return;
  const saved=document.querySelector('#save-status');if(saved)saved.textContent='正在保存…';
  clearTimeout(saveTimer);saveTimer=setTimeout(persist,200);
});

app.addEventListener('change',event=>{
  const target=event.target;
  if (target.dataset.seen) {setPriorSeen(state,target.dataset.seen,target.value);target.value=questionRecord(state,target.dataset.seen).priorSeen;persist();}
  if (target.dataset.setting) {state.settings[target.dataset.setting]=Number(target.value);persist();announce('学习节奏已保存。');}
  if (target.dataset.visual==='modulus') {visualSettings[state.activeLesson] ||= {};visualSettings[state.activeLesson].modulus=Number(target.value);render('[data-visual="modulus"]');}
});

app.addEventListener('submit',event=>{
  const form=event.target.closest('form[data-question]');if(!form)return;event.preventDefault();
  const question=questionById(form.dataset.question),data=new FormData(form),response={value:String(data.get('value')||''),reasoning:String(data.get('reasoning')||'')};
  syncState(storage,state);
  state.drafts[question.id]={...response,updatedAt:Date.now()};
  const result=recordAttempt(state,question,response);
  if(!result.valid){const feedback=document.querySelector(`#feedback-${question.id}`);feedback.textContent=result.message;feedback.className='answer-feedback retry';feedback.focus();return;}
  flash='';persist();render(`#feedback-${question.id}`);announce(question.kind==='proof'?'推理已记录，可以对照要点自评。':result.correct?'本次答案正确，记录已保存。':'本次答案还需修正，首次作答已保留。');
});

app.addEventListener('click',event=>{
  const button=event.target.closest('button');if(!button)return;
  if(button.dataset.visual){visualSettings[state.activeLesson] ||= {};const key=button.dataset.visual;visualSettings[state.activeLesson][key]=key==='ordered'?button.dataset.value==='true':Number(button.dataset.value);render(`[data-visual="${key}"][data-value="${button.dataset.value}"]`);return;}
  const action=button.dataset.action,id=button.dataset.id;
  if(!action)return;
  if(action==='stage'){state.stage=button.dataset.stage;flash='';persist();render('#lesson-title');return;}
  if(action==='hint'){const question=questionById(id);revealHint(state,question);persist();render(`#question-${id} .help-panel summary`);announce('提示已展开，使用记录已保存。');return;}
  if(action==='solution'){revealSolution(state,id);persist();render(`#solution-${id} summary`);announce('参考解已展开，本题帮助记录已保留。');return;}
  if(action==='self-assess'){syncState(storage,state);const accepted=assessProof(state,id,button.dataset.rating,Date.now(),button.dataset.attempt);flash=accepted?'':'这道题刚在另一个标签页修订。请重新核对当前推理，再记录自评。';persist();render(accepted?`#question-${id} .evidence-line`:'#main');announce(accepted?'自评已保存，不作为外部批改结果。':flash);return;}
  if(action==='finish'){state.learned[id]=Date.now();scheduleReview(state,id);persist();render('#lesson-title');announce('本节已标记学习，复验已经安排。');return;}
  if(action==='continue-group'||action==='resume'){state.group.ids=[];paused=false;persist();render();return;}
  if(action==='pause'){paused=true;document.querySelector('#rest-dialog').showModal();return;}
  if(action==='export'){
    const payload={exportedAt:new Date().toISOString(),curriculumVersion,meaning:'作答与帮助记录；自由证明评价为学生自评，不是正确性认证。',state,questions:Object.keys(state.questions).filter(key=>questionById(key)).map(key=>({id:key,prompt:questionById(key).prompt,options:questionById(key).options?.map(option=>({id:option.id,text:option.text}))}))};
    const url=URL.createObjectURL(new Blob([JSON.stringify(payload,null,2)],{type:'application/json'})),link=document.createElement('a');link.href=url;link.download=`mfc-learning-${new Date().toISOString().slice(0,10)}.json`;link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);announce('学习记录已准备下载。');
  }
});

app.addEventListener('close',()=>{paused=false;},true);
document.querySelector('.skip-link').addEventListener('click',event=>{event.preventDefault();document.querySelector('#main')?.focus();});
window.addEventListener('hashchange',()=>{flash='';paused=false;render('#main');scrollTo({top:0,behavior:'instant'});});
window.addEventListener('storage',event=>{if(event.key!==storageKey)return;syncState(storage,state);announce('另一个标签页更新了记录，已合并首次作答与帮助证据。');});
window.addEventListener('pagehide',()=>{clearTimeout(saveTimer);persist();});
render();
