import {
  DummyDriver,
  Kysely,
  PostgresAdapter,
  PostgresIntrospector,
  PostgresQueryCompiler,
} from "kysely";

import { DB as MaterializeSchema } from "~/types/materialize";

export const createQueryBuilder = () => {
  return new Kysely<MaterializeSchema>({
    dialect: {
      createAdapter() {
        return new PostgresAdapter();
      },
      createDriver() {
        // Kysely requires a database driver, but we decided to just use it as a query builder, rather than implement an HTTP driver
        // Specifically the driver doesn't have support for query cancellation, which we want.
        return new DummyDriver();
      },
      createIntrospector(datbase: Kysely<unknown>) {
        return new PostgresIntrospector(datbase);
      },
      createQueryCompiler() {
        return new PostgresQueryCompiler();
      },
    },
  });
};

export const queryBuilder = createQueryBuilder();
