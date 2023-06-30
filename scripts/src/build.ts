import * as path from "path";
import { rollup } from "rollup";
import { TaskProject } from "./devkit/task.ts";
import { getProjectRoot, getProjectEnv, getTsResolver } from "./devkit/workspace.ts";
import { useImportDefault } from "./tools/useImportDefault.ts";
import ts from 'typescript';
const tscPlugin = await import('rollup-plugin-typescript2').then(useImportDefault())
const resolvePlugin = await import('@rollup/plugin-node-resolve').then(useImportDefault())
const lexer = await import('es-module-lexer')
const MagicString = await import('magic-string').then(useImportDefault());
const projectRoot = getProjectRoot(TaskProject)
const projectEnv = getProjectEnv(TaskProject)
const Mono_project_index = path.resolve(projectRoot, projectEnv['Mono_project_index'] || 'src/index.ts')

const nodeForEach = (node: ts.Node, cb: (child: ts.Node) => boolean) => {
  node.forEachChild((node) => cb(node) && nodeForEach(node, cb))
}
const tsResolver = await getTsResolver(TaskProject)
try {
  const rollupBuild = await rollup({
    external: (source, importer, isResolved) => {
      console.log(source)
    },
    input: Mono_project_index,
    plugins: [
      tscPlugin({
        clean: true,
        check: false,
        cwd: path.resolve(projectRoot),
      }),
      resolvePlugin({
        rootDir: projectRoot,
      }),
      {
        name: 'bundle-resolver',
        async transform(code, id) {
          await lexer.init
          const magicString = new MagicString(code)
          const [imports] = lexer.parse(code)
          for (const importSpecifier of imports) {
            const start = importSpecifier.d > -1 ? importSpecifier.s + 1 : importSpecifier.s
            const end = importSpecifier.d > -1 ? importSpecifier.e + -1 : importSpecifier.e
            const target = code.slice(start, end)
            const resolved = tsResolver(id, target)
            if (resolved !== null) { magicString.update(start, end, resolved) }
          }
          return {
            code: magicString.toString(),
            map: magicString.generateMap(),
          }
        }
      },

    ],
  })

} catch (e) {
  e instanceof Error && console.error(e.message)
  throw e
}
