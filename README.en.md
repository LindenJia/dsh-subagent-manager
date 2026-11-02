<p align="center">
  <img src="icon.svg" width="88" height="88" alt="Subagent Manager">
</p>

<h1 align="center">Subagent Manager</h1>

<p align="center">
  Manage every subagent a session has delegated, from one page in DeepSeek Harness.<br>
  Pagination, filtering, archive, permanent delete, batch actions, and the concurrency limit.
</p>

<p align="center">
  <a href="LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue?style=flat-square" alt="License"></a>
  &nbsp;
  <img src="https://img.shields.io/badge/DSH-0.2.1--rc.5-2f63d8?style=flat-square" alt="DSH">
  &nbsp;
  <img src="https://img.shields.io/badge/version-1.2.0-2f63d8?style=flat-square" alt="Version">
</p>

<p align="center">
  <a href="README.md">中文</a> | English
</p>

> **Community plugin, not an official DeepSeek product.** Validated against DeepSeek Harness `0.2.1-rc.5` on the Web profile. Other `0.2.x` releases have not been verified one by one.

<p align="center">
  <a href="#features">Features</a> ·
  <a href="#ui-and-actions">UI and actions</a> ·
  <a href="#install">Install</a> ·
  <a href="#usage">Usage</a> ·
  <a href="#configuration">Configuration</a> ·
  <a href="#safety-and-limits">Safety and limits</a> ·
  <a href="#how-it-works">How it works</a> ·
  <a href="#troubleshooting">Troubleshooting</a> ·
  <a href="#development-and-verification">Development</a> ·
  <a href="#license">License</a>
</p>

## Features

DSH's built-in subagent catalog is scoped to the current session. When subagents are spread across sessions and old tasks need cleanup, there is no single place to manage them. This plugin adds that management surface:

| Capability | Description |
|---|---|
| Global subagent list | Aggregates subagents across sessions with title, parent session, delegation depth, running/archived state, and child count |
| Search and filter | Search title, ID, or parent; filter All / Running / Archived. Search and filtering run on the Host and cover every page |
| Pagination | Fixed 15 rows per page, with page count and previous/next controls |
| Archive / unarchive | Stops the subagent's current run and hides its conversation; data is retained and can be restored |
| Single delete | Permanently removes the subagent's session directory after confirmation |
| Batch delete | Per-row checkboxes, select-all on the current page, selection count; up to 100 at a time, deepest first |
| Concurrency limit | Reads and writes `subagent.maxActiveSubagents` (1–256), the same setting DSH uses for delegation capacity |
| Parent count sync | After a delete, the “N subagents” count in the parent conversation decreases instead of keeping the deleted child |
| Manage from the conversation | Click the “N subagents” trigger in the conversation header to open the same catalog and archive or delete each direct child |
| Root-conversation tool | A root conversation can call `manage_subagent` to archive, unarchive, or delete its own descendants; subagent callers, external tasks, and arbitrary session ids are rejected |

## UI and actions

Open **Settings → Subagent Manager**. The layout is roughly:

```text
┌─ Subagent Manager ─────────────────────────────────────────┐
│ Concurrent subagents  [ 8 ]  [Save]      Effective now: 8  │
├────────────────────────────────────────────────────────────┤
│ All | Running | Archived          Search title, ID, parent  │
│ ☑ Select this page   3 selected   Clear   [Delete selected] │
│                                                            │
│ ☑  ● Subagent title       Parent…  Depth 1  Running  Archive Delete │
│ ☐  ● Another subagent     Parent…  Depth 2  Idle     Archive Delete │
│                                                            │
│ Page 1 of 3     15 per page                  Previous Next  │
└────────────────────────────────────────────────────────────┘
```

| Action | How | Result |
|---|---|---|
| Find a subagent | Use the search box, or switch status tabs | The list and pagination are recalculated from the filtered result |
| Archive | Click **Archive** on a row | Stops the current run and hides the conversation from grouping surfaces; reversible |
| Delete one | Click **Delete** on a row, then confirm | Permanently removes that subagent's session directory |
| Batch delete | Check rows (across pages if needed), click **Delete selected**, confirm | Deletes sequentially; failed items stay selected and report the first reason |
| Change the limit | Enter 1–256 at the top and click **Save** | Writes DSH's `subagent` configuration; applies to later delegations |

> **Select this page** only selects the current page. Selections persist across pages, up to 100 items. Running subagents have disabled checkboxes; archive them first.

### Conversation-header entry

The Settings page is not the only entry point. The “N subagents” trigger beside the conversation title now opens the same direct-child catalog:

- click a row to open that child conversation;
- use **Archive / Unarchive** in the row;
- **Delete** asks for confirmation first;
- delete is disabled while the child is running or still has children;
- external tasks show a label and cannot be archived or deleted;
- a successful delete immediately reduces the parent count.

This entry shares the same Host routes, permission rules, and tombstone cleanup as the Settings page.

### Model entry

The root conversation can also manage subagents through a tool, without opening Settings:

```text
manage_subagent(agent_id="...", action="archive")
manage_subagent(agent_id="...", action="unarchive")
manage_subagent(agent_id="...", action="delete")
```

