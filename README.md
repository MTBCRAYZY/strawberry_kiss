# 🍓 Strawberry Kiss – Pastelería Online

Tienda en línea con **Node.js + Express + MongoDB**. El frontend usa **Bootstrap 5** con animaciones AOS.

---

## ⚙️ Requisitos

| Herramienta | Versión mínima | Descarga |
|---|---|---|
| Node.js | 18 o superior | https://nodejs.org |
| MongoDB Community | 6 o superior | https://www.mongodb.com/try/download/community |
| XAMPP  | Cualquiera | https://www.apachefriends.org |
---

## 🚀 Instalación paso a paso

### 1. Instalar dependencias

```bash
cd strawberry-kiss
npm install
```

### 2. Iniciar MongoDB

Opción A – **MongoDB sin XAMPP** (recomendado):
```bash
# Windows: abre MongoDB Compass o ejecuta:
mongod --dbpath C:\data\db

# macOS / Linux:
mongod
```

Opción B – **Con XAMPP** (si tienes el módulo MongoDB instalado en XAMPP):
- Abre el panel de XAMPP
- Asegúrate de que el servicio MongoDB esté corriendo en el puerto 27017

### 3. Configurar variables de entorno

El archivo `.env` ya viene configurado:
```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/strawberry-kiss
JWT_SECRET=tu_super_secreto_jwt_strawberry_kiss_2024
JWT_EXPIRE=7d
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000
```

> Puedes cambiar `MONGODB_URI` si tu MongoDB corre en otro puerto.

### 4. Cargar datos de ejemplo (seed)

```bash
npm run seed
```

Esto crea 10 productos en la base de datos.

### 5. Iniciar el servidor

```bash
# Producción:
npm start

# Desarrollo (reinicio automático):
npm run dev
```

### 6. Abrir en el navegador

```
http://localhost:3000
```

---

## 📁 Estructura del proyecto

```
strawberry-kiss/
├── server.js               ← Servidor Express principal
├── seed.js                 ← Script para poblar la BD
├── .env                    ← Variables de entorno
├── package.json
│
├── controllers/
│   ├── authController.js   ← Registro / Login / Perfil
│   ├── cartController.js   ← Carrito de compras
│   └── paymentController.js← Procesar pedidos
│
├── models/
│   ├── User.js             ← Usuario (con bcrypt)
│   ├── Cart.js             ← Carrito persistente
│   └── Order.js            ← Órdenes / Pedidos
│
├── routes/
│   ├── auth.js             ← /api/auth/*
│   ├── cart.js             ← /api/carrito/*
│   └── payment.js          ← /api/pagos/*
│
├── middleware/
│   └── auth.js             ← JWT protect / autorizar
│
└── Intento2-PAGINAWEB/     ← Frontend estático
    ├── index.html          ← Página principal
    ├── login.html          ← Login / Registro
    ├── infoOrdenaAqui.html ← Catálogo + Carrito
    ├── mis-pedidos.html    ← Historial de pedidos
    ├── api.js              ← Cliente HTTP del frontend
    ├── style.css           ← Estilos globales
    └── ...
```

---

## 🔌 Endpoints de la API

### Auth `/api/auth`
| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/registro` | Crear cuenta |
| POST | `/login` | Iniciar sesión (devuelve JWT) |
| GET  | `/me` | Perfil del usuario autenticado |
| PUT  | `/actualizar-perfil` | Actualizar datos |
| POST | `/logout` | Cerrar sesión |

### Carrito `/api/carrito` *(requiere JWT)*
| Método | Ruta | Descripción |
|--------|------|-------------|
| GET    | `/` | Ver carrito activo |
| POST   | `/agregar` | Agregar producto |
| PUT    | `/actualizar/:id` | Cambiar cantidad |
| DELETE | `/eliminar/:id` | Quitar producto |
| DELETE | `/vaciar` | Vaciar carrito |

### Pagos `/api/pagos` *(requiere JWT)*
| Método | Ruta | Descripción |
|--------|------|-------------|
| GET  | `/metodos-disponibles` | Lista de métodos de pago |
| POST | `/procesar` | Procesar pago y crear orden |
| GET  | `/ordenes` | Mis pedidos |
| GET  | `/orden/:id` | Detalle de un pedido |
| POST | `/cancelar-orden/:id` | Cancelar pedido pendiente |

---

## ✨ Características del frontend

- **Bootstrap 5** – Navbar responsive, modales nativos, toasts, badges, spinners
- **AOS** (Animate on Scroll) – Cards animadas al hacer scroll
- **Carrito persistente** – Guardado en MongoDB vinculado al usuario
- **Checkout integrado** – Modal con formulario de envío y método de pago
- **Historial de pedidos** – Ver y cancelar órdenes desde `mis-pedidos.html`
- **JWT** – Sesión persistente en `localStorage`

---

## 🛠️ Solución de problemas

| Error | Solución |
|-------|----------|
| `MongoServerError: connect ECONNREFUSED` | MongoDB no está corriendo. Inicia `mongod` |
| `Error: Cannot find module 'express'` | Ejecuta `npm install` |
| Página en blanco / 404 | Asegúrate de abrir `http://localhost:3000` (no el archivo .html directamente) |
| Login no funciona | Verifica que el servidor Node.js esté corriendo |

---
## PASWORD AND EMAIL ADMIN
admin@strawberrykiss.com 
admin1234

## URL DASHBOARD ADMIN 
http://localhost:3000/admin.html

*Strawberry Kiss – Pastelería Artesanal © 2024*
