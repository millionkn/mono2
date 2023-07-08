import '@mono/libs-polyfill';
import fse from "fs-extra";
import path from 'path';
import process from "process";
import { fileURLToPath } from 'url';
import { execaCommand } from 'execa';
import { esmCommand } from '../tools';
import { cac } from 'cac';
import { buildWrapper } from './build';
import { runWrapper } from './run';


Object
  .pipeLineFrom(cac('mono'))
  .pipeTap(buildWrapper)
  .pipeTap(runWrapper)
  .unpack((cli) => cli.help().parse())


// let [scriptName, ...args] = process.argv.slice(2)


// const scriptPath = fileURLToPath(import.meta.url)
//   .pipe((str) => path.resolve(str, '../scripts', `${scriptName}.ts`))

// const stat = fse.statSync(scriptPath, { throwIfNoEntry: false })
// if (!stat) {
//   console.error(`no script '${scriptName}',read 'mono --help'`)
//   process.exit(1)
// }

// const child = execaCommand([esmCommand(scriptPath), ...args].join(' '), {
//   stdio: 'inherit',
// })