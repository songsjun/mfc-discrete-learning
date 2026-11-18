# 课程内容接口

每个模块导出命名数组 `lessons`。课程 ID 为 L01 至 L18，以及 B01、B02。所有正文为纯文本和可读 Unicode 数学，不含 HTML、LaTeX 标记或脚本。所有题目为原创，不是来源教材的翻译题。来源用于参照和进一步阅读。

```js
export const lessons = [{
  id: 'L01', unit: 'language', title: '集合与对象', subtitle: '本节主要问题',
  minutes: 35, optional: false, prerequisites: [], concepts: ['集合'],
  goals: ['具体目标一', '具体目标二'],
  intuition: {lead: '一个具体问题', paragraphs: ['解释一', '解释二']},
  definitions: [{term: '集合', en: 'set', meaning: '精确定义', formula: '可选公式'}],
  example: {title: '例题短标题', prompt: '完整问题',
    steps: [{text: '推理步骤', why: '成立理由'}], conclusion: '结论'},
  misconception: {claim: '错误想法', correction: '纠正及反例'},
  exercises: [/* 恰好两题 */],
  transfer: {/* 一道不同题面的小迁移题，不和即时题重复 */},
  sources: [{label: '教材及章节', url: 'https://...', note: '仅作参照，题目为本项目原创'}],
  visual: null // 或 sets、logic、induction、mapping、residues、counting、pigeonhole
}];
```

例题至少三步，各有理由。核心课节有至少两条目标和一项定义。单节正文宜短，不用长篇课本段落。units 为 language(L01–03)、proof(L04–06)、induction(L07–09)、functions(L10–12)、relations(L13–15)、counting(L16–18)、bridge(B01–02)。可选卡为 optional:true、minutes:25。

题目接口如下。id 在全站唯一，形如 L01-Q1、L01-Q2、L01-R1。

```js
{id:'L01-Q1', kind:'choice', prompt:'完整题面',
 options:[{id:'a',text:'选项',feedback:'对这个选项的反馈'}, /* 至少三项 */],
 answer:'a', hints:['第一层小提示','第二层提示'],
 solution:'完整答案和理由', rubric:['检查要点一','检查要点二']}

{id:'L01-Q2', kind:'proof', prompt:'要求解释或证明',
 hints:['小提示','进一步提示'], solution:'完整参考证明',
 rubric:['范围/假设','关键步骤','结论']}

{id:'L17-Q2', kind:'number', prompt:'明确说明输入数值或分数',
 answer:'10', hints:['...','...'], solution:'数值及推导', rubric:['...','...']}
```

每节第一题使用 choice。第二题可为 proof 或 number。迁移题也支持以上三类，优先 proof。choice 的 answer 是选项 ID；number 只接受可比较的数字或简单分数，数学解释留在解答。不要使用字符串评分自由证明。
