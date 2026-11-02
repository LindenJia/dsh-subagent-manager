# 子智能体管理器 / Subagent Manager

为 DeepSeek Harness Web 提供的子智能体管理插件。它在 **Settings（设置）** 中增加一个独立页面，用于管理当前配置方案里所有会话派生的子智能体。

GitHub 仓库：<https://github.com/alexjia812/dsh-subagent-manager>

## 功能

- **分页列表**：按创建时间倒序显示标题、父会话、委派深度、运行状态、归档状态与下级数量；每页 15 条，支持上一页/下一页、按运行/归档筛选和跨全部数据搜索。
- **多选与批量删除**：每行复选框、当前页“全选本页”、已选计数和批量删除按钮；一次最多选 100 个，运行中的子智能体不可勾选。
- **归档 / 取消归档**：归档会停止该子智能体正在运行的工作，并把它从会话列表中隐藏；数据保留，可随时取消归档。
- **永久删除**：删除该子智能体在会话持久化目录中的整个会话目录（`session.v*.jsonl.zstd`、锁文件等）。此操作不可撤销。
- **并发数量设置**：直接读写 `subagent` 配置命名空间的 `maxActiveSubagents` 字段（1–256），与 DSH 自带的子智能体并发上限是同一项设置。

删除是用户专属的破坏性操作，插件不注册任何模型可调用的工具，模型无法自行删除或归档会话。

## 安装

插件以本地 bundle 形式提供：

```bash
git clone https://github.com/alexjia812/dsh-subagent-manager.git
```

然后由 Agent 使用 `plugin_manager` 工具的 `install_bundle` 动作安装，`target` 指向克隆后的绝对路径：

```text
target: /absolute/path/to/dsh-subagent-manager
```

安装后刷新 Web 页面，打开 **设置 → 子智能体管理器**。

包名 `@local/dsh-subagent-manager` 用于本地 `link:` 安装；如果要发布到 npm，请改成自己的 scoped 包名，并同步更新 `cordis.patch.yml` 与本 README。

## 行为与限制

- **只能删除子智能体**：根会话、普通 fork 会话不会被列出或删除。
- **运行中不可删除**：运行中的子智能体会话会先被拦截；请先归档（会停止运行），待其释放后再删除。
- **有下级时不可删除**：必须先删除其下级，避免留下无法访问的孤立会话。
- **父会话计数同步**：DSH 的父会话日志以追加方式记录子智能体发现项，原始日志不会因删除而重写。本插件在 Host 侧对 `subagentCatalog` 的客户端投影做墓碑过滤，并在当前页面直接更新父会话的投影存储，因此删除后回话主页的子智能体计数会相应减少。墓碑保存在 `$DSH_HOME/subagent-manager/deleted-sessions.json`，启动时会扫描失效目录项自动补记。
- **原始日志仍保留发现事件**：过滤只作用于投影与 UI，不改写父会话的追加日志；这是为了不破坏 DSH 的会话日志完整性与回放约束。
- **会话根目录**：默认使用 `$DSH_HOME/sessions`。如果配置方案把 `@deepseek-ai/dsh-session-persistence-jsonl` 的 `root` 改到了别处，请在本插件行上增加配置：

  ```yaml
  - id: subagent-manager
    name: '@local/dsh-subagent-manager'
    config:
      sessionRoot: /absolute/path/to/sessions
  ```

## 常见问题

- **列表加载失败，提示 `cannot get property "sessions" without inject`**：Host 半部漏声明了 `sessions` 服务。该问题已修复（`inject` 已包含 `sessions`）；刷新页面或重新打开设置页即可。若仍报同一个错，说明 Host 进程还没加载新模块，重启一次 `dsh-web` 后再试。
- **列表一直为空**：确认当前 DSH 实例确实有子智能体会话；本页管理的是所有会话派生的子智能体，不是当前会话的聊天记录。
- **删除按钮是灰色的**：子智能体仍在运行，或还有下级子智能体。先归档（会停止运行），或先删除下级，再删除它。
- **复选框是灰色的**：运行中的子智能体不能批量删除；先归档，待其释放后再勾选。
- **批量删除部分失败**：失败项会保持勾选，并显示首个失败原因；常见原因是仍有下级或仍在运行。处理后再点一次“批量删除”。
- **并发上限保存失败**：若提示设置已在别处修改，点“刷新”读取最新值后重试；若提示不可用，说明当前配置方案没有可写的 `subagent` 设置命名空间。

## 实现

- Host 半部：`index.js`。它注册两条精确的 `ctx.connection.fetch` 路由（`/api/dsh-subagent-manager/state` 与 `/action`），读取 `ctx.sessionQuery` / `ctx.sessionPersistence` / `ctx.workspaceRegistry` / `ctx.settings`，并在没有 Connection 载体的组合中回退到 `ctx.webServer`。
- Client 半部：`client.js`。它向 `settings.section` 槽注册页面，使用 DSH 主题 token，不依赖任何 Harness Client 包。

## 验证

- Host 侧分页（每页 15 条）、状态筛选、跨全部数据搜索、批量删除顺序与 100 条上限，已通过含 42 条模拟子会话的冒烟测试。
- 单条归档/删除、并发上限写入也通过模拟服务测试。
- 删除后的父会话目录投影过滤（含失效目录项自动补墓碑、墓碑文件持久化）已通过模拟 `subagentCatalog` 投影测试。
- 会话目录解析已用本机 120 个真实子智能体会话逐一比对，全部命中。
- `settings.section` 注册在运行中的 Web 客户端里为 `active`。
- 页面的最终视觉呈现（明暗主题、窄屏布局）仍需在浏览器中确认；刷新页面后打开设置页检查即可。
- 删除操作会真实移除磁盘上的会话目录，请只在确认不再需要该子智能体历史时使用。

## License

[MIT](LICENSE) © 2026 Linden Jia
