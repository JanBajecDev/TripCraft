import { migrate } from 'drizzle-orm/postgres-js/migrator'
import postgres from 'postgres'
import { drizzle } from 'drizzle-orm/postgres-js'

const sql = postgres(process.env.DATABASE_URL!, { max: 1 })
const db = drizzle(sql)

await migrate(db, { migrationsFolder: './drizzle' })
console.log('Migrations done')
await sql.end()
