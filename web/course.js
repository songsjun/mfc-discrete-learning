import {lessons as foundations} from './content/foundations.js';
import {lessons as proofs} from './content/proofs-functions.js';
import {lessons as structures} from './content/relations-counting.js';

export const curriculumVersion = '2026-11-17.1';
export const lessons = [...foundations, ...proofs, ...structures];
export const core = lessons.filter(lesson => !lesson.optional);
export const optional = lessons.filter(lesson => lesson.optional);
export const lessonById = id => lessons.find(lesson => lesson.id === id);
export const questionById = id => lessons.flatMap(lesson => [...lesson.exercises, lesson.transfer]).find(q => q.id === id);
export const groups = [
  {id:'language', title:'先把对象说清楚', description:'集合、命题与量词', ids:['L01','L02','L03']},
  {id:'proof', title:'给结论一个理由', description:'直接、逆否与反证', ids:['L04','L05','L06']},
  {id:'induction', title:'让论证站得住', description:'归纳法与集合证明', ids:['L07','L08','L09']},
  {id:'functions', title:'把输入与输出连起来', description:'映射、单射、满射与双射', ids:['L10','L11','L12']},
  {id:'relations', title:'从关系看见分类', description:'等价关系、类与模整数', ids:['L13','L14','L15']},
  {id:'counting', title:'有条理地数清楚', description:'排列组合与鸽巢', ids:['L16','L17','L18']}
];
