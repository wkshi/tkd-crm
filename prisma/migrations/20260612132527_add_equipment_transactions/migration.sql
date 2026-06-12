-- CreateEnum
CREATE TYPE "EquipmentTransactionType" AS ENUM ('in', 'out', 'adjust');

-- CreateTable
CREATE TABLE "equipment_transactions" (
    "id" TEXT NOT NULL,
    "equipment_id" TEXT NOT NULL,
    "type" "EquipmentTransactionType" NOT NULL,
    "quantity" INTEGER NOT NULL,
    "reason" TEXT,
    "operator" TEXT,
    "related_student_id" TEXT,
    "related_coach_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "equipment_transactions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "equipment_transactions_equipment_id_idx" ON "equipment_transactions"("equipment_id");

-- CreateIndex
CREATE INDEX "equipment_transactions_created_at_idx" ON "equipment_transactions"("created_at");

-- CreateIndex
CREATE INDEX "equipment_transactions_type_idx" ON "equipment_transactions"("type");

-- AddForeignKey
ALTER TABLE "equipment_transactions" ADD CONSTRAINT "equipment_transactions_equipment_id_fkey" FOREIGN KEY ("equipment_id") REFERENCES "equipment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "equipment_transactions" ADD CONSTRAINT "equipment_transactions_related_student_id_fkey" FOREIGN KEY ("related_student_id") REFERENCES "students"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "equipment_transactions" ADD CONSTRAINT "equipment_transactions_related_coach_id_fkey" FOREIGN KEY ("related_coach_id") REFERENCES "coaches"("id") ON DELETE SET NULL ON UPDATE CASCADE;
