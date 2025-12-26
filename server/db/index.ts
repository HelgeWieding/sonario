import { drizzle } from 'drizzle-orm/node-postgres'
import pg from 'pg'
import * as schema from './schema'

const { Pool } = pg

let db: ReturnType<typeof drizzle<typeof schema>> | null = null

export function getDb() {
  if (!db) {
    const config = useRuntimeConfig()
    const pool = new Pool({
      connectionString: config.databaseUrl,
    })
    db = drizzle(pool, { schema })
  }
  return db
}

export { schema }
