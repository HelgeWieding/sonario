-- Rename 'new' status to 'untriaged' in the status enum
ALTER TYPE "public"."status" RENAME VALUE 'new' TO 'untriaged';--> statement-breakpoint
-- Update the default value for the status column
ALTER TABLE "feature_requests" ALTER COLUMN "status" SET DEFAULT 'untriaged';