Use `list_agents` to obtain `agent_id`. The tool accepts only a **root conversation**, and the target must be a registered descendant of that conversation; subagent callers, external tasks, and arbitrary session ids are rejected. `delete` still requires the target to be non-resident and childless; otherwise archive it or delete its descendants first.

A tool delete records a tombstone. The Client polls `/tombstones` every 5 seconds and removes those ids from the current projection store, so the conversation-header count drops within a few seconds without a page refresh.

## Install

### Requirements

- A working DSH Web profile.
- `git` and DSH's `plugin_manager`.
- No TypeScript, build step, or third-party runtime dependency. Host and Client halves are plain JavaScript.

### From GitHub

```bash
git clone https://github.com/LindenJia/dsh-subagent-manager.git
```

Then ask an agent to install the cloned directory through `plugin_manager`:

```text
Use plugin_manager's install_bundle action to install
/absolute/path/to/dsh-subagent-manager
into the current DSH profile. Confirm that include:subagent-manager is active
and that the Subagent Manager settings page is registered.
```

Refresh the Web page and open **Settings → Subagent Manager**.

> Running only `dsh plugin add` usually installs the package but does not write `dsh.profile.bundles` and the bundle patch, so the settings page may not appear. `install_bundle` handles dependencies, bundle selection, and the patch together.

### Uninstall

Use `plugin_manager`'s `remove_bundle` action for `@local/dsh-subagent-manager`, then refresh the page. To clear tombstone state as well, remove `$DSH_HOME/subagent-manager/deleted-sessions.json`.

## Usage

1. Click the “N subagents” trigger beside the conversation title, or open **Settings → Subagent Manager**. Both list the same subagents.
2. Narrow the list with search and status tabs. Pagination is fixed at 15 rows per page.
3. Use **Archive** when the history should stay but the subagent should stop running and disappear from grouping surfaces.
4. Use **Delete** only when the history is no longer needed. Archive a running subagent first; delete its children first.
5. For batch deletion, check the target rows and confirm. If a parent and its child are both selected, the Host deletes the deeper child first, then the parent.
6. Change the concurrency limit at the top and save. It affects later delegations and does not force-stop existing subagents.

After a successful delete, the parent conversation's “N subagents” count decreases. Stale catalog entries left by earlier deletions are also scanned at plugin startup, recorded as tombstones, and filtered out.

## Configuration

The plugin itself has two optional fields, usually unnecessary:

| Field | Default | Meaning |
|---|---|---|
| `sessionRoot` | `$DSH_HOME/sessions` | Root of the subagent session directories. Set it only when `@deepseek-ai/dsh-session-persistence-jsonl` uses a different `root` |
| `stateDir` | `$DSH_HOME/subagent-manager` | Plugin state directory holding `deleted-sessions.json` |

Add the configuration to the plugin row in the profile's `cordis.patch.yml`:

```yaml
- id: subagent-manager
  name: '@local/dsh-subagent-manager'
  config:
    sessionRoot: /srv/dsh/sessions
    stateDir: /srv/dsh/subagent-manager
```

The concurrency limit is not a plugin-owned field. It is DSH's existing `subagent` namespace; the card reads and writes it directly:

```yaml
- id: subagent
  config:
    maxActiveSubagents: 8
```

`config:` replaces the whole config object; include only the fields you need to change. Reload the plugin or restart the Host after changing `sessionRoot` or `stateDir`.

## Safety and limits

- **Deletion is permanent.** The subagent's whole session directory (`session.v*.jsonl.zstd`, lock file, and so on) is removed and cannot be restored from the plugin.
- **Subagents only.** Root sessions and ordinary fork sessions are never listed and cannot be deleted here.
- **No running subagent can be deleted.** Single and batch deletion both refuse a resident subagent; archive it first.
- **No subagent with children can be deleted.** Single deletion requires the children to be handled first. Batch deletion sorts deepest first, so a parent and its child can be selected together.
- **Only the session directory is removed.** Attachments, workspace records, and other external artifacts are not cleaned up; the workspace list stops showing the session because it no longer exists.
- **The parent count is a projection filter, not a log rewrite.** DSH's parent log is append-only, so deleting a child session does not rewrite the historical discovery entry. The plugin uses a durable tombstone to filter the client-facing `subagentCatalog` projection and updates the current page's projection store immediately. The raw parent log still contains the discovery event.
- **Disabling or uninstalling the plugin makes the raw catalog entries visible again.** The tombstone filter is active only while the plugin runs; this preserves DSH's log replay and integrity constraints.
- **Stale-entry scanning uses materialized projections.** At startup the plugin scans parent catalog projections and tombstones entries whose child session no longer exists. A very cold parent that has never been opened may fall outside that scan; reloading the plugin or restarting the Host scans again.
- **The model tool only manages descendants of its own root conversation.** `manage_subagent` accepts only a root conversation, and the target must appear in that conversation's `listDescendants` catalog; subagent callers, arbitrary session ids, and external tasks are rejected. `delete` still requires a non-resident, childless target. The tool does not upload sessions, read credentials, or make outbound network calls; HTTP routes reuse DSH's Connection authentication and fall back to `ctx.webServer` when needed.

