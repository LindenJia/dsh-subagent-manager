/**
 * Host half of the Subagent Manager bundle.
 *
 * It owns three operations over durable subagent Sessions:
 *  - archive / unarchive through the registered Workspace archive set;
 *  - permanent deletion of an inactive subagent's session directory;
 *  - the `subagent.maxActiveSubagents` settings field.
 *
 * The browser half talks to the two exact Fetch routes below. No model-facing
 * tool is registered: deleting or archiving a session is a user-only action.
 *
 * @module @local/dsh-subagent-manager
 */
import { readFileSync } from 'node:fs'
import { lstat, mkdir, readdir, rename, rm, stat, writeFile } from 'node:fs/promises'
import { homedir } from 'node:os'
import path from 'node:path'

/** Loader row id and Client module id. */
export const name = 'subagent-manager'

/** Core services the manager cannot work without. */
export const inject = [
  'subagents',
  'workspaceRegistry',
  'sessionQuery',
  'sessionPersistence',
  'agents',
  'sessions',
  'sessionProjections',
  'settings',
  'tools',
]

/** One exact Fetch prefix claimed by this bundle. */
const BASE = '/api/dsh-subagent-manager'
const TITLE_TTL_MS = 60_000
const RECORD_TTL_MS = 10_000
const MAX_LIMIT = 1000
const BATCH_LIMIT = 100
const MIN_ACTIVE = 1
const MAX_ACTIVE = 256
const DELETED_STATE_KEY = Symbol.for('@local/dsh-subagent-manager/deleted-sessions')

class ActionError extends Error {
  /**
   * @param {string} code - stable machine code the browser localizes.
   * @param {string} [detail] - optional human-readable detail.
   */
  constructor(code, detail) {
    super(detail || code)
    this.name = 'ActionError'
    this.code = code
    this.detail = detail || ''
  }
}

/**
 * @param {object} config - Loader row config.
 * @returns {string} absolute session-persistence root.
 */
function resolveSessionRoot(config) {
  const configured = typeof config?.sessionRoot === 'string' ? config.sessionRoot.trim() : ''
  if (configured) return path.resolve(configured)
  const home = process.env.DSH_HOME || path.join(homedir(), '.dsh')
  return path.join(home, 'sessions')
}

/**
 * @param {object} config - Loader row config.
 * @returns {string} directory for plugin-owned durable state.
 */
function resolveStateDir(config) {
  const configured = typeof config?.stateDir === 'string' ? config.stateDir.trim() : ''
  if (configured) return path.resolve(configured)
  const home = process.env.DSH_HOME || path.join(homedir(), '.dsh')
  return path.join(home, 'subagent-manager')
}

/**
 * Reproduce the JSONL backend's project-directory key without importing the
 * backend: separators collapse to one dash and unsafe code units use the
 * backend's `~XXXX` escape.
 *
 * @param {string} cwd - session's recorded working directory.
 * @returns {string} one readable project directory name.
 */
function projectKey(cwd) {
  let readable = ''
  let separatorRun = false
  for (let i = 0; i < cwd.length; i += 1) {
    const code = cwd.charCodeAt(i)
    const ch = String.fromCharCode(code)
    if (ch === '/' || ch === '\\' || ch === ':') {
      if (!separatorRun) readable += '-'
      separatorRun = true
    } else if (ch !== '~' && /^[A-Za-z0-9._-]$/.test(ch)) {
      readable += ch
      separatorRun = false
    } else {
      readable += `~${code.toString(16).toUpperCase().padStart(4, '0')}`
      separatorRun = false
    }
  }
  return `--${(readable.replace(/^-+/, '') || 'root').slice(0, 251)}--`
}

/**
 * Reproduce the JSONL backend's session-id path encoding.
 *
 * @param {string} raw - non-empty session id.
 * @returns {string} one safe path segment.
 */
function encodeSegment(raw) {
  if (raw.length === 0) throw new Error('cannot encode an empty path segment')
  if (raw === '.') return '~002E'
  if (raw === '..') return '~002E~002E'
  let out = ''
  for (let i = 0; i < raw.length; i += 1) {
    const code = raw.charCodeAt(i)
    const ch = String.fromCharCode(code)
    if (ch !== '~' && /^[A-Za-z0-9._-]$/.test(ch)) out += ch
    else out += `~${code.toString(16).toUpperCase().padStart(4, '0')}`
  }
  return out
}

/** Path helpers exported for diagnostics and compatibility checks. */
export const pathEncoding = { projectKey, encodeSegment }

/**
 * @param {unknown} value - raw config value.
 * @param {number} fallback - value to use when the field is not an integer.
 * @returns {number} safe integer.
 */
function integerOr(value, fallback) {
  return Number.isInteger(value) ? value : fallback
}

/**
 * @param {unknown} value - raw query-string value.
 * @param {number} fallback - default.
 * @param {number} min - inclusive lower bound.
 * @param {number} max - inclusive upper bound.
 * @returns {number} clamped integer.
 */
