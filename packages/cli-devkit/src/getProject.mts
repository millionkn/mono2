import { mode, workspaceRoot } from './define.mjs'
import path from "path";
import fse from 'fs-extra';
import dotEnv from 'dotenv';
import { normalizePath } from './tools.mjs';

export function getProjectRoot(projectName: string) {
  return projectName
    .pipe((str) => path.resolve(workspaceRoot, `packages`, str))
    .pipe((str) => normalizePath(str))
}

/**
 * order:

`[projectRoot]/.env.[mode].local`

`[projectRoot]/.env.[mode]`

`[projectRoot]/.env.local`

`[projectRoot]/.env`

`[workspaceRoot]/.env.[mode].local`

`[workspaceRoot]/.env.[mode]`

`[workspaceRoot]/.env.local`

`[workspaceRoot]/.env`
 */
export function getProjectEnv(projectName: string) {
  if (mode === 'local') {
    throw new Error(
      `"local" cannot be used as a mode name because it conflicts with ` +
      `the .local postfix for .env files.`,
    )
  }
  return getProjectRoot(projectName)
    .pipe((projectRoot) => [
      !mode ? '' : `${projectRoot}/.env.${mode}.local`,
      !mode ? '' : `${projectRoot}/.env.${mode}`,
      `${projectRoot}/.env.local`,
      `${projectRoot}/.env`,
      !mode ? '' : `${workspaceRoot}/.env.${mode}.local`,
      !mode ? '' : `${workspaceRoot}/.env.${mode}`,
      `${workspaceRoot}/.env.local`,
      `${workspaceRoot}/.env`,
    ])
    .reverse()
    .filter((envFile) => !!envFile)
    .map((envFile) => {
      const isFile = fse.statSync(envFile, { throwIfNoEntry: false })?.isFile()
      if (!isFile) { return {} }
      return dotEnv.parse(fse.readFileSync(envFile))
    })
    .pipeLine((objArr): { [key: string]: string } => Object.assign({}, ...objArr))
    .pipeLine((obj) => Object.entries(obj))
    .pipeLine((arr) => arr.sort((a, b) => a[0].localeCompare(b[0])))
    .unpack((arr) => Object.fromEntries(arr))
}

export function getProjectDeps(projectName: string) {
  const filePath = path.resolve(getProjectRoot(projectName), 'package.json')
  const json = fse.readJsonSync(filePath, { throws: false })
  if (!json || typeof json !== 'object') {
    throw new Error(`'${filePath}' not exists or is not a valid json`)
  }
  const deps = json['dependencies'] ?? {}
  return {
    monoDependencies: Object.keys(deps)
      .filter((e) => e.startsWith('@mono/'))
      .map((str) => str.replace(`@mono/`, '')),
    thiryDependencies: Object.entries(deps)
      .filter(([k]) => !k.startsWith('@mono/'))
      .asObject(([a]) => a, ([, b]) => String(b).valueOf())
  }
}
