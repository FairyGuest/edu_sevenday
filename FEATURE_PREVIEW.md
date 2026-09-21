# 学情与教学设计功能副本

来源：`../edu_7net_fe-26_08_21`，创建于 2026-09-18。所有功能修改均位于本副本，原目录保持不变。副本保留原项目结构、配置、资源和接口调用，独立复制了运行依赖；未复制原目录的 Git 历史、构建产物及临时缓存。

## 本次功能

- **个人学情**：保留独立 Tab、学生列表、知识图谱和证据明细；素养区域使用固定维度雷达图，配合最强素养、待提升项、均值及二级指标。缺失证据显示“暂无数据”，不将缺失值当作 0 分连线。
- **导入考试记录**：学生/学科、考试名称/日期分为两行两列，备注占整行，题目表独立展示；底部操作固定在弹窗滚动区域外。保留导入回执、批次、新学生和原有题目编辑能力，补充必填校验及重复提交保护。
- **导入班级学情**：在“设置班级学情”弹窗底部和首页班级学情卡提供入口，支持多选、已选回显、管理与移除。导入失败保留原列表，取消不提交改动。导入后使用班级 Tab 分别查看知识点、掌握分布与典型错例；各班的预览章节独立保存。
- **教案生成**：所有已导入班级的快照通过 `class_ids` / `imported_class_profiles` 传入生成请求；摘要同时追加到既有 `user_require` 字段。第一个导入班级作为默认关联班级，切换预览不改变发布对象。当前选择保存在本次应用会话中，刷新页面后可重新导入。
- **布置作业**：课时与单元教案生成后，右上角常驻小按钮，正文滚动不影响入口位置。直接复用现有班级选择、发布、错误重试和作业下发流程。
- **下发与回收工作台（新增）**：左侧一级菜单新增「下发与回收」，统一跟踪作业与学案的下发记录、提交状态（未布置/待提交/按时提交/未按时提交/按时/未按时重新提交）、AI 初批与教师复核进度；学案按基础必做/提高选做/挑战选做三档统计选做率；提供演示用「模拟学生补交」推进回收。学案下发（教学设计页/教学设计增强页）与个性化作业发布后弹窗引导跳转本页。
- **作业批改（演示批改工作台）**：演示环境下 `/teach/correction` 改走回收状态机：左侧下发记录 → 中间按待复核/已复核/未提交筛选的学生列表 → 右侧逐题批改（题干、学生作答、AI 判定、错因、教师改判）与结构化反馈（总评、错因分布、知识点达成、下一步建议），复核改判留痕并入档；真实环境仍走原有 findExamPage 链路。
- **教学反思（新增）**：左侧一级菜单新增「教学反思」，基于批改证据由规则引擎生成反思建议卡（知识点达成/共性错因/提交习惯/分层选做，每条附证据摘要与可执行动作），支持记录教师反思并沉淀为校本教研议题或反哺教案。
- **小助手反思建议**：小助手新增「教学反思/反思建议」意图，基于同批批改证据输出建议卡（附证据与动作按钮）；动作白名单新增 `open_homework_flow`、`open_teaching_reflection`。

## 信息架构（2026-09-20 收敛）

侧栏收敛为六个一级入口：**首页 / 学情分析 / 教学设计 / 作业 / 校本教研 / 资源平台**。

- **作业（/homework）**：四合一子 Tab——作业组卷 / 作业下发 / 下发与回收 / 作业批改（组织方式对齐学情分析的子功能 Tab）；URL 用 `?sub=compose|assign|flow|grade` 同步，`tab/dispatch_id/sid/class_id` 等参数透传给子页。原 /setTopic、/paperCompose、/homework-flow、/teach/correction 路由保留可直达。
- **教学反思（/design/reflection）**：并入教学设计域（反思链：批改证据 → 反思 → 教研 → 反哺教案）。教学设计生成入口新增「教学反思」入口卡；页面顶部有「教学设计 / 教学反思」归属条与「去生成教案」回链。原 /teaching-reflection 路由保留。
- **首页 = 总工作台**：新增功能导航卡（学情分析 / 教学设计 / 作业 / 校本教研 / 资源平台，含常用子入口直达），下方保留在线作业、互动记录、常用智能体、消息提醒。
- 小助手动作与页面问候已同步新路径（open_homework_flow → /homework?sub=flow、open_teaching_reflection → /design/reflection、open_homework → /homework?sub=compose&tab=personalized）。

## 本地预览

已构建的副本可直接启动：

```powershell
$env:PORT = '4174'
npm run preview:demo
```

访问 `http://127.0.0.1:4174`。演示账号 `teacher`，密码 `demo123456`，验证码 `1234`。预览沿用原项目的演示数据和模板生成，不会向真实学生发布作业。查看个人雷达图时，如当前月份没有作答数据，可以清空日期筛选查看已有记录。

修改代码后重新构建：

```powershell
npm run build:demo
```

真实环境仍沿用原项目已有接口；本次没有新增后端服务。多班级生成已验证请求携带全部班级信息，真实模型生成效果需在对应后端环境联调。

## 后续采用

可以先独立运行此副本体验。确认采用后，依据 `FEATURE_CHANGES.json` 的文件清单迁移源码即可，无新增运行依赖，无需替换原项目的 `.git`、环境配置或 lockfile。清单保留修改前后 SHA-256，若原工程后续发生变化，可据此识别需要合并的文件。

已另外生成 `FEATURE_PREVIEW.patch`，包含本次 18 个源码文件的变更，并已在原工程执行 `git apply --check` 验证可应用。本次只检查补丁，没有将其应用到原工程。

决定采用时，在原工程目录执行：

```powershell
git apply --check ../edu_7net_fe-26_08_21-feature-preview/FEATURE_PREVIEW.patch
git apply ../edu_7net_fe-26_08_21-feature-preview/FEATURE_PREVIEW.patch
```

如果检查报告冲突，先合并原工程的后续修改再应用；成功应用后使用原工程既有命令重新构建。

## 验证

新增浏览器验证脚本：`tests/feature-preview-browser.cjs`；生成上下文验证：`tests/feature-context-regression.cjs`。原有发布回归使用 `tests/lesson-workflow-browser.cjs` 与 `tests/lesson-workflow-regression.cjs`。

```powershell
node tests/feature-context-regression.cjs
node tests/lesson-workflow-regression.cjs
node tests/feature-preview-browser.cjs
```

下发回收/批改/反思工作流回归（2026-09-20 新增）：`tests/homework-flow-browser.cjs`，覆盖工作台列表与提交状态、学案下发端到端（教学设计增强页按钮 → 弹窗 → 工作台三档分层统计）、批改页逐题改判复核留痕、反思页建议卡、小助手反思意图，共 7 项。

```powershell
node tests/homework-flow-browser.cjs
```

注意：`tests/feature-preview-browser.cjs` 中「个人学情日期选择器」断言已与现状不符（个人学情筛选已改为预设时间按钮组），该项超时属测试过时，非功能损坏；现行该区域由 `portrait-research-regression.cjs` 覆盖。

新增浏览器脚本默认使用本副本 `.temp/browser-tools/node_modules/playwright-core`，也支持 `PLAYWRIGHT_MODULE` 指定已有安装，默认地址为 4174。截图和结果保存在 `.temp/feature-preview/`。
