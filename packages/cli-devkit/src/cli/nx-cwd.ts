import { CAC } from "cac";
import { execaCommand } from "execa";
import { env } from "process";
import { getProjectRoot } from "../getProject";

export function nxCwdWrapper() {
  return (cac: CAC) => cac
    .command('nx-cwd', `run commands in cwd:'packages/[NX_TASK_TARGET_PROJECT]'`)
    .action(() => {
      const projectName = env['NX_TASK_TARGET_PROJECT']
      if (!projectName) {
        console.error(`not found env 'NX_TASK_TARGET_PROJECT',without nx?`)
        process.exit(1)
      }
      const child = execaCommand(process.argv.slice(3).join(' '), {
        cwd: getProjectRoot(projectName),
        stdio: 'inherit',
      })
      child.catch(() => { }).finally(() => {
        const exitCode = child.exitCode
        if (exitCode === null) { throw new Error() }
        process.exit(exitCode)
      })
    })
}