import { CAC } from "cac";
import { esmCommand } from "../tools";
import { execaCommand } from 'execa'
import fse from "fs-extra";

export function runWrapper(cac: CAC) {
  cac
    .command('run <script>', `run a esm script`)
    .option(`--debug`, `with '--inspect' flag`)
    .option('--mode <mode>', `if set,will load '.env.[mode]' or '.env.[mode].local'`)
    .action(async (scriptPath: string, options: { '--': string[], mode: string | undefined, debug: boolean | undefined }) => {
      if (!fse.statSync(scriptPath, { throwIfNoEntry: false })?.isFile()) {
        console.error(`'${scriptPath}' is not file`)
        process.exit(1)
      }
      const child = execaCommand([esmCommand(scriptPath), ...options["--"]].join(' '), {
        stdio: 'inherit',
      })
      await child.catch(() => { })
      const exitCode = child.exitCode
      if (exitCode === null) { throw new Error() }
      process.exit(exitCode)
    })
}