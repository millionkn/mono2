// cwd=[projectRoot]
import path from 'path';
import * as tsconfck from 'tsconfck';
import { fileURLToPath } from 'url';

export const resolve = async (specifier, context, nextResolve) => {
  if (specifier.startsWith('@src')) {
    const parentPath = fileURLToPath(context.parentURL ?? specifier)
    const targetProjectDir = await tsconfck.find(parentPath).then((str) => path.resolve(str, '..'))
    const result = path.relative(path.resolve(parentPath, '..'), path.resolve(targetProjectDir, 'src'))
    return nextResolve(specifier.replace(/^@src/, result))
  }
  return nextResolve(specifier)
}

