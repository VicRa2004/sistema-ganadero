-- CreateTable
CREATE TABLE "pesaje" (
    "pes_id" SERIAL NOT NULL,
    "pes_fkganado" INTEGER NOT NULL,
    "pes_peso" DOUBLE PRECISION NOT NULL,
    "pes_fecha" TIMESTAMP(3) NOT NULL,
    "pes_observaciones" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pesaje_pkey" PRIMARY KEY ("pes_id")
);

-- CreateIndex
CREATE INDEX "pesaje_pes_fkganado_pes_fecha_idx" ON "pesaje"("pes_fkganado", "pes_fecha");

-- AddForeignKey
ALTER TABLE "pesaje" ADD CONSTRAINT "pesaje_pes_fkganado_fkey" FOREIGN KEY ("pes_fkganado") REFERENCES "ganado"("gan_id") ON DELETE CASCADE ON UPDATE CASCADE;


-- Historial inicial: un pesaje por animal existente con su peso actual
INSERT INTO "pesaje" ("pes_fkganado", "pes_peso", "pes_fecha")
SELECT "gan_id", "gan_peso", COALESCE("created_at", CURRENT_TIMESTAMP)
FROM "ganado"
WHERE "deleted_at" IS NULL;
