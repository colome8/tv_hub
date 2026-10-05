# Práctica Integradora 1 — TV Hub Watch Experience

Aplicación de clase construida con Node.js, Express, TypeScript, MongoDB, Mongoose y JavaScript. La práctica consiste en completar el flujo MVC para consultar un canal desde MongoDB y reproducir su stream en la página Watch mediante Shaka Player.

## Objetivo

Cuando el usuario selecciona un canal en Home, la aplicación debe:

1. Abrir Watch con el identificador del canal.
2. Solicitar `GET /api/channels/:id` desde el navegador.
3. Encontrar el canal activo en MongoDB.
4. Responder con su información en formato JSON.
5. Mostrar su nombre, país y categorías.
6. Cargar `streamUrl` en Shaka Player.
7. Mostrar los estados Loading, Playing o Error.

## Arquitectura

El recorrido principal es:

```text
Home
  ↓
watch.js (View)
  ↓ GET /api/channels/:id
channel.routes.ts (Route)
  ↓
channel.controller.ts (Controller)
  ↓
channel.model.ts (Model)
  ↓
MongoDB
  ↓ JSON
watch.js → Shaka Player → Stream
```

- **View:** muestra la información y solicita el canal mediante `fetch`.
- **Route:** relaciona el método y la URL con el Controller correcto.
- **Controller:** valida la petición, coordina la consulta y construye la respuesta.
- **Model:** define el Channel y permite consultar MongoDB mediante Mongoose.
- **MongoDB:** almacena los canales importados desde las playlists M3U.

## Requisitos

- Node.js 20 o superior.
- Docker Desktop con Docker Compose.
- Postman, navegador o DevTools para probar la API.

## Preparar el proyecto

Instala las dependencias:

```bash
npm install
```

Inicia MongoDB. Si el contenedor ya existe pero está detenido:

```bash
docker compose start
```

Para crearlo o iniciarlo mediante la configuración del proyecto:

```bash
docker compose up -d
```

Compila el proyecto e importa todas las playlists locales:

```bash
npm run build
npm run import:all-channels
```

Finalmente, inicia la aplicación:

```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:3000`.

## Importar canales

Para cargar todas las playlists con sufijo `_playlist.m3u` de `docs/`:

```bash
npm run build
npm run import:all-channels
```

Para importar o actualizar una sola playlist:

```bash
npm run import:channels -- docs/japon_playlist.m3u Japan
```

La importación completa reemplaza los canales y favoritos existentes. Los usuarios y las sesiones se conservan.

## Archivos principales

```text
src/routes/channel.routes.ts
src/controllers/channel.controller.ts
src/models/channel.model.ts
src/public/watch.html
src/public/js/watch.js
tests/channels.test.ts
```

## API de canales

| Método | Endpoint | Resultado |
| --- | --- | --- |
| GET | `/api/channels` | Devuelve los canales activos. |
| GET | `/api/channels/:id` | Devuelve un canal activo por su identificador. |

Ejemplo de respuesta:

```json
{
  "channel": {
    "_id": "ID_DEL_CANAL",
    "name": "Canal de ejemplo",
    "logoUrl": "https://example.com/logo.png",
    "streamUrl": "https://example.com/stream.m3u8",
    "country": "Mexico",
    "categories": ["News"],
    "isActive": true
  }
}
```

## Pasos de la actividad

1. Conectar `GET /api/channels/:id` con `getChannel`.
2. Consultar un canal activo mediante el Channel Model.
3. Responder con `404` cuando el canal no exista.
4. Enviar el canal al frontend como JSON.
5. Solicitar el canal desde `watch.js` mediante `fetch`.
6. Mostrar nombre, país y categorías en Watch.
7. Conectar Shaka Player con el elemento `<video>` y cargar `streamUrl`.
8. Mostrar correctamente los estados Loading, Playing y Error.

## Pruebas

Comprueba la API en Postman o el navegador usando un identificador real:

```http
GET http://localhost:3000/api/channels/ID_REAL_DEL_CANAL
```

La respuesta esperada es `200 OK` con un objeto `channel`.

Ejecuta las pruebas específicas de la práctica:

```bash
npm test -- --runInBand tests/channels.test.ts
```

Comprueba también que TypeScript compile correctamente:

```bash
npm run build
```

## Validación final

- Home muestra los canales importados.
- Seleccionar un canal abre Watch con su identificador.
- La petición `GET /api/channels/:id` responde con `200`.
- Watch presenta el nombre, país y categorías correctos.
- Un stream disponible cambia la interfaz de Loading a Playing.
- Un stream no disponible muestra Error y el botón Try again.

La reproducción depende de que el stream remoto siga disponible y permita acceso desde el navegador.

## Evidencias para la entrega

El PDF debe incluir:

1. URL del repositorio público.
2. Captura de la Route y evidencia de que funciona.
3. Captura de la consulta del Controller y de la respuesta JSON.
4. Captura del `fetch` y de Watch mostrando el canal.
5. Captura de Shaka Player y del stream reproduciéndose.
6. Evidencia de al menos dos estados del reproductor, de preferencia Playing y Error.
7. Una conclusión breve sobre la responsabilidad de View, Route, Controller, Model y MongoDB.

No entregues únicamente capturas del código: incluye también evidencia del resultado que produce cada modificación.
