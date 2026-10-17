# Feature · Uso en campo y movilidad

## 1. Identificación rápida (QR / código de barras / RFID)

- El endpoint `GET /ganado/:idOrIdentificador` ya permite buscar por arete.
- Escáner en la UI con la cámara (`BarcodeDetector` o librería, versión exacta) para abrir la ficha al escanear.
- Generar e imprimir **etiquetas QR** por animal.
- RFID: entrada por teclado (lectores tipo HID) en un campo de búsqueda siempre enfocado; fase posterior: Web Bluetooth/Web Serial.

## 2. PWA y modo offline

- Manifest, iconos y service worker (Vite PWA plugin, versión exacta).
- Caché de lectura de listados y fichas recientes.
- **Cola de escrituras offline** (pesajes, tratamientos, traslados) con reintento y resolución de conflictos (última escritura gana + aviso).
- Indicador de estado de conexión y de cambios pendientes.
- Importante: el refresh token en cookie `HttpOnly` y access token en memoria deben tolerar reconexión.

## 3. Mapa de terrenos

- Hoy `ubicacion` es texto. Añadir `geom` (GeoJSON de polígono) o lat/lng + radio en `Terreno`.
- Mapa con MapLibre/Leaflet para dibujar y ver terrenos; calcular `extensionHectareas` automáticamente del polígono.
- Mostrar ocupación por terreno con color según `capacidadMaxima`.

## 4. Rotación de potreros e historial de traslados

- Ya existe `POST /ganado/:id/traslados` pero no se guarda historial.
- Modelo `HistorialTraslado(ganadoId, terrenoOrigenId, terrenoDestinoId, fecha, motivo?)`.
- Días de descanso por terreno y sugerencias de rotación; alerta de sobrepastoreo si se excede capacidad.
- Traslado masivo de varios animales o de un lote.

## 5. Fotos y evidencias

- Varias fotos por animal (hoy una sola `imagenGanado`), con galería y fecha.
- Adjuntos en tratamientos (recetas, resultados de laboratorio).
- Requiere resolver U-2 (validación de uploads) y preferiblemente almacenamiento S3.

## Criterios de aceptación

- Escanear un QR abre la ficha en < 2 s.
- Registrar un pesaje sin conexión se sincroniza al recuperar red sin duplicados.
- Un traslado queda en el historial y actualiza la ocupación del mapa.
