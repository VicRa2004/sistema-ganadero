/*
  Warnings:

  - You are about to drop the column `gan_fkrancho` on the `ganado` table. All the data in the column will be lost.
  - You are about to drop the `rancho` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `gan_fkterreno` to the `ganado` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "ganado" DROP CONSTRAINT "ganado_gan_fkrancho_fkey";

-- DropForeignKey
ALTER TABLE "rancho" DROP CONSTRAINT "rancho_rnch_fkusuario_fkey";

-- AlterTable
ALTER TABLE "ganado" DROP COLUMN "gan_fkrancho",
ADD COLUMN     "gan_fkterreno" INTEGER NOT NULL;

-- DropTable
DROP TABLE "rancho";

-- CreateTable
CREATE TABLE "terreno" (
    "terr_id" SERIAL NOT NULL,
    "terr_nombre" VARCHAR(150) NOT NULL,
    "terr_ubicacion" VARCHAR(255) NOT NULL,
    "terr_extension" DOUBLE PRECISION NOT NULL,
    "terr_capacidad_max" INTEGER NOT NULL,
    "terr_imagen" VARCHAR(255),
    "terr_fkusuario" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "terreno_pkey" PRIMARY KEY ("terr_id")
);

-- AddForeignKey
ALTER TABLE "terreno" ADD CONSTRAINT "terreno_terr_fkusuario_fkey" FOREIGN KEY ("terr_fkusuario") REFERENCES "user"("usr_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ganado" ADD CONSTRAINT "ganado_gan_fkterreno_fkey" FOREIGN KEY ("gan_fkterreno") REFERENCES "terreno"("terr_id") ON DELETE RESTRICT ON UPDATE CASCADE;
