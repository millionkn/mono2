import { CAC } from "cac";
import { getCwdProjectName } from "../getProject";
import { rollupProject } from "../rollupProject";
import ora from "ora";

export function rollupWrapper() {
  return (cac: CAC) => cac
    .command('rollup [project]', `rollup project,default find project in current cwd`)
    .action(async (rawProjectName: string | undefined) => {
      const projectName = rawProjectName ?? getCwdProjectName()
      if (!projectName) {
        console.error(`cwd not in project,please set a project`)
        process.exit(1)
      }
      const spinner = ora(`build project '${projectName}'`).start();
      await rollupProject(projectName).then(() => {
        spinner.succeed('build complate')
        process.exit(0)
      }).catch((e) => {
        if (!(e instanceof Error)) { throw e }
        spinner.fail('build failed')
        console.error(e.message)
        process.exit(1)
      })
    })
}