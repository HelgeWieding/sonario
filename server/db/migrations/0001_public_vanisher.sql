-- Delete all existing contacts (they have user_id, need product_id now)
TRUNCATE TABLE "contacts" CASCADE;
--> statement-breakpoint
ALTER TABLE "contacts" DROP CONSTRAINT "contacts_user_id_users_id_fk";
--> statement-breakpoint
DROP INDEX "contacts_user_email_idx";--> statement-breakpoint
ALTER TABLE "contacts" ADD COLUMN "product_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "contacts" ADD CONSTRAINT "contacts_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "contacts_product_email_idx" ON "contacts" USING btree ("product_id","email");--> statement-breakpoint
ALTER TABLE "contacts" DROP COLUMN "user_id";