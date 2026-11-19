-- CreateEnum
CREATE TYPE "TipoTransaccion" AS ENUM ('COMPRA', 'VENTA');

-- CreateEnum
CREATE TYPE "CategoriaGasto" AS ENUM ('ALIMENTO', 'MEDICINA', 'VETERINARIO', 'MANO_OBRA', 'MANTENIMIENTO', 'OTRO');

-- CreateEnum
CREATE TYPE "TipoMovimientoInsumo" AS ENUM ('ENTRADA', 'SALIDA', 'AJUSTE');

-- CreateEnum
CREATE TYPE "PropositoLote" AS ENUM ('ENGORDA', 'DESTETE', 'VIENTRES', 'RECRIA', 'LECHE', 'OTRO');

-- AlterEnum
ALTER TYPE "TipoNotificacion" ADD VALUE 'AUTONOMIA_ALIMENTO';

-- AlterTable
ALTER TABLE "ganado" ADD COLUMN     "gan_procedencia" VARCHAR(200);

-- AlterTable
ALTER TABLE "insumo" ADD COLUMN     "ins_costo_unitario" DECIMAL(12,2) NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "transaccion" (
    "trn_id" SERIAL NOT NULL,
    "trn_tipo" "TipoTransaccion" NOT NULL,
    "trn_fecha" TIMESTAMP(3) NOT NULL,
    "trn_contraparte" VARCHAR(200) NOT NULL,
    "trn_total" DECIMAL(14,2) NOT NULL,
    "trn_moneda" VARCHAR(10) NOT NULL DEFAULT 'MXN',
    "trn_documento" VARCHAR(150),
    "trn_documento_adjunto" VARCHAR(255),
    "trn_observaciones" TEXT,
    "trn_fkusuario" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "transaccion_pkey" PRIMARY KEY ("trn_id")
);

-- CreateTable
CREATE TABLE "transaccion_ganado" (
    "trg_id" SERIAL NOT NULL,
    "trg_fktransaccion" INTEGER NOT NULL,
    "trg_fkganado" INTEGER NOT NULL,
    "trg_precio" DECIMAL(14,2) NOT NULL,
    "trg_peso_registro" DOUBLE PRECISION NOT NULL,
    "trg_procedencia" VARCHAR(200),

    CONSTRAINT "transaccion_ganado_pkey" PRIMARY KEY ("trg_id")
);

-- CreateTable
CREATE TABLE "gasto" (
    "gas_id" SERIAL NOT NULL,
    "gas_categoria" "CategoriaGasto" NOT NULL,
    "gas_concepto" VARCHAR(200) NOT NULL,
    "gas_monto" DECIMAL(14,2) NOT NULL,
    "gas_fecha" TIMESTAMP(3) NOT NULL,
    "gas_fkterreno" INTEGER,
    "gas_fkganado" INTEGER,
    "gas_fklote" INTEGER,
    "gas_observaciones" TEXT,
    "gas_fkusuario" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "gasto_pkey" PRIMARY KEY ("gas_id")
);

-- CreateTable
CREATE TABLE "movimiento_insumo" (
    "mov_id" SERIAL NOT NULL,
    "mov_fkinsumo" INTEGER NOT NULL,
    "mov_tipo" "TipoMovimientoInsumo" NOT NULL,
    "mov_cantidad" DECIMAL(12,3) NOT NULL,
    "mov_delta" DECIMAL(12,3) NOT NULL,
    "mov_costo_unitario" DECIMAL(12,2),
    "mov_motivo" VARCHAR(255) NOT NULL,
    "mov_ref_tipo" VARCHAR(50),
    "mov_ref_id" INTEGER,
    "mov_fkganado" INTEGER,
    "mov_fkterreno" INTEGER,
    "mov_fklote" INTEGER,
    "mov_fkusuario" INTEGER NOT NULL,
    "mov_fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "movimiento_insumo_pkey" PRIMARY KEY ("mov_id")
);

-- CreateTable
CREATE TABLE "lote" (
    "lot_id" SERIAL NOT NULL,
    "lot_nombre" VARCHAR(150) NOT NULL,
    "lot_proposito" "PropositoLote" NOT NULL DEFAULT 'ENGORDA',
    "lot_descripcion" TEXT,
    "lot_fkterreno" INTEGER,
    "lot_activo" BOOLEAN NOT NULL DEFAULT true,
    "lot_fkusuario" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "lote_pkey" PRIMARY KEY ("lot_id")
);

-- CreateTable
CREATE TABLE "lote_ganado" (
    "lgn_fklote" INTEGER NOT NULL,
    "lgn_fkganado" INTEGER NOT NULL,
    "lgn_fecha_ingreso" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "lote_ganado_pkey" PRIMARY KEY ("lgn_fklote","lgn_fkganado")
);

