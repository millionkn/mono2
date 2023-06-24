import { platform } from 'os';
import * as path from 'path';
import * as posix from "path/posix";
import { cwd } from 'process';

const isWindows = platform() === 'win32'

export function normalizePath(pathStr: string): string {
  return pathStr
    .pipe((str) => path.relative(cwd(), str))
    .pipe((str) => isWindows ? str.replaceAll('\\', '/') : str)
    .pipe((str) => posix.normalize(str))
}

export function relative(from: string, to: string) {
  return path.relative(from, to)
    .pipe((str) => isWindows ? str.replaceAll('\\', '/') : str)
    .pipe((str) => posix.normalize(str))
}