import '@mono/libs-polyfill';
import path from "path";
import { platform } from 'os';
import * as posix from "path/posix";
import process from "process";
import { fileURLToPath } from 'url';

const isWindows = platform() === 'win32'

export function normalizeRelative(from: string, to: string) {
  return path.relative(from, to)
    .pipe((str) => isWindows ? str.replaceAll('\\', '/') : str)
    .pipe((str) => posix.normalize(str))
}

export function normalizePath(pathStr: string) {
  return normalizeRelative(process.cwd(), pathStr)
}

export function esmCommand(scriptPath: string) {
  return scriptPath
    .pipe((str) => normalizePath(str))
    .pipe((scriptPath) => `ts-node-esm --experimentalSpecifierResolution node -T --swc ${scriptPath}`)
}

export function useImportDefault() {
  return <T extends { [keys: string]: any }>(res: T): T extends { default: any } ? T['default'] : T => {
    return 'default' in res ? res['default'] : res
  }
}

export const workspaceRoot = import.meta.url
  .pipe((str) => fileURLToPath(str))
  .pipe((str) => path.resolve(str, '../../../..'))
  .pipe((str) => normalizePath(str))

export const Env_SkipBuild = 'Mono_Cli_Devkit'