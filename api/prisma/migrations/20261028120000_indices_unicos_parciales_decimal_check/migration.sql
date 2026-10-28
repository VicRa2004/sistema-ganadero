-- DropIndex
DROP INDEX "ganado_gan_identificador_key";

-- DropIndex
DROP INDEX "raza_raz_nombre_key";

-- DropIndex
DROP INDEX "veterinario_vet_cedula_key";

-- AlterTable
ALTER TABLE "aplicacion_sanitaria" ALTER COLUMN "aps_dosis" SET DATA TYPE DECIMAL(12,3);

-- AlterTable
ALTER TABLE "insumo" ALTER COLUMN "ins_stock" SET DATA TYPE DECIMAL(12,3),
ALTER COLUMN "ins_stock_minimo" SET DATA TYPE DECIMAL(12,3);

-- AlterTable
ALTER TABLE "tratamiento_medico" ALTER COLUMN "trt_dosis_diaria" SET DATA TYPE DECIMAL(12,3);

-- CreateIndex
CREATE INDEX "ganado_gan_fkterreno_idx" ON "ganado"("gan_fkterreno");

-- CreateIndex
CREATE INDEX "ganado_gan_fkraza_idx" ON "ganado"("gan_fkraza");

-- CreateIndex
CREATE INDEX "ganado_gan_fkpropietario_idx" ON "ganado"("gan_fkpropietario");

-- CreateIndex
CREATE INDEX "ganado_gan_fecha_baja_idx" ON "ganado"("gan_fecha_baja");

-- CreateIndex
CREATE INDEX "ganado_deleted_at_idx" ON "ganado"("deleted_at");

-- CreateIndex
CREATE INDEX "insumo_ins_fkusuario_idx" ON "insumo"("ins_fkusuario");

-- CreateIndex
CREATE INDEX "insumo_ins_tipo_idx" ON "insumo"("ins_tipo");

-- CreateIndex
CREATE INDEX "insumo_deleted_at_idx" ON "insumo"("deleted_at");

-- CreateIndex
CREATE INDEX "refresh_token_rft_expires_at_idx" ON "refresh_token"("rft_expires_at");

-- CreateIndex
CREATE INDEX "sesion_sanitaria_ses_fecha_idx" ON "sesion_sanitaria"("ses_fecha");

-- CreateIndex
CREATE INDEX "sesion_sanitaria_ses_fkveterinario_idx" ON "sesion_sanitaria"("ses_fkveterinario");

-- CreateIndex
CREATE INDEX "sesion_sanitaria_ses_fkinsumo_idx" ON "sesion_sanitaria"("ses_fkinsumo");

-- CreateIndex
CREATE INDEX "terreno_terr_fkusuario_idx" ON "terreno"("terr_fkusuario");

-- CreateIndex
CREATE INDEX "tratamiento_medico_trt_fkganado_idx" ON "tratamiento_medico"("trt_fkganado");

-- CreateIndex
CREATE INDEX "tratamiento_medico_trt_activo_idx" ON "tratamiento_medico"("trt_activo");

-- CreateIndex
CREATE INDEX "tratamiento_medico_trt_fecha_fin_idx" ON "tratamiento_medico"("trt_fecha_fin");

-- CreateIndex
CREATE INDEX "veterinario_vet_fkusuario_idx" ON "veterinario"("vet_fkusuario");


-- Únicos solo entre registros activos: un arete, cédula o raza borrados (soft delete) se pueden reutilizar.
-- Prisma no modela índices parciales; `migrate diff` los ignora.
CREATE UNIQUE INDEX "ganado_gan_identificador_activo_key" ON "ganado"("gan_identificador") WHERE "deleted_at" IS NULL;
CREATE UNIQUE INDEX "raza_raz_nombre_activo_key" ON "raza"("raz_nombre") WHERE "deleted_at" IS NULL;
CREATE UNIQUE INDEX "veterinario_vet_cedula_activo_key" ON "veterinario"("vet_cedula") WHERE "deleted_at" IS NULL;

-- Invariantes de dosis y fechas. NOT VALID: se exigen a las filas nuevas sin fallar por datos históricos;
-- tras corregirlos, `ALTER TABLE ... VALIDATE CONSTRAINT`.
ALTER TABLE "tratamiento_medico" ADD CONSTRAINT "tratamiento_medico_fechas_chk" CHECK ("trt_fecha_fin" >= "trt_fecha_inicio") NOT VALID;
ALTER TABLE "tratamiento_medico" ADD CONSTRAINT "tratamiento_medico_dosis_chk" CHECK ("trt_dosis_diaria" > 0) NOT VALID;
ALTER TABLE "aplicacion_sanitaria" ADD CONSTRAINT "aplicacion_sanitaria_dosis_chk" CHECK ("aps_dosis" > 0) NOT VALID;
