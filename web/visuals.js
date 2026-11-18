import {escapeHTML as e} from './utils.js';

export const residue = (number,modulus) => ((number % modulus) + modulus) % modulus;
export function mappingProperties(outputs,codomain) {
  return {injective:new Set(outputs).size === outputs.length,surjective:codomain.every(value => outputs.includes(value))};
}
export function pairs(ordered) {
  const people = ['甲','乙','丙','丁','戊'], result = [];
  for (let i=0;i<people.length;i++) for (let j=0;j<people.length;j++) if (ordered ? i!==j : i<j) result.push([people[i],people[j]]);
  return result;
}
export const mappingCases = [
  {label:'一一对应',domain:['a','b','c'],codomain:[1,2,3],outputs:[1,2,3]},
  {label:'陪域多一个点',domain:['a','b','c'],codomain:[1,2,3,4],outputs:[1,2,3]},
  {label:'两个输入同像',domain:['a','b','c'],codomain:[1,2,3],outputs:[1,1,2]},
  {label:'满射但非单射',domain:['a','b','c','d'],codomain:[1,2,3],outputs:[1,2,3,3]}
];

export function renderVisual(kind,settings={}) {
  if (kind === 'mapping') {
    const index = Number.isInteger(settings.mapping) ? settings.mapping : 0;
    const model = mappingCases[index] || mappingCases[0];
    const properties = mappingProperties(model.outputs,model.codomain);
    const svg = `<svg viewBox="0 0 420 220" role="img" aria-label="有限函数的箭头图，${properties.injective?'单射':'非单射'}，${properties.surjective?'满射':'非满射'}"><defs><marker id="arrowhead" markerWidth="8" markerHeight="8" refX="7" refY="3" orient="auto"><path d="M0,0 L0,6 L7,3 z" fill="#11766d"/></marker></defs><text x="66" y="22">定义域 A</text><text x="278" y="22">陪域 B</text>${model.outputs.map((value,i)=>`<line x1="116" y1="${52+i*42}" x2="284" y2="${52+model.codomain.indexOf(value)*42}" stroke="#11766d" stroke-width="2" marker-end="url(#arrowhead)"/>`).join('')}${model.domain.map((value,i)=>`<circle cx="95" cy="${52+i*42}" r="18" fill="#edf2fa"/><text x="95" y="${57+i*42}" text-anchor="middle">${value}</text>`).join('')}${model.codomain.map((value,i)=>`<circle cx="310" cy="${52+i*42}" r="18" fill="${model.outputs.includes(value)?'#e6f2ee':'#fff4d5'}"/><text x="310" y="${57+i*42}" text-anchor="middle">${value}</text>`).join('')}</svg>`;
    return `<figure class="math-lab"><figcaption>动手看映射</figcaption><div class="segmented">${mappingCases.map((value,i)=>`<button type="button" data-visual="mapping" data-value="${i}" aria-pressed="${i===index}">${value.label}</button>`).join('')}</div>${svg}<p class="lab-result">${properties.injective?'不同输入没有相撞：是单射。':'存在不同输入同像：不是单射。'} ${properties.surjective?'陪域的每个点都被命中：是满射。':'陪域有点未被命中：不是满射。'}</p><p class="small">图中只讨论这些有限集合。换陪域后，满射的判断可能改变。</p></figure>`;
  }
  if (kind === 'residues') {
    const modulus = [3,4,5].includes(settings.modulus) ? settings.modulus : 4;
    const numbers = [-6,-3,0,1,2,5,7];
    return `<figure class="math-lab"><figcaption>把整数放进余数盒子</figcaption><label class="inline-label">模数 <select data-visual="modulus">${[3,4,5].map(n=>`<option ${n===modulus?'selected':''} value="${n}">${n}</option>`).join('')}</select></label><div class="residue-boxes">${Array.from({length:modulus},(_,r)=>`<div class="residue-box"><strong>[${r}]</strong><span>余数 ${r}</span><div>${numbers.filter(n=>residue(n,modulus)===r).map(n=>`<b class="number-chip">${n<0?'−'+Math.abs(n):n}</b>`).join('') || '<span class="small">本例未放入数字</span>'}</div></div>`).join('')}</div><p class="lab-result">−6 = ${modulus} × ${Math.floor(-6/modulus)} + ${residue(-6,modulus)}，所以 −6 属于 [${residue(-6,modulus)}]。</p><p class="small">这里只展示每个类的少量成员。标准余数从 0 到 ${modulus-1}；一个类本身是集合。</p></figure>`;
  }
  if (kind === 'counting') {
    const ordered = settings.ordered === true;
    const results = pairs(ordered);
    return `<figure class="math-lab"><figcaption>同样五个人，换一个选法</figcaption><div class="segmented"><button type="button" data-visual="ordered" data-value="false" aria-pressed="${!ordered}">选两名代表</button><button type="button" data-visual="ordered" data-value="true" aria-pressed="${ordered}">选正、副代表</button></div><div class="pair-grid">${results.map(pair=>`<span>${pair.join(ordered?' → ':'、')}</span>`).join('')}</div><p class="lab-result">共 ${results.length} 种。${ordered?'交换角色得到不同安排，所以 5 × 4 = 20。':'交换名字仍是同一组，每组被数两次，所以 5 × 4 ÷ 2 = 10。'}</p></figure>`;
  }
  if (kind === 'induction') return `<figure class="math-lab"><figcaption>两件事，缺一不可</figcaption><div class="proof-chain"><span>基例成立<br><small>起点站得住</small></span><b>＋</b><span>对任意 k<br><small>P(k) ⇒ P(k+1)</small></span><b>⇒</b><span>从起点起<br><small>所有整数都覆盖</small></span></div><p class="small">验算几个值，只检查了几个起点；它不能替代任意 k 的归纳步。</p></figure>`;
  if (kind === 'logic') return `<figure class="math-lab"><figcaption>证明的方向</figcaption><div class="proof-chain"><span>4 ∣ n</span><b>⇒</b><span>n = 4k = 2(2k)</span><b>⇒</b><span>2 ∣ n</span></div><p class="small">反过来不一定成立：n = 2 是偶数，却不是 4 的倍数。</p></figure>`;
  if (kind === 'pigeonhole') return `<figure class="math-lab"><figcaption>六个对象，五个余数盒子</figcaption><div class="residue-boxes">${[0,1,2,3,4].map(n=>`<div class="residue-box"><strong>余数 ${n}</strong><div><b class="number-chip">${n}</b>${n===0?'<b class="number-chip">5</b>':''}</div></div>`).join('')}</div><p class="small">这是一个具体摆放。一般证明要说明：若每盒最多一个，五个盒子最多容纳五个对象。</p></figure>`;
  if (kind === 'sets') return `<figure class="math-lab"><figcaption>先区分对象的层次</figcaption><div class="set-scene"><span>集合 A =</span><div class="set-outline"><b>1</b><b>2</b><b>3</b></div></div><p class="lab-result">2 ∈ A；{2} ⊆ A。</p><p class="small">2 是一个数，{2} 是只含这个数的集合。元素与子集回答不同的问题。</p></figure>`;
  return '';
}
