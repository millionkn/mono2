import path from "path";
import { cwd, env } from "process";
import { fileURLToPath } from "url";
import { normalizePath, normalizeRelative } from './tools.mjs';

export const mode = env['Mono_task_mode'] ?? ''

export const workspaceRoot = import.meta.url
  .pipe((str) => fileURLToPath(str))
  .pipe((str) => path.resolve(str, '../../../..'))
  .pipe((str) => normalizePath(str))

export const cwdProjectName = cwd()
  .pipe((str) => normalizeRelative(path.resolve(workspaceRoot, 'packages'), str))
  .pipe((str) => str.split('/')[0])
  .pipe((str) => {
    if (str.startsWith('.')) { throw new Error('cwd not in project') }
    return str
  })
