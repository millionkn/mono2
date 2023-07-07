import * as path from "path";
import { rollup } from "rollup";
import typescript from 'typescript';
import { exit } from "process";
import { cwdProjectName, projectRoot, useImportDefault } from "../tools.js";
import ora from 'ora';
import { resolveDeps } from "../plugins/resolve-deps.js";

const tscPlugin = await import('rollup-plugin-typescript2').then(useImportDefault())
const resolvePlugin = await import('@rollup/plugin-node-resolve').then(useImportDefault())

const [inputFile] = process.argv.slice(2)
const spinner = ora(`build project '${cwdProjectName}'`).start();
try {
  const rollupBuild = await rollup({
    input: inputFile,
    plugins: [
      resolveDeps(),
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
  spinner.succeed('build complate')
} catch (e) {
  if (!(e instanceof Error)) { throw e }
  spinner.fail('build failed')
  console.error(e.message)
  exit(1)
}
