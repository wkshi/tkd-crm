-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "EquipmentCategory" ADD VALUE 't_shirt';
ALTER TYPE "EquipmentCategory" ADD VALUE 'tracksuit';
ALTER TYPE "EquipmentCategory" ADD VALUE 'sneakers';
ALTER TYPE "EquipmentCategory" ADD VALUE 'backpack';
