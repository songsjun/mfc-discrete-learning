export const storageKey = 'mfc-study-room:v1';
const dict = value => value !== null && typeof value === 'object' && !Array.isArray(value);
const finite = value => typeof value === 'number' && Number.isFinite(value) && value >= 0 && value <= 8640000000000000;
const lessonKey = id => /^(L\d{2}|B0[12])$/.test(id);
const questionKey = id => /^(L\d{2}|B0[12])-(Q[12]|R1)$/.test(id);
const seenValues = new Set(['unknown','no','yes']);

export function freshState() {
  return {version:1, activeLesson:'L01', stage:'learn', learned:{}, reviews:{}, questions:{}, drafts:{}, notes:{}, noteUpdatedAt:{}, settings:{groupSize:2, reviewHours:24}, group:{ids:[]}};
}

function safeAttempt(value) {
  if (!dict(value) || !finite(value.at) || typeof value.value !== 'string') return null;
  return {at:value.at, value:value.value, reasoning:typeof value.reasoning === 'string' ? value.reasoning : '', correct:typeof value.correct === 'boolean' ? value.correct : null, kind:['choice','number','proof'].includes(value.kind) ? value.kind : 'proof', helpBefore:!!value.helpBefore, priorSeen:seenValues.has(value.priorSeen) ? value.priorSeen : 'unknown'};
}

export function sanitizeState(raw) {
  if (!dict(raw) || raw.version !== 1) throw new Error('Unsupported record');
  const state = freshState();
  if (typeof raw.activeLesson === 'string' && lessonKey(raw.activeLesson)) state.activeLesson = raw.activeLesson;
  if (['learn','example','practice','review'].includes(raw.stage)) state.stage = raw.stage;
  if (dict(raw.settings)) {
    if ([2,3].includes(raw.settings.groupSize)) state.settings.groupSize = raw.settings.groupSize;
    if ([24,48,72].includes(raw.settings.reviewHours)) state.settings.reviewHours = raw.settings.reviewHours;
  }
  for (const [id,value] of Object.entries(dict(raw.learned) ? raw.learned : {})) if (lessonKey(id) && finite(value)) state.learned[id] = value;
  for (const [id,value] of Object.entries(dict(raw.notes) ? raw.notes : {})) if (lessonKey(id) && typeof value === 'string') state.notes[id] = value;
  for (const [id,value] of Object.entries(dict(raw.noteUpdatedAt) ? raw.noteUpdatedAt : {})) if (lessonKey(id) && finite(value)) state.noteUpdatedAt[id] = value;
  for (const [id,value] of Object.entries(dict(raw.reviews) ? raw.reviews : {})) {
    if (lessonKey(id) && dict(value) && finite(value.scheduledAt) && finite(value.dueAt)) state.reviews[id] = {scheduledAt:value.scheduledAt,dueAt:value.dueAt};
  }
  for (const [id,value] of Object.entries(dict(raw.drafts) ? raw.drafts : {})) {
    if (questionKey(id) && dict(value)) state.drafts[id] = {value:typeof value.value === 'string' ? value.value : '',reasoning:typeof value.reasoning === 'string' ? value.reasoning : '',updatedAt:finite(value.updatedAt) ? value.updatedAt : 0};
  }
  for (const [id,value] of Object.entries(dict(raw.questions) ? raw.questions : {})) {
    if (!questionKey(id) || !dict(value)) continue;
    const record = questionRecord(state,id);
    record.openedAt = finite(value.openedAt) ? value.openedAt : null;
    record.priorSeen = seenValues.has(value.priorSeen) ? value.priorSeen : 'unknown';
    record.hints = Number.isInteger(value.hints) ? Math.max(0,Math.min(10,value.hints)) : 0;
    record.solutionSeen = !!value.solutionSeen;
    record.hintSeenAt = record.hints ? (finite(value.hintSeenAt) ? value.hintSeenAt : 0) : null;
    record.solutionSeenAt = record.solutionSeen ? (finite(value.solutionSeenAt) ? value.solutionSeenAt : 0) : null;
    record.attempts = Array.isArray(value.attempts) ? value.attempts.map(safeAttempt).filter(Boolean) : [];
    record.firstAttempt = safeAttempt(value.firstAttempt) || record.attempts[0] || null;
    if (dict(value.selfAssessment) && ['understood','needs-help'].includes(value.selfAssessment.rating) && finite(value.selfAssessment.at) && value.selfAssessment.forAttempt === attemptIdentity(record.attempts.at(-1))) record.selfAssessment = {rating:value.selfAssessment.rating, at:value.selfAssessment.at,forAttempt:value.selfAssessment.forAttempt};
  }
  if (dict(raw.group) && Array.isArray(raw.group.ids)) state.group.ids = [...new Set(raw.group.ids.filter(id => typeof id === 'string' && questionKey(id)))];
  return state;
}

