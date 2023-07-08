import * as path from "path";
import { rollup } from "rollup";
import typescript from 'typescript';
import { cwd, exit } from "process";
import { useImportDefault } from "./tools.js";
import ora from 'ora';
import { resolveDeps } from "./plugins/resolve-deps.js";
import { getProjectEnv, getProjectRoot } from "./getProject.js";

const tscPlugin = await import('rollup-plugin-typescript2').then(useImportDefault())
const resolvePlugin = await import('@rollup/plugin-node-resolve').then(useImportDefault())

export async function buildProject(options: {
  projectName: string,
  inputFile: string[],
  mode: string,
}) {
  const projectRoot = getProjectRoot(options.projectName);
  const projectEnv = getProjectEnv(options.projectName, options.mode);//todo
  const spinner = ora(`build project '${options.projectName}'`).start();
  try {
    const rollupBuild = await rollup({
      input: options.inputFile,
      plugins: [
        resolveDeps(),
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