-- CreateTable
CREATE TABLE "racion_alimentacion" (
    "rac_id" SERIAL NOT NULL,
    "rac_nombre" VARCHAR(150) NOT NULL,
    "rac_fkinsumo" INTEGER NOT NULL,
    "rac_fkterreno" INTEGER,
    "rac_fklote" INTEGER,
    "rac_cantidad_diaria_animal" DECIMAL(12,3) NOT NULL,
    "rac_dias_alerta_autonomia" INTEGER NOT NULL DEFAULT 7,
    "rac_activo" BOOLEAN NOT NULL DEFAULT true,
    "rac_observaciones" TEXT,
    "rac_fkusuario" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "racion_alimentacion_pkey" PRIMARY KEY ("rac_id")
);

-- CreateTable
CREATE TABLE "suministro_racion" (
    "sum_id" SERIAL NOT NULL,
    "sum_fkracion" INTEGER NOT NULL,
    "sum_fkinsumo" INTEGER NOT NULL,
    "sum_fkterreno" INTEGER,
    "sum_fklote" INTEGER,
    "sum_fecha" TIMESTAMP(3) NOT NULL,
    "sum_cantidad_animales" INTEGER NOT NULL,
    "sum_cantidad_total" DECIMAL(12,3) NOT NULL,
    "sum_costo_total" DECIMAL(14,2) NOT NULL,
    "sum_observaciones" TEXT,
    "sum_fkusuario" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "suministro_racion_pkey" PRIMARY KEY ("sum_id")
);

-- CreateIndex
CREATE INDEX "transaccion_trn_fkusuario_trn_fecha_idx" ON "transaccion"("trn_fkusuario", "trn_fecha");

-- CreateIndex
CREATE INDEX "transaccion_trn_tipo_idx" ON "transaccion"("trn_tipo");

-- CreateIndex
CREATE INDEX "transaccion_deleted_at_idx" ON "transaccion"("deleted_at");

-- CreateIndex
CREATE INDEX "transaccion_ganado_trg_fkganado_idx" ON "transaccion_ganado"("trg_fkganado");

-- CreateIndex
CREATE UNIQUE INDEX "transaccion_ganado_trg_fktransaccion_trg_fkganado_key" ON "transaccion_ganado"("trg_fktransaccion", "trg_fkganado");

-- CreateIndex
CREATE INDEX "gasto_gas_fkusuario_gas_fecha_idx" ON "gasto"("gas_fkusuario", "gas_fecha");

-- CreateIndex
CREATE INDEX "gasto_gas_categoria_idx" ON "gasto"("gas_categoria");

-- CreateIndex
CREATE INDEX "gasto_gas_fkterreno_idx" ON "gasto"("gas_fkterreno");

-- CreateIndex
CREATE INDEX "gasto_gas_fkganado_idx" ON "gasto"("gas_fkganado");

-- CreateIndex
CREATE INDEX "gasto_gas_fklote_idx" ON "gasto"("gas_fklote");

-- CreateIndex
CREATE INDEX "gasto_deleted_at_idx" ON "gasto"("deleted_at");

-- CreateIndex
CREATE INDEX "movimiento_insumo_mov_fkinsumo_mov_fecha_idx" ON "movimiento_insumo"("mov_fkinsumo", "mov_fecha");

-- CreateIndex
CREATE INDEX "movimiento_insumo_mov_fkganado_idx" ON "movimiento_insumo"("mov_fkganado");

-- CreateIndex
CREATE INDEX "movimiento_insumo_mov_fkterreno_idx" ON "movimiento_insumo"("mov_fkterreno");

-- CreateIndex
CREATE INDEX "movimiento_insumo_mov_fklote_idx" ON "movimiento_insumo"("mov_fklote");

-- CreateIndex
CREATE INDEX "movimiento_insumo_mov_ref_tipo_mov_ref_id_idx" ON "movimiento_insumo"("mov_ref_tipo", "mov_ref_id");

-- CreateIndex
CREATE INDEX "lote_lot_fkusuario_idx" ON "lote"("lot_fkusuario");

-- CreateIndex
CREATE INDEX "lote_lot_fkterreno_idx" ON "lote"("lot_fkterreno");

-- CreateIndex
CREATE INDEX "lote_lot_proposito_idx" ON "lote"("lot_proposito");

-- CreateIndex
CREATE INDEX "lote_deleted_at_idx" ON "lote"("deleted_at");

-- CreateIndex
CREATE INDEX "lote_ganado_lgn_fkganado_idx" ON "lote_ganado"("lgn_fkganado");

-- CreateIndex
CREATE INDEX "racion_alimentacion_rac_fkusuario_idx" ON "racion_alimentacion"("rac_fkusuario");

-- CreateIndex
CREATE INDEX "racion_alimentacion_rac_fkinsumo_idx" ON "racion_alimentacion"("rac_fkinsumo");

-- CreateIndex
CREATE INDEX "racion_alimentacion_rac_fkterreno_idx" ON "racion_alimentacion"("rac_fkterreno");

-- CreateIndex
CREATE INDEX "racion_alimentacion_rac_fklote_idx" ON "racion_alimentacion"("rac_fklote");

-- CreateIndex
CREATE INDEX "racion_alimentacion_rac_activo_idx" ON "racion_alimentacion"("rac_activo");

-- CreateIndex
CREATE INDEX "racion_alimentacion_deleted_at_idx" ON "racion_alimentacion"("deleted_at");

-- CreateIndex
CREATE INDEX "suministro_racion_sum_fkracion_sum_fecha_idx" ON "suministro_racion"("sum_fkracion", "sum_fecha");

-- CreateIndex
CREATE INDEX "suministro_racion_sum_fkinsumo_idx" ON "suministro_racion"("sum_fkinsumo");

-- CreateIndex
CREATE INDEX "suministro_racion_sum_fkterreno_idx" ON "suministro_racion"("sum_fkterreno");

-- CreateIndex
CREATE INDEX "suministro_racion_sum_fklote_idx" ON "suministro_racion"("sum_fklote");

-- CreateIndex
CREATE INDEX "suministro_racion_sum_fkusuario_idx" ON "suministro_racion"("sum_fkusuario");

