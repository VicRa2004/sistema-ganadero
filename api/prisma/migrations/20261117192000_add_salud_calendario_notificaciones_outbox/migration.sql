-- CreateEnum
CREATE TYPE "EstadoSesionSanitaria" AS ENUM ('PROGRAMADA', 'REALIZADA', 'CANCELADA');

-- CreateEnum
CREATE TYPE "TipoNotificacion" AS ENUM ('STOCK_BAJO', 'INSUMO_POR_CADUCAR', 'TRATAMIENTO_POR_VENCER', 'SESION_PROGRAMADA', 'VACUNA_PENDIENTE');

-- AlterTable
ALTER TABLE "insumo" ADD COLUMN     "ins_periodo_retiro_dias" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "sesion_sanitaria" ADD COLUMN     "ses_estado" "EstadoSesionSanitaria" NOT NULL DEFAULT 'REALIZADA',
ADD COLUMN     "ses_fkplan_sanitario" INTEGER;

-- CreateTable
CREATE TABLE "plan_sanitario" (
    "pln_id" SERIAL NOT NULL,
    "pln_nombre" VARCHAR(150) NOT NULL,
    "pln_descripcion" TEXT NOT NULL,
    "pln_frecuencia_dias" INTEGER NOT NULL,
    "pln_dosis_animal" DECIMAL(12,3) NOT NULL,
    "pln_fkveterinario" INTEGER NOT NULL,
    "pln_fkinsumo" INTEGER NOT NULL,
    "pln_fkterreno" INTEGER,
    "pln_fkraza" INTEGER,
    "pln_edad_minima_meses" INTEGER,
    "pln_proxima_ejecucion" TIMESTAMP(3) NOT NULL,
    "pln_activo" BOOLEAN NOT NULL DEFAULT true,
    "pln_fkusuario" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "plan_sanitario_pkey" PRIMARY KEY ("pln_id")
);

-- CreateTable
CREATE TABLE "notificacion" (
    "not_id" SERIAL NOT NULL,
    "not_fkusuario" INTEGER NOT NULL,
    "not_tipo" "TipoNotificacion" NOT NULL,
    "not_titulo" VARCHAR(200) NOT NULL,
    "not_cuerpo" TEXT NOT NULL,
    "not_ref_tipo" VARCHAR(50),
    "not_ref_id" INTEGER,
    "not_clave_dedup" VARCHAR(160) NOT NULL,
    "not_leida_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notificacion_pkey" PRIMARY KEY ("not_id")
);

-- CreateTable
CREATE TABLE "preferencia_notificacion" (
    "prf_id" SERIAL NOT NULL,
    "prf_fkusuario" INTEGER NOT NULL,
    "prf_tipo" "TipoNotificacion" NOT NULL,
    "prf_in_app" BOOLEAN NOT NULL DEFAULT true,
    "prf_email" BOOLEAN NOT NULL DEFAULT false,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "preferencia_notificacion_pkey" PRIMARY KEY ("prf_id")
);

-- CreateTable
CREATE TABLE "evento_outbox" (
    "out_id" SERIAL NOT NULL,
    "out_event_name" VARCHAR(120) NOT NULL,
    "out_payload" JSONB NOT NULL,
    "out_procesado_at" TIMESTAMP(3),
    "out_error" TEXT,
    "out_intentos" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "evento_outbox_pkey" PRIMARY KEY ("out_id")
);

-- CreateIndex
CREATE INDEX "plan_sanitario_pln_fkusuario_idx" ON "plan_sanitario"("pln_fkusuario");

-- CreateIndex
CREATE INDEX "plan_sanitario_pln_activo_pln_proxima_ejecucion_idx" ON "plan_sanitario"("pln_activo", "pln_proxima_ejecucion");

-- CreateIndex
CREATE INDEX "notificacion_not_fkusuario_not_leida_at_idx" ON "notificacion"("not_fkusuario", "not_leida_at");

-- CreateIndex
CREATE INDEX "notificacion_created_at_idx" ON "notificacion"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "notificacion_not_fkusuario_not_clave_dedup_key" ON "notificacion"("not_fkusuario", "not_clave_dedup");

-- CreateIndex
CREATE UNIQUE INDEX "preferencia_notificacion_prf_fkusuario_prf_tipo_key" ON "preferencia_notificacion"("prf_fkusuario", "prf_tipo");

-- CreateIndex
CREATE INDEX "evento_outbox_out_procesado_at_idx" ON "evento_outbox"("out_procesado_at");

-- CreateIndex
CREATE INDEX "sesion_sanitaria_ses_estado_idx" ON "sesion_sanitaria"("ses_estado");

-- CreateIndex
CREATE INDEX "sesion_sanitaria_ses_fkplan_sanitario_idx" ON "sesion_sanitaria"("ses_fkplan_sanitario");

-- AddForeignKey
ALTER TABLE "sesion_sanitaria" ADD CONSTRAINT "sesion_sanitaria_ses_fkplan_sanitario_fkey" FOREIGN KEY ("ses_fkplan_sanitario") REFERENCES "plan_sanitario"("pln_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "plan_sanitario" ADD CONSTRAINT "plan_sanitario_pln_fkusuario_fkey" FOREIGN KEY ("pln_fkusuario") REFERENCES "user"("usr_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "plan_sanitario" ADD CONSTRAINT "plan_sanitario_pln_fkveterinario_fkey" FOREIGN KEY ("pln_fkveterinario") REFERENCES "veterinario"("vet_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "plan_sanitario" ADD CONSTRAINT "plan_sanitario_pln_fkinsumo_fkey" FOREIGN KEY ("pln_fkinsumo") REFERENCES "insumo"("ins_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "plan_sanitario" ADD CONSTRAINT "plan_sanitario_pln_fkterreno_fkey" FOREIGN KEY ("pln_fkterreno") REFERENCES "terreno"("terr_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "plan_sanitario" ADD CONSTRAINT "plan_sanitario_pln_fkraza_fkey" FOREIGN KEY ("pln_fkraza") REFERENCES "raza"("raz_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notificacion" ADD CONSTRAINT "notificacion_not_fkusuario_fkey" FOREIGN KEY ("not_fkusuario") REFERENCES "user"("usr_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "preferencia_notificacion" ADD CONSTRAINT "preferencia_notificacion_prf_fkusuario_fkey" FOREIGN KEY ("prf_fkusuario") REFERENCES "user"("usr_id") ON DELETE CASCADE ON UPDATE CASCADE;

