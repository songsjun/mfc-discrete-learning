# 离散学习室 MFC 基础准备

本项目面向大一新生，为斯图加特大学 MFC 提供第一阶段离散数学准备。已实现本地首版：18 节核心、2 张可选卡、60 道原创题、分步例题、交互直觉、学习记录和稍后复验。提供纯前端运行和 GitHub Pages 静态发布。

## 在线访问

- [打开离散学习室](https://songsjun.github.io/mfc-discrete-learning/)
- [GitHub 源码仓库](https://github.com/songsjun/mfc-discrete-learning)
- [发布流程与版本追踪](DEPLOYMENT.md)

main 分支推送后，检查和测试成功才发布 web 目录。浏览器与试学待验项目仍见验收报告。

## 本地运行

需要 Node.js 22 或以上版本，无需安装依赖。

```sh
npm start
```

然后打开 http://127.0.0.1:4173/ 。服务只监听本机。换端口可运行 `npm start -- --port 4174`。直接双击 HTML 文件不支持模块加载，请使用本机服务。

```sh
npm run check
npm test
```

- [验收标准](ACCEPTANCE.md) 在实现前制定。
- [实现方案](IMPLEMENTATION.md) 说明结构与默认决策。
- [逐项验收结果](docs/VALIDATION.md) 区分自动检查、独立内容审查与尚未完成的浏览器验证。

草稿和记录保存在当前浏览器、当前网站地址下。学习记录页可导出 JSON 备份。自由证明只保存推理和自评，不自动认证正确性，不计算掌握率。

## 预研依据

**目标课程已确认：斯图加特大学信息安全研究所的硕士课程 Mathematical Foundations of (Post-Quantum) Cryptography。官方说明以计算机或数学本科前四学期的基础为起点。本网站定位为第一阶段的离散数学准备，完成网站内容不等于具备该硕士课的全部基础。**

- [预研方案与知识结构](research/01-proposal.md)：课程对齐、18 节核心路径、两张可选衔接卡、强度与网站学习流程。
- [教学样例与练习答案](research/02-teaching-samples.md)：三个核心样例，以及模逆、有限概率的短衔接样例。
- [来源与可行性证据](research/03-evidence.md)：官方课程说明、公开资料边界、教材定位、许可和 aime 观察。
- [MFC 课程核查记录](research/evidence/mfc-course-observation.json)：官方入口、核查时间、事实与未知项。
- [aime 公开资料观察记录](research/evidence/aime-observation.json)：访问时间、版本、字段与内容指纹。

## 保留的需求边界

目的为学习 MFC 补基础。对象为大一新生。证明方法最重要，其次是集合、映射、关系与等价类，以及排列组合和鸽巢原理。学习应从概念和直觉出发，经例题进入少量练习。控制强度，避免扩展成完整离散数学课程。

图论、布尔代数、有限自动机、递推关系求解不进入本次准备站。公开课程介绍没有把它们列为独立重点；这不足以断言所有学期资料都不使用相关工具。证明所需的基础命题逻辑仍保留。

## 已确认与尚未确认

已从[研究所课程页](https://www.sec.uni-stuttgart.de/teaching/mathematical-foundations-of-post-quantum-cryptography/)确认课程身份、总体数学领域与背景水平。保留 18 节核心，不把官网列出的高阶数学全部提前加入网站。

公开说明没有展开“本科前四学期”的具体能力清单。正式模块先修字段、目标学期的讲义顺序及题单仍未取得。2026/27 ILIAS 入口可读课程元数据，但加入需申请并获批准。本轮未登录或申请。

本轮资料日期为 2026 年 11 月 17 日。项目文件均位于本独立目录。外部网页只作只读调研。
