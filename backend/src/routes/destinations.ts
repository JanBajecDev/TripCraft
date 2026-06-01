import { and, asc, eq, ilike, or } from 'drizzle-orm'
import { Hono } from 'hono'
import { db } from '../db/client'
import { destinations } from '../db/schema'

const router = new Hono()

router.get('/', async (c) => {
  const type = c.req.query('type')
  const q = c.req.query('q')?.trim()

  if (type && type !== 'origin' && type !== 'destination') {
    return c.json({ error: 'Invalid type. Must be "origin" or "destination"' }, 400)
  }

  try {
    const conditions = []
    if (type) conditions.push(eq(destinations.type, type))
    if (q) conditions.push(or(ilike(destinations.city, `${q}%`), ilike(destinations.code, `${q}%`)))

    const where = conditions.length === 1
      ? conditions[0]
      : conditions.length > 1
        ? and(...conditions)
        : undefined

    const results = q
      ? await db.select().from(destinations).where(where).orderBy(asc(destinations.sortOrder)).limit(50)
      : await db.select().from(destinations).where(where).orderBy(asc(destinations.sortOrder))
    return c.json(results)
  } catch (error) {
    console.error('Failed to fetch destinations:', error)
    return c.json({ error: 'Failed to fetch destinations' }, 500)
  }
})

export default router
