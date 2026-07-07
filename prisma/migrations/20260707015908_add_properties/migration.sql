-- CreateEnum
CREATE TYPE "TipoInsumo" AS ENUM ('MEDICAMENTO', 'VACUNA', 'ALIMENTO');

-- CreateEnum
CREATE TYPE "SexoGanado" AS ENUM ('MACHO', 'HEMBRA');

-- CreateTable
CREATE TABLE "raza" (
    "raz_id" SERIAL NOT NULL,
    "raz_nombre" VARCHAR(100) NOT NULL,
    "raz_descripcion" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "raza_pkey" PRIMARY KEY ("raz_id")
);

-- CreateTable
CREATE TABLE "propietario" (
    "prop_id" SERIAL NOT NULL,
    "prop_nombre" VARCHAR(255) NOT NULL,
    "prop_telefono" VARCHAR(20),
    "prop_correo" VARCHAR(128),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "propietario_pkey" PRIMARY KEY ("prop_id")
);

-- CreateTable
CREATE TABLE "rancho" (
    "rnch_id" SERIAL NOT NULL,
    "rnch_nombre" VARCHAR(150) NOT NULL,
    "rnch_ubicacion" VARCHAR(255) NOT NULL,
    "rnch_extension" DOUBLE PRECISION NOT NULL,
    "rnch_capacidad_max" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "rancho_pkey" PRIMARY KEY ("rnch_id")
);

-- CreateTable
CREATE TABLE "ganado" (
    "gan_id" SERIAL NOT NULL,
    "gan_identificador" VARCHAR(50) NOT NULL,
    "gan_peso" DOUBLE PRECISION NOT NULL,
    "gan_edad_meses" INTEGER NOT NULL,
    "gan_sexo" "SexoGanado" NOT NULL,
    "gan_fkraza" INTEGER NOT NULL,
    "gan_fkrancho" INTEGER NOT NULL,
    "gan_fkpropietario" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "ganado_pkey" PRIMARY KEY ("gan_id")
);

-- CreateTable
CREATE TABLE "insumo" (
    "ins_id" SERIAL NOT NULL,
    "ins_nombre" VARCHAR(150) NOT NULL,
    "ins_tipo" "TipoInsumo" NOT NULL,
    "ins_stock" DOUBLE PRECISION NOT NULL,
    "ins_stock_minimo" DOUBLE PRECISION NOT NULL,
    "ins_unidad" VARCHAR(20) NOT NULL,
    "ins_lote" VARCHAR(50) NOT NULL,
    "ins_fecha_caducidad" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "insumo_pkey" PRIMARY KEY ("ins_id")
);

-- CreateTable
CREATE TABLE "sesion_sanitaria" (
    "ses_id" SERIAL NOT NULL,
    "ses_fecha" TIMESTAMP(3) NOT NULL,
    "ses_veterinario" VARCHAR(150) NOT NULL,
    "ses_descripcion" TEXT NOT NULL,
    "ses_fkinsumo" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "sesion_sanitaria_pkey" PRIMARY KEY ("ses_id")
);

-- CreateTable
CREATE TABLE "aplicacion_sanitaria" (
    "aps_id" SERIAL NOT NULL,
    "aps_fksesion" INTEGER NOT NULL,
    "aps_fkganado" INTEGER NOT NULL,
    "aps_dosis" DOUBLE PRECISION NOT NULL,
    "aps_observaciones" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "aplicacion_sanitaria_pkey" PRIMARY KEY ("aps_id")
);

-- CreateTable
CREATE TABLE "tratamiento_medico" (
    "trt_id" SERIAL NOT NULL,
    "trt_fkganado" INTEGER NOT NULL,
    "trt_diagnostico" VARCHAR(255) NOT NULL,
    "trt_fecha_inicio" TIMESTAMP(3) NOT NULL,
    "trt_fecha_fin" TIMESTAMP(3) NOT NULL,
    "trt_activo" BOOLEAN NOT NULL DEFAULT true,
    "trt_fkinsumo" INTEGER NOT NULL,
    "trt_dosis_diaria" DOUBLE PRECISION NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "tratamiento_medico_pkey" PRIMARY KEY ("trt_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "raza_raz_nombre_key" ON "raza"("raz_nombre");

-- CreateIndex
CREATE UNIQUE INDEX "ganado_gan_identificador_key" ON "ganado"("gan_identificador");

-- CreateIndex
CREATE UNIQUE INDEX "aplicacion_sanitaria_aps_fksesion_aps_fkganado_key" ON "aplicacion_sanitaria"("aps_fksesion", "aps_fkganado");

-- AddForeignKey
ALTER TABLE "ganado" ADD CONSTRAINT "ganado_gan_fkraza_fkey" FOREIGN KEY ("gan_fkraza") REFERENCES "raza"("raz_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ganado" ADD CONSTRAINT "ganado_gan_fkrancho_fkey" FOREIGN KEY ("gan_fkrancho") REFERENCES "rancho"("rnch_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ganado" ADD CONSTRAINT "ganado_gan_fkpropietario_fkey" FOREIGN KEY ("gan_fkpropietario") REFERENCES "propietario"("prop_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sesion_sanitaria" ADD CONSTRAINT "sesion_sanitaria_ses_fkinsumo_fkey" FOREIGN KEY ("ses_fkinsumo") REFERENCES "insumo"("ins_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "aplicacion_sanitaria" ADD CONSTRAINT "aplicacion_sanitaria_aps_fksesion_fkey" FOREIGN KEY ("aps_fksesion") REFERENCES "sesion_sanitaria"("ses_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "aplicacion_sanitaria" ADD CONSTRAINT "aplicacion_sanitaria_aps_fkganado_fkey" FOREIGN KEY ("aps_fkganado") REFERENCES "ganado"("gan_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tratamiento_medico" ADD CONSTRAINT "tratamiento_medico_trt_fkganado_fkey" FOREIGN KEY ("trt_fkganado") REFERENCES "ganado"("gan_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tratamiento_medico" ADD CONSTRAINT "tratamiento_medico_trt_fkinsumo_fkey" FOREIGN KEY ("trt_fkinsumo") REFERENCES "insumo"("ins_id") ON DELETE RESTRICT ON UPDATE CASCADE;
