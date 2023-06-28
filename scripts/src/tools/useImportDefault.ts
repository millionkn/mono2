export function useImportDefault() {
  return <T extends { [keys: string]: any }>(res: T): T extends { default: any } ? T['default'] : T => {
    return 'default' in res ? res['default'] : res
  }
}