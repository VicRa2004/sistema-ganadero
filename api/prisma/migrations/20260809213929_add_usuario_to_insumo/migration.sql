/*
  Warnings:

  - Added the required column `ins_fkusuario` to the `insumo` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "insumo" ADD COLUMN     "ins_fkusuario" INTEGER;

-- Populate existing rows with min usr_id if table insumo is not empty
UPDATE "insumo" 
SET "ins_fkusuario" = (SELECT "usr_id" FROM "user" ORDER BY "usr_id" ASC LIMIT 1) 
WHERE "ins_fkusuario" IS NULL;

-- Make column NOT NULL
ALTER TABLE "insumo" ALTER COLUMN "ins_fkusuario" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "insumo" ADD CONSTRAINT "insumo_ins_fkusuario_fkey" FOREIGN KEY ("ins_fkusuario") REFERENCES "user"("usr_id") ON DELETE CASCADE ON UPDATE CASCADE;
