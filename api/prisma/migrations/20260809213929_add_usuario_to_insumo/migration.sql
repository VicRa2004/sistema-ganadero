/*
  Warnings:

  - Added the required column `ins_fkusuario` to the `insumo` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "insumo" ADD COLUMN     "ins_fkusuario" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "insumo" ADD CONSTRAINT "insumo_ins_fkusuario_fkey" FOREIGN KEY ("ins_fkusuario") REFERENCES "user"("usr_id") ON DELETE CASCADE ON UPDATE CASCADE;
