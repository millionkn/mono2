import '@mono/libs-polyfill';
import fse from "fs-extra";
import path from 'path';
import process from "process";
import { fileURLToPath } from 'url';
import { execaCommand } from 'execa';
import { esmCommand, cwdProjectName, projectRoot, workspaceRoot } from './tools';
import { getProjectEnv } from './getProject';

let [scriptName, target, ...args] = process.argv.slice(2)
let mode = ''
if (args.length > 0 && args[0].startsWith('mode=')) {
  mode = args[0].replace('mode=', '')
  args = args.slice(1)
}

if (!scriptName || scriptName === '--help' || scriptName === '-h') {
  console.log(`
scripts:
  mono build ./src/index.ts [mode=modeName]
  mono dev ./src/index.ts [mode=modeName] [--debug]
  mono run ./script.ts [mode=modeName] [...args]
  mono nx targetName [mode=modeName]
output env:
  Mono_project_name=[projectName]
  Mono_project_root=[absProjectRoot]
  Mono_workspace_root=[absWorkspaceRoot]
  Mono_mode=[mode]
`)
  process.exit(0)
}


const scriptPath = fileURLToPath(import.meta.url)
  .pipe((str) => path.resolve(str, '../scripts', `${scriptName}.ts`))

const stat = fse.statSync(scriptPath, { throwIfNoEntry: false })
if (!stat) {
  console.error(`no script '${scriptName}',read 'mono --help'`)
  process.exit(1)
}

const child = execaCommand([esmCommand(scriptPath), target, ...args].join(' '), {
  stdio: 'inherit',
  env: {
    Mono_workspace_root: path.resolve(workspaceRoot),
    Mono_project_name: path.resolve(cwdProjectName),
    Mono_project_root: path.resolve(projectRoot),
    Mono_mode: mode,
    ...getProjectEnv(cwdProjectName, mode),
  },
})

await child.catch(() => { })
const exitCode = child.exitCode
if (exitCode === null) { throw new Error() }
process.exit(exitCode)