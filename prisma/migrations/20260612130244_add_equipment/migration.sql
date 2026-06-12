-- CreateEnum
CREATE TYPE "EquipmentCategory" AS ENUM ('uniform', 'gear', 'belt', 'pad', 'accessory', 'other');

-- CreateTable
CREATE TABLE "equipment" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" "EquipmentCategory" NOT NULL DEFAULT 'gear',
    "specification" TEXT,
    "current_stock" INTEGER NOT NULL DEFAULT 0,
    "min_stock" INTEGER NOT NULL DEFAULT 0,
    "status" "Status" NOT NULL DEFAULT 'active',
    "remark" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "equipment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "equipment_name_idx" ON "equipment"("name");

-- CreateIndex
CREATE INDEX "equipment_category_idx" ON "equipment"("category");

-- CreateIndex
CREATE INDEX "equipment_status_idx" ON "equipment"("status");
