<p align="center">
  <img src="icon.svg" width="88" height="88" alt="Subagent Manager">
</p>

<h1 align="center">子智能体管理器</h1>

<p align="center">
  在 DeepSeek Harness 的设置里管理所有会话派生的子智能体。<br>
  分页、筛选、归档、永久删除、批量操作与并发上限，集中在一个页面。
</p>

<p align="center">
  <a href="LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue?style=flat-square" alt="License"></a>
  &nbsp;
  <img src="https://img.shields.io/badge/DSH-0.2.1--rc.5-2f63d8?style=flat-square" alt="DSH">
  &nbsp;
  <img src="https://img.shields.io/badge/version-1.1.0-2f63d8?style=flat-square" alt="Version">
</p>

<p align="center">
  中文 | <a href="README.en.md">English</a>
</p>

> **社区插件，非 DeepSeek 官方产品。** 验证基线为 DeepSeek Harness `0.2.1-rc.5` 的 Web profile；其他 `0.2.x` 版本未逐一验证。

<p align="center">
  <a href="#功能">功能</a> ·
  <a href="#界面与操作">界面与操作</a> ·
  <a href="#安装">安装</a> ·
  <a href="#使用">使用</a> ·
  <a href="#配置">配置</a> ·
  <a href="#安全与限制">安全与限制</a> ·
  <a href="#工作原理">工作原理</a> ·
  <a href="#故障排查">故障排查</a> ·
  <a href="#开发与验证">开发与验证</a> ·
  <a href="#license">License</a>
</p>

## 功能

DSH 自带的子智能体目录聚焦当前会话；当子智能体分散在多个会话、需要清理旧任务时，缺少统一入口。这个插件补上的就是一个管理面：

| 能力 | 说明 |
|---|---|
| 全量子智能体列表 | 跨会话汇总，显示标题、父会话、委派深度、运行状态、归档状态与下级数量 |
| 搜索与筛选 | 按标题、ID、父会话搜索；筛选全部 / 运行中 / 已归档，搜索和筛选在 Host 端完成，覆盖所有页 |
| 分页 | 固定每页 15 条，显示页码与总数，提供上一页 / 下一页 |
| 归档 / 取消归档 | 归档会停止该子智能体当前运行并隐藏其会话；数据保留，可随时恢复 |
| 单条删除 | 永久删除子智能体的会话目录，需在弹窗中确认 |
| 批量删除 | 每行复选框、全选本页、已选计数；一次最多 100 个，按委派深度从深到浅执行 |
| 并发上限 | 读写 `subagent.maxActiveSubagents`（1–256），与 DSH 自带子智能体并发上限是同一项设置 |
| 父会话计数同步 | 删除后回话主页的“xx 个子智能体”会相应减少，不留下已删除子智能体的计数 |
| 回话主页直接管理 | 点击回话主页头部的“xx 个子智能体”展开目录，直接归档或删除每个直接子智能体 |

## 界面与操作

安装后打开 **设置 → 子智能体管理器**。页面结构大致如下（示意图，不是截图）：

```text
┌─ 子智能体管理器 ───────────────────────────────────────────┐
│ 并发子智能体上限  [ 8 ]  [保存]        当前生效：8          │
├────────────────────────────────────────────────────────────┤
│ 全部 | 运行中 | 已归档                 搜索标题、ID、父会话  │
│ ☑ 全选本页    已选 3 项   清除选择   [批量删除]             │
│                                                            │
│ ☑  ● 子任务标题         父会话…  深度 1  运行中  归档 删除   │
│ ☐  ● 另一个子任务       父会话…  深度 2  空闲    归档 删除   │
│                                                            │
│ 第 1 / 3 页     每页 15 条                    上一页  下一页  │
└────────────────────────────────────────────────────────────┘
```

| 操作 | 怎么做 | 结果 |
|---|---|---|
| 定位子智能体 | 搜索框输入标题 / ID / 父会话，或切换状态标签 | 列表与分页按筛选结果重新计算 |
| 归档 | 行内点“归档” | 停止当前运行并从会话分组界面隐藏；可取消归档 |
| 单条删除 | 行内点“删除”，确认弹窗 | 永久移除该子智能体的会话目录 |
| 批量删除 | 勾选多行（可跨页），点“批量删除”，确认 | 依次删除选中项；失败项保留勾选并提示原因 |
| 调整并发上限 | 顶部输入 1–256，点“保存” | 写入 DSH 的 `subagent` 配置并立即生效于后续委派 |

> “全选本页”只作用于当前页；跨页勾选会保留，单次最多 100 个。运行中的子智能体复选框是灰的，先归档。

### 回话主页入口

设置页不是唯一入口。回话主页标题旁的“xx 个子智能体”现在会展开同一个子智能体目录：

- 点击某一行打开该子会话；
- 行内“归档 / 取消归档”直接操作；
- 行内“删除”会先弹出确认；
- 运行中或仍有下级的子智能体，删除按钮置灰；
- 外部任务只显示标签，不能归档或删除；
- 删除成功后，父会话的计数立即减少。

