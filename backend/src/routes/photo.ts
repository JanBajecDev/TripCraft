import { Hono } from 'hono'
import { serpFetch } from '../lib/serp'

const router = new Hono()

// GET /api/photo?q=<hotel name city>
// Returns the first image URL from Google Images for the query
router.get('/', async (c) => {
  const q = c.req.query('q')
  if (!q) return c.json({ error: 'q required' }, 400)

  try {
    const data = await serpFetch({ engine: 'google_images', q, num: '5' }) as Record<string, unknown>
    const results = data.images_results as Record<string, unknown>[] | undefined
    const url = results?.[0]?.original ?? results?.[0]?.thumbnail
    if (!url) return c.json({ url: null })
    return c.json({ url })
  } catch (err) {
    console.error('[photo] error:', err)
    return c.json({ url: null })
  }
})

export default router
