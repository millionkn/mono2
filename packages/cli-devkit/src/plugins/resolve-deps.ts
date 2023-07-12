import { Plugin } from "rollup";
import { getProjectThiryDeps } from "../getProject";

export function resolveDeps(projectName: string): Plugin {
  const deps = projectName
    .pipeLine((str) => getProjectThiryDeps(str))
    .unpack((obj) => Object.keys(obj))
    .map((dep) => dep.split('/'))
  return {
    name: 'resolve-deps',
    resolveId(source) {
      if (source.startsWith('.')) {
      } else if (source.startsWith('@mono/')) {
        return { id: source, external: true }
      } else if (!!deps.find((dep) => source.split('/').startsWith(dep))) {
        return { id: source, external: true }
      } else if (source.replaceAll('\\', '/').includes('/node_modules/')) {
        return { id: source, external: true }
      }
    },
  }
}