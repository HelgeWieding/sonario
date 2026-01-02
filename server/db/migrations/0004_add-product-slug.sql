-- Backfill slugs for existing products
UPDATE "products" SET "slug" = LOWER(REGEXP_REPLACE(REGEXP_REPLACE("name", '[^a-zA-Z0-9\s-]', '', 'g'), '\s+', '-', 'g')) WHERE "slug" IS NULL;--> statement-breakpoint
UPDATE "products" SET "slug" = 'product' WHERE "slug" IS NULL OR "slug" = '';--> statement-breakpoint
-- Make slug column NOT NULL
ALTER TABLE "products" ALTER COLUMN "slug" SET NOT NULL;