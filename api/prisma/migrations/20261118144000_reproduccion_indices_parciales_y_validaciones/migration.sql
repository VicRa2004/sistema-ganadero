-- CreateEnum
CREATE TYPE "TipoEventoReproductivo" AS ENUM ('MONTA', 'INSEMINACION', 'DIAGNOSTICO_GESTACION', 'PARTO', 'DESTETE', 'ABORTO');

-- CreateEnum
CREATE TYPE "ResultadoDiagnostico" AS ENUM ('POSITIVO', 'NEGATIVO');

-- AlterEnum
ALTER TYPE "TipoNotificacion" ADD VALUE 'PARTO_PROXIMO';

-- DropForeignKey
ALTER TABLE "aplicacion_sanitaria" DROP CONSTRAINT "aplicacion_sanitaria_aps_fkganado_fkey";

-- DropForeignKey
ALTER TABLE "tratamiento_medico" DROP CONSTRAINT "tratamiento_medico_trt_fkganado_fkey";

-- AlterTable
ALTER TABLE "ganado" ADD COLUMN     "gan_fkparto_evento" INTEGER;

-- CreateTable
CREATE TABLE "evento_reproductivo" (
    "evr_id" SERIAL NOT NULL,
    "evr_fkhembra" INTEGER NOT NULL,
    "evr_fkmacho" INTEGER,
    "evr_tipo" "TipoEventoReproductivo" NOT NULL,
    "evr_fecha" TIMESTAMP(3) NOT NULL,
    "evr_resultado" "ResultadoDiagnostico",
    "evr_fecha_probable_parto" TIMESTAMP(3),
    "evr_observaciones" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "evento_reproductivo_pkey" PRIMARY KEY ("evr_id")
);

-- CreateIndex
CREATE INDEX "evento_reproductivo_evr_fkhembra_evr_fecha_idx" ON "evento_reproductivo"("evr_fkhembra", "evr_fecha");

-- CreateIndex
CREATE INDEX "evento_reproductivo_evr_fkmacho_idx" ON "evento_reproductivo"("evr_fkmacho");

-- CreateIndex
CREATE INDEX "evento_reproductivo_evr_tipo_idx" ON "evento_reproductivo"("evr_tipo");

-- CreateIndex
CREATE INDEX "evento_reproductivo_evr_fecha_probable_parto_idx" ON "evento_reproductivo"("evr_fecha_probable_parto");

-- CreateIndex
CREATE INDEX "evento_reproductivo_deleted_at_idx" ON "evento_reproductivo"("deleted_at");

-- AddForeignKey
ALTER TABLE "ganado" ADD CONSTRAINT "ganado_gan_fkparto_evento_fkey" FOREIGN KEY ("gan_fkparto_evento") REFERENCES "evento_reproductivo"("evr_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "aplicacion_sanitaria" ADD CONSTRAINT "aplicacion_sanitaria_aps_fkganado_fkey" FOREIGN KEY ("aps_fkganado") REFERENCES "ganado"("gan_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tratamiento_medico" ADD CONSTRAINT "tratamiento_medico_trt_fkganado_fkey" FOREIGN KEY ("trt_fkganado") REFERENCES "ganado"("gan_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "evento_reproductivo" ADD CONSTRAINT "evento_reproductivo_evr_fkhembra_fkey" FOREIGN KEY ("evr_fkhembra") REFERENCES "ganado"("gan_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "evento_reproductivo" ADD CONSTRAINT "evento_reproductivo_evr_fkmacho_fkey" FOREIGN KEY ("evr_fkmacho") REFERENCES "ganado"("gan_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Validar CHECK constraints creados con NOT VALID en 20261028120000
ALTER TABLE "tratamiento_medico" VALIDATE CONSTRAINT "tratamiento_medico_fechas_chk";
ALTER TABLE "tratamiento_medico" VALIDATE CONSTRAINT "tratamiento_medico_dosis_chk";
ALTER TABLE "aplicacion_sanitaria" VALIDATE CONSTRAINT "aplicacion_sanitaria_dosis_chk";

-- Índices parciales de rendimiento sobre registros activos (WHERE deleted_at IS NULL)
CREATE INDEX "ganado_activos_terreno_baja_idx" ON "ganado"("gan_fkterreno", "gan_fecha_baja") WHERE "deleted_at" IS NULL;
CREATE INDEX "ganado_activos_raza_nacimiento_idx" ON "ganado"("gan_fkraza", "gan_fecha_nacimiento") WHERE "deleted_at" IS NULL AND "gan_fecha_baja" IS NULL;
CREATE INDEX "ganado_activos_padre_idx" ON "ganado"("gan_fkpadre") WHERE "deleted_at" IS NULL AND "gan_fkpadre" IS NOT NULL;
CREATE INDEX "ganado_activos_madre_idx" ON "ganado"("gan_fkmadre") WHERE "deleted_at" IS NULL AND "gan_fkmadre" IS NOT NULL;
CREATE INDEX "insumo_activos_usuario_tipo_idx" ON "insumo"("ins_fkusuario", "ins_tipo") WHERE "deleted_at" IS NULL;
CREATE INDEX "insumo_activos_caducidad_idx" ON "insumo"("ins_fecha_caducidad") WHERE "deleted_at" IS NULL;
CREATE INDEX "terreno_activos_usuario_idx" ON "terreno"("terr_fkusuario") WHERE "deleted_at" IS NULL;
CREATE INDEX "propietario_activos_usuario_idx" ON "propietario"("prop_fkusuario") WHERE "deleted_at" IS NULL;
CREATE INDEX "veterinario_activos_usuario_idx" ON "veterinario"("vet_fkusuario") WHERE "deleted_at" IS NULL;
CREATE INDEX "sesion_sanitaria_activas_vet_fecha_idx" ON "sesion_sanitaria"("ses_fkveterinario", "ses_fecha") WHERE "deleted_at" IS NULL;
CREATE INDEX "sesion_sanitaria_activas_estado_fecha_idx" ON "sesion_sanitaria"("ses_estado", "ses_fecha") WHERE "deleted_at" IS NULL;
CREATE INDEX "tratamiento_medico_activos_ganado_idx" ON "tratamiento_medico"("trt_fkganado", "trt_activo") WHERE "deleted_at" IS NULL;
CREATE INDEX "tratamiento_medico_activos_fin_idx" ON "tratamiento_medico"("trt_activo", "trt_fecha_fin") WHERE "deleted_at" IS NULL;
CREATE INDEX "plan_sanitario_activos_usuario_idx" ON "plan_sanitario"("pln_fkusuario", "pln_activo") WHERE "deleted_at" IS NULL;
CREATE INDEX "aplicacion_sanitaria_activas_ganado_idx" ON "aplicacion_sanitaria"("aps_fkganado") WHERE "deleted_at" IS NULL;
CREATE INDEX "evento_reproductivo_activos_hembra_fecha_idx" ON "evento_reproductivo"("evr_fkhembra", "evr_fecha") WHERE "deleted_at" IS NULL;
CREATE INDEX "evento_reproductivo_activos_parto_probable_idx" ON "evento_reproductivo"("evr_fecha_probable_parto") WHERE "deleted_at" IS NULL AND "evr_fecha_probable_parto" IS NOT NULL;
