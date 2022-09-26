import { runBasicTests } from "@next-auth/adapter-test"
import { Pool } from "pg"
import {
  Kysely,
  MysqlDialect,
  PostgresDialect,
  SchemaModule,
  sql,
  SqliteAdapter,
  SqliteDialect,
} from "kysely"
import { KyselyAdapter } from "../src"
import type { Database } from "../src/database"
import { createPool } from "mysql2"
import { DataTypeExpression } from "kysely/dist/cjs/parser/data-type-parser"
import SqliteDatabase from "better-sqlite3"

type BuiltInDialect = "postgres" | "mysql" | "sqlite"

const POOL_SIZE = 20
const DIALECT_CONFIGS = {
  postgres: {
    host: "localhost",
    database: "kysely_test",
    user: "kysely",
    port: 5434,
    max: POOL_SIZE,
  },
  mysql: {
    database: "kysely_test",
    host: "localhost",
    user: "kysely",
    password: "kysely",
    port: 3308,
    supportBigNumbers: true,
    bigNumberStrings: true,
    connectionLimit: POOL_SIZE,
  },
  sqlite: {
    databasePath: ":memory:",
  },
} as const

async function dropDatabase(db: Kysely<Database>): Promise<void> {
  await db.schema.dropTable("Account").ifExists().execute()
  await db.schema.dropTable("Session").ifExists().execute()
  await db.schema.dropTable("User").ifExists().execute()
  await db.schema.dropTable("VerificationToken").ifExists().execute()
}

export function createTableWithId(
  schema: SchemaModule,
  dialect: BuiltInDialect,
  tableName: string
) {
  const builder = schema.createTable(tableName)

  if (dialect === "postgres") {
    return builder.addColumn("id", "uuid", (col) =>
      col.primaryKey().defaultTo(sql`gen_random_uuid()`)
    )
  } else if (dialect === "mysql") {
    return builder.addColumn("id", "varchar(36)", (col) =>
      col.primaryKey().defaultTo(sql`(UUID())`)
    )
  } else {
    return builder.addColumn("id", "integer", (col) =>
      col.autoIncrement().primaryKey()
    )
  }
}

async function createDatabase(
  db: Kysely<Database>,
  dialect: BuiltInDialect
): Promise<void> {
  const defaultTimestamp = {
    postgres: sql`NOW()`,
    mysql: sql`NOW(3)`,
    sqlite: sql`CURRENT_TIMESTAMP`,
  }[dialect]
  const uuidColumnType: DataTypeExpression =
    dialect === "mysql" ? "varchar(36)" : "uuid"
  const dateColumnType: DataTypeExpression =
    dialect === "mysql" ? sql`DATETIME(3)` : "timestamptz"

  await dropDatabase(db)

  await createTableWithId(db.schema, dialect, "User")
    .addColumn("name", "varchar(255)")
    .addColumn("email", "varchar(255)", (col) => col.unique())
    .addColumn("emailVerified", dateColumnType, (col) =>
      col.defaultTo(defaultTimestamp)
    )
    .addColumn("image", "varchar(255)")
    .execute()

  let createAccountTable = createTableWithId(db.schema, dialect, "Account")
    .addColumn("userId", uuidColumnType, (col) =>
      col.references("User.id").onDelete("cascade").notNull()
    )
    .addColumn("type", "varchar(255)", (col) => col.notNull())
    .addColumn("provider", "varchar(255)", (col) => col.notNull())
    .addColumn("providerAccountId", "varchar(255)", (col) => col.notNull())
    .addColumn("refresh_token", "varchar(255)")
    .addColumn("access_token", "varchar(255)")
    .addColumn("expires_at", "bigint")
    .addColumn("token_type", "varchar(255)")
    .addColumn("scope", "varchar(255)")
    .addColumn("id_token", "varchar(255)")
    .addColumn("session_state", "varchar(255)")
    .addColumn("oauth_token_secret", "varchar(255)")
    .addColumn("oauth_token", "varchar(255)")
  if (dialect === "mysql")
    createAccountTable = createAccountTable.addForeignKeyConstraint(
      "Account_userId_fk",
      ["userId"],
      "User",
      ["id"],
      (cb) => cb.onDelete("cascade")
    )
  await createAccountTable.execute()

  let createSessionTable = createTableWithId(db.schema, dialect, "Session")
    .addColumn("userId", uuidColumnType, (col) =>
      col.references("User.id").onDelete("cascade").notNull()
    )
    .addColumn("sessionToken", "varchar(255)", (col) => col.notNull().unique())
    .addColumn("expires", dateColumnType, (col) => col.notNull())

  if (dialect === "mysql")
    createSessionTable = createSessionTable.addForeignKeyConstraint(
      "Session_userId_fk",
      ["userId"],
      "User",
      ["id"],
      (cb) => cb.onDelete("cascade")
    )
  await createSessionTable.execute()

  await db.schema
    .createTable("VerificationToken")
    .addColumn("identifier", "varchar(255)", (col) => col.notNull())
    .addColumn("token", "varchar(255)", (col) => col.notNull().unique())
    .addColumn("expires", dateColumnType, (col) => col.notNull())
    .execute()

  await db.schema
    .createIndex("Account_userId_index")
    .on("Account")
    .column("userId")
    .execute()
}

