# GitHub Pages 发布

- 源码仓库：https://github.com/songsjun/mfc-discrete-learning
- 网站地址：https://songsjun.github.io/mfc-discrete-learning/
- 发布流程：https://github.com/songsjun/mfc-discrete-learning/actions/workflows/pages.yml
- 当前线上来源：https://songsjun.github.io/mfc-discrete-learning/release.json

## 发布内容和验收

Pages 构件仅包含 web 目录。研究文档、测试、工具脚本和本机记录不作为网站资源发布。学习记录仍只在浏览器中保存，GitHub Pages 不接收学生作答。

main 分支推送或手动触发工作流后，先使用 Node.js 24 运行语法检查和验收测试。全部成功后写入来源提交与工作流标识，再上传并部署同一静态构件。官方 Actions 均固定到完整提交 SHA。

成功标准包括工作流成功、Pages API 返回正常状态、首页与本地模块可通过项目子路径访问，以及 release.json 的 commit 对应发布来源。HTTP 和模块响应不替代真实浏览器、手机布局、键盘或新生试学。

本地验收及其未覆盖项见 [验收报告](docs/VALIDATION.md)。发布网站不代表这些待验项自动通过，也不代表本站覆盖 MFC 的全部先修。

## 日常更新

在项目目录运行检查，提交后推送 main：npm run check、npm test、git push origin main。

查看工作流：gh run list --repo songsjun/mfc-discrete-learning --workflow pages.yml。

查看 Pages：gh api repos/songsjun/mfc-discrete-learning/pages。

查看来源时只读取 release.json 的公开提交和运行标识；不在代码中保存凭据。

## 回滚

首次发布没有旧的线上版本。后续若发现回归，找到上一条验证成功的发布提交，使用正常的 git revert 提交撤销有问题的变更并推送 main，令同一验证发布流程重建网站。不要重写共享历史。

代码回滚不会删除或回滚浏览器 localStorage。内容或记录结构发生变化时，应先核对兼容性。本次发布保留现有记录格式。
