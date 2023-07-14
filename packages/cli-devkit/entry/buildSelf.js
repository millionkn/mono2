import path from "path";
import { rollup } from "rollup";
import typescript from 'typescript';
import { globSync } from 'glob';
import { fileURLToPath } from "url";
const tscPlugin = await import('rollup-plugin-typescript2')
const resolvePlugin = await import('@rollup/plugin-node-resolve')

const selfRoot = path.posix.normalize(path.relative(
  process.cwd(),
  path.resolve(fileURLToPath(import.meta.url), '../..'),
).split('\\').join('/'))

try {
  const rollupBuild = await rollup({
    input: globSync(`${selfRoot}/src/**/*.ts`),
    plugins: [
      resolvePlugin.default({
        rootDir: path.resolve(selfRoot),
      }),
      {
        name: 'exclude_deps',
        async resolveId(id, importer) {
          if (!importer) { return }
          if (id.startsWith('@mono/')) {
            return { id, external: true }
          }
          if (id.split('\\').join('/').includes('/node_modules/')) {
            return { id, external: true }
          }
        }
      },
      tscPlugin.default({
        tsconfigOverride: {
          compilerOptions: {
            rootDir: 'src',
          },
        },
        cwd: path.resolve(selfRoot),
        tsconfig: path.resolve(selfRoot, 'tsConfig.json'),
        typescript,
      }),
    ],
  })
  await rollupBuild.write({
    dir: path.resolve(selfRoot, 'dist'),
    preserveModules: true,
  })
} catch (e) {
  console.error(e instanceof Error ? e.message : String(e))
  process.exit(1)
}


