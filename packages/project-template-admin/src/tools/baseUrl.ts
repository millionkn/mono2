export function baseUrl(...strArr: string[]) {
  return import.meta.env.VITE_Base_Url
    .pipeValue((baseUrl) => `${baseUrl}/${strArr.join('/')}`)
    .pipeValue((str) => str.split('/'))
    .filter((str) => str.length > 0)
    .join('/')
    .pipeValue((str) => `/${str}`)
}