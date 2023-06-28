import * as path from "path";
import { rollup } from "rollup";
import { TaskProject } from "./devkit/task.ts";
import { getProjectRoot, getProjectEnv } from "./devkit/workspace.ts";
import { useImportDefault } from "./tools/useImportDefault.ts";
import ts from 'typescript';
const tscPlugin = await import('rollup-plugin-typescript2').then(useImportDefault())
const resolvePlugin = await import('@rollup/plugin-node-resolve').then(useImportDefault())

const projectRoot = getProjectRoot(TaskProject)
const projectEnv = getProjectEnv(TaskProject)
const Mono_project_index = path.resolve(projectRoot, projectEnv['Mono_project_index'] || 'src/index.ts')

try {
  const rollupBuild = await rollup({
    input: Mono_project_index,
    plugins: [
      tscPlugin({
        clean: true,
        check: false,
        cwd:path.resolve(projectRoot),
        transformers: [
          (ls) => {
            ls.getProgram()
            return {
              after: [
                (context) => {
                  const options = context.getCompilerOptions()
                  console.log('options',options)
                  const host = ts.createCompilerHost(options, false);
                  const tsResolver = (from: string, importTarget: string) => ts
                    .resolveModuleName(importTarget, from, options, host)
                    .resolvedModule
                  return (sourceFile) => {
                    const nodeForEach = (deep: number, node: ts.Node, cb: (child: ts.Node, deep: number) => boolean) => {
                      node.forEachChild((node) => cb(node, deep) && nodeForEach(deep + 1, node, cb))
                    }
                    nodeForEach(0, sourceFile, (node) => {
                      if (ts.isImportDeclaration(node)) {
                        const astResult = node.getChildren().find((t) => ts.isStringLiteral(t))
                        if (!astResult) { throw new Error() }
                        const resolveTarget = astResult.getText().slice(1, -1)
                        const result = tsResolver(sourceFile.fileName, resolveTarget)
                        console.log('import',sourceFile.fileName, astResult, result)
                        return false
                      }
                      return true
                    })
                    return sourceFile
                  }
                }
              ]
            }
          },
        ]
      }),
      {
        name: 'bundle-resolver',
        async transform(code, id) {
          return {
            map: null,
          }
        }
      },
      resolvePlugin({
        rootDir: projectRoot,
      }),
    ],
  })

  console.log(rollupBuild)
} catch (e) {
  e instanceof Error && console.error(e.message)
  throw e
}