function clampInt(value, fallback, min, max) {
  const parsed = Number.parseInt(String(value ?? ''), 10)
  if (!Number.isFinite(parsed)) return fallback
  return Math.max(min, Math.min(max, parsed))
}

/**
 * @param {import('node:http').ServerResponse} res - node response.
 * @param {number} status - HTTP status.
 * @param {unknown} body - JSON-serializable body.
 */
function sendNode(res, status, body) {
  const text = JSON.stringify(body)
  res.writeHead(status, {
    'content-type': 'application/json; charset=utf-8',
    'content-length': Buffer.byteLength(text),
    'cache-control': 'no-store',
  })
  res.end(text)
}

/**
 * @param {number} status - HTTP status.
 * @param {unknown} body - JSON-serializable body.
 * @returns {Response} fetch response.
 */
function jsonResponse(status, body) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store',
    },
  })
}

/**
 * @param {unknown} error - thrown value.
 * @returns {Response} a failure response.
 */
function errorResponse(error) {
  if (error instanceof ActionError) {
    return jsonResponse(200, { ok: false, code: error.code, detail: error.detail })
  }
  const message = error instanceof Error ? error.message : String(error)
  return jsonResponse(200, { ok: false, code: 'INTERNAL', detail: message })
}

/**
 * @param {string} id - candidate session id.
 * @returns {string} the validated id.
 */
function assertSessionId(id) {
  if (typeof id !== 'string' || id.length === 0 || id.length > 200 || !/^[A-Za-z0-9._:-]+$/.test(id)) {
    throw new ActionError('INVALID', 'invalid session id')
  }
  return id
}

/**
 * @param {unknown} value - candidate error.
 * @returns {string} a stable message.
 */
function errorText(value) {
  if (value instanceof Error) return value.message
  return String(value)
}

/**
 * Mount the Host half.
 *
 * @param {import('@deepseek-ai/cordis').Context} ctx - Host plugin context.
 * @param {{ sessionRoot?: string, stateDir?: string }} [config] - optional persistence-root and state-directory overrides.
 */
