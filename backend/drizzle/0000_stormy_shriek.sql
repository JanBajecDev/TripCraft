CREATE TABLE IF NOT EXISTS "itinerary" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"trip_id" uuid NOT NULL,
	"flights" jsonb,
	"hotel" jsonb,
	"days" jsonb,
	"restaurants" jsonb,
	"events" jsonb,
	"car_rental" jsonb,
	"budget" jsonb,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "itinerary_trip_id_unique" UNIQUE("trip_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "messages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"trip_id" uuid NOT NULL,
	"role" text NOT NULL,
	"content" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "trips" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"origin" text NOT NULL,
	"destination" text NOT NULL,
	"dest_code" text NOT NULL,
	"date_mode" text NOT NULL,
	"date_label" text NOT NULL,
	"trip_days" integer NOT NULL,
	"travellers" integer NOT NULL,
	"budget_gbp" integer NOT NULL,
	"interests" text[] NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "itinerary" ADD CONSTRAINT "itinerary_trip_id_trips_id_fk" FOREIGN KEY ("trip_id") REFERENCES "public"."trips"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "messages" ADD CONSTRAINT "messages_trip_id_trips_id_fk" FOREIGN KEY ("trip_id") REFERENCES "public"."trips"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
