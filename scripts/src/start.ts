import { stat } from "fs/promises";
import { resolve } from "path";
import { env } from "process";
import { fileURLToPath } from "url";

const dot_env = env['Mono_dot_env']
if (!dot_env) {
  throw new Error('without env file,try run command in workspace root')
}

const targetProjectName = env['NX_TASK_TARGET_PROJECT']
if (!targetProjectName) {
  throw new Error('unknown target project name,without nx?')
}

const projectCwd = resolve(fileURLToPath(import.meta.url), '../../../packages', targetProjectName)
const indexFile = resolve(projectCwd, env['Mono_project_index'] || 'src/index.ts')

const fileStat = await stat(indexFile).catch(() => {
  throw new Error(`'${indexFile}' not exists`)
})
if (fileStat.isDirectory()) {
  throw new Error(`'${indexFile}' is a directory`)
}
console.log(env['Mono_script_debug'])
console.log(indexFile)