这个入口和设置页共用同一套 Host 路由、权限规则和墓碑清理，不会出现两套行为。

## 安装

### 要求

- 已安装并可运行 DSH Web profile。
- 能使用 `git` 和 DSH 的 `plugin_manager`。
- 不需要 TypeScript、构建步骤或第三方运行时依赖；Host 与 Client 都是纯 JavaScript。

### 从 GitHub 安装

```bash
git clone https://github.com/alexjia812/dsh-subagent-manager.git
```

推荐把克隆后的绝对路径交给 Agent，用 `plugin_manager` 的 `install_bundle` 安装：

```text
请使用 plugin_manager 的 install_bundle 动作，把
/absolute/path/to/dsh-subagent-manager
安装到当前 DSH profile。安装后确认 include:subagent-manager 为 active，
并在设置中确认“子智能体管理器”页面已注册。
```

安装完成后刷新 Web 页面，打开 **设置 → 子智能体管理器**。

> 单独执行 `dsh plugin add` 通常只把包装进 profile，不会自动写入 `dsh.profile.bundles` 和 bundle patch，设置页可能不会出现。`install_bundle` 会同时处理依赖、bundle 选择与 patch。

### 卸载

由 Agent 使用 `plugin_manager` 的 `remove_bundle` 动作移除 `@local/dsh-subagent-manager`，然后刷新页面。若要同时清理墓碑状态，删除 `$DSH_HOME/subagent-manager/deleted-sessions.json`。

## 使用

1. 在回话主页点击标题旁的“xx 个子智能体”，或打开 **设置 → 子智能体管理器**。两处看到的是同一批子智能体。
2. 用搜索和状态标签缩小范围；分页固定每页 15 条。
3. 需要保留数据但停止运行时用“归档”；归档可撤销。
4. 确实不再需要历史时用“删除”；运行中的先归档，仍有下级的先处理下级。
5. 批量删除时勾选目标行，点“批量删除”。如果同时选中父、子，Host 会先删深层子会话，再删父会话。
6. 顶部输入并发上限并保存；该设置对之后创建的委派生效，不会强制停止现有子智能体。

删除成功后，回话主页的父会话目录计数会同步减少。之前已经删除、但仍残留在父会话目录里的旧条目，会在插件启动扫描时补记为墓碑并一起过滤。

## 配置

本插件自身只有两个可选配置，通常不需要改动：

| 字段 | 默认 | 说明 |
|---|---|---|
| `sessionRoot` | `$DSH_HOME/sessions` | 子智能体会话目录的根路径。仅在修改了 `@deepseek-ai/dsh-session-persistence-jsonl` 的 `root` 时需要设置 |
| `stateDir` | `$DSH_HOME/subagent-manager` | 插件状态目录，保存 `deleted-sessions.json` 墓碑文件 |

在 profile 的 `cordis.patch.yml` 中给插件行加配置：

```yaml
- id: subagent-manager
  name: '@local/dsh-subagent-manager'
  config:
    sessionRoot: /srv/dsh/sessions
    stateDir: /srv/dsh/subagent-manager
```

并发上限不是插件自己的字段，而是 DSH 现有的 `subagent` 配置命名空间。页面的“并发上限”卡片会直接读写它：

```yaml
- id: subagent
  config:
    maxActiveSubagents: 8
```

`config:` 会替换该行的完整配置；只写需要改的字段即可。修改 `sessionRoot` 或 `stateDir` 后重载插件或重启 Host。

## 安全与限制

- **删除是永久的。** 会移除该子智能体的整个会话目录（`session.v*.jsonl.zstd`、锁文件等），无法从插件内恢复。
- **只管理子智能体。** 根会话和普通 fork 会话不会出现在列表里，也不能通过本插件删除。
- **运行中不能删除。** 行内删除和批量删除都会拒绝仍在驻留的子智能体；先归档以停止运行。
- **有下级时不能删除。** 单条删除要求先处理下级；批量删除会按深度排序，因此同时选中父、子时可以一起删。
- **只删除会话目录。** 附件、工作区登记和其他外部产物不在清理范围内；工作区列表会因会话不存在而不再显示它。
- **父会话计数是投影过滤，不改写父日志。** DSH 的父会话日志是追加式的，删除子会话不会重写历史发现项。插件用持久墓碑过滤 `subagentCatalog` 的客户端投影，并即时更新当前页面的投影存储；因此计数会减少，但原始父会话日志仍保留该发现事件。
- **禁用或卸载插件后，原始目录项会重新可见。** 墓碑过滤只在插件启用时生效；这是为了不破坏 DSH 的日志回放与完整性约束。
- **失效目录项扫描基于已物化投影。** 启动时扫描父会话的目录投影，把“目录里有、会话已不存在”的条目录入墓碑。极冷、从未打开过的父会话可能不在这次扫描范围内；重新加载插件或重启 Host 会再次扫描。
- **没有模型工具，也没有外部网络请求。** 删除和归档是用户专属操作，不注册 Agent 可调用的工具；不会上传会话、不读取凭据。HTTP 路由复用 DSH 的 Connection 认证，缺省回退到 `ctx.webServer`。

## 工作原理

| 部分 | 职责 |
|---|---|
| Host `index.js` | 读取 `sessionQuery` / `sessionPersistence` / `workspaceRegistry` / `settings`；提供 `/api/dsh-subagent-manager/state` 与 `/action` 两条路由；执行归档、删除和并发上限写入 |
| Client `client.js` | 向 `settings.section` 注册设置页，并以较低优先级在 `conversation.session.header.actions` 接替 `subagent-catalog`；负责分页、搜索、勾选、回话主页目录、确认弹窗和投影存储更新；只使用 DSH 主题 token，不依赖其他 Client 包 |
| 状态文件 | `deleted-sessions.json` 记录已删除子智能体 ID，供投影过滤和失效目录项清理使用 |

删除后的计数同步分三层：

1. Host 删除子会话目录，并把它的 ID 写入墓碑集合。
2. Host 包装 `subagentCatalog` 的 wire view，在投影发往浏览器前过滤墓碑 ID；热会话、冷会话和缓存读取一致生效。
3. 当前页面删除成功后，Client 直接更新父会话的投影存储，让“xx 个子智能体”立即下降，不必等下一次投影事件。

## 故障排查

| 现象 | 处理 |
|---|---|
| 设置里没有“子智能体管理器” | 确认 `include:subagent-manager` 为 `active`；刷新页面。若刚安装，确认 bundle 已写入 profile，而不是只执行了 `dsh plugin add` |
| 回话主页没有“xx 个子智能体” | 当前会话没有直接子智能体，或目录投影尚未加载；先派发一次子智能体再刷新 |
| 回话主页的目录没有归档/删除按钮 | 刷新页面加载新版 Client；旧版目录是 DSH 自带组件，只有打开和层级展开 |
| 列表加载失败，提示 `cannot get property "sessions" without inject` | 旧版本缺少 `sessions` 服务声明；更新到当前版本，刷新页面。若仍报错，重载插件或重启 `dsh-web` |
| 列表一直为空 | 当前 DSH 实例确实还没有子智能体会话；本页管理所有会话派生的子智能体，不是当前会话的聊天记录 |
| 删除按钮是灰色的 | 子智能体仍在运行，或还有下级子智能体；先归档，或先删除下级 |
| 复选框是灰色的 | 运行中的子智能体不能批量删除；先归档，待其释放后再勾选 |
| 批量删除部分失败 | 失败项会保留勾选并显示首个失败原因；常见原因是仍有下级或仍在运行 |
| 删除后父会话计数没变 | 对页面做一次硬刷新；确认插件为 `active`。若父会话开在另一个标签页，刷新该标签页。仍不更新时提供父会话 ID 和当前计数 |
| 并发上限保存失败 | 提示冲突时先刷新读取最新 revision 再保存；提示不可用说明当前 profile 没有可写的 `subagent` 命名空间 |
| 自定义了会话根目录 | 给插件行设置 `config.sessionRoot`，否则插件找不到会话目录，删除会报 `DELETE_FAILED` |

## 开发与验证

仓库没有构建步骤。主要文件：

| 文件 | 作用 |
|---|---|
| `index.js` | Host 半部：状态、归档、删除、批量删除、并发上限、墓碑过滤 |
| `client.js` | Client 半部：设置页、回话主页目录、分页、选择、确认弹窗、投影存储更新 |
| `cordis.patch.yml` | bundle 安装行 |
| `locale/*.json` | 插件管理器中显示的标题与描述 |
| `icon.svg` | 插件图标 |

本地检查：

```bash
node --check index.js
node --check client.js
npm pack --dry-run --json
```

已完成的验证：

- Host 分页（每页 15 条）、状态筛选、跨全部数据搜索、批量删除顺序与 100 条上限，通过含 42 条模拟子会话的冒烟测试。
- 删除后的父会话目录投影过滤、失效目录项自动补墓碑、墓碑文件持久化，通过模拟 `subagentCatalog` 投影测试。
- 会话目录解析用本机 120 个真实子智能体会话逐一比对，全部命中。
- 回话主页目录按父会话过滤的 `/state?parent=` 查询通过模拟测试：根会话只返回直接子会话，嵌套会话只返回自己的下级。
- `settings.section` 与接替后的 `subagent-catalog` 在运行中的 Web 客户端均为 `active`。
- 页面最终视觉、暗色主题和窄屏布局仍需在浏览器中刷新后确认。

## 贡献

欢迎通过 [Issues](https://github.com/alexjia812/dsh-subagent-manager/issues) 报告问题和提出建议。提交问题时请附上：

- DSH 版本、操作系统和 profile 名称；
- 安装方式（`install_bundle` 的目录 / 版本）；
- 复现步骤、实际结果和预期结果；
- 相关报错信息（请移除凭据、会话内容和私有路径）。

这个插件是社区项目，不是 DeepSeek 官方产品。

## License

[MIT](LICENSE) © 2026 Linden Jia