export function loadState(storage) {
  try {
    const saved = storage.getItem(storageKey);
    return {state:saved ? sanitizeState(JSON.parse(saved)) : freshState(), warning:''};
  } catch {
    return {state:freshState(),warning:'本地学习记录暂时无法读取。本次可以继续学习，请导出记录备份。'};
  }
}

export function saveState(storage,state) {
  try { syncState(storage,state); storage.setItem(storageKey,JSON.stringify(state)); return true; } catch { return false; }
}

export function questionRecord(state,id) {
  return state.questions[id] ||= {openedAt:null,priorSeen:'unknown',hints:0,solutionSeen:false,hintSeenAt:null,solutionSeenAt:null,firstAttempt:null,attempts:[],selfAssessment:null};
}

export function openQuestion(state,id,now=Date.now()) {
  const record = questionRecord(state,id);
  if (record.openedAt === null) record.openedAt = now;
  return record;
}

export function setPriorSeen(state,id,value) {
  const record = questionRecord(state,id);
  if (seenValues.has(value) && record.priorSeen !== 'yes') record.priorSeen = value;
  return record;
}

export function revealHint(state,question,now=Date.now()) {
  const record = questionRecord(state,question.id);
  if (record.hints === 0) record.hintSeenAt = now;
  record.hints = Math.min(question.hints.length,record.hints + 1);
}

export function revealSolution(state,id,now=Date.now()) { const record=questionRecord(state,id);if (!record.solutionSeen) record.solutionSeenAt=now;record.solutionSeen = true; }


export function attemptIdentity(attempt) {
  return attempt ? JSON.stringify([attempt.at,attempt.kind,attempt.value,attempt.reasoning]) : '';
}

export function assessProof(state,id,rating,now=Date.now(),expectedIdentity) {
  const record=questionRecord(state,id),last=record.attempts.at(-1);
  if (expectedIdentity !== undefined && expectedIdentity !== attemptIdentity(last)) return false;
  if (last?.kind === 'proof' && ['understood','needs-help'].includes(rating)) {record.selfAssessment={rating,at:now,forAttempt:attemptIdentity(last)};return true;}
  return false;
}

// 合并保存过的证据，避免陈旧标签页抹去首次作答或帮助记录。
export function mergeStates(local,remote) {
  const result=sanitizeState(local),other=sanitizeState(remote);
  for(const [id,time] of Object.entries(other.learned)) result.learned[id]=result.learned[id]===undefined ? time : Math.min(result.learned[id],time);
  for(const [id,review] of Object.entries(other.reviews)) if(!result.reviews[id] || review.scheduledAt<result.reviews[id].scheduledAt) result.reviews[id]=review;
  for(const [id,note] of Object.entries(other.notes)) {
    if(result.notes[id]===undefined || (other.noteUpdatedAt[id]||0)>(result.noteUpdatedAt[id]||0)) {
      result.notes[id]=note;result.noteUpdatedAt[id]=other.noteUpdatedAt[id]||0;
    }
  }
  for(const [id,draft] of Object.entries(other.drafts)) if(!result.drafts[id] || draft.updatedAt>result.drafts[id].updatedAt) result.drafts[id]=draft;
  for(const id of new Set([...Object.keys(result.questions),...Object.keys(other.questions)])) {
    const current=questionRecord(result,id),saved=other.questions[id];
    if(!saved)continue;
    const both=[current,saved];
    const times=both.map(q=>q.openedAt).filter(finite);
    current.openedAt=times.length?Math.min(...times):null;
    current.priorSeen=both.some(q=>q.priorSeen==='yes')?'yes':both.some(q=>q.priorSeen==='no')?'no':'unknown';
    const hintTimes=both.filter(q=>q.hints>0).map(q=>finite(q.hintSeenAt)?q.hintSeenAt:0);
    const solutionTimes=both.filter(q=>q.solutionSeen).map(q=>finite(q.solutionSeenAt)?q.solutionSeenAt:0);
    const assessmentCandidates=both.map(q=>q.selfAssessment).filter(Boolean);
    const firstCandidates=[saved.firstAttempt,current.firstAttempt].filter(Boolean).sort((a,b)=>a.at-b.at);
    const attempts=new Map();
    for(const attempt of [...saved.attempts,...current.attempts,...firstCandidates]) {
      const key=attemptIdentity(attempt),existing=attempts.get(key);
      attempts.set(key,existing?{...existing,helpBefore:existing.helpBefore||attempt.helpBefore}: {...attempt});
    }
    current.hints=Math.max(current.hints,saved.hints);
    current.hintSeenAt=hintTimes.length?Math.min(...hintTimes):null;
    current.solutionSeen=current.solutionSeen||saved.solutionSeen;
    current.solutionSeenAt=solutionTimes.length?Math.min(...solutionTimes):null;
    const helpTimes=[current.hintSeenAt,current.solutionSeenAt].filter(finite);
    current.attempts=[...attempts.values()].sort((a,b)=>a.at-b.at).map(attempt=>({...attempt,helpBefore:attempt.helpBefore||helpTimes.some(time=>time<=attempt.at)}));
    current.firstAttempt=firstCandidates.length ? {...firstCandidates[0],helpBefore:firstCandidates[0].helpBefore||helpTimes.some(time=>time<=firstCandidates[0].at)} : null;
    const latestKey=attemptIdentity(current.attempts.at(-1));
    current.selfAssessment=assessmentCandidates.filter(value=>value.forAttempt===latestKey).sort((a,b)=>b.at-a.at)[0] || null;
  }
  return result;
}

