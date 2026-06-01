import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'
import destinations from './routes/destinations'
import trips from './routes/trips'
import photo from './routes/photo'

const app = new Hono()

app.use('*', logger())
app.use('*', cors({
  origin: process.env.FRONTEND_URL ?? 'http://localhost:5173',
  allowHeaders: ['Content-Type'],
  allowMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
}))

app.route('/api/trips', trips)
app.route('/api/photo', photo)
app.route('/api/destinations', destinations)

app.get('/health', (c) => c.json({ ok: true }))

export default {
  port: Number(process.env.PORT ?? 3001),
  idleTimeout: 0,  // disable timeout — SSE streams can run for minutes
  fetch: app.fetch,
}
