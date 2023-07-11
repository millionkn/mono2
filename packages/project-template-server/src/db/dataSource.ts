import { dbDatabase, dbHost, dbPassword, dbPort, dbSynchronize, dbType, dbUsername } from "@src/env";
import { DataSource, EntitySchema } from "typeorm";

export const entitySchemaLoaderArr = new Array<() => EntitySchema>()

export const loadDataSource = Object.lazy(() => {
  return new DataSource({
    type: dbType as any,
    host: dbHost,
    port: dbPort,
    username: dbUsername,
    password: dbPassword,
    database: dbDatabase,
    synchronize: dbSynchronize,
    entities: entitySchemaLoaderArr,
    logging: [
      'error',
    ],
  })
})