export function syncState(storage,state) {
  try {
    const raw=storage.getItem(storageKey);
    if(raw) Object.assign(state,mergeStates(state,JSON.parse(raw)));
    return true;
  } catch { return false; }
}

export function numericValue(value) {
  const normalized = String(value).trim().replace(/[０-９]/g,c => String(c.charCodeAt(0)-0xff10)).replace(/−/g,'-');
  if (!/^[+-]?(?:\d+(?:\.\d+)?|\.\d+)(?:\s*\/\s*[+-]?(?:\d+(?:\.\d+)?|\.\d+))?$/.test(normalized)) return null;
  const [numerator, denominator='1'] = normalized.split('/').map(Number);
  const number = numerator / denominator;
  return denominator !== 0 && Number.isFinite(number) ? number : null;
}

export function checkResponse(question,value) {
  const input = String(value ?? '').trim();
  if (!input) return {valid:false, message:'先留下一个答案或一点推理，再记录这次尝试。'};
  if (question.kind === 'proof') return {valid:true,correct:null};
  if (question.kind === 'choice') {
    if (!question.options.some(option => option.id === input)) return {valid:false,message:'请先选择一个判断。'};
    return {valid:true,correct:input === question.answer};
  }
  const actual = numericValue(input), expected = numericValue(question.answer);
  if (actual === null) return {valid:false,message:'请输入一个数字或简单分数，例如 10 或 1/4。'};
  return {valid:true,correct:expected !== null && actual === expected};
}

export function recordAttempt(state,question,response,now=Date.now()) {
  const result = checkResponse(question,response.value);
  if (!result.valid) return result;
  const record = openQuestion(state,question.id,now);
  const attempt = {at:now, value:String(response.value).trim(), reasoning:String(response.reasoning || '').trim(), kind:question.kind, correct:result.correct, helpBefore:record.hints > 0 || record.solutionSeen, priorSeen:record.priorSeen};
  if (!record.firstAttempt) {
    record.firstAttempt = {...attempt};
    if (!state.group.ids.includes(question.id)) state.group.ids.push(question.id);
  }
  record.attempts.push(attempt);
  record.selfAssessment = null;
  return {...result,attempt};
}

export function evidenceLabel(record) {
  if (!record?.firstAttempt) return '尚未作答';
  const first = record.firstAttempt;
  if (first.kind === 'proof') return record.selfAssessment ? `推理已记录；自评${record.selfAssessment.rating === 'understood' ? '已理解' : '仍需帮助'}` : '推理已记录；待自评';
  if (!first.correct) return record.attempts.at(-1)?.correct ? '首次未答对；修订后答对' : '首次未答对；可以继续想';
  if (first.helpBefore) return '首次答对；作答前使用过帮助';
  if (record.priorSeen === 'yes') return '首次答对；曾见过本题';
  if (first.priorSeen === 'no') return '首次无提示答对（自述未见）';
  return first.priorSeen === 'yes' ? '首次答对；曾见过本题' : '首次答对；既往见题未知';
}

export function scheduleReview(state,id,now=Date.now()) {
  if (!state.reviews[id]) state.reviews[id] = {scheduledAt:now,dueAt:now + state.settings.reviewHours * 3600000};
  return state.reviews[id];
}

export function reviewStatus(state,lesson,now=Date.now()) {
  const record = state.questions[lesson.transfer.id];
  if (record?.firstAttempt) return 'attempted';
  if (record?.openedAt !== null && record?.openedAt !== undefined) return 'opened';
  if (!state.reviews[lesson.id]) return 'unscheduled';
  return state.reviews[lesson.id].dueAt <= now ? 'due' : 'upcoming';
}
