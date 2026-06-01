import { zValidator } from "@hono/zod-validator";
import { asc, eq } from "drizzle-orm";
import { Hono } from "hono";
import { stream } from "hono/streaming";
import { z } from "zod";
import { runAgent } from "../agent/runner";
import { db } from "../db/client";
import { itinerary, messages, trips } from "../db/schema";

const router = new Hono();

const CreateTripSchema = z.object({
  origin: z.string().min(1),
  destination: z.string().min(1),
  destCode: z.string().min(2).max(4),
  dateMode: z.enum(["exact", "flexible"]),
  dateLabel: z.string().min(1),
  tripDays: z.number().int().min(1).max(30),
  travellers: z.number().int().min(1).max(20),
  budgetGbp: z.number().int().min(0),
  interests: z.array(z.string()).min(1),
});

router.post("/", zValidator("json", CreateTripSchema), async (c) => {
  try {
    const body = c.req.valid("json");
    const [trip] = await db.insert(trips).values(body).returning();
    await db.insert(itinerary).values({ tripId: trip.id });
    return c.json({ tripId: trip.id }, 201);
  } catch (error) {
    console.error(error);
    return c.json({ error: "Failed to create trip" }, 500);
  }
});

router.get("/:id", async (c) => {
  const id = c.req.param("id");
  const trip = await db.query.trips.findFirst({ where: eq(trips.id, id) });
  if (!trip) return c.json({ error: "Not found" }, 404);
  const itin = await db.query.itinerary.findFirst({
    where: eq(itinerary.tripId, id),
  });
  return c.json({ trip, itinerary: itin });
});

router.post("/:id/messages", async (c) => {
  const tripId = c.req.param("id");
  const body = await c.req.json<{ message: string }>();
  const userMessage = body.message?.trim();
  if (!userMessage) return c.json({ error: "message required" }, 400);

  const trip = await db.query.trips.findFirst({ where: eq(trips.id, tripId) });
  if (!trip) return c.json({ error: "Trip not found" }, 404);

  await db
    .insert(messages)
    .values({ tripId, role: "user", content: userMessage });

  const history = await db.query.messages.findMany({
    where: eq(messages.tripId, tripId),
    orderBy: [asc(messages.createdAt)],
  });

  c.header("Content-Type", "text/event-stream");
  c.header("Cache-Control", "no-cache");
  c.header("Connection", "keep-alive");
  c.header("X-Accel-Buffering", "no");

  return stream(c, async (s) => {
    const send = (event: string, data: unknown) => {
      s.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
    };
    try {
      await runAgent({ trip, history, send, tripId });
    } catch (err) {
      console.error('[route] agent error:', err)
      send("error", {
        message: err instanceof Error ? err.message : "Unknown error",
      });
    }
    send("done", {});
  });
});

export default router;
