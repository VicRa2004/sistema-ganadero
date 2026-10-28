# Backups de PostgreSQL

## Copia

Diaria, con `pg_dump` en formato custom (comprimido, restaurable por tabla):

```bash
pg_dump "$DATABASE_URL" -Fc -f "ganadero_$(date +%F).dump"
```

Programarla con cron o el scheduler del hosting (Dokploy), conservar al menos 7 diarias y 4 semanales, y guardarlas fuera del servidor de la BD (S3 u otro disco).

## Restauración

Probarla en una BD vacía, nunca sobre producción directamente:

```bash
createdb ganadero_restore
pg_restore -d ganadero_restore --no-owner ganadero_2026-10-28.dump
```

Para volver a producción: detener la app, restaurar con `pg_restore --clean --if-exists -d <bd>` y arrancar (la imagen ejecuta `migrate deploy` al iniciar).

Verificar la restauración una vez al mes: abrir la copia más reciente en una BD temporal y comprobar el conteo de `ganado` y `user`.
