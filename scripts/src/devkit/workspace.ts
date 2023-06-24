import '@mono/libs-polyfill';
import * as fs from 'fs';
import * as path from 'path';
import { env } from 'process';
import { fileURLToPath } from 'url';
import dotEnv from 'dotenv';
import dotEnvExpand from 'dotenv-expand';
import { TaskMode } from './task.ts';
import { normalizePath } from '../tools/path.ts';

export const WorkspaceRoot = import.meta.url
  .pipe((str) => fileURLToPath(str))
  .pipe((str) => path.resolve(str, '../../../../'))
  .pipe((str) => normalizePath(str))

const projectRoot: { [projectName: string]: string } = {}

export function getProjectRoot(projectName: string) {
  return projectRoot[projectName] ||= projectName
    .pipe((str) => path.resolve(WorkspaceRoot, str === 'scripts' ? './' : 'packages', str))
    .pipe((str) => normalizePath(str))
    .pipe((result) => {
      const packageJson = path.resolve(result, 'package.json')
      const stat = fs.statSync(packageJson, { throwIfNoEntry: false })
      if (!stat) { throw new Error(`can't find project '${projectName}'\n'${packageJson}' not exists`) }
      return result
    })
}

const projectEnv: { [projectName: string]: { [envName: string]: string | undefined } } = {}
/**
 * order:

`[ProjectRoot]/.env.[TaskMode].local`

`[ProjectRoot]/.env.[TaskMode]`

`[ProjectRoot]/.env.local`

`[ProjectRoot]/.env`

`.env.[TaskMode].local`

`.env.[TaskMode]`

`.env.local`

`.env`

`[system.env]`
 */
export function getProjectEnv(projectName: string) {
  if (TaskMode === 'local') {
    throw new Error(
      `"local" cannot be used as a mode name because it conflicts with ` +
      `the .local postfix for .env files.`,
    )
  }
  return projectEnv[projectName] ||= getProjectRoot(projectName)
    .pipe((ProjectRoot) => [
      `${ProjectRoot}/.env.${TaskMode}.local`,
      `${ProjectRoot}/.env.${TaskMode}`,
      `${ProjectRoot}/.env.local`,
      `${ProjectRoot}/.env`,
      `.env.${TaskMode}.local`,
      `.env.${TaskMode}`,
      `.env.local`,
      `.env`,
    ])
    .reverse()
    .map((envFile) => path.resolve(WorkspaceRoot, envFile))
    .flatMap((envFile) => {
      const isFile = fs.statSync(envFile, { throwIfNoEntry: false })?.isFile()
      if (!isFile) { return [] }
      return Object.entries(dotEnv.parse(fs.readFileSync(envFile)))
    })
    .pipeLine((arr) => Object.fromEntries(arr))
    .pipeLine((parsed) => {
      Object.entries(env).forEach(([key, value]) => {
        if (parsed[key] !== undefined) { return }
        if (value === undefined) { return }
        parsed[key] = value
      })
      return Object.fromEntries(Object.entries(parsed).sort(([a], [b]) => a.localeCompare(b)))
    })
    .unpack((parsed) => {
      const result = dotEnvExpand.expand({ parsed })
      if (result.error) { throw result.error }
      return parsed
    })
}