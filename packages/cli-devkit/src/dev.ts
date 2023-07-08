import * as path from "path";
import { watch, rollup } from "rollup";
import typescript from 'typescript';
import { cwdProjectName, projectRoot, useImportDefault } from "../tools.js";
import ora from 'ora';
import { resolveDeps } from "../plugins/resolve-deps.js";
import { watchEnvFile } from "../plugins/watch-env-file.js";
import ansiEscapes from 'ansi-escapes';
import dayjs from "dayjs";
import chalk from 'chalk';

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

watcher.on('change', (id) => {
  console.log(ansiEscapes.clearTerminal)
  console.log([
    chalk.bgGreen.white(dayjs().format('YYYY-MM-DD HH:mm:ss')),
    `file '${chalk.white(id)}' changed`
  ].join(' '))
})
let spinner = ora()
watcher.on('event', (event) => {
  if(event.code === 'START'){
    console.log(ansiEscapes.clearTerminal)
    console.log([
      chalk.bgGreen.white(dayjs().format('YYYY-MM-DD HH:mm:ss')),
      `dev server started`
    ].join(' '))
  }else if (event.code === 'BUNDLE_START') {
    console.log([
      chalk.bgGreen.white(dayjs().format('YYYY-MM-DD HH:mm:ss')),
      `build start`
    ].join(' '))
    spinner.start(`rebuild project'${cwdProjectName}'`)
  } else if (event.code === 'BUNDLE_END') {
    spinner.stop()
    console.log([
      chalk.bgGreen.white(dayjs().format('YYYY-MM-DD HH:mm:ss')),
      chalk.green('build success'),
    ].join(' '))
  } else if (event.code === 'ERROR') {
    spinner.stop()
    console.log([
      chalk.bgGreen(dayjs().format('YYYY-MM-DD HH:mm:ss')),
      chalk.bgRed.white('build failed'),
    ].join(' '))
    console.log(event.error.message)
  }
})
