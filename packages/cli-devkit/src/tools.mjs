import '@mono/libs-polyfill';
import path from "path";
import { platform } from 'os';
import * as posix from "path/posix";
import { cwd } from "process";

const isWindows = platform() === 'win32'

/**
 * @param {string} from 
 * @param {string} to 
 * @returns {string}
 */
export function normalizeRelative(from, to) {
  return path.relative(from, to)
    .pipe((str) => isWindows ? str.replaceAll('\\', '/') : str)
    .pipe((str) => posix.normalize(str))
}

/**
 * @param {string} pathStr 
 * @returns {string}
 */
export function normalizePath(pathStr) {
  return normalizeRelative(cwd(), pathStr)
}

/**
 * @param {string} scriptPath
 * @returns {string}
 */
export function esmCommand(scriptPath) {
  return scriptPath
    .pipe((str) => normalizePath(str))
    .pipe((scriptPath) => `ts-node-esm --experimentalSpecifierResolution node -T --swc ${scriptPath}`)
}