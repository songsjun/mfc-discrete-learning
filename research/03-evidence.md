# 来源与可行性证据

调研及更新日期为 2026 年 11 月 17 日。以下区分可直接核查的来源事实与本项目的设计判断。已核实目标 MFC 的课程身份和公开说明，仍未取得正式模块先修字段或目标学期讲义，也未开展新生试学。

## MFC 官方课程依据

| 一手来源与定位 | 已确认事实 | 不能据此推出的结论 |
| --- | --- | --- |
| [研究所课程页](https://www.sec.uni-stuttgart.de/teaching/mathematical-foundations-of-post-quantum-cryptography/)，标题及开头说明 | 正式英文名为 Mathematical Foundations of (Post-Quantum) Cryptography，标为硕士课 | 不是名称相近的 MIT 教材或其它学校课程 |
| 同页课程介绍 | 列出代数、代数数论、代数几何、概率、调和分析相关方向 | 清单不是逐学期授课进度；列出的理论也不是全部先修 |
| 同页自足性说明 | 数学理论会自足讲授，但预期有计算机或数学本科前四学期的背景 | 不能解读为零基础入门；也不能推定必须提前学完抽象代数等高阶理论 |
| 同页 Exam 部分 | 作业累计至少 50% 分数是参加期末考试的条件 | 这是考试准入，不是正式注册先修 |
| [研究所教学目录](https://www.sec.uni-stuttgart.de/teaching/)，2026/2027 Winter Term | 列出当前冬季 MFC，并链接到 ILIAS | 不证明各年内容相同 |
| [ILIAS 2026/27 信息页](https://ilias3.uni-stuttgart.de/ilias.php?baseClass=ilrepositorygui&cmdClass=ilobjcoursegui&cmdNode=xi%3Amd&item_ref_id=0&ref_id=4553285) | 可公开读取课名、学期等元数据；加入课程需申请并获批准；入口许可标为 All rights reserved | 本轮没有取得讲义与题单，不能将它们当开放教材转载或声称已分析实际课程练习 |

官方[硕士 Informatik PO 2019 学习结构页](https://www.f05.uni-stuttgart.de/informatik/studierende/master/informatik/po-2019/)也把 MFC 列入 TMG-INF 目录，支持其硕士课程定位。定向查找未取得模块手册条目中的正式先修字段，因此正式入课先修保留未知。课程页说“MFC 不是本所其它课的正式先修”，不能反向解释为“MFC 自身无正式先修”。

**教学推断**：证明与抽象语言适用于以上数学方向；集合、映射和等价类对代数对象的理解有直接帮助；有限计数能给有限概率建立入口。线性代数、分析及更完整的概率基础需要另查，不能由 18 节离散准备替代。官网未给出这些能力的细目或深度，因此不标为已确认的逐项先修。

本地[课程核查记录](evidence/mfc-course-observation.json)保存来源、核查方法、事实与未知项。官网及 ILIAS 的可访问部分已足够支持课程定位和范围边界；当前方案不以取得受限讲义为前提。

## aime 的实际组织

读取范围为 [公开首页](https://aime.kapy.ca/)、[公开课程目录](https://aime.kapy.ca/api/catalog?lang=zh)、[U01 公开课程内容](https://aime.kapy.ca/api/course?unit=U01&lang=zh) 和首页引用的公开页面脚本。未读取学习会话、学生记录或写入接口。

公开目录含 14 个单元，并标明单元先修。抽查的 U01 为 `web-0.2.0`，含 6 个小节、75 个任务。小节包含目标、直觉、原则、识别线索、误解、回想、练习路线和例题。例题步骤将“做什么”与“为什么”分开。任务标注来源、用途和难度。首页提供分组练习与休息设置，并区分完成记录与掌握判断。

**设计判断**：可借鉴其小节结构、按需提示和复验思路；无需继承其竞赛范围和题量。只抽查 U01，不代表已审查全站内容。浏览器宿主不可用，以上来自只读 HTTP 内容与公开数据，不是布局或交互验收。

本地[观察记录](evidence/aime-observation.json)保存了 URL、访问时间、字段名、版本和响应指纹。未将 aime 页面源码作为本项目网站代码复用。

## 官方教材与使用角色

| 来源 | 已核实的范围与版本 | 拟定角色和边界 |
| --- | --- | --- |
| Richard Hammack，[*Book of Proof*](https://richardhammack.github.io/BookOfProof/) | 第三版修订 3.4，作者说明修订于 2025 年 2 月 5 日；目录覆盖本轮核心内容 | 证明、关系与等价类的外链阅读和数学核对。官网标 CC BY-NC-ND 4.0，不预设可以公开发布翻译或改编版本 |
| Oscar Levin，[*Discrete Mathematics An Open Introduction* 第四版](https://discrete.openmathbooks.org/dmoi4.html) | 作者定位为本科一、二年级；有交互式在线版及公开源文件 | 候选可改编主来源。官网标 CC BY-NC-SA 4.0，需遵守署名、非商业与相同方式共享条件；仅抽取选节 |
| Lehman、Leighton、Meyer，[*Mathematics for Computer Science*](https://ocw.mit.edu/courses/6-042j-mathematics-for-computer-science-spring-2015/resources/mit6_042js15_textbook/) | MIT OCW Spring 2015 教材，PDF 修订日期 2015 年 5 月 18 日 | 计数及关系的补充依据。该 PDF 封面标 CC BY-NC-SA 3.0；不能用当前 OCW 网页页脚版本代替它 |

免费阅读不等于可任意改编。后续内容条目应区分自编、转载、改编和仅外链，保存原始定位及具体许可。不同来源的改编内容分别记录适用许可；当前不把所有来源合并成一个新许可。若未来用途超出相应许可，再核对实际授权。

Levin 的[作者前言](https://discrete.openmathbooks.org/dmoi4/preface.html)和[源仓库](https://github.com/oscarlevin/discrete-book/)提供作者说明及源文件入口。Levin 第四版先以图论练证明；本项目不照搬其全书顺序。MIT 全书的结构、概率及算法内容也不全部进入本项目。

## 核心范围与来源定位

Hammack 目录可从[作者首页](https://richardhammack.github.io/BookOfProof/)直接进入相应章节；MIT 按[官方分章目录](https://ocw.mit.edu/courses/6-042j-mathematics-for-computer-science-spring-2015/pages/readings/)定位。章节级覆盖不等于全章必学。

| 用户需要 | 一手定位 | 筛选方式 |
| --- | --- | --- |
| 直接、逆否、反证 | Hammack 第 4、5、6 章；[Levin §1.4](https://discrete.openmathbooks.org/dmoi4/sec_logic-proofs.html) | 先用整数与奇偶，暂不选高阶存在性证明 |
| 数学归纳法 | Hammack §10.1；[Levin §4.5](https://discrete.openmathbooks.org/dmoi4/sec_seq-induction.html) | 只选普通归纳的求和、整除例题 |
| 集合与集合证明 | Hammack 第 1 章、§§8.1–8.3；MIT §4.1 | 小集合先行，不教无限基数 |
| 单射、满射、双射 | [Levin §5.2](https://discrete.openmathbooks.org/dmoi4/sec_structures-functions.html)；Hammack 第 12 章 | 强调陪域、像和任意元素，筛掉无限集等势扩展 |
| 关系、等价类、模整数 | Hammack §§11.1–11.5；MIT §§4.4–4.5、9.10 | 从分组过渡到三性质与类；不直接进入商环理论 |
| 排列组合与鸽巢 | MIT §§14.1–14.5、14.8；Hammack §§3.2–3.5、3.9 | 从是否计顺序和是否重复开始，不扩展生成函数等专题 |

## 可定位的例题和练习

这些条目表明有现成教学素材，不是已经完成的中文题库。是否采用原题、改编或另行自编，需在后续内容编写时逐题标明。

| 定位与内容概述 | 适合的教学用途 | 解答核实情况 |
| --- | --- | --- |
| [Levin §1.4 Reading Questions 1–3](https://discrete.openmathbooks.org/dmoi4/sec_logic-proofs.html)：选择不同证明方法的开头 | 在要求完整证明前，先检查假设与目标 | 网页有逐项反馈 |
| [Levin §4.5 Example 4.5.2、4.5.3](https://discrete.openmathbooks.org/dmoi4/sec_seq-induction.html)：求和公式、`5∣(6ⁿ−1)` | 同一归纳骨架在两个情境中的应用 | 两例有解答 |
| [Levin §5.2 Example 5.2.6](https://discrete.openmathbooks.org/dmoi4/sec_structures-functions.html)：判断满射；本节 Additional Exercises 16、19、20 涉及单满双射及复合 | 从小集合图形过渡到符号定义；第 19 题的无限集部分不列必做 | 例题有解答；未逐题核实后三题的全部官方答案 |
| [Hammack §11.4 习题 1、2](https://richardhammack.github.io/BookOfProof/Main.pdf)：小集合分划；印刷页 217 | 先看见分组，再引入类 | 仅核实题目；未逐题核实答案 |
| 同一 PDF §11.5 习题 1–3：Z₂、Z₃、Z₄ 运算表；印刷页 221 | 如后续需要运算桥接再选用，不列入当前核心练习 | 仅核实题目；未逐题核实答案 |
| [MIT Problem 14.37(b)](https://ocw.mit.edu/courses/6-042j-mathematics-for-computer-science-spring-2015/mit6_042js15_textbook.pdf)：100 个整数中有两数之差为 37 的倍数；印刷页 609 | 将整数按余数分盒，迁移到整除 | 已定位题目；未核实完整官方解答 |

两张可选衔接卡只复用同一本 MIT 教材的以下选节，不新增整套课程。

| 短卡的一手定位 | 支持内容与选用边界 |
| --- | --- |
| [MIT §8.2.1](https://ocw.mit.edu/courses/6-042j-mathematics-for-computer-science-spring-2015/resources/mit6_042js15_session12/)，印刷页 249；[§8.9 开头](https://ocw.mit.edu/courses/6-042j-mathematics-for-computer-science-spring-2015/resources/mit6_042js15_session13/)，印刷页 270 | 欧几里得算法和乘法逆元入口；不取后续密码系统和算法证明 |
| [MIT §16.4.1、§16.5.1](https://ocw.mit.edu/courses/6-042j-mathematics-for-computer-science-spring-2015/resources/mit6_042js15_session28/)，印刷页 684–686 | 独立均匀抽样中的精确重复概率，以及有限样本空间和事件；不取指数近似或连续概率 |

衔接卡中的 3 与 7、8 个标签等参数为本项目自编，不称为 MIT 原题或 MFC 作业。是否通过这些题不能作为正式入课资格判断。

## 教学方法的证据

[IES 2007 教学实践指南](https://ies.ed.gov/ncee/wwc/PracticeGuide/1)包含数学及高等教育适用范围。它将例题与独立练习交替、具体与抽象表示结合、间隔学习列为中等证据建议；将测验中的重新接触关键内容及解释性问题列为较强证据建议。

本方案据此选择“例题后马上尝试”“用余数盒子解释抽象等价类”“稍后用新题复验”。这些是设计推断。该指南不证明本方案的 35–45 分钟节长、6 周总长、具体复验间隔或中文学习效果。

Levin 官方发布页说明，其在线教材具有按需展开的提示和解答，部分练习支持答案检查。这直接支持所拟内容和交互的可实现性。aime 的公开资料进一步给出完整的小节字段参照。当前没有为本项目编写、运行或验证网站。

## 内容复核

未参与文档编写的独立审查 agent 核对了三组样例的证明、答案与反例，检查了先修依赖、概率与时长计算，以及课程范围和学习效果的表述边界。未发现阻断交付的问题。根据其建议，等价类样例补充了负整数的标准余数示例。

该审查另核对了 Hammack 与 Levin 官方网页、所列 Levin 归纳与满射例题，以及 IES 证据等级。它未重复核对 MIT PDF 封面和全部习题页码，也未独立重新抓取 aime 响应。这些部分沿用前述来源调研，不能称为全部经过双重验证。真实新生试学仍未开展。

课程身份确认后的更新另经独立复核：官方课程说明、考试准入与先修的区分、两张新增短卡的数学答案、文件间一致性均未发现阻断问题。复核发现的一处“课程确认后”旧条件已修正。该次复核未重验原三组样例与教材许可；新增 MIT 页码和 ILIAS 元数据沿用相应来源调研，不声称全部双重核验。