-- AddForeignKey
ALTER TABLE "transaccion" ADD CONSTRAINT "transaccion_trn_fkusuario_fkey" FOREIGN KEY ("trn_fkusuario") REFERENCES "user"("usr_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transaccion_ganado" ADD CONSTRAINT "transaccion_ganado_trg_fktransaccion_fkey" FOREIGN KEY ("trg_fktransaccion") REFERENCES "transaccion"("trn_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transaccion_ganado" ADD CONSTRAINT "transaccion_ganado_trg_fkganado_fkey" FOREIGN KEY ("trg_fkganado") REFERENCES "ganado"("gan_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gasto" ADD CONSTRAINT "gasto_gas_fkusuario_fkey" FOREIGN KEY ("gas_fkusuario") REFERENCES "user"("usr_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gasto" ADD CONSTRAINT "gasto_gas_fkterreno_fkey" FOREIGN KEY ("gas_fkterreno") REFERENCES "terreno"("terr_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gasto" ADD CONSTRAINT "gasto_gas_fkganado_fkey" FOREIGN KEY ("gas_fkganado") REFERENCES "ganado"("gan_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gasto" ADD CONSTRAINT "gasto_gas_fklote_fkey" FOREIGN KEY ("gas_fklote") REFERENCES "lote"("lot_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "movimiento_insumo" ADD CONSTRAINT "movimiento_insumo_mov_fkinsumo_fkey" FOREIGN KEY ("mov_fkinsumo") REFERENCES "insumo"("ins_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "movimiento_insumo" ADD CONSTRAINT "movimiento_insumo_mov_fkganado_fkey" FOREIGN KEY ("mov_fkganado") REFERENCES "ganado"("gan_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "movimiento_insumo" ADD CONSTRAINT "movimiento_insumo_mov_fkterreno_fkey" FOREIGN KEY ("mov_fkterreno") REFERENCES "terreno"("terr_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "movimiento_insumo" ADD CONSTRAINT "movimiento_insumo_mov_fklote_fkey" FOREIGN KEY ("mov_fklote") REFERENCES "lote"("lot_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "movimiento_insumo" ADD CONSTRAINT "movimiento_insumo_mov_fkusuario_fkey" FOREIGN KEY ("mov_fkusuario") REFERENCES "user"("usr_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lote" ADD CONSTRAINT "lote_lot_fkusuario_fkey" FOREIGN KEY ("lot_fkusuario") REFERENCES "user"("usr_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lote" ADD CONSTRAINT "lote_lot_fkterreno_fkey" FOREIGN KEY ("lot_fkterreno") REFERENCES "terreno"("terr_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lote_ganado" ADD CONSTRAINT "lote_ganado_lgn_fklote_fkey" FOREIGN KEY ("lgn_fklote") REFERENCES "lote"("lot_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lote_ganado" ADD CONSTRAINT "lote_ganado_lgn_fkganado_fkey" FOREIGN KEY ("lgn_fkganado") REFERENCES "ganado"("gan_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "racion_alimentacion" ADD CONSTRAINT "racion_alimentacion_rac_fkusuario_fkey" FOREIGN KEY ("rac_fkusuario") REFERENCES "user"("usr_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "racion_alimentacion" ADD CONSTRAINT "racion_alimentacion_rac_fkinsumo_fkey" FOREIGN KEY ("rac_fkinsumo") REFERENCES "insumo"("ins_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "racion_alimentacion" ADD CONSTRAINT "racion_alimentacion_rac_fkterreno_fkey" FOREIGN KEY ("rac_fkterreno") REFERENCES "terreno"("terr_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "racion_alimentacion" ADD CONSTRAINT "racion_alimentacion_rac_fklote_fkey" FOREIGN KEY ("rac_fklote") REFERENCES "lote"("lot_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "suministro_racion" ADD CONSTRAINT "suministro_racion_sum_fkracion_fkey" FOREIGN KEY ("sum_fkracion") REFERENCES "racion_alimentacion"("rac_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "suministro_racion" ADD CONSTRAINT "suministro_racion_sum_fkinsumo_fkey" FOREIGN KEY ("sum_fkinsumo") REFERENCES "insumo"("ins_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "suministro_racion" ADD CONSTRAINT "suministro_racion_sum_fkterreno_fkey" FOREIGN KEY ("sum_fkterreno") REFERENCES "terreno"("terr_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "suministro_racion" ADD CONSTRAINT "suministro_racion_sum_fklote_fkey" FOREIGN KEY ("sum_fklote") REFERENCES "lote"("lot_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "suministro_racion" ADD CONSTRAINT "suministro_racion_sum_fkusuario_fkey" FOREIGN KEY ("sum_fkusuario") REFERENCES "user"("usr_id") ON DELETE CASCADE ON UPDATE CASCADE;


-- Invariantes de montos, costos, kardex y raciones
ALTER TABLE "insumo" ADD CONSTRAINT "insumo_costo_unitario_chk" CHECK ("ins_costo_unitario" >= 0);
ALTER TABLE "transaccion" ADD CONSTRAINT "transaccion_total_chk" CHECK ("trn_total" >= 0);
ALTER TABLE "transaccion_ganado" ADD CONSTRAINT "transaccion_ganado_precio_chk" CHECK ("trg_precio" >= 0 AND "trg_peso_registro" > 0);
ALTER TABLE "gasto" ADD CONSTRAINT "gasto_monto_chk" CHECK ("gas_monto" > 0);
ALTER TABLE "movimiento_insumo" ADD CONSTRAINT "movimiento_insumo_delta_chk" CHECK (
    ("mov_tipo" = 'ENTRADA' AND "mov_cantidad" > 0 AND "mov_delta" = "mov_cantidad") OR
    ("mov_tipo" = 'SALIDA' AND "mov_cantidad" > 0 AND "mov_delta" = -"mov_cantidad") OR
    ("mov_tipo" = 'AJUSTE' AND "mov_delta" = "mov_cantidad" AND "mov_delta" <> 0)
);
ALTER TABLE "racion_alimentacion" ADD CONSTRAINT "racion_cantidad_chk" CHECK ("rac_cantidad_diaria_animal" > 0 AND "rac_dias_alerta_autonomia" >= 1 AND ("rac_fkterreno" IS NOT NULL OR "rac_fklote" IS NOT NULL));
ALTER TABLE "suministro_racion" ADD CONSTRAINT "suministro_cantidad_chk" CHECK ("sum_cantidad_animales" > 0 AND "sum_cantidad_total" > 0 AND "sum_costo_total" >= 0);

-- Índices parciales de rendimiento sobre registros activos (WHERE deleted_at IS NULL)
CREATE INDEX "transaccion_activos_usuario_fecha_idx" ON "transaccion"("trn_fkusuario", "trn_fecha") WHERE "deleted_at" IS NULL;
CREATE INDEX "gasto_activos_usuario_fecha_idx" ON "gasto"("gas_fkusuario", "gas_fecha") WHERE "deleted_at" IS NULL;
CREATE INDEX "lote_activos_usuario_idx" ON "lote"("lot_fkusuario", "lot_activo") WHERE "deleted_at" IS NULL;
CREATE INDEX "racion_activos_usuario_idx" ON "racion_alimentacion"("rac_fkusuario", "rac_activo") WHERE "deleted_at" IS NULL;

-- Backfill de kardex inicial para insumos existentes con stock positivo
INSERT INTO "movimiento_insumo" ("mov_fkinsumo", "mov_tipo", "mov_cantidad", "mov_delta", "mov_costo_unitario", "mov_motivo", "mov_ref_tipo", "mov_fkusuario", "mov_fecha")
SELECT "ins_id", 'ENTRADA', "ins_stock", "ins_stock", "ins_costo_unitario", 'Saldo inicial (migración kardex)', 'INICIAL', "ins_fkusuario", CURRENT_TIMESTAMP
FROM "insumo"
WHERE "deleted_at" IS NULL AND "ins_stock" > 0;
