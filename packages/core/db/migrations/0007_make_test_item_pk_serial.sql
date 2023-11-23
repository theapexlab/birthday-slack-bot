ALTER TABLE "testItems" RENAME COLUMN "id" TO "test_id";
ALTER TABLE "testItems" DROP CONSTRAINT "testItems_pkey";
ALTER TABLE "testItems" ADD COLUMN "id" SERIAL PRIMARY KEY;
