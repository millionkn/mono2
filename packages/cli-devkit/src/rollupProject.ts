import * as path from "path";
import { rollup } from "rollup";
import typescript from 'typescript';
import { cwd, exit } from "process";
import { useImportDefault } from "./tools";
import ora from 'ora';
import { resolveDeps } from "./plugins/resolve-deps";
import { getProjectRoot } from "./getProject";
import { globSync } from 'glob';

const tscPlugin = await import('rollup-plugin-typescript2').then(useImportDefault())
const resolvePlugin = await import('@rollup/plugin-node-resolve').then(useImportDefault())

export async function rollupProject(projectName: string) {
  const projectRoot = getProjectRoot(projectName);
  const spinner = ora(`build project '${projectName}'`).start();
  try {
    const rollupBuild = await rollup({
      input: globSync([
        getProjectRoot(projectName, `src/**/*.ts`),
        getProjectRoot(projectName, `src/**/*.tsx`),
        getProjectRoot(projectName, `src/**/*.js`),
        getProjectRoot(projectName, `src/**/*.jsx`),
      ]),
      plugins: [
        resolveDeps(projectName),
        resolvePlugin({
          rootDir: projectRoot,
        }),
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
    await rollupBuild.close()
    spinner.succeed('build complate')
    exit(0)
  } catch (e) {
    if (!(e instanceof Error)) { throw e }
    spinner.fail('build failed')
    console.error(e.message)
    exit(1)
  }
}



