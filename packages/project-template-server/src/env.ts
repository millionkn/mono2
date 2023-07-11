import { env } from "process";
import { DataSourceOptions } from "typeorm";

// 为了部署时方便查看需要设置哪些环境变量
// 此文件不抽成单独的包

export const serverPort = Object.pipeLineFrom(env['server_port'])
  .pipeLine((v) => v?.asNumber() ?? null)
  .unpack((v) => {
    if (typeof v === 'number') { return v }
    throw new Error(`env [server_port] must be number`)
  })

export const dbType = Object.pipeLineFrom(env['db_type'])
  .unpack((v) => {
    const arr: DataSourceOptions['type'][] = [
      'mysql',
      'postgres',
    ]
    if (!v?.isOneOf(arr)) {
      throw new Error(`env [db_type] must be one of ${arr.map((e) => `'${e}'`).join(',')}`)
    }
    return v
  })

export const dbHost = Object.pipeLineFrom(env['db_host'])
  .unpack((v) => {
    if (typeof v === 'string') { return v }
    throw new Error(`env [db_host] should be set`)
  })

export const dbPort = Object.pipeLineFrom(env['db_port'])
  .pipeLine((v) => v?.asNumber() ?? null)
  .unpack((v) => {
    if (typeof v === 'number') { return v }
    throw new Error(`env [db_port] must be number`)
  })

export const dbUsername = Object.pipeLineFrom(env['db_username'])
  .unpack((v) => {
    if (typeof v === 'string') { return v }
    throw new Error(`env [db_username] should be set`)
  })

export const dbPassword = Object.pipeLineFrom(env['db_password'])
  .unpack((v) => {
    if (typeof v === 'string') { return v }
    throw new Error(`env [db_password] should be set`)
  })
export const dbDatabase = Object.pipeLineFrom(env['db_database'])
  .unpack((v) => {
    if (typeof v === 'string') { return v }
    throw new Error(`env [db_database] should be set`)
  })

export const dbSynchronize = env['db_synchronize'] === 'true'