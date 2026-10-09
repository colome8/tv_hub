# TV Hub V6 — Sesión 15

Aplicación construida con Node.js, Express, TypeScript, MongoDB y Mongoose. Esta práctica agrega operaciones en tiempo real con Socket.IO, escalamiento automático con `node-cron` y notificaciones por correo con Nodemailer.

## Objetivo

Completar el ciclo de vida de los Reports:

1. Mostrar Reports nuevos y actualizados sin refrescar la página.
2. Escalar automáticamente los Reports `OPEN` antiguos.
3. Enviar un correo cuando un Report se crea.
4. Enviar un correo al usuario cuando soporte resuelve su Report.

La regla principal es guardar primero en MongoDB y notificar después. Si Socket.IO, cron o el correo fallan, la información principal no debe perderse.

## Arquitectura

```text
Navegador
   ↓ HTTP
Routes → Controllers → Models → MongoDB
              ↓
              ├─ Socket.IO → usuario y administradores
              └─ Nodemailer → correo externo

node-cron → busca Reports antiguos → MongoDB → Socket.IO
```

- **Routes:** conectan cada endpoint con su Controller.
- **Controllers:** validan y coordinan las operaciones.
- **Models:** representan los datos guardados en MongoDB.
- **Socket.IO:** avisa cambios en tiempo real.
- **node-cron:** ejecuta periódicamente el escalamiento.
- **Nodemailer:** construye y envía las notificaciones por correo.

## Requisitos

- Node.js 20 o superior.
- Docker Desktop con Docker Compose.
- Navegador web.

## Instalación y ejecución

Instala las dependencias:

```bash
npm install
```

Inicia MongoDB:

```bash
docker compose up -d
```

Comprueba el contenedor:

```bash
docker compose ps
```

Inicia la aplicación:

```bash
npm run dev
```

Abre `http://localhost:3000`.

El proyecto usa `.env.example` automáticamente cuando no existe `.env`. Para personalizar la configuración:

```bash
copy .env.example .env
```

No subas `.env` ni credenciales reales al repositorio.

## Socket.IO

Socket.IO comparte el mismo servidor HTTP de Express. Cada conexión autenticada entra al room de su usuario. Los usuarios con rol `ADMIN` también entran al room `admins`.

Eventos utilizados:

- `report:created`: avisa que se creó un Report.
- `report:updated`: avisa que un Report cambió.

El usuario propietario y el panel de soporte reciben las actualizaciones sin refrescar la página.

## Escalamiento con node-cron

El job se ejecuta con la expresión configurada en `REPORT_ESCALATION_CRON`. En desarrollo se ejecuta cada minuto:

```env
REPORT_ESCALATION_MINUTES=2
REPORT_ESCALATION_CRON=*/1 * * * *
```

Un Report cambia de `OPEN` a `ESCALATED` cuando su fecha de creación es anterior o igual al límite calculado. El cambio se guarda en MongoDB antes de emitir `report:updated`.

## Correos con Nodemailer

Se generan dos notificaciones:

- **Report creado:** se envía a `REPORT_NOTIFICATION_EMAIL` e incluye canal, razón, descripción, estado y fecha.
- **Report resuelto:** se envía al correo del usuario e incluye canal, razón, descripción y estado final.

El envío ocurre después de guardar el Report. Cada llamada está protegida con un `try/catch` local, por lo que un error de correo no revierte la operación principal.

Si `SMTP_HOST` está vacío en desarrollo, se utiliza una cuenta de prueba de Ethereal. La terminal muestra una URL como esta:

```text
Email preview: https://ethereal.email/message/...
```

Para utilizar un servidor SMTP real, configura las variables sin guardar secretos en Git:

```env
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=usuario
SMTP_PASS=contraseña
SMTP_FROM=TV Hub <no-reply@example.com>
```

## Archivos principales

```text
src/server.ts
src/realtime/socket.ts
src/jobs/report-escalation.job.ts
src/notifications/report-email.ts
src/controllers/report.controller.ts
src/models/report.model.ts
src/public/js/reports.js
src/public/js/support-reports.js
```

## Pruebas

Compila TypeScript:

```bash
npm run build
```

Ejecuta todas las pruebas:

```bash
npm test
```

Pruebas principales de esta práctica:

```bash
npm test -- --runInBand tests/reports.test.ts
npm test -- --runInBand tests/report-escalation.test.ts
```

## Validación manual

1. Abre `/reports.html` con un usuario normal.
2. Abre `/support-reports.html` con un administrador en otra sesión.
3. Crea un Report y comprueba que aparece en ambas ventanas sin refrescar.
4. Espera entre 2 y 3 minutos y verifica el cambio automático de `OPEN` a `ESCALATED`.
5. Resuelve el Report desde soporte y abre el preview de Ethereal.
6. Verifica que los correos de creación y resolución contienen los datos correctos.

## Evidencias de entrega

El PDF final debe contener:

1. Explicación y código principal de Socket.IO.
2. Dos navegadores mostrando una actualización sin refresh.
3. Explicación y código principal de `node-cron`.
4. El mismo Report primero `OPEN` y después `ESCALATED`.
5. Código de Nodemailer y su integración en el Controller.
6. Previews de Ethereal para creación y resolución.
7. URL del repositorio y commit final correspondiente a las evidencias.
