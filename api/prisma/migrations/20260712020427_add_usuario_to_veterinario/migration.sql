/*
  Warnings:

  - Added the required column `vet_fkusuario` to the `veterinario` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "veterinario" ADD COLUMN     "vet_fkusuario" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "veterinario" ADD CONSTRAINT "veterinario_vet_fkusuario_fkey" FOREIGN KEY ("vet_fkusuario") REFERENCES "user"("usr_id") ON DELETE CASCADE ON UPDATE CASCADE;
