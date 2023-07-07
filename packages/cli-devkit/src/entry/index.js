import '@mono/libs-polyfill';
import path from "path";
import { posix } from 'path';
import { platform } from 'os';
import process from "process";
import { execaCommand } from 'execa';
import { fileURLToPath } from "url";

const isWindows = platform() === 'win32'

function normalizeRelative(from, to) {
  return path.relative(from, to)
    .pipe((str) => isWindows ? str.replaceAll('\\', '/') : str)
    .pipe((str) => posix.normalize(str))
}

const command = import.meta.url
  .pipe((str) => fileURLToPath(str))
  .pipe((str) => path.resolve(str, `../../index.ts`))
  .pipe((str) => normalizeRelative(process.cwd(), str))
  .pipe((scriptPath) => `ts-node-esm --experimentalSpecifierResolution node -T --swc ${scriptPath}`)

const child = execaCommand([command, ...process.argv.slice(2)].join(' '), {
  stdio: 'inherit',
})
await child.catch(() => { })
const exitCode = child.exitCode
if (exitCode === null) { throw new Error() }
process.exit(exitCode)

