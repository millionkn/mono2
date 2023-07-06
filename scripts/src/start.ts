import '@mono/libs-polyfill'
import { stat } from "fs/promises";
import * as path from "path";
import { WorkspaceRoot, getProjectEnv, getProjectRoot } from './devkit/workspace.ts';
import { TaskProject } from './devkit/task.ts';
import { execaCommand } from 'execa';
import { relative } from './tools/path.ts';
import * as tsconfck from 'tsconfck';
import watch from "glob-watcher"
import dayjs from 'dayjs';
import { debounceTime, fromEvent, map, merge } from 'rxjs';
import ansiEscapes from 'ansi-escapes';

const projectRoot = getProjectRoot(TaskProject)
const projectEnv = getProjectEnv(TaskProject)
const Mono_project_index = path.resolve(projectRoot, projectEnv['Mono_project_index'] || 'src/index.ts')

const fileStat = await stat(Mono_project_index).catch(() => {
  throw new Error(`'${Mono_project_index}' not exists`)
})
if (fileStat.isDirectory()) {
  throw new Error(`'${Mono_project_index}' is a directory`)
}

const { tsconfigFile, tsconfig } = await tsconfck.parse(Mono_project_index)
const TS_NODE_PROJECT = path.relative(WorkspaceRoot, tsconfigFile).replaceAll('\\', '/')

const scriptsRoot = getProjectRoot('scripts')
const loaderPath = relative(projectRoot, path.resolve(scriptsRoot, 'src', 'tools', 'bundler-loader.mjs'))

console.clear()
console.log(`${dayjs().format('HH:mm:ss')}:starting dev server...`)

const command = `node ${projectEnv['Mono_script_debug'] === 'true' ? '--inspect' : ''} --no-warnings --loader ts-node/esm --loader ${loaderPath} --experimental-specifier-resolution=node ${Mono_project_index}`

let child = execaCommand(command, {
  cwd: projectRoot,
  stdio: 'inherit',
})


const watcher = watch(tsconfig.include, {
  cwd: projectRoot,
})

merge(
  fromEvent(watcher, 'change').pipe(map((e: any) => e[0])),
  fromEvent(watcher, 'add').pipe(map((e: any) => e[0])),
  fromEvent(watcher, 'unlink'),
).pipe(
  debounceTime(200),
).subscribe(() => {
  if (!child.killed || child.exitCode === null) {
    child.kill()
  }
  console.log(`${ansiEscapes.clearTerminal}${dayjs().format('HH:mm:ss')}:file changed,restart...`)

  child = execaCommand(command, {
    cwd: projectRoot,
    stdio: 'inherit',
  })
})

