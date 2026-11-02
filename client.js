window.__ModuleLoader__.load({
  id: '@local/dsh-subagent-manager',
  factory(require) {
    const React = require('react')
    const h = React.createElement

    const NS = 'subagent-manager'

    const en = {
      title: 'Subagent Manager',
      subtitle: 'Archive or permanently delete subagents derived from any session, and set how many may run at once.',
      'section.limits': 'Concurrent capacity',
      'limits.label': 'Maximum concurrent subagents',
      'limits.hint': 'Counts every live subagent under one main agent across all levels. The main agent is not counted. Values from 1 to 256.',
      'limits.effective': 'Effective now: {count}',
      'limits.save': 'Save',
      'limits.saving': 'Saving…',
      'limits.saved': 'Saved',
      'limits.invalid': 'Enter a whole number from 1 to 256.',
      'limits.unavailable': 'The subagent settings namespace is not available or is read-only in this profile.',
      'section.list': 'Subagents',
      'list.refresh': 'Refresh',
      'list.search': 'Search',
      'list.searchPlaceholder': 'Search title, id, or parent',
      'list.empty': 'No subagents have been delegated yet.',
      'list.emptyFiltered': 'No subagent matches this filter.',
      'list.loading': 'Loading subagents…',
      'list.error': 'The subagent list could not be loaded.',
      'list.total': '{count} total',
      'list.showing': 'Showing the newest {shown}',
      'list.more': 'Show more',
      'list.all': 'All',
      'list.running': 'Running',
      'list.archived': 'Archived',
      'list.selectAll': 'Select this page',
      'list.selectRow': 'Select {title}',
      'list.selected': '{count} selected',
      'list.clearSelection': 'Clear selection',
      'list.batchDelete': 'Delete selected',
      'list.selectLimit': 'Select at most 100 subagents at a time.',
      'list.page': 'Page {page} of {pages}',
      'list.prev': 'Previous',
      'list.next': 'Next',
      'list.pageSize': '{count} per page',
      'list.filtered': '{count} matched',
      'summary.total': '{count} total',
      'summary.running': '{count} running',
      'summary.archived': '{count} archived',
      'row.running': 'Running',
      'row.idle': 'Idle',
      'row.archived': 'Archived',
      'row.selectRunning': 'A running subagent cannot be deleted; archive it first.',
      'row.untitled': 'Untitled subagent',
      'row.parent': 'Parent: {title}',
      'row.depth': 'Depth {depth}',
      'row.children': '{count} children',
      'row.created': 'Created {time}',
      'row.archive': 'Archive',
      'row.unarchive': 'Unarchive',
      'row.delete': 'Delete',
      'row.deleteRunning': 'A running subagent cannot be deleted. Archive it first to stop it.',
      'row.deleteChildren': 'Delete this subagent\'s children first.',
      'row.archiveRunning': 'Archive stops the subagent\'s current run and hides its conversation.',
      'banner.archived': 'Subagent archived.',
      'banner.unarchived': 'Subagent unarchived.',
      'banner.deleted': 'Subagent permanently deleted.',
      'banner.limit': 'Concurrent subagent limit updated.',
      'banner.batchDeleted': 'Deleted {deleted}; {failed} failed.',
      'banner.batchDeletedAll': 'Deleted {deleted} subagents.',
      'dialog.delete.title': 'Delete this subagent permanently?',
      'dialog.batchDelete.title': 'Delete {count} subagents permanently?',
      'dialog.batchDelete.body': 'The session logs for the selected subagents will be removed from disk. This cannot be undone.',
      'dialog.delete.body': 'The session log for “{title}” will be removed from disk. This cannot be undone.',
      'dialog.delete.warning': 'The parent session keeps the durable discovery record for this child, so a stale catalog entry may remain until that parent is reopened.',
      'dialog.archive.title': 'Archive this running subagent?',
      'dialog.archive.body': 'Archiving “{title}” stops its current run and hides its conversation. You can unarchive it later.',
      'dialog.cancel': 'Cancel',
      'dialog.delete.confirm': 'Delete permanently',
      'dialog.archive.confirm': 'Archive',
      'error.INVALID': 'The request was not valid.',
      'error.NOT_FOUND': 'The subagent session no longer exists.',
      'error.NOT_SUBAGENT': 'That session is not a subagent.',
      'error.HAS_CHILDREN': 'Delete the subagent\'s children first.',
      'error.LIVE': 'The subagent is still resident. Archive it, then retry.',
      'error.ARCHIVE_FAILED': 'The subagent could not be archived.',
      'error.UNARCHIVE_FAILED': 'The subagent could not be unarchived.',
      'error.DELETE_FAILED': 'The session files could not be deleted.',
      'error.UNAVAILABLE': 'This operation is unavailable in the current profile.',
      'error.UPDATE_FAILED': 'The setting could not be saved.',
      'error.CONFLICT': 'The setting changed elsewhere. Refresh, then try again.',
      'error.INTERNAL': 'The Host reported an internal error.',
    }

    const zh = {
      title: '子智能体管理器',
      subtitle: '归档或永久删除任意会话派生的子智能体，并设置同时运行的数量上限。',
      'section.limits': '并发数量',
      'limits.label': '并发子智能体上限',
      'limits.hint': '统计一个主智能体下所有层级的存活子智能体，主智能体不计入。可填 1–256。',
      'limits.effective': '当前生效：{count}',
      'limits.save': '保存',
      'limits.saving': '保存中…',
      'limits.saved': '已保存',
      'limits.invalid': '请输入 1–256 的整数。',
      'limits.unavailable': '当前配置方案未提供子智能体设置，或该设置只读。',
      'section.list': '子智能体',
      'list.refresh': '刷新',
      'list.search': '搜索',
      'list.searchPlaceholder': '搜索标题、ID 或父会话',
      'list.empty': '还没有派生出子智能体。',
      'list.emptyFiltered': '没有符合当前筛选条件的子智能体。',
      'list.loading': '正在加载子智能体…',
      'list.error': '子智能体列表加载失败。',
      'list.total': '共 {count} 个',
      'list.showing': '仅显示最近 {shown} 个',
      'list.more': '显示更多',
      'list.all': '全部',
      'list.running': '运行中',
      'list.archived': '已归档',
      'list.selectAll': '全选本页',
      'list.selectRow': '选择 {title}',
      'list.selected': '已选 {count} 项',
      'list.clearSelection': '清除选择',
      'list.batchDelete': '批量删除',
      'list.selectLimit': '一次最多选择 100 个子智能体。',
      'list.page': '第 {page} / {pages} 页',
      'list.prev': '上一页',
      'list.next': '下一页',
      'list.pageSize': '每页 {count} 条',
      'list.filtered': '筛选出 {count} 个',
      'summary.total': '共 {count} 个',
      'summary.running': '{count} 个运行中',
      'summary.archived': '{count} 个已归档',
      'row.running': '运行中',
      'row.idle': '空闲',
      'row.archived': '已归档',
      'row.selectRunning': '运行中的子智能体不可批量删除，请先归档。',
      'row.untitled': '未命名子智能体',
      'row.parent': '父会话：{title}',
      'row.depth': '深度 {depth}',
      'row.children': '{count} 个下级',
      'row.created': '创建于 {time}',
      'row.archive': '归档',
      'row.unarchive': '取消归档',
      'row.delete': '删除',
      'row.deleteRunning': '运行中的子智能体不可删除，请先归档以停止运行。',
      'row.deleteChildren': '请先删除该子智能体的下级。',
      'row.archiveRunning': '归档会停止该子智能体当前运行，并隐藏其会话。',
      'banner.archived': '子智能体已归档。',
      'banner.unarchived': '已取消归档。',
      'banner.deleted': '子智能体已永久删除。',
      'banner.limit': '并发子智能体上限已更新。',
      'banner.batchDeleted': '已删除 {deleted} 个，{failed} 个失败。',
      'banner.batchDeletedAll': '已删除 {deleted} 个子智能体。',
      'dialog.delete.title': '永久删除这个子智能体？',
      'dialog.batchDelete.title': '永久删除 {count} 个子智能体？',
      'dialog.batchDelete.body': '将从磁盘移除选中子智能体的会话日志，此操作无法撤销。',
      'dialog.delete.body': '将从磁盘移除「{title}」的会话日志，此操作无法撤销。',
      'dialog.delete.warning': '父会话仍保留该子智能体的持久发现记录，父会话重新打开前可能留下一条失效的目录项。',
      'dialog.archive.title': '归档这个运行中的子智能体？',
      'dialog.archive.body': '归档「{title}」会停止它当前的运行并隐藏其会话，之后可以取消归档。',
      'dialog.cancel': '取消',
      'dialog.delete.confirm': '永久删除',
      'dialog.archive.confirm': '归档',
      'error.INVALID': '请求无效。',
      'error.NOT_FOUND': '该子智能体会话已不存在。',
      'error.NOT_SUBAGENT': '该会话不是子智能体。',
      'error.HAS_CHILDREN': '请先删除该子智能体的下级。',
      'error.LIVE': '子智能体仍在驻留，请归档后重试。',
      'error.ARCHIVE_FAILED': '归档失败。',
      'error.UNARCHIVE_FAILED': '取消归档失败。',
      'error.DELETE_FAILED': '删除会话文件失败。',
      'error.UNAVAILABLE': '当前配置方案不支持该操作。',
      'error.UPDATE_FAILED': '设置保存失败。',
      'error.CONFLICT': '设置已在别处修改，请刷新后重试。',
      'error.INTERNAL': 'Host 报告了内部错误。',
    }

    const CSS = [
      '.dsm-root{display:flex;flex-direction:column;gap:20px;padding:0 0 40px;color:var(--dsw-alias-label-primary);font-size:13px;line-height:20px}',
      '.dsm-head{display:flex;flex-direction:column;gap:4px}',
      '.dsm-head-row{display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap}',
      '.dsm-title{margin:0;font-size:20px;line-height:28px;font-weight:600}',
      '.dsm-subtitle{margin:0;color:var(--dsw-alias-label-secondary)}',
      '.dsm-card{display:flex;flex-direction:column;gap:12px;border:1px solid var(--dsw-alias-border-l1);border-radius:12px;background:var(--dsw-alias-bg-layer-1);padding:16px}',
      '.dsm-card-head{display:flex;align-items:flex-start;justify-content:space-between;gap:12px;flex-wrap:wrap}',
      '.dsm-card-title{margin:0;font-size:14px;line-height:22px;font-weight:600}',
      '.dsm-card-desc{margin:0;color:var(--dsw-alias-label-secondary);font-size:12px;line-height:18px}',
      '.dsm-limit-row{display:flex;align-items:center;gap:8px;flex-wrap:wrap}',
      '.dsm-input{box-sizing:border-box;width:104px;height:32px;border:1px solid var(--dsw-alias-border-l1);border-radius:8px;background:var(--dsw-alias-bg-layer-2);color:var(--dsw-alias-label-primary);padding:0 10px;font-size:13px;outline:none}',
      '.dsm-input:focus-visible{border-color:var(--dsw-alias-brand-primary);outline:2px solid color-mix(in srgb, var(--dsw-alias-brand-primary) 35%, transparent);outline-offset:1px}',
      '.dsm-input:disabled{opacity:.55;cursor:not-allowed}',
      '.dsm-search{box-sizing:border-box;flex:1;min-width:180px;max-width:320px;height:32px;border:1px solid var(--dsw-alias-border-l1);border-radius:8px;background:var(--dsw-alias-bg-layer-2);color:var(--dsw-alias-label-primary);padding:0 10px;font-size:13px;outline:none}',
      '.dsm-search:focus-visible{border-color:var(--dsw-alias-brand-primary);outline:2px solid color-mix(in srgb, var(--dsw-alias-brand-primary) 35%, transparent);outline-offset:1px}',
      '.dsm-search::placeholder{color:var(--dsw-alias-label-secondary)}',
      '.dsm-btn{display:inline-flex;align-items:center;justify-content:center;gap:6px;box-sizing:border-box;min-height:30px;border:1px solid var(--dsw-alias-border-l1);border-radius:8px;background:transparent;color:var(--dsw-alias-label-primary);padding:0 12px;font-size:12px;line-height:18px;cursor:pointer;white-space:nowrap}',
      '.dsm-btn:hover:not(:disabled){background:var(--dsw-alias-bg-layer-2)}',
      '.dsm-btn:focus-visible{outline:2px solid var(--dsw-alias-brand-primary);outline-offset:2px}',
      '.dsm-btn:disabled{opacity:.45;cursor:not-allowed}',
      '.dsm-btn-primary{border-color:var(--dsw-alias-brand-primary);color:var(--dsw-alias-brand-primary)}',
      '.dsm-btn-danger{border-color:color-mix(in srgb, var(--dsw-alias-state-error-primary) 55%, var(--dsw-alias-border-l1));color:var(--dsw-alias-state-error-primary)}',
      '.dsm-btn-ghost{border-color:transparent;color:var(--dsw-alias-label-secondary)}',
      '.dsm-chips{display:flex;align-items:center;gap:6px;flex-wrap:wrap}',
      '.dsm-chip{box-sizing:border-box;min-height:28px;border:1px solid transparent;border-radius:999px;background:transparent;color:var(--dsw-alias-label-secondary);padding:0 10px;font-size:12px;line-height:18px;cursor:pointer}',
      '.dsm-chip:hover{background:var(--dsw-alias-bg-layer-2)}',
      '.dsm-chip:focus-visible{outline:2px solid var(--dsw-alias-brand-primary);outline-offset:1px}',
      '.dsm-chip[aria-pressed=true]{border-color:var(--dsw-alias-brand-primary);background:color-mix(in srgb, var(--dsw-alias-brand-primary) 10%, transparent);color:var(--dsw-alias-brand-primary)}',
      '.dsm-summary{display:flex;align-items:center;gap:12px;flex-wrap:wrap;color:var(--dsw-alias-label-secondary);font-size:12px;line-height:18px}',
      '.dsm-toolbar{display:flex;align-items:center;gap:10px;flex-wrap:wrap;padding-top:4px}',
      '.dsm-select-all{display:inline-flex;align-items:center;gap:6px;color:var(--dsw-alias-label-secondary);font-size:12px;line-height:18px;cursor:pointer;user-select:none}',
      '.dsm-check{box-sizing:border-box;width:14px;height:14px;margin:0;flex:none;accent-color:var(--dsw-alias-brand-primary);cursor:pointer}',
      '.dsm-check:disabled{cursor:not-allowed;opacity:.45}',
      '.dsm-row>.dsm-check{margin-top:5px}',
      '.dsm-selected{color:var(--dsw-alias-brand-primary);font-size:12px;line-height:18px}',
      '.dsm-pager{display:flex;align-items:center;gap:10px;flex-wrap:wrap;border-top:1px solid var(--dsw-alias-border-l1);padding-top:12px}',
      '.dsm-page-info,.dsm-page-size{color:var(--dsw-alias-label-secondary);font-size:12px;line-height:18px}',
      '.dsm-page-actions{display:flex;align-items:center;gap:6px;margin-left:auto;flex-wrap:wrap}',
      '.dsm-list{display:flex;flex-direction:column}',
      '.dsm-row{display:flex;align-items:flex-start;gap:10px;padding:12px 0;border-top:1px solid var(--dsw-alias-border-l1)}',
      '.dsm-row:first-child{border-top:0}',
      '.dsm-dot{width:8px;height:8px;border-radius:50%;margin-top:6px;flex:none;background:var(--dsw-alias-state-idle-primary)}',
      '.dsm-dot[data-state=running]{background:var(--dsw-alias-state-success-primary)}',
      '.dsm-dot[data-state=archived]{background:var(--dsw-alias-state-warn-primary)}',
      '.dsm-row-main{display:flex;flex:1;min-width:0;flex-direction:column;gap:2px}',
      '.dsm-row-title{font-size:13px;line-height:20px;font-weight:500;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}',
      '.dsm-row-meta{display:flex;align-items:center;gap:8px;flex-wrap:wrap;color:var(--dsw-alias-label-secondary);font-size:12px;line-height:18px}',
      '.dsm-row-id{color:var(--dsw-alias-label-secondary);font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:11px;line-height:16px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}',
      '.dsm-row-actions{display:flex;align-items:center;gap:6px;flex:none;flex-wrap:wrap}',
      '.dsm-badge{display:inline-flex;align-items:center;border:1px solid var(--dsw-alias-border-l1);border-radius:999px;padding:0 8px;font-size:11px;line-height:18px;color:var(--dsw-alias-label-secondary)}',
      '.dsm-badge[data-tone=warn]{border-color:color-mix(in srgb, var(--dsw-alias-state-warn-primary) 55%, var(--dsw-alias-border-l1));color:var(--dsw-alias-state-warn-primary)}',
      '.dsm-badge[data-tone=brand]{border-color:color-mix(in srgb, var(--dsw-alias-brand-primary) 55%, var(--dsw-alias-border-l1));color:var(--dsw-alias-brand-primary)}',
      '.dsm-banner{display:flex;align-items:flex-start;gap:8px;border:1px solid var(--dsw-alias-border-l1);border-radius:10px;background:var(--dsw-alias-bg-layer-1);padding:8px 12px;font-size:12px;line-height:18px}',
      '.dsm-banner[data-kind=error]{border-color:color-mix(in srgb, var(--dsw-alias-state-error-primary) 45%, var(--dsw-alias-border-l1));color:var(--dsw-alias-state-error-primary)}',
      '.dsm-banner[data-kind=success]{border-color:color-mix(in srgb, var(--dsw-alias-state-success-primary) 45%, var(--dsw-alias-border-l1));color:var(--dsw-alias-state-success-primary)}',
      '.dsm-empty{display:flex;flex-direction:column;align-items:center;gap:8px;padding:32px 12px;color:var(--dsw-alias-label-secondary);text-align:center}',
      '.dsm-empty-title{color:var(--dsw-alias-label-primary);font-size:13px;line-height:20px}',
      '.dsm-hint{margin:0;color:var(--dsw-alias-label-secondary);font-size:12px;line-height:18px}',
      '.dsm-error-text{color:var(--dsw-alias-state-error-primary)}',
      '.dsm-overlay{position:fixed;inset:0;z-index:1000;display:flex;align-items:center;justify-content:center;padding:24px;background:color-mix(in srgb, var(--dsw-alias-bg-base) 60%, transparent)}',
      '.dsm-modal{box-sizing:border-box;width:min(460px,100%);max-height:calc(100vh - 48px);overflow:auto;border:1px solid var(--dsw-alias-border-l2);border-radius:14px;background:var(--dsw-alias-bg-overlay);padding:20px;box-shadow:0 18px 50px color-mix(in srgb, var(--dsw-alias-bg-base) 65%, transparent)}',
      '.dsm-modal-title{margin:0;font-size:16px;line-height:24px;font-weight:600}',
      '.dsm-modal-body{margin:8px 0 0;color:var(--dsw-alias-label-secondary);font-size:13px;line-height:20px}',
      '.dsm-modal-warning{margin:12px 0 0;border-left:2px solid var(--dsw-alias-state-warn-primary);padding-left:10px;color:var(--dsw-alias-label-secondary);font-size:12px;line-height:18px}',
      '.dsm-modal-actions{display:flex;justify-content:flex-end;gap:8px;flex-wrap:wrap;margin-top:20px}',
      '.dsm-sr{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0}',
      '@media(max-width:640px){.dsm-row{flex-wrap:wrap}.dsm-row-actions{margin-left:18px}.dsm-search{max-width:none}.dsm-page-size{display:none}}',
    ].join('')

    /**
     * @param {string} name - route tail.
     * @returns {string} absolute API URL under the page mount.
     */
    function endpoint(name) {
      return new URL(`api/dsh-subagent-manager/${name}`, document.baseURI).toString()
    }

    /**
     * @param {object} body - response body.
     * @returns {Error & { code?: string, detail?: string }} a typed failure.
     */
    function bodyError(body) {
      const error = new Error(body?.detail || body?.code || 'request failed')
      if (body && typeof body.code === 'string') error.code = body.code
      if (body && typeof body.detail === 'string') error.detail = body.detail
      return error
    }

    /**
     * @param {string} url - Fetch URL.
     * @param {RequestInit} [options] - Fetch options.
     * @returns {Promise<object>} parsed successful body.
     */
    async function requestJson(url, options) {
      const response = await fetch(url, Object.assign({ cache: 'no-store', headers: { accept: 'application/json' } }, options || {}))
      if (!response.ok) {
        const error = new Error(`HTTP ${response.status}`)
        error.code = 'INTERNAL'
        error.detail = `HTTP ${response.status}`
        throw error
      }
      const body = await response.json()
      if (!body || body.ok !== true) throw bodyError(body)
      return body
    }

    /**
     * @param {Error & { code?: string, detail?: string }} error - failure.
     * @param {(key: string, params?: object) => string} t - translate.
     * @returns {string} localized text.
     */
    function errorText(error, t) {
      const code = error && typeof error.code === 'string' ? error.code : 'INTERNAL'
      const key = `error.${code}`
      const translated = t(key)
      const base = translated !== key ? translated : t('error.INTERNAL')
      const detail = error && typeof error.detail === 'string' ? error.detail.trim() : ''
      return detail ? `${base} · ${detail}` : base
    }

    /**
     * @param {string} id - session id.
     * @returns {string} compact display form.
     */
    function shortId(id) {
      if (typeof id !== 'string') return ''
      return id.length > 20 ? `${id.slice(0, 8)}…${id.slice(-6)}` : id
    }

    /**
     * @param {number} value - epoch milliseconds.
     * @returns {string} localized date/time.
     */
    function formatTime(value) {
      if (!Number.isFinite(value)) return ''
      try {
        return new Date(value).toLocaleString()
      } catch {
        return new Date(value).toISOString()
      }
    }

    /**
     * @param {string} text - localized template.
     * @param {object} params - placeholders.
     * @returns {string} filled text.
     */
    function fill(text, params) {
      if (!params) return text
      return String(text).replace(/\{(\w+)\}/g, (match, key) => (params[key] === undefined ? match : String(params[key])))
    }

    /**
     * Confirm dialog with Escape and focus handling owned by this plugin.
     *
     * @param {{ title: string, body: string, warning?: string, cancel: string, confirm: string, danger?: boolean, onCancel: () => void, onConfirm: () => void }} props - dialog copy and handlers.
     */
    function ConfirmDialog(props) {
      const confirmRef = React.useRef(null)
      React.useEffect(() => {
        const previous = document.activeElement
        if (confirmRef.current) confirmRef.current.focus()
        const onKey = (event) => {
          if (event.key === 'Escape') {
            event.preventDefault()
            event.stopPropagation()
            props.onCancel()
          }
        }
        document.addEventListener('keydown', onKey, true)
        return () => {
          document.removeEventListener('keydown', onKey, true)
          if (previous && typeof previous.focus === 'function') previous.focus()
        }
      }, [])
      return h(
        'div',
        {
          className: 'dsm-overlay',
          onClick: (event) => {
            if (event.target === event.currentTarget) props.onCancel()
          },
        },
        h(
          'div',
          {
            className: 'dsm-modal',
            role: 'dialog',
            'aria-modal': 'true',
            'aria-labelledby': 'dsm-confirm-title',
            'aria-describedby': 'dsm-confirm-body',
          },
          h('h3', { className: 'dsm-modal-title', id: 'dsm-confirm-title' }, props.title),
          h('p', { className: 'dsm-modal-body', id: 'dsm-confirm-body' }, props.body),
          props.warning ? h('p', { className: 'dsm-modal-warning' }, props.warning) : null,
          h(
            'div',
            { className: 'dsm-modal-actions' },
            h('button', { type: 'button', className: 'dsm-btn', onClick: props.onCancel }, props.cancel),
            h(
              'button',
              {
                type: 'button',
                ref: confirmRef,
                className: `dsm-btn ${props.danger ? 'dsm-btn-danger' : 'dsm-btn-primary'}`,
                onClick: props.onConfirm,
              },
              props.confirm,
            ),
          ),
        ),
      )
    }

    /**
     * The settings section body.
     *
     * @param {{ t: (key: string, params?: object) => string, hideDeleted?: (parentId?: string, childId?: string) => void }} props - translated copy and catalog-filter hook.
     */
    function ManagerPage(props) {
      const t = props.t
      const PAGE_SIZE = 15
      const [snapshot, setSnapshot] = React.useState({ phase: 'loading', data: null, error: null })
      const [tick, setTick] = React.useState(0)
      const [page, setPage] = React.useState(0)
      const [query, setQuery] = React.useState('')
      const [debouncedQuery, setDebouncedQuery] = React.useState('')
      const debouncedRef = React.useRef('')
      const [filter, setFilter] = React.useState('all')
      const [busy, setBusy] = React.useState('')
      const [banner, setBanner] = React.useState(null)
      const [confirm, setConfirm] = React.useState(null)
      const [selected, setSelected] = React.useState(() => new Set())
      const [draft, setDraft] = React.useState('')
      const [draftDirty, setDraftDirty] = React.useState(false)
      const freshRef = React.useRef(false)

      React.useEffect(() => {
        const timer = setTimeout(() => {
          const next = query.trim()
          if (debouncedRef.current === next) return
          debouncedRef.current = next
          setDebouncedQuery(next)
          setPage(0)
          setSelected(new Set())
        }, 300)
        return () => clearTimeout(timer)
      }, [query])

      React.useEffect(() => {
        let cancelled = false
        const controller = new AbortController()
        async function load() {
          const fresh = freshRef.current
          freshRef.current = false
          const params = new URLSearchParams({
            limit: String(PAGE_SIZE),
            offset: String(page * PAGE_SIZE),
            status: filter,
          })
          if (debouncedQuery) params.set('q', debouncedQuery)
          if (fresh) params.set('fresh', '1')
          try {
            const response = await fetch(endpoint('state') + '?' + params.toString(), {
              cache: 'no-store',
              headers: { accept: 'application/json' },
              signal: controller.signal,
            })
            if (!response.ok) throw bodyError({ code: 'INTERNAL', detail: `HTTP ${response.status}` })
            const body = await response.json()
            if (!body || body.ok !== true) throw bodyError(body)
            if (cancelled) return
            if (typeof body.page === 'number' && body.page !== page) {
              setPage(body.page)
              return
            }
            setSnapshot({ phase: 'ready', data: body, error: null })
          } catch (error) {
            if (cancelled || error?.name === 'AbortError') return
            setSnapshot((current) => ({
              phase: current.data ? 'ready' : 'error',
              data: current.data,
              error: errorText(error, t),
            }))
          }
        }
        load()
        const timer = setInterval(() => {
          if (document.visibilityState === 'visible') load()
        }, 5000)
        return () => {
          cancelled = true
          controller.abort()
          clearInterval(timer)
        }
      }, [page, debouncedQuery, filter, tick])

      React.useEffect(() => {
        if (!banner || banner.kind !== 'success') return undefined
        const timer = setTimeout(() => setBanner(null), 4000)
        return () => clearTimeout(timer)
      }, [banner])

      const data = snapshot.data
      const effective = data?.limits?.available ? data.limits.maxActiveSubagents : 8

      React.useEffect(() => {
        if (!draftDirty) setDraft(String(effective))
      }, [effective, draftDirty])

      const limitsAvailable = Boolean(data?.limits?.available)
      const limitsWritable = Boolean(data?.limits?.writable)
      const draftNumber = Number(draft)
      const draftValid = Number.isInteger(draftNumber) && draftNumber >= 1 && draftNumber <= 256
      const draftChanged = draftValid && draftNumber !== effective
      const canSave = limitsAvailable && limitsWritable && draftValid && draftChanged && busy === ''

      function reload(manual) {
        if (manual) freshRef.current = true
        setTick((value) => value + 1)
      }

      /**
       * @param {string} action - Host action.
       * @param {object} [extra] - action fields.
       * @param {string} [successKey] - banner key.
       * @param {string} [busyKey] - busy marker.
       */
      async function act(action, extra, successKey, busyKey) {
        const marker = busyKey || action
        setBusy(marker)
        setBanner(null)
        try {
          const body = await requestJson(endpoint('action'), {
            method: 'POST',
            headers: { 'content-type': 'application/json', accept: 'application/json' },
            body: JSON.stringify(Object.assign({ action }, extra || {})),
          })
          if (action === 'delete' && extra && extra.id && typeof props.hideDeleted === 'function') {
            props.hideDeleted(body?.parentId || extra.parentId, extra.id)
          }
          if ((action === 'delete' || action === 'archive') && extra && extra.id) {
            setSelected((current) => {
              if (!current.has(extra.id)) return current
              const next = new Set(current)
              next.delete(extra.id)
              return next
            })
          }
          setBanner({ kind: 'success', text: t(successKey) })
          await reload()
          return body
        } catch (error) {
          setBanner({ kind: 'error', text: errorText(error, t) })
          return undefined
        } finally {
          setBusy('')
        }
      }

      async function saveLimit() {
        if (!canSave) return
        const body = await act(
          'set-limit',
          { maxActiveSubagents: draftNumber, revision: data?.limits?.revision },
          'banner.limit',
          'limit',
        )
        if (body) setDraftDirty(false)
      }

      /**
       * @param {string[]} ids - subagent ids to remove.
       */
      async function batchDelete(ids) {
        setBusy('delete-many')
        setBanner(null)
        try {
          const body = await requestJson(endpoint('action'), {
            method: 'POST',
            headers: { 'content-type': 'application/json', accept: 'application/json' },
            body: JSON.stringify({ action: 'delete-many', ids }),
          })
          const results = Array.isArray(body.results) ? body.results : []
          for (const result of results) {
            if (result.ok && typeof props.hideDeleted === 'function') props.hideDeleted(result.parentId, result.id)
          }
          const failed = results.filter((result) => !result.ok)
          if (failed.length > 0) {
            const first = failed[0]
            setBanner({
              kind: 'error',
              text:
                fill(t('banner.batchDeleted'), {
                  deleted: body.deleted || 0,
                  failed: body.failed || failed.length,
                }) +
                ' · ' +
                errorText({ code: first.code, detail: first.detail }, t),
            })
            setSelected(new Set(failed.map((result) => result.id).filter(Boolean)))
          } else {
            setBanner({
              kind: 'success',
              text: fill(t('banner.batchDeletedAll'), { deleted: body.deleted || results.length }),
            })
            setSelected(new Set())
          }
          await reload()
        } catch (error) {
          setBanner({ kind: 'error', text: errorText(error, t) })
        } finally {
          setBusy('')
        }
      }

      function toggleRow(id) {
        if (!selected.has(id) && selected.size >= 100) {
          setBanner({ kind: 'error', text: t('list.selectLimit') })
          return
        }
        setSelected((current) => {
          const next = new Set(current)
          if (next.has(id)) next.delete(id)
          else next.add(id)
          return next
        })
      }

      function togglePage(rows) {
        const selectable = rows.filter((row) => !row.live)
        if (selectable.length === 0) return
        const all = selectable.every((row) => selected.has(row.id))
        if (!all) {
          const additions = selectable.filter((row) => !selected.has(row.id)).length
          if (selected.size + additions > 100) {
            setBanner({ kind: 'error', text: t('list.selectLimit') })
            return
          }
        }
        setSelected((current) => {
          const next = new Set(current)
          for (const row of selectable) {
            if (all) next.delete(row.id)
            else next.add(row.id)
          }
          return next
        })
      }

      function changeFilter(value) {
        if (value === filter) return
        setFilter(value)
        setPage(0)
        setSelected(new Set())
      }

      function requestArchive(row) {
        if (row.archived) {
          act('unarchive', { id: row.id }, 'banner.unarchived')
          return
        }
        if (row.live) {
          setConfirm({ kind: 'archive', row })
          return
        }
        act('archive', { id: row.id }, 'banner.archived')
      }

      function requestDelete(row) {
        if (row.live || row.hasChildren) return
        setConfirm({ kind: 'delete', row })
      }

      function requestBatchDelete() {
        if (busy || selected.size === 0) return
        setConfirm({ kind: 'batch-delete', ids: [...selected], count: selected.size })
      }

      function confirmAction() {
        const target = confirm
        setConfirm(null)
        if (!target) return
        if (target.kind === 'delete') act('delete', { id: target.row.id, parentId: target.row.parentId }, 'banner.deleted')
        else if (target.kind === 'batch-delete') batchDelete(target.ids)
        else act('archive', { id: target.row.id }, 'banner.archived')
      }

      const rows = Array.isArray(data?.subagents) ? data.subagents : []
      const allTotal = data ? (typeof data.allTotal === 'number' ? data.allTotal : data.total) : 0
      const filteredTotal = data ? data.total : 0
      const pageCount = Math.max(1, data?.pageCount || 1)
      const currentPage = data?.page ?? page
      const selectableRows = rows.filter((row) => !row.live)
      const allPageSelected = selectableRows.length > 0 && selectableRows.every((row) => selected.has(row.id))
      const somePageSelected = selectableRows.some((row) => selected.has(row.id))
      const filtering = Boolean(debouncedQuery) || filter !== 'all'

      const summary = data
        ? h(
            'div',
            { className: 'dsm-summary' },
            h('span', null, fill(t('summary.total'), { count: allTotal })),
            h('span', null, fill(t('summary.running'), { count: data.running })),
            h('span', null, fill(t('summary.archived'), { count: data.archived })),
            filtering ? h('span', null, fill(t('list.filtered'), { count: filteredTotal })) : null,
          )
        : null

      let listBody
      if (snapshot.phase === 'loading' && !data) {
        listBody = h('div', { className: 'dsm-empty' }, h('span', null, t('list.loading')))
      } else if (snapshot.phase === 'error' && !data) {
        listBody = h(
          'div',
          { className: 'dsm-empty' },
          h('span', { className: 'dsm-empty-title dsm-error-text' }, t('list.error')),
          snapshot.error ? h('span', null, snapshot.error) : null,
          h('button', { type: 'button', className: 'dsm-btn', onClick: () => reload(true) }, t('list.refresh')),
        )
      } else if (allTotal === 0) {
        listBody = h('div', { className: 'dsm-empty' }, h('span', null, t('list.empty')))
      } else if (rows.length === 0) {
        listBody = h('div', { className: 'dsm-empty' }, h('span', null, t('list.emptyFiltered')))
      } else {
        listBody = h(
          'div',
          { className: 'dsm-list' },
          rows.map((row) => {
            const deleteDisabled = row.live || row.hasChildren
            const deleteTitle = row.live ? t('row.deleteRunning') : row.hasChildren ? t('row.deleteChildren') : t('row.delete')
            const dotState = row.live ? 'running' : row.archived ? 'archived' : 'idle'
            const title = row.title || t('row.untitled')
            const checkboxTitle = row.live
              ? t('row.selectRunning')
              : fill(t('list.selectRow'), { title })
            return h(
              'div',
              { className: 'dsm-row', key: row.id },
              h('input', {
                type: 'checkbox',
                className: 'dsm-check',
                checked: selected.has(row.id),
                disabled: row.live || Boolean(busy),
                title: checkboxTitle,
                'aria-label': checkboxTitle,
                onChange: () => toggleRow(row.id),
              }),
              h('span', { className: 'dsm-dot', 'data-state': dotState, 'aria-hidden': 'true' }),
              h(
                'div',
                { className: 'dsm-row-main' },
                h('div', { className: 'dsm-row-title', title }, title),
                h(
                  'div',
                  { className: 'dsm-row-meta' },
                  h(
                    'span',
                    { className: 'dsm-badge', 'data-tone': row.live ? 'brand' : undefined },
                    row.live ? t('row.running') : t('row.idle'),
                  ),
                  row.archived ? h('span', { className: 'dsm-badge', 'data-tone': 'warn' }, t('row.archived')) : null,
                  h('span', null, fill(t('row.parent'), { title: row.parentTitle || shortId(row.parentId) })),
                  h('span', null, fill(t('row.depth'), { depth: row.depth })),
                  row.childCount > 0 ? h('span', null, fill(t('row.children'), { count: row.childCount })) : null,
                  h('span', null, fill(t('row.created'), { time: formatTime(row.createdAt) })),
                ),
                h('div', { className: 'dsm-row-id', title: row.id }, shortId(row.id)),
              ),
              h(
                'div',
                { className: 'dsm-row-actions' },
                h(
                  'button',
                  {
                    type: 'button',
                    className: 'dsm-btn',
                    disabled: Boolean(busy),
                    title: row.live && !row.archived ? t('row.archiveRunning') : undefined,
                    onClick: () => requestArchive(row),
                  },
                  row.archived ? t('row.unarchive') : t('row.archive'),
                ),
                h(
                  'button',
                  {
                    type: 'button',
                    className: 'dsm-btn dsm-btn-danger',
                    disabled: deleteDisabled || Boolean(busy),
                    title: deleteTitle,
                    onClick: () => requestDelete(row),
                  },
                  t('row.delete'),
                ),
              ),
            )
          }),
        )
      }

      const toolbar = h(
        'div',
        { className: 'dsm-toolbar' },
        h(
          'label',
          { className: 'dsm-select-all' },
          h('input', {
            type: 'checkbox',
            className: 'dsm-check',
            checked: allPageSelected,
            disabled: selectableRows.length === 0 || Boolean(busy),
            'aria-label': t('list.selectAll'),
            ref: (element) => {
              if (element) element.indeterminate = somePageSelected && !allPageSelected
            },
            onChange: () => togglePage(rows),
          }),
          h('span', null, t('list.selectAll')),
        ),
        selected.size > 0
          ? h('span', { className: 'dsm-selected' }, fill(t('list.selected'), { count: selected.size }))
          : null,
        selected.size > 0
          ? h('button', { type: 'button', className: 'dsm-btn dsm-btn-ghost', disabled: Boolean(busy), onClick: () => setSelected(new Set()) }, t('list.clearSelection'))
          : null,
        selected.size > 0
          ? h('button', { type: 'button', className: 'dsm-btn dsm-btn-danger', disabled: Boolean(busy), onClick: requestBatchDelete }, t('list.batchDelete'))
          : null,
      )

      const pager = data && allTotal > 0
        ? h(
            'div',
            { className: 'dsm-pager' },
            h('span', { className: 'dsm-page-info' }, fill(t('list.page'), { page: currentPage + 1, pages: pageCount })),
            h('span', { className: 'dsm-page-size' }, fill(t('list.pageSize'), { count: PAGE_SIZE })),
            h(
              'div',
              { className: 'dsm-page-actions' },
              h(
                'button',
                {
                  type: 'button',
                  className: 'dsm-btn',
                  disabled: Boolean(busy) || currentPage <= 0,
                  onClick: () => setPage(Math.max(0, currentPage - 1)),
                },
                t('list.prev'),
              ),
              h(
                'button',
                {
                  type: 'button',
                  className: 'dsm-btn',
                  disabled: Boolean(busy) || currentPage + 1 >= pageCount,
                  onClick: () => setPage(Math.min(pageCount - 1, currentPage + 1)),
                },
                t('list.next'),
              ),
            ),
          )
        : null

      return h(
        'div',
        { className: 'dsm-root' },
        h('style', null, CSS),
        h(
          'div',
          { className: 'dsm-head' },
          h(
            'div',
            { className: 'dsm-head-row' },
            h('h2', { className: 'dsm-title' }, t('title')),
            h('button', { type: 'button', className: 'dsm-btn', onClick: () => reload(true) }, t('list.refresh')),
          ),
          h('p', { className: 'dsm-subtitle' }, t('subtitle')),
        ),
        banner ? h('div', { className: 'dsm-banner', 'data-kind': banner.kind, role: 'status' }, banner.text) : null,
        snapshot.error && data ? h('div', { className: 'dsm-banner', 'data-kind': 'error', role: 'alert' }, snapshot.error) : null,
        h(
          'section',
          { className: 'dsm-card', 'aria-labelledby': 'dsm-limits-title' },
          h(
            'div',
            { className: 'dsm-card-head' },
            h(
              'div',
              null,
              h('h3', { className: 'dsm-card-title', id: 'dsm-limits-title' }, t('section.limits')),
              h('p', { className: 'dsm-card-desc' }, t('limits.hint')),
            ),
            limitsAvailable
              ? h('span', { className: 'dsm-badge' }, fill(t('limits.effective'), { count: effective }))
              : null,
          ),
          limitsAvailable
            ? h(
                'div',
                { className: 'dsm-limit-row' },
                h('label', { className: 'dsm-sr', htmlFor: 'dsm-limit-input' }, t('limits.label')),
                h('input', {
                  id: 'dsm-limit-input',
                  className: 'dsm-input',
                  type: 'number',
                  min: 1,
                  max: 256,
                  step: 1,
                  value: draft,
                  disabled: !limitsWritable || busy === 'limit',
                  onChange: (event) => {
                    setDraft(event.target.value)
                    setDraftDirty(true)
                  },
                }),
                h(
                  'button',
                  {
                    type: 'button',
                    className: 'dsm-btn dsm-btn-primary',
                    disabled: !canSave,
                    onClick: saveLimit,
                  },
                  busy === 'limit' ? t('limits.saving') : t('limits.save'),
                ),
                draftDirty && !draftValid ? h('span', { className: 'dsm-hint dsm-error-text' }, t('limits.invalid')) : null,
              )
            : h('p', { className: 'dsm-hint' }, t('limits.unavailable')),
          limitsAvailable && !limitsWritable
            ? h('p', { className: 'dsm-hint' }, t('limits.unavailable'))
            : null,
        ),
        h(
          'section',
          { className: 'dsm-card', 'aria-labelledby': 'dsm-list-title' },
          h(
            'div',
            { className: 'dsm-card-head' },
            h('h3', { className: 'dsm-card-title', id: 'dsm-list-title' }, t('section.list')),
            h(
              'div',
              { className: 'dsm-chips', role: 'group', 'aria-label': t('section.list') },
              [['all', 'list.all'], ['running', 'list.running'], ['archived', 'list.archived']].map(([value, key]) =>
                h(
                  'button',
                  {
                    key: value,
                    type: 'button',
                    className: 'dsm-chip',
                    'aria-pressed': filter === value,
                    onClick: () => changeFilter(value),
                  },
                  t(key),
                ),
              ),
            ),
            h('input', {
              className: 'dsm-search',
              type: 'search',
              value: query,
              placeholder: t('list.searchPlaceholder'),
              'aria-label': t('list.search'),
              onChange: (event) => setQuery(event.target.value),
            }),
          ),
          summary,
          toolbar,
          listBody,
          pager,
        ),
        confirm
          ? h(ConfirmDialog, {
              title:
                confirm.kind === 'delete'
                  ? t('dialog.delete.title')
                  : confirm.kind === 'batch-delete'
                    ? fill(t('dialog.batchDelete.title'), { count: confirm.count })
                    : t('dialog.archive.title'),
              body:
                confirm.kind === 'delete'
                  ? fill(t('dialog.delete.body'), { title: confirm.row.title || shortId(confirm.row.id) })
                  : confirm.kind === 'batch-delete'
                    ? fill(t('dialog.batchDelete.body'), { count: confirm.count })
                    : fill(t('dialog.archive.body'), { title: confirm.row.title || shortId(confirm.row.id) }),
              warning: confirm.kind === 'delete' || confirm.kind === 'batch-delete' ? t('dialog.delete.warning') : undefined,
              cancel: t('dialog.cancel'),
              confirm: t(confirm.kind === 'archive' ? 'dialog.archive.confirm' : 'dialog.delete.confirm'),
              danger: confirm.kind !== 'archive',
              onCancel: () => setConfirm(null),
              onConfirm: confirmAction,
            })
          : null,
      )
    }

    return {
      inject: ['slots', 'locale', 'sessions'],
      apply(pluginCtx) {
        const deletedChildren = new Set()

        function filterCatalogEntries(value) {
          if (!Array.isArray(value) || deletedChildren.size === 0) return value
          let changed = false
          const next = value.filter((entry) => {
            if (entry && typeof entry === 'object' && typeof entry.id === 'string' && deletedChildren.has(entry.id)) {
              changed = true
              return false
            }
            return true
          })
          return changed ? next : value
        }

        function patchProjectionStore(store) {
          if (!store || typeof store !== 'object') return
          if (store.__subagentManagerPatched !== true) {
            store.__subagentManagerPatched = true
            if (typeof store.apply === 'function') {
              const apply = store.apply.bind(store)
              store.apply = (key, value, seq) =>
                apply(key, key === 'subagentCatalog' ? filterCatalogEntries(value) : value, seq)
            }
            if (typeof store.applyCached === 'function') {
              const applyCached = store.applyCached.bind(store)
              store.applyCached = (values) => {
                if (values && Array.isArray(values.subagentCatalog)) {
                  const filtered = filterCatalogEntries(values.subagentCatalog)
                  if (filtered !== values.subagentCatalog) {
                    values = Object.assign({}, values, { subagentCatalog: filtered })
                  }
                }
                return applyCached(values)
              }
            }
          }
          if (!store.rows || typeof store.rows.get !== 'function') return
          const row = store.rows.get('subagentCatalog')
          if (!row || !Array.isArray(row.value)) return
          const filtered = filterCatalogEntries(row.value)
          if (filtered === row.value) return
          store.rows.set('subagentCatalog', Object.assign({}, row, { value: filtered }))
          if (typeof store.changed === 'function') store.changed('subagentCatalog')
        }

        function hideDeleted(parentId, childId) {
          if (typeof childId === 'string' && childId.length > 0) deletedChildren.add(childId)
          const sessions = pluginCtx.sessions
          const manager = sessions && sessions.manager
          if (!manager) return
          try {
            const stores = manager.projectionStores
            if (stores && typeof stores.values === 'function') {
              for (const store of stores.values()) patchProjectionStore(store)
            }
            if (typeof manager.projectionStore === 'function' && typeof parentId === 'string' && parentId.length > 0) {
              patchProjectionStore(manager.projectionStore(parentId))
            }
          } catch {
            // A client-version mismatch leaves the durable Host filter in charge.
          }
        }

        function ManagerEntry(props) {
          const [, bump] = React.useReducer((value) => value + 1, 0)
          React.useEffect(() => {
            const dispose = pluginCtx.on('locale/change', bump)
            return typeof dispose === 'function' ? dispose : undefined
          }, [])
          return h(ManagerPage, Object.assign({}, props, { t: pluginCtx.locale.bind(NS), hideDeleted }))
        }

        pluginCtx.effect(() => pluginCtx.locale.register(NS, 'en', en))
        pluginCtx.effect(() => pluginCtx.locale.register(NS, 'zh', zh))
        pluginCtx.effect(() =>
          pluginCtx.slots.inject('settings.section', () =>
            pluginCtx.slots.register(
              {
                name: 'settings.section',
                id: 'subagent-manager',
                order: 30,
                label: () => pluginCtx.locale.bind(NS)('title'),
              },
              ManagerEntry,
            ),
          ),
        )
      },
    }
  },
})
