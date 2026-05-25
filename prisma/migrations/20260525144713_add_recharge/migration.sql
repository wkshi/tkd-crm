/*
  Warnings:

  - You are about to drop the column `certificate_no` on the `gradings` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "gradings" DROP COLUMN "certificate_no";

-- CreateTable
CREATE TABLE "recharges" (
    "id" TEXT NOT NULL,
    "student_id" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "sessions" INTEGER NOT NULL,
    "duration_days" INTEGER NOT NULL,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "recharges_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "recharges_student_id_idx" ON "recharges"("student_id");

-- AddForeignKey
ALTER TABLE "recharges" ADD CONSTRAINT "recharges_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE CASCADE ON UPDATE CASCADE;
