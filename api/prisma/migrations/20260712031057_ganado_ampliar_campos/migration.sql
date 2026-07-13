/*
  Warnings:

  - You are about to drop the column `gan_edad_meses` on the `ganado` table. All the data in the column will be lost.
  - Added the required column `gan_fecha_nacimiento` to the `ganado` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ganado" DROP COLUMN "gan_edad_meses",
ADD COLUMN     "gan_fecha_baja" TIMESTAMP(3),
ADD COLUMN     "gan_fecha_nacimiento" DATE NOT NULL,
ADD COLUMN     "gan_fkmadre" INTEGER,
ADD COLUMN     "gan_fkmotivo_baja" INTEGER,
ADD COLUMN     "gan_fkpadre" INTEGER,
ADD COLUMN     "gan_imagen" VARCHAR(255);

-- CreateTable
CREATE TABLE "motivo_baja" (
    "mtb_id" SERIAL NOT NULL,
    "mtb_nombre" VARCHAR(100) NOT NULL,
    "mtb_descripcion" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "motivo_baja_pkey" PRIMARY KEY ("mtb_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "motivo_baja_mtb_nombre_key" ON "motivo_baja"("mtb_nombre");

-- AddForeignKey
ALTER TABLE "ganado" ADD CONSTRAINT "ganado_gan_fkpadre_fkey" FOREIGN KEY ("gan_fkpadre") REFERENCES "ganado"("gan_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ganado" ADD CONSTRAINT "ganado_gan_fkmadre_fkey" FOREIGN KEY ("gan_fkmadre") REFERENCES "ganado"("gan_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ganado" ADD CONSTRAINT "ganado_gan_fkmotivo_baja_fkey" FOREIGN KEY ("gan_fkmotivo_baja") REFERENCES "motivo_baja"("mtb_id") ON DELETE RESTRICT ON UPDATE CASCADE;