export function apply(ctx, config = {}) {
  const sessionRoot = resolveSessionRoot(config)
  const logger = ctx.logger ?? console

  /** @type {{ at: number, rows: any[] | null, records: any[], byId: Map<string, any>, headerById: Map<string, any>, counts: Map<string, number> }} */
  let cache = {
    at: 0,
    rows: null,
    records: [],
    byId: new Map(),
    headerById: new Map(),
    counts: new Map(),
  }
  /** @type {Map<string, { at: number, title: string | null }>} */
  const titleCache = new Map()

  /**
   * @param {string} name - service key.
   * @returns {any} the service or undefined.
   */
  function service(name) {
    try {
      return ctx.get(name)
    } catch {
      return undefined
    }
  }

  const stateDir = resolveStateDir(config)
  const tombstoneFile = path.join(stateDir, 'deleted-sessions.json')
  const deleted =
    globalThis[DELETED_STATE_KEY] instanceof Set ? globalThis[DELETED_STATE_KEY] : new Set()
  globalThis[DELETED_STATE_KEY] = deleted
  try {
    const raw = JSON.parse(readFileSync(tombstoneFile, 'utf8'))
    if (Array.isArray(raw?.deleted)) {
      for (const id of raw.deleted) if (typeof id === 'string' && id.length > 0) deleted.add(id)
    }
  } catch (error) {
    if (error && typeof error === 'object' && error.code !== 'ENOENT') {
      logger.warn?.(`subagent-manager: tombstone read failed: ${errorText(error)}`)
    }
  }

  let persistTail = Promise.resolve()

  /** Persist the durable tombstone set without blocking a delete response. */
  function persistTombstones() {
    const payload = JSON.stringify({ version: 1, deleted: [...deleted] })
    persistTail = persistTail
      .then(async () => {
        await mkdir(stateDir, { recursive: true })
        const temporary = `${tombstoneFile}.${process.pid}.${Date.now()}.tmp`
        await writeFile(temporary, payload)
        await rename(temporary, tombstoneFile)
      })
      .catch((error) => {
        logger.warn?.(`subagent-manager: tombstone write failed: ${errorText(error)}`)
      })
    return persistTail
  }

  /**
   * @param {string} id - deleted child session id.
   * @returns {boolean} whether the set changed.
   */
  function rememberDeleted(id) {
    if (typeof id !== 'string' || id.length === 0 || deleted.has(id)) return false
    deleted.add(id)
    persistTombstones()
    return true
  }

  /**
   * Filter tombstoned catalog entries without changing an untouched array's
   * identity, so unchanged projection values keep suppressing publication.
   *
   * @param {unknown} value - catalog wire value.
   * @returns {unknown} filtered value.
   */
  function filterCatalog(value) {
    if (!Array.isArray(value) || deleted.size === 0) return value
    let changed = false
    const next = value.filter((entry) => {
      if (entry && typeof entry === 'object' && typeof entry.id === 'string' && deleted.has(entry.id)) {
        changed = true
        return false
      }
      return true
    })
    return changed ? next : value
  }

  /**
   * Wrap the `subagentCatalog` wire view once for this process. This filters
   * client-visible projection values (including cold cache reads) without
   * rewriting the append-only parent log.
   *
   * @returns {boolean} whether the filter is installed.
   */
  function installCatalogFilter() {
    const registry = service('sessionProjections')
    const registration = registry?.registrations?.get?.('subagentCatalog')
    const wire = registration?.def?.wire
    if (!wire || typeof wire.view !== 'function') return false
    if (wire.view.__subagentManagerCatalogFilter === true) return true
    const original = wire.view
    const wrapped = (state) => filterCatalog(original(state))
    wrapped.__subagentManagerCatalogFilter = true
    try {
      wire.view = wrapped
    } catch (error) {
      logger.warn?.(`subagent-manager: catalog filter install failed: ${errorText(error)}`)
      return false
    }
    ctx.effect(() => () => {
      if (wire.view === wrapped) {
        try {
          wire.view = original
        } catch {
          // The registry may already be gone during teardown.
        }
      }
    })
    return true
  }

  let reconcilePromise

  /**
   * Reconcile tombstones with the current corpus once: drop ids that exist
   * again, and remember catalog children whose session is gone. The scan uses
   * already-materialized projections so it does not read agent logs.
   *
   * @returns {Promise<void>} completion of the one-time reconciliation.
   */
  function ensureReconciled() {
    if (reconcilePromise !== undefined) return reconcilePromise
    reconcilePromise = (async () => {
      try {
        const rows = await ctx.sessionQuery.listSessions()
        const existing = new Set(rows.map((row) => row.header.id))
        let changed = false
        for (const id of [...deleted]) {
          if (existing.has(id)) {
            deleted.delete(id)
            changed = true
          }
        }
        const projectionCache = service('sessionProjectionCache')
        const projections = service('sessionProjections')
        for (const row of rows) {
          let catalog
          const live = ctx.sessions.get(row.header.id)
          if (live !== undefined) {
            try {
              catalog = projections?.snapshot?.(live, ['subagentCatalog'])?.values?.subagentCatalog
            } catch {
              catalog = undefined
            }
          }
          if (!Array.isArray(catalog) && projectionCache !== undefined) {
            try {
              catalog = projectionCache.cachedSnapshot(row.header, ['subagentCatalog'])?.values?.subagentCatalog
            } catch {
              catalog = undefined
            }
          }
          if (!Array.isArray(catalog)) continue
          for (const entry of catalog) {
            if (!entry || typeof entry.id !== 'string' || entry.mode === 'external') continue
            if (existing.has(entry.id) || deleted.has(entry.id)) continue
            let known = true
            try {
              known = Boolean(await ctx.sessionPersistence.stat(entry.id))
            } catch {
              known = true
            }
            if (known) continue
            deleted.add(entry.id)
            changed = true
          }
        }
        if (changed) await persistTombstones()
      } catch (error) {
        logger.warn?.(`subagent-manager: tombstone reconciliation failed: ${errorText(error)}`)
      }
    })()
    return reconcilePromise
  }

  installCatalogFilter()
  void ensureReconciled()

  function invalidate() {
    cache = {
      at: 0,
      rows: null,
      records: [],
      byId: new Map(),
      headerById: new Map(),
      counts: new Map(),
    }
  }

  /**
   * Read the live-preferred session corpus and derive the subagent index.
   *
   * @param {boolean} fresh - bypass the short cache.
   * @returns {Promise<typeof cache>} the index.
   */
  async function loadRecords(fresh = false) {
    if (!fresh && cache.rows && Date.now() - cache.at < RECORD_TTL_MS) return cache
    const rows = await ctx.sessionQuery.listSessions()
    const records = rows.filter((row) => {
      const header = row?.header
      if (!header?.parentSession) return false
      return header.origin === 'subagent' || integerOr(header.delegationDepth, 0) > 0
    })
    const counts = new Map()
    const byId = new Map()
    const headerById = new Map()
    for (const row of rows) {
      if (row?.header?.id) headerById.set(row.header.id, row.header)
    }
    for (const row of records) {
      const header = row.header
      byId.set(header.id, row)
      if (header.parentSession) counts.set(header.parentSession, (counts.get(header.parentSession) || 0) + 1)
    }
    cache = { at: Date.now(), rows, records, byId, headerById, counts }
    return cache
  }

  /**
   * Resolve one session title without reading its event log: live titles come
   * from the title service, cold titles from the persisted projection cache's
   * zero-I/O listing hint.
   *
   * @param {any} header - session header.
   * @returns {string | null} current title, when one is already known.
   */
  function titleFor(header) {
    const live = ctx.sessions.get(header.id)
    if (live) {
      try {
        const snapshot = service('sessionTitle')?.get(live)
        if (snapshot && typeof snapshot.title === 'string' && snapshot.title.length > 0) return snapshot.title
      } catch {
        // Fall through to the projection cache.
      }
    }
    const projectionCache = service('sessionProjectionCache')
    if (projectionCache) {
      try {
        const snapshot =
          projectionCache.cachedSnapshot(header, ['title']) || projectionCache.cachedPredecessorTitle(header)
        const value = snapshot?.values?.title
        if (typeof value === 'string' && value.length > 0) return value
      } catch {
        // A missing or incompatible cache row is simply an unknown title.
      }
    }
    return null
  }

  /**
   * @param {Iterable<string>} ids - session ids whose titles are needed.
   * @returns {Map<string, string | null>} title by id; null means not cached.
   */
  function loadTitles(ids) {
    const out = new Map()
    const now = Date.now()
    for (const id of new Set(ids)) {
      if (!id) continue
      const cached = titleCache.get(id)
      if (cached && now - cached.at < TITLE_TTL_MS) {
        out.set(id, cached.title)
        continue
      }
      const header = cache.headerById.get(id)
      const title = header ? titleFor(header) : null
      titleCache.set(id, { at: now, title })
      out.set(id, title)
    }
    return out
  }

  /**
   * Read the live `subagent` settings namespace.
   *
   * @returns {{ available: boolean, ns: string, maxActiveSubagents: number, maxDepth: number, revision: number | undefined, writable: boolean }} limits view.
   */
  function readLimits() {
    const fallback = {
      available: false,
      ns: 'subagent',
      maxActiveSubagents: 8,
      maxDepth: 1,
      revision: undefined,
      writable: false,
    }
    try {
      const descriptors = ctx.settings.describe({ redactSecrets: true })
      const descriptor =
        descriptors.find((entry) => entry.ns === 'subagent') ||
        descriptors.find((entry) => typeof entry.ns === 'string' && entry.ns.endsWith(':subagent'))
      if (!descriptor) return fallback
      const value = descriptor.value && typeof descriptor.value === 'object' ? descriptor.value : {}
      return {
        available: true,
        ns: descriptor.ns,
        maxActiveSubagents: integerOr(value.maxActiveSubagents, 8),
        maxDepth: integerOr(value.maxDepth, 1),
        revision: Number.isInteger(descriptor.revision) ? descriptor.revision : undefined,
        writable: ctx.settings.writable !== false,
      }
    } catch (error) {
      logger.warn?.(`subagent-manager: settings read failed: ${errorText(error)}`)
      return fallback
    }
  }

  /**
   * @param {string} id - subagent session id.
   * @returns {number} delegation depth, derived when the header omits it.
   */
  function depthOf(id) {
    let depth = 0
    let current = cache.byId.get(id)
    const seen = new Set()
    while (current?.header?.parentSession && depth < 32) {
      if (seen.has(current.header.id)) break
      seen.add(current.header.id)
      depth += 1
      current = cache.byId.get(current.header.parentSession)
    }
    return depth
  }

  /**
   * Build the browser state payload.
   *
   * @param {{ limit?: number, offset?: number, status?: string, q?: string, parent?: string, fresh?: boolean }} query - paging and filter options.
   * @returns {Promise<object>} state payload.
   */
  async function buildState(query = {}) {
    await ensureReconciled()
    const limit = Math.max(1, Math.min(MAX_LIMIT, integerOr(query.limit, 15)))
    const offset = Math.max(0, integerOr(query.offset, 0))
    const status = query.status === 'running' || query.status === 'archived' ? query.status : 'all'
    const q = typeof query.q === 'string' ? query.q.trim().toLowerCase().slice(0, 200) : ''
    const parent = typeof query.parent === 'string' ? query.parent.trim().slice(0, 200) : ''
    const index = await loadRecords(query.fresh === true)
    const archiveSet = new Set(ctx.workspaceRegistry.archivedSessionIds)
    const liveIds = new Set(ctx.agents.list().map((agent) => agent.id))
    const titleIds = new Set()
    for (const row of index.records) {
      titleIds.add(row.header.id)
      if (row.header.parentSession) titleIds.add(row.header.parentSession)
    }
    const titles = loadTitles(titleIds)
    const mapped = index.records.map((row) => {
      const header = row.header
      return {
        id: header.id,
        parentId: header.parentSession || null,
        parentTitle: header.parentSession ? titles.get(header.parentSession) || null : null,
        title: titles.get(header.id) || null,
        createdAt: header.createdAt,
        live: liveIds.has(header.id),
        archived: archiveSet.has(header.id),
        hasChildren: (index.counts.get(header.id) || 0) > 0,
        childCount: index.counts.get(header.id) || 0,
        depth: integerOr(header.delegationDepth, depthOf(header.id)),
        formatStatus: row.formatStatus || null,
      }
    })
    const scoped = parent ? mapped.filter((row) => row.parentId === parent) : mapped
    const filtered = scoped.filter((row) => {
      if (status === 'running' && !row.live) return false
      if (status === 'archived' && !row.archived) return false
      if (!q) return true
      const haystack = [row.title, row.id, row.parentId, row.parentTitle]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
      return haystack.includes(q)
    })
    filtered.sort((left, right) => {
      const byTime = (right.createdAt || 0) - (left.createdAt || 0)
      if (byTime !== 0) return byTime
      return String(left.id).localeCompare(String(right.id))
    })
    const total = filtered.length
    const pageCount = Math.max(1, Math.ceil(total / limit))
    const safeOffset = Math.min(offset, Math.max(0, (pageCount - 1) * limit))
    const subagents = filtered.slice(safeOffset, safeOffset + limit)
    return {
      ok: true,
      total,
      allTotal: scoped.length,
      running: scoped.filter((row) => row.live).length,
      archived: scoped.filter((row) => row.archived).length,
      offset: safeOffset,
      limit,
      page: Math.floor(safeOffset / limit),
      pageCount,
      hasMore: safeOffset + limit < total,
      status,
      subagents,
      limits: readLimits(),
    }
  }

  /**
   * Resolve one durable subagent header.
   *
   * @param {string} rawId - candidate id.
   * @returns {Promise<any>} the session header.
   */
  async function requireSubagent(rawId) {
    const id = assertSessionId(rawId)
    let header
    try {
      const snapshot = await ctx.sessionPersistence.stat(id)
      header = snapshot?.header
    } catch {
      header = undefined
    }
    if (!header) header = ctx.sessions.get(id)?.header
    if (!header) header = (await loadRecords(true)).byId.get(id)?.header
    if (!header) throw new ActionError('NOT_FOUND', 'session not found')
    const isSubagent =
      Boolean(header.parentSession) && (header.origin === 'subagent' || integerOr(header.delegationDepth, 0) > 0)
    if (!isSubagent) throw new ActionError('NOT_SUBAGENT', 'session is not a subagent')
    return header
  }

  /**
   * @param {string} id - subagent id.
   * @param {number} timeoutMs - wait bound.
   * @returns {Promise<boolean>} whether the agent and session store released it.
   */
  async function waitGone(id, timeoutMs) {
    const deadline = Date.now() + timeoutMs
    for (;;) {
      if (!ctx.agents.get(id) && !ctx.sessions.get(id)) return true
      if (Date.now() >= deadline) return false
      await new Promise((resolve) => setTimeout(resolve, 100))
    }
  }

  /**
   * Ask the direct parent to release a resident child. The archive path
   * already stopped its work; this only frees the activation.
   *
   * @param {string} id - child session id.
   * @param {string | undefined} parentId - durable direct parent.
   * @returns {Promise<void>} resolves after the best-effort release.
   */
  async function releaseResident(id, parentId) {
    if (!ctx.agents.get(id)) return
    const parent = parentId ? ctx.agents.get(parentId) : undefined
    if (!parent) return
    try {
      await ctx.subagents.drainChildren(parent, [id])
    } catch (error) {
      logger.warn?.(`subagent-manager: could not release ${id}: ${errorText(error)}`)
    }
  }

  /**
   * Locate the session-owned directory under the persistence root.
   *
   * @param {any} header - durable session header.
   * @param {string} id - session id.
   * @returns {Promise<string | undefined>} absolute session directory, when materialized.
   */
  async function locateSessionDir(header, id) {
    const segment = encodeSegment(id)
    const project = header.cwd === undefined ? '_no-cwd' : projectKey(header.cwd)
    const preferred = path.join(sessionRoot, project, segment)
    if (await isDirectory(preferred)) return preferred
    let entries
    try {
      entries = await readdir(sessionRoot, { withFileTypes: true })
    } catch {
      return undefined
    }
    for (const entry of entries) {
      if (!entry.isDirectory()) continue
      const candidate = path.join(sessionRoot, entry.name, segment)
      if (await isDirectory(candidate)) return candidate
    }
    return undefined
  }

  /**
   * @param {string} target - absolute path.
   * @returns {Promise<boolean>} true for a real directory.
   */
  async function isDirectory(target) {
    try {
      return (await lstat(target)).isDirectory()
    } catch {
      return false
    }
  }

  /**
   * Archive one subagent, stopping its running work if necessary.
   *
   * @param {string} rawId - subagent id.
   * @returns {Promise<object>} action result.
   */
  async function archive(rawId) {
    const header = await requireSubagent(rawId)
    const id = header.id
    try {
      await ctx.workspaceRegistry.archiveSession(id, { stopActivity: true })
    } catch (error) {
      throw new ActionError('ARCHIVE_FAILED', errorText(error))
    }
    await releaseResident(id, header.parentSession)
    invalidate()
    return { ok: true, action: 'archive', id }
  }

  /**
   * @param {string} rawId - subagent id.
   * @returns {Promise<object>} action result.
   */
  async function unarchive(rawId) {
    const header = await requireSubagent(rawId)
    try {
      await ctx.workspaceRegistry.unarchiveSession(header.id)
    } catch (error) {
      throw new ActionError('UNARCHIVE_FAILED', errorText(error))
    }
    invalidate()
    return { ok: true, action: 'unarchive', id: header.id }
  }

  /**
   * Permanently remove one inactive, childless subagent's session directory.
   *
   * @param {string} rawId - subagent id.
   * @returns {Promise<object>} action result.
   */
  async function remove(rawId) {
    const header = await requireSubagent(rawId)
    const id = header.id
    const index = await loadRecords(true)
    const children = index.records.filter((row) => row.header.parentSession === id)
    if (children.length > 0) {
      throw new ActionError('HAS_CHILDREN', String(children.length))
    }
    if (ctx.agents.get(id) || ctx.sessions.get(id)) {
      try {
        ctx.subagents.interrupt(id, { kind: 'user', parentSessionId: header.parentSession })
      } catch {
        // An absent or already idle target is an accepted no-op.
      }
      await releaseResident(id, header.parentSession)
      if (!(await waitGone(id, 5000))) throw new ActionError('LIVE', 'subagent is still resident')
    }
    try {
      await ctx.workspaceRegistry.archiveSession(id, { stopActivity: true })
    } catch (error) {
      throw new ActionError('ARCHIVE_FAILED', errorText(error))
    }
    try {
      if (!(await stat(sessionRoot)).isDirectory()) {
        throw new ActionError('DELETE_FAILED', 'session root is not a directory')
      }
    } catch (error) {
      if (error instanceof ActionError) throw error
      throw new ActionError('DELETE_FAILED', `session root is not accessible: ${errorText(error)}`)
    }
    const directory = await locateSessionDir(header, id)
    let removed = false
    if (directory) {
      const relative = path.relative(sessionRoot, directory)
      if (relative.startsWith('..') || path.isAbsolute(relative)) {
        throw new ActionError('DELETE_FAILED', 'resolved session directory escapes the persistence root')
      }
      try {
        await rm(directory, { recursive: true, force: true })
        removed = true
      } catch (error) {
        throw new ActionError('DELETE_FAILED', errorText(error))
      }
    }
    try {
      await ctx.workspaceRegistry.unarchiveSession(id)
    } catch (error) {
      logger.warn?.(`subagent-manager: archive-set cleanup failed for ${id}: ${errorText(error)}`)
    }
    titleCache.delete(id)
    if (rememberDeleted(id)) await persistTail
    invalidate()
    return {
      ok: true,
      action: 'delete',
      id,
      parentId: header.parentSession || null,
      removed,
      alreadyDeleted: !directory,
    }
  }

  /**
   * Permanently remove several subagents, deepest first so a selected parent
   * can follow its selected children. Failures are isolated per id.
   *
   * @param {object} body - request body carrying `ids`.
   * @returns {Promise<object>} per-id results and counts.
   */
  async function removeMany(body) {
    const rawIds = body?.ids
    if (!Array.isArray(rawIds) || rawIds.length === 0 || rawIds.length > BATCH_LIMIT) {
      throw new ActionError('INVALID', `ids must be a non-empty array of at most ${BATCH_LIMIT} session ids`)
    }
    const ids = [...new Set(rawIds)]
    for (const id of ids) assertSessionId(id)
    await loadRecords(true)
    const ordered = [...ids].sort((left, right) => depthOf(right) - depthOf(left))
    const liveIds = new Set(ctx.agents.list().map((agent) => agent.id))
    const results = []
    for (const id of ordered) {
      if (liveIds.has(id)) {
        results.push({ id, ok: false, code: 'LIVE', detail: 'archive the running subagent before deleting it' })
        continue
      }
      try {
        const result = await remove(id)
        results.push({
          id,
          ok: true,
          parentId: result.parentId || null,
          removed: Boolean(result.removed),
        })
      } catch (error) {
        if (error instanceof ActionError) {
          results.push({ id, ok: false, code: error.code, detail: error.detail })
        } else {
          results.push({ id, ok: false, code: 'INTERNAL', detail: errorText(error) })
        }
      }
    }
    const deleted = results.filter((result) => result.ok).length
    invalidate()
    return {
      ok: true,
      action: 'delete-many',
      results,
      deleted,
      failed: results.length - deleted,
    }
  }

  /**
   * @param {object} body - request body.
   * @returns {Promise<object>} action result.
   */
  async function setLimit(body) {
    const next = body?.maxActiveSubagents
    if (!Number.isInteger(next) || next < MIN_ACTIVE || next > MAX_ACTIVE) {
      throw new ActionError('INVALID', `maxActiveSubagents must be an integer from ${MIN_ACTIVE} to ${MAX_ACTIVE}`)
    }
    const limits = readLimits()
    if (!limits.available || !limits.writable) throw new ActionError('UNAVAILABLE', 'settings are not writable')
    const expected = Number.isInteger(body?.revision) ? body.revision : limits.revision
    try {
      await ctx.settings.update(limits.ns, { maxActiveSubagents: next }, expected)
    } catch (error) {
      if (error && typeof error === 'object' && error.code === 'SETTINGS_CONFLICT') {
        throw new ActionError('CONFLICT', 'settings changed since the page loaded')
      }
      throw new ActionError('UPDATE_FAILED', errorText(error))
    }
    return { ok: true, action: 'set-limit', limits: readLimits() }
  }

  /**
   * @param {object} body - request body.
   * @returns {Promise<object>} action result.
   */
  async function runAction(body) {
    const action = body?.action
    if (action === 'archive') return archive(body.id)
    if (action === 'unarchive') return unarchive(body.id)
    if (action === 'delete') return remove(body.id)
    if (action === 'delete-many') return removeMany(body)
    if (action === 'set-limit') return setLimit(body)
    throw new ActionError('INVALID', `unknown action: ${String(action)}`)
  }


  /**
   * Model-facing management entry for a root conversation. It exposes only
   * archive/unarchive/delete over this conversation's registered descendants;
   * arbitrary session ids and subagent callers are rejected.
   *
   * @returns {object} raw tool definition for `ctx.tools.register`.
   */
  function createManageToolDefinition() {
    return {
      name: 'manage_subagent',
      description:
        'Archive, unarchive, or permanently delete one subagent under this root conversation. '
        + 'archive stops its current run and hides it; unarchive restores it; '
        + 'delete removes its session directory and cannot be undone. '
        + 'delete refuses a running or resident subagent and one that still has children; '
        + 'delete its descendants first. Use list_agents to find the agent_id. '
        + 'Only a root conversation can call this; calls from a subagent are rejected.',
      parameters: {
        type: 'object',
        additionalProperties: false,
        properties: {
          agent_id: {
            type: 'string',
            description: 'Durable id of a subagent under this root conversation (see list_agents).',
          },
          action: {
            type: 'string',
            enum: ['archive', 'unarchive', 'delete'],
            description: 'archive, unarchive, or delete.',
          },
        },
        required: ['agent_id', 'action'],
      },
      output: {
        schema: {
          type: 'object',
          additionalProperties: false,
          properties: {
            ok: { type: 'boolean' },
            action: { type: 'string', enum: ['archive', 'unarchive', 'delete'] },
            agentId: { type: 'string' },
            parentId: { type: 'string' },
            deleted: { type: 'boolean' },
          },
          required: ['ok', 'action', 'agentId', 'parentId', 'deleted'],
        },
        render: (_args, value) => {
          const verb =
            value?.action === 'archive'
              ? 'archived'
              : value?.action === 'unarchive'
                ? 'unarchived'
                : 'deleted'
          return [{ type: 'text', text: `${verb} subagent ${String(value?.agentId || '')}` }]
        },
      },
      async execute(args, exec) {
        const caller = exec.agent
        if (!caller) throw new Error('manage_subagent requires a calling root conversation')
        const header = ctx.sessions.get(caller.id)?.header
        if (!header) throw new Error('manage_subagent requires a live root conversation')
        const callerIsSubagent =
          Boolean(header.parentSession)
          && (header.origin === 'subagent' || integerOr(header.delegationDepth, 0) > 0)
        if (callerIsSubagent) {
          throw new Error('manage_subagent is only available to a root conversation, not a subagent')
        }
        const agentId = args?.agent_id
        const action = args?.action
        if (typeof agentId !== 'string' || agentId.length === 0 || agentId.length > 200) {
          throw new Error('agent_id must be a non-empty string')
        }
        if (action !== 'archive' && action !== 'unarchive' && action !== 'delete') {
          throw new Error('action must be archive, unarchive, or delete')
        }
        let target
        try {
          const rows = await ctx.subagents.listDescendants(caller.id, exec.signal)
          target = rows.find((row) => row.kind === 'child' && row.id === agentId)
        } catch (error) {
          throw new Error(`could not read this conversation's subagent catalog: ${errorText(error)}`)
        }
        if (!target) {
          throw new Error(`subagent ${agentId} is not a registered descendant of this conversation`)
        }
        if (target.mode === 'external') {
          throw new Error(`subagent ${agentId} is an external task and cannot be archived or deleted`)
        }
        if (action === 'delete' && (ctx.agents.get(agentId) || ctx.sessions.get(agentId))) {
          throw new Error(`subagent ${agentId} is still running or resident; archive it first, then delete`)
        }
        try {
          if (action === 'archive') {
            await archive(agentId)
            return { ok: true, action, agentId, parentId: target.parentId, deleted: false }
          }
          if (action === 'unarchive') {
            await unarchive(agentId)
            return { ok: true, action, agentId, parentId: target.parentId, deleted: false }
          }
          const result = await remove(agentId)
          return {
            ok: true,
            action,
            agentId,
            parentId: result.parentId || target.parentId,
            deleted: Boolean(result.removed),
          }
        } catch (error) {
          if (error instanceof ActionError) {
            throw new Error(
              `cannot ${action} subagent ${agentId}: ${error.code}${error.detail ? ` (${error.detail})` : ''}`,
            )
          }
          throw error
        }
      },
    }
  }

  async function handleTombstones() {
    try {
      await ensureReconciled()
      return jsonResponse(200, { ok: true, deleted: [...deleted] })
    } catch (error) {
      return errorResponse(error)
    }
  }

  /** @param {Request} request - Fetch request. */
  async function handleState(request) {
    try {
      const url = new URL(request.url)
      return jsonResponse(200, await buildState({
        limit: clampInt(url.searchParams.get('limit'), 15, 1, MAX_LIMIT),
        offset: clampInt(url.searchParams.get('offset'), 0, 0, 1_000_000),
        status: url.searchParams.get('status') || 'all',
        q: url.searchParams.get('q') || '',
        parent: url.searchParams.get('parent') || '',
        fresh: url.searchParams.get('fresh') === '1',
      }))
    } catch (error) {
      return errorResponse(error)
    }
  }

  /** @param {Request} request - Fetch request. */
  async function handleAction(request) {
    try {
      const body = await request.json()
      return jsonResponse(200, await runAction(body))
    } catch (error) {
      return errorResponse(error)
    }
  }

  /**
   * Node HTTP fallback for compositions without `ctx.connection.fetch`.
   *
   * @param {import('node:http').IncomingMessage} req - request.
   * @param {import('node:http').ServerResponse} res - response.
   */
  async function handleLegacy(req, res) {
    try {
      const url = new URL(req.url || '/', 'http://localhost')
      if (url.pathname === `${BASE}/state` && req.method === 'GET') {
        const state = await buildState({
          limit: clampInt(url.searchParams.get('limit'), 15, 1, MAX_LIMIT),
          offset: clampInt(url.searchParams.get('offset'), 0, 0, 1_000_000),
          status: url.searchParams.get('status') || 'all',
          q: url.searchParams.get('q') || '',
          parent: url.searchParams.get('parent') || '',
          fresh: url.searchParams.get('fresh') === '1',
        })
        sendNode(res, 200, state)
        return
      }
      if (url.pathname === `${BASE}/tombstones` && req.method === 'GET') {
        await ensureReconciled()
        sendNode(res, 200, { ok: true, deleted: [...deleted] })
        return
      }
      if (url.pathname === `${BASE}/action` && req.method === 'POST') {
        const chunks = []
        for await (const chunk of req) chunks.push(chunk)
        let body
        try {
          body = JSON.parse(Buffer.concat(chunks).toString('utf8') || '{}')
        } catch {
          throw new ActionError('INVALID', 'invalid JSON body')
        }
        const result = await runAction(body)
        sendNode(res, 200, result)
        return
      }
      sendNode(res, 404, { ok: false, code: 'NOT_FOUND', detail: url.pathname })
    } catch (error) {
      if (error instanceof ActionError) {
        sendNode(res, 200, { ok: false, code: error.code, detail: error.detail })
        return
      }
      sendNode(res, 200, { ok: false, code: 'INTERNAL', detail: errorText(error) })
    }
  }

  ctx.effect(() => ctx.tools.register(createManageToolDefinition()))

  ctx.effect(() => {
    const connection = service('connection')
    if (connection?.fetch?.register) {
      const offState = connection.fetch.register({
        path: `${BASE}/state`,
        methods: ['GET'],
        requestBody: 'buffered',
        fetch: handleState,
      })
      const offAction = connection.fetch.register({
        path: `${BASE}/action`,
        methods: ['POST'],
        requestBody: 'buffered',
        fetch: handleAction,
      })
      const offTombstones = connection.fetch.register({
        path: `${BASE}/tombstones`,
        methods: ['GET'],
        requestBody: 'buffered',
        fetch: handleTombstones,
      })
      return () => {
        for (const disposer of [offState, offAction, offTombstones]) {
          try {
            const result = disposer()
            if (result && typeof result.then === 'function') result.catch(() => {})
          } catch {
            // Disposal is best effort.
          }
        }
      }
    }
    const webServer = service('webServer')
    if (webServer?.register) {
      return webServer.register({ kind: 'prefix', path: BASE, handler: handleLegacy })
    }
    throw new Error('subagent-manager: neither ctx.connection.fetch nor ctx.webServer is mounted')
  })
}
