CREATE TABLE IF NOT EXISTS "destinations" (
	"id" text PRIMARY KEY NOT NULL,
	"city" text NOT NULL,
	"country" text,
	"code" text NOT NULL,
	"note" text,
	"type" text NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL
);