## How it works

| Part | Responsibility |
|---|---|
| Host `index.js` | Reads `sessionQuery` / `sessionPersistence` / `workspaceRegistry` / `settings`; registers the `manage_subagent` tool; serves `/state`, `/action`, and `/tombstones`; performs archive, delete, and limit writes |
| Client `client.js` | Registers the `settings.section` page and shadows `subagent-catalog` in `conversation.session.header.actions` at a lower priority; owns pagination, search, selection, the conversation-header catalog, confirmation dialogs, the projection-store update, and tombstone polling; uses only DSH theme tokens and imports no other Client package |
| State file | `deleted-sessions.json` stores deleted subagent IDs for projection filtering and stale-entry cleanup |

Parent-count synchronization has three layers:

1. The Host removes the child session directory and records its ID in the tombstone set.
2. The Host wraps the `subagentCatalog` wire view and filters tombstoned IDs before projections reach the browser, for live sessions, cold sessions, and cached reads alike.
3. After a successful delete, the Client updates the parent's projection store directly, so the “N subagents” count drops immediately instead of waiting for the next projection event.
4. When the model deletes through `manage_subagent`, the Host writes the same tombstone; the Client polls `/tombstones` every 5 seconds and filters the projection store, so the count updates without a refresh.

## Troubleshooting

| Symptom | What to do |
|---|---|
| No “Subagent Manager” entry in Settings | Confirm `include:subagent-manager` is `active`; refresh. If it was just installed, confirm the bundle was written to the profile, not only installed with `dsh plugin add` |
| No “N subagents” trigger in the conversation header | The current session has no direct children, or the catalog projection has not loaded yet; delegate a subagent, then refresh |
| The header catalog has no archive/delete buttons | Refresh to load the new Client. The old catalog is the shipped DSH component with open and expand only |
| The model cannot see `manage_subagent` | Refresh the page or reload the plugin so the tool list updates. Even when a subagent sees the tool, its call is rejected |
| `manage_subagent` returns a refusal | Only a root conversation can call it; the target must be a descendant; external tasks, running/resident subagents, and deletes with children are refused |
| List fails with `cannot get property "sessions" without inject` | An old build is missing the `sessions` service declaration. Update to the current version and refresh; reload the plugin or restart `dsh-web` if it persists |
| The list is always empty | This DSH instance has no subagent sessions yet. The page manages subagents from all sessions, not the current conversation's chat history |
| The Delete button is grey | The subagent is running, or it still has children. Archive it, or delete its children first |
| Checkboxes are grey | A running subagent cannot be batch-deleted. Archive it and wait for it to be released |
| Batch delete partially failed | Failed items stay selected and the first failure reason is shown; the common causes are remaining children or a still-running subagent |
| The parent count did not change after deletion | Hard-refresh the page and confirm the plugin is `active`. If the parent is open in another tab, refresh that tab. If it still does not update, report the parent session ID and current count |
| Saving the concurrency limit fails | On a conflict, refresh to read the latest revision and retry. “Unavailable” means the current profile has no writable `subagent` namespace |
| A custom session root is configured | Set `config.sessionRoot` on the plugin row; otherwise the plugin cannot locate session directories and deletion fails with `DELETE_FAILED` |

## Development and verification

There is no build step. Main files:

| File | Purpose |
|---|---|
| `index.js` | Host half: state, archive, delete, batch delete, concurrency limit, tombstone filtering, `manage_subagent` tool |
| `client.js` | Client half: settings page, conversation-header catalog, pagination, selection, dialogs, projection-store update |
| `cordis.patch.yml` | Bundle installation row |
| `locale/*.json` | Plugin Manager title and description |
| `icon.svg` | Plugin icon |

Local checks:

```bash
node --check index.js
node --check client.js
npm pack --dry-run --json
```

Verification performed:

- Host pagination (15 per page), status filtering, cross-corpus search, batch-deletion order, and the 100-item cap, using a 42-row mock corpus.
- Parent catalog projection filtering after deletion, automatic tombstoning of stale entries, and tombstone-file persistence, using a mocked `subagentCatalog` projection.
- Session-directory resolution matched all 120 real subagent sessions on the development machine.
- Parent-scoped `/state?parent=` queries verified that a root session returns only direct children and a nested session returns only its own descendants.
- Real end-to-end check: a disposable subagent was created, then `manage_subagent` ran `archive`, `unarchive`, and `delete`; the session directory was removed and the tombstone persisted.
- Both `settings.section` and the shadowed `subagent-catalog` are registered as `active` in the running Web client.
- Final visuals, dark theme, and narrow-screen layout still need a browser refresh for confirmation.

## Contributing

Use [Issues](https://github.com/LindenJia/dsh-subagent-manager/issues) for bug reports and suggestions. Please include:

- DSH version, operating system, and profile name;
- install method (the `install_bundle` directory or version);
- reproduction steps, actual result, and expected result;
- relevant errors, with credentials, session content, and private paths removed.

This is a community plugin, not an official DeepSeek product.

## License

[MIT](LICENSE) © 2026 Linden Jia
