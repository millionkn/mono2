import path from "path";
import fse from "fs-extra";
import dotEnv from 'dotenv';
import { normalizePath, normalizeRelative, workspaceRoot } from "./tools";

export function getProjectRoot(projectName: string, ...child: string[]) {
  return projectName
    .pipe((str) => path.resolve(workspaceRoot, `packages`, str, ...child))
    .pipe((str) => normalizePath(str))
}

export function getCwdProjectName() {
  return process.cwd()
    .pipe((str) => normalizeRelative(path.resolve(workspaceRoot, 'packages'), str))
    .pipe((str) => str.split('/')[0])
    .pipe((str) => str.startsWith('.') ? null : str)
}

/**
`[projectRoot]/.env.[mode].local`

`[projectRoot]/.env.[mode]`

`[projectRoot]/.env.local`

`[projectRoot]/.env`

`[workspaceRoot]/.env.[mode].local`

`[workspaceRoot]/.env.[mode]`

`[workspaceRoot]/.env.local`

`[workspaceRoot]/.env`
 */
export const getProjectEnvFileList = (projectName: string, mode: string) => {
  if (mode === 'local') {
    console.error(
      `"local" cannot be used as a mode name because it conflicts with ` +
      `the .local postfix for .env files.`,
    )
    process.exit(1)
  }
  const projectRoot = getProjectRoot(projectName)
  return [
    !mode ? '' : `${projectRoot}/.env.${mode}.local`,
    !mode ? '' : `${projectRoot}/.env.${mode}`,
    `${projectRoot}/.env.local`,
    `${projectRoot}/.env`,
    !mode ? '' : `${workspaceRoot}/.env.${mode}.local`,
    !mode ? '' : `${workspaceRoot}/.env.${mode}`,
    `${workspaceRoot}/.env.local`,
    `${workspaceRoot}/.env`,
  ].filter((str) => !!str)
}

export function getProjectEnv(projectName: string, mode: string) {
  return getProjectEnvFileList(projectName, mode)
    .reverse()
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


export function getProjectThiryDeps(projectName: string) {
  const filePath = path.resolve(getProjectRoot(projectName, 'package.json'))
  const json = fse.readJsonSync(filePath, { throws: false })
  if (!json || typeof json !== 'object') {
    console.error(`'${filePath}' not exists or is not a valid json`)
    process.exit(1)
  }
  const deps = json['dependencies'] ?? {}
  return Object.entries(deps)
    .filter(([k]) => !k.startsWith('@mono/'))
    .asObject(([a]) => a, ([, b]) => String(b).valueOf())
}

export function getProjectMonoDeepDeps(projectName: string): string[] {
  const filePath = path.resolve(getProjectRoot(projectName, 'package.json'))
  const json = fse.readJsonSync(filePath, { throws: false })
  if (!json || typeof json !== 'object') {
    console.error(`'${filePath}' not exists or is not a valid json`)
    process.exit(1)
  }
  const deps = json['dependencies'] ?? {}
  return Object.keys(deps)
    .filter((e) => e.startsWith('@mono/'))
    .map((str) => str.replace(`@mono/`, ''))
    .flatMap((projectName) => getProjectMonoDeepDeps(projectName).concat(projectName))
    .dedup((v) => v)
}