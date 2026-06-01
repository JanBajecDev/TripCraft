import { pgTable, text, integer, jsonb, timestamp, uuid } from 'drizzle-orm/pg-core'

export const trips = pgTable('trips', {
  id:          uuid('id').primaryKey().defaultRandom(),
  origin:      text('origin').notNull(),
  destination: text('destination').notNull(),
  destCode:    text('dest_code').notNull(),
  dateMode:    text('date_mode').notNull(),
  dateLabel:   text('date_label').notNull(),
  tripDays:    integer('trip_days').notNull(),
  travellers:  integer('travellers').notNull(),
  budgetGbp:   integer('budget_gbp').notNull(),
  interests:   text('interests').array().notNull(),
  createdAt:   timestamp('created_at').defaultNow().notNull(),
  updatedAt:   timestamp('updated_at').defaultNow().notNull(),
})

export const messages = pgTable('messages', {
  id:        uuid('id').primaryKey().defaultRandom(),
  tripId:    uuid('trip_id').notNull().references(() => trips.id, { onDelete: 'cascade' }),
  role:      text('role').notNull(),
  content:   text('content').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

export const itinerary = pgTable('itinerary', {
  id:          uuid('id').primaryKey().defaultRandom(),
  tripId:      uuid('trip_id').notNull().references(() => trips.id, { onDelete: 'cascade' }).unique(),
  flights:     jsonb('flights'),
  hotel:       jsonb('hotel'),
  days:        jsonb('days'),
  restaurants: jsonb('restaurants'),
  events:      jsonb('events'),
  carRental:   jsonb('car_rental'),
  budget:      jsonb('budget'),
  updatedAt:   timestamp('updated_at').defaultNow().notNull(),
})
