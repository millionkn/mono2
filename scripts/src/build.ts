import * as path from "path";
import { rollup } from "rollup";
import { TaskProject } from "./devkit/task.ts";
import { getProjectRoot, getProjectEnv } from "./devkit/workspace.ts";
import { useImportDefault } from "./tools/useImportDefault.ts";
import typescript from 'typescript';
import { exit } from "process";
const tscPlugin = await import('rollup-plugin-typescript2').then(useImportDefault())
const resolvePlugin = await import('@rollup/plugin-node-resolve').then(useImportDefault())

const projectRoot = getProjectRoot(TaskProject)
const projectEnv = getProjectEnv(TaskProject)
const Mono_project_index = path.resolve(projectRoot, projectEnv['Mono_project_index'] || 'src/index.ts')

try {
  const rollupBuild = await rollup({
    input: Mono_project_index,
    plugins: [
      {
        name: 'resolve-deps',
        resolveId(source) {
          if (source.startsWith('@mono/')) {
            return { id: source, external: true }
          } else if (source.replaceAll('\\', '/').includes('/node_modules/')) {
            return { id: source, external: true }
          }
        },
      },
      resolvePlugin({
        rootDir: projectRoot,
      }),
      tscPlugin({
        cwd: path.resolve(projectRoot),
        typescript,
      }),
    ],
  })
  await rollupBuild.write({
    dir: path.resolve(projectRoot, 'dist'),
    preserveModules: true,
  })
  await rollupBuild.close()
} catch (e) {
  if (!(e instanceof Error)) { throw e }
  console.error(e.message)
  exit(1)
}
