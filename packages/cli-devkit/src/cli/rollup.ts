import { CAC } from "cac";
import { getCwdProjectName } from "../getProject";
import { rollupProject } from "../rollupProject";

export function rollupWrapper() {
  return (cac: CAC) => cac
    .command('rollup [project]', `rollup project,default find project in current cwd`)
    .action((rawProjectName: string | undefined) => {
      const projectName = rawProjectName ?? getCwdProjectName()
      if (!projectName) {
        console.error(`cwd not in project,please set a project`)
        process.exit(1)
      }
      rollupProject(projectName)
    })
}