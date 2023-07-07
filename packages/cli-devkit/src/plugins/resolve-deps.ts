import { Plugin } from "rollup";

export function resolveDeps(): Plugin {
  return {
    name: 'resolve-deps',
    resolveId(source) {
      if (source.startsWith('@mono/')) {
        return { id: source, external: true }
      } else if (source.replaceAll('\\', '/').includes('/node_modules/')) {
        return { id: source, external: true }
      }
    },
  }
}