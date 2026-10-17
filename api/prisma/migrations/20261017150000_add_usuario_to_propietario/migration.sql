/*
  Warnings:

  - Added the required column `prop_fkusuario` to the `propietario` table. Los registros existentes se
    asignan al dueño del terreno donde tienen más ganado; si no tienen ganado, al primer usuario.

*/
-- AlterTable
ALTER TABLE "propietario" ADD COLUMN     "prop_fkusuario" INTEGER;

-- Backfill 1: dueño del terreno con más cabezas de ese propietario
UPDATE "propietario" p
SET "prop_fkusuario" = sub."terr_fkusuario"
FROM (
  SELECT DISTINCT ON (g."gan_fkpropietario")
    g."gan_fkpropietario" AS prop_id,
    t."terr_fkusuario"
  FROM "ganado" g
  JOIN "terreno" t ON t."terr_id" = g."gan_fkterreno"
  GROUP BY g."gan_fkpropietario", t."terr_fkusuario"
  ORDER BY g."gan_fkpropietario", COUNT(*) DESC, t."terr_fkusuario" ASC
) sub
WHERE sub.prop_id = p."prop_id" AND p."prop_fkusuario" IS NULL;

-- Backfill 2: propietarios sin ganado, al primer usuario
UPDATE "propietario"
SET "prop_fkusuario" = (SELECT "usr_id" FROM "user" ORDER BY "usr_id" ASC LIMIT 1)
WHERE "prop_fkusuario" IS NULL;

-- Make column NOT NULL
ALTER TABLE "propietario" ALTER COLUMN "prop_fkusuario" SET NOT NULL;

-- CreateIndex
CREATE INDEX "propietario_prop_fkusuario_idx" ON "propietario"("prop_fkusuario");

-- AddForeignKey
ALTER TABLE "propietario" ADD CONSTRAINT "propietario_prop_fkusuario_fkey" FOREIGN KEY ("prop_fkusuario") REFERENCES "user"("usr_id") ON DELETE CASCADE ON UPDATE CASCADE;