const runDialectBasicTests = (
  db: Kysely<Database>,
  dialect: BuiltInDialect
) => {
  const datesStoredAsISOStrings =
    db.getExecutor().adapter instanceof SqliteAdapter

  runBasicTests({
    adapter: KyselyAdapter(db),
    db: {
      async connect() {
        await dropDatabase(db)
        await createDatabase(db, dialect)
      },
      async disconnect() {
        await db.destroy()
      },
      async user(userId) {
        const user =
          (await db
            .selectFrom("User")
            .selectAll()
            .where("id", "=", userId)
            .executeTakeFirst()) ?? null
        if (datesStoredAsISOStrings && user?.emailVerified)
          user.emailVerified = new Date(user.emailVerified)
        return user
      },
      async account({ provider, providerAccountId }) {
        const result = await db
          .selectFrom("Account")
          .selectAll()
          .where("provider", "=", provider)
          .where("providerAccountId", "=", providerAccountId)
          .executeTakeFirst()
        if (!result) return null
        const { oauth_token, oauth_token_secret, ...account } = result
        if (typeof account.expires_at === "string")
          account.expires_at = Number(account.expires_at)
        return account
      },
      async session(sessionToken) {
        const session =
          (await db
            .selectFrom("Session")
            .selectAll()
            .where("sessionToken", "=", sessionToken)
            .executeTakeFirst()) ?? null
        if (datesStoredAsISOStrings && session?.expires)
          session.expires = new Date(session.expires)
        return session
      },
      async verificationToken({ identifier, token }) {
        const verificationToken = await db
          .selectFrom("VerificationToken")
          .selectAll()
          .where("identifier", "=", identifier)
          .where("token", "=", token)
          .executeTakeFirstOrThrow()
        if (datesStoredAsISOStrings)
          verificationToken.expires = new Date(verificationToken.expires)
        return verificationToken
      },
    },
  })
}

describe("Testing PostgresDialect", () => {
  const db = new Kysely<Database>({
    dialect: new PostgresDialect({
      pool: new Pool(DIALECT_CONFIGS.postgres),
    }),
  })
  runDialectBasicTests(db, "postgres")
})

describe("Testing MysqlDialect", () => {
  const db = new Kysely<Database>({
    dialect: new MysqlDialect({
      pool: createPool(DIALECT_CONFIGS.mysql),
    }),
  })
  runDialectBasicTests(db, "mysql")
})

describe("Testing SqliteDialect", () => {
  const db = new Kysely<Database>({
    dialect: new SqliteDialect({
      database: async () =>
        new SqliteDatabase(DIALECT_CONFIGS.sqlite.databasePath),
    }),
  })
  runDialectBasicTests(db, "sqlite")
})
