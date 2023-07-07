import { Plugin } from "rollup";
import { getProjectEnvFileList } from "../getProject";
import { env } from "process";

export function watchEnvFile(projectName: string): Plugin {
  const fileList = getProjectEnvFileList(projectName, env['Mono_mode'] ?? '')
  return {
    name: 'watch-env-file',
    buildStart() {
      fileList.forEach((file) => this.addWatchFile(file))
    }
  }
}