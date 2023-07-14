import path from "path";
import { rollup } from "rollup";
import typescript from 'typescript';
import { cwd } from "process";
import { useImportDefault } from "./tools";
import { getProjectRoot } from "./getProject";
import { globSync } from "glob";

const tscPlugin = await import('rollup-plugin-typescript2').then(useImportDefault())
const resolvePlugin = await import('@rollup/plugin-node-resolve').then(useImportDefault())

export async function rollupProject(
  projectName: string,
) {
  const projectRoot = getProjectRoot(projectName);
  const rollupBuild = await rollup({
    input: globSync([
      'ts', 'tsx', 'js', 'jsx',
    ].map((suffix) => getProjectRoot(projectName, `src/**/*.${suffix}`))),
    plugins: [
      resolvePlugin({
        rootDir: projectRoot,
      }),
      {
        name: 'exclude_all',
        resolveId(id, importer) {
          if (!importer) { return }
          return { id, external: true }
        }
      },
      tscPlugin({
        cwd: cwd(),
        tsconfig: path.resolve(projectRoot, 'tsConfig.json'),
        typescript,
      }),
    ],
  })
  await rollupBuild.write({
    dir: path.resolve(projectRoot, 'dist'),
    preserveModules: true,
  })
  rollupBuild.close()
}



