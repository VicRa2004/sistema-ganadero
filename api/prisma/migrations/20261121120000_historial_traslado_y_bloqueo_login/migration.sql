-- AlterTable
ALTER TABLE "user" ADD COLUMN     "usr_bloqueado_hasta" TIMESTAMP(3),
ADD COLUMN     "usr_intentos_fallidos" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "historial_traslado" (
    "tra_id" SERIAL NOT NULL,
    "tra_fkganado" INTEGER NOT NULL,
    "tra_fkterreno_origen" INTEGER NOT NULL,
    "tra_fkterreno_destino" INTEGER NOT NULL,
    "tra_fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "historial_traslado_pkey" PRIMARY KEY ("tra_id")
);

-- CreateIndex
CREATE INDEX "historial_traslado_tra_fkganado_tra_fecha_idx" ON "historial_traslado"("tra_fkganado", "tra_fecha");

-- AddForeignKey
ALTER TABLE "historial_traslado" ADD CONSTRAINT "historial_traslado_tra_fkganado_fkey" FOREIGN KEY ("tra_fkganado") REFERENCES "ganado"("gan_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "historial_traslado" ADD CONSTRAINT "historial_traslado_tra_fkterreno_origen_fkey" FOREIGN KEY ("tra_fkterreno_origen") REFERENCES "terreno"("terr_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "historial_traslado" ADD CONSTRAINT "historial_traslado_tra_fkterreno_destino_fkey" FOREIGN KEY ("tra_fkterreno_destino") REFERENCES "terreno"("terr_id") ON DELETE CASCADE ON UPDATE CASCADE;


-- Trigger: registra cada cambio de terreno del ganado, venga de donde venga
CREATE FUNCTION registrar_traslado_ganado() RETURNS trigger AS $$
BEGIN
    INSERT INTO "historial_traslado" ("tra_fkganado", "tra_fkterreno_origen", "tra_fkterreno_destino")
    VALUES (NEW."gan_id", OLD."gan_fkterreno", NEW."gan_fkterreno");
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER "ganado_registrar_traslado"
AFTER UPDATE OF "gan_fkterreno" ON "ganado"
FOR EACH ROW
WHEN (OLD."gan_fkterreno" IS DISTINCT FROM NEW."gan_fkterreno")
EXECUTE FUNCTION registrar_traslado_ganado();
