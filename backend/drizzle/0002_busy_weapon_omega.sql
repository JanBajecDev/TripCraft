ALTER TABLE "destinations" DROP CONSTRAINT "destinations_pkey";
ALTER TABLE "destinations" ADD CONSTRAINT "destinations_id_type_pk" PRIMARY KEY("id","type");
