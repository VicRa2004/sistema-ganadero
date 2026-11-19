-- DropForeignKey
ALTER TABLE "movimiento_insumo" DROP CONSTRAINT "movimiento_insumo_mov_fkusuario_fkey";

-- AddForeignKey
ALTER TABLE "movimiento_insumo" ADD CONSTRAINT "movimiento_insumo_mov_fkusuario_fkey" FOREIGN KEY ("mov_fkusuario") REFERENCES "user"("usr_id") ON DELETE CASCADE ON UPDATE CASCADE;

