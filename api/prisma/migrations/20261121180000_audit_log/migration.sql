-- CreateTable
CREATE TABLE "audit_log" (
    "aud_id" SERIAL NOT NULL,
    "aud_fkusuario" INTEGER,
    "aud_metodo" VARCHAR(10) NOT NULL,
    "aud_ruta" VARCHAR(255) NOT NULL,
    "aud_estado" INTEGER NOT NULL,
    "aud_ip" VARCHAR(64),
    "aud_request_id" VARCHAR(64),
    "aud_fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_log_pkey" PRIMARY KEY ("aud_id")
);

-- CreateIndex
CREATE INDEX "audit_log_aud_fecha_idx" ON "audit_log"("aud_fecha");

-- CreateIndex
CREATE INDEX "audit_log_aud_fkusuario_aud_fecha_idx" ON "audit_log"("aud_fkusuario", "aud_fecha");

-- AddForeignKey
ALTER TABLE "audit_log" ADD CONSTRAINT "audit_log_aud_fkusuario_fkey" FOREIGN KEY ("aud_fkusuario") REFERENCES "user"("usr_id") ON DELETE SET NULL ON UPDATE CASCADE;

