import { EntitySchema } from "typeorm";
import { entitySchemaLoaderArr } from "../dataSource";

entitySchemaLoaderArr.push(() => PersonEntitySchema)

export const PersonEntitySchema = new EntitySchema<{
  id: string,
  name: string,
}>({
  name: "category",
  columns: {
    id: {
      type: String,
      primary: true,
      generated: 'uuid',
    },
    name: {
      type: String,
    },
  },
})

