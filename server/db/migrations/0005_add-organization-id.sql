-- Add organizationId column to products table for Clerk Organizations support
ALTER TABLE "products" ADD COLUMN "organization_id" text;

-- Create index for efficient organization-based queries
CREATE INDEX "products_organization_id_idx" ON "products" ("organization_id");
