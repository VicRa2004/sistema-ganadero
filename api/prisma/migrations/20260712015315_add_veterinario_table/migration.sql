/*
  Warnings:

  - You are about to drop the column `ses_veterinario` on the `sesion_sanitaria` table. All the data in the column will be lost.
  - Added the required column `rnch_fkusuario` to the `rancho` table without a default value. This is not possible if the table is not empty.
  - Added the required column `ses_fkveterinario` to the `sesion_sanitaria` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "rancho" ADD COLUMN     "rnch_fkusuario" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "sesion_sanitaria" DROP COLUMN "ses_veterinario",
ADD COLUMN     "ses_fkveterinario" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "tratamiento_medico" ADD COLUMN     "trt_fkveterinario" INTEGER;

-- CreateTable
CREATE TABLE "veterinario" (
    "vet_id" SERIAL NOT NULL,
    "vet_nombre" VARCHAR(255) NOT NULL,
    "vet_telefono" VARCHAR(20) NOT NULL,
    "vet_cedula" VARCHAR(50) NOT NULL,
    "vet_especialidad" VARCHAR(100),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "veterinario_pkey" PRIMARY KEY ("vet_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "veterinario_vet_cedula_key" ON "veterinario"("vet_cedula");

-- AddForeignKey
ALTER TABLE "rancho" ADD CONSTRAINT "rancho_rnch_fkusuario_fkey" FOREIGN KEY ("rnch_fkusuario") REFERENCES "user"("usr_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sesion_sanitaria" ADD CONSTRAINT "sesion_sanitaria_ses_fkveterinario_fkey" FOREIGN KEY ("ses_fkveterinario") REFERENCES "veterinario"("vet_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tratamiento_medico" ADD CONSTRAINT "tratamiento_medico_trt_fkveterinario_fkey" FOREIGN KEY ("trt_fkveterinario") REFERENCES "veterinario"("vet_id") ON DELETE RESTRICT ON UPDATE CASCADE;
