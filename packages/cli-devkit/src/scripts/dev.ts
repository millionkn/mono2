import * as path from "path";
import { watch, rollup } from "rollup";
import typescript from 'typescript';
import { cwdProjectName, projectRoot, useImportDefault } from "../tools.js";
import ora from 'ora';
import { resolveDeps } from "../plugins/resolve-deps.js";
import { watchEnvFile } from "../plugins/watch-env-file.js";

const tscPlugin = await import('rollup-plugin-typescript2').then(useImportDefault())
const resolvePlugin = await import('@rollup/plugin-node-resolve').then(useImportDefault())

const [inputFile, debug] = process.argv.slice(2)

const watcher = watch({
  input: inputFile,
  plugins: [
    watchEnvFile(cwdProjectName),
    resolveDeps(),
    resolvePlugin({
      rootDir: projectRoot,
    }),
    tscPlugin({
      cwd: path.resolve(projectRoot),
      typescript,
    }),
  ],
  output: {
    dir: path.resolve(projectRoot, 'dist'),
    preserveModules: true,
  }
})

spinner.succeed('build complate')