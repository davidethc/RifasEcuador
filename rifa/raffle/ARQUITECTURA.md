# 📋 Arquitectura del Proyecto Raffle

## 🏗️ Estructura General

Tu proyecto está dividido en **4 componentes principales** que funcionan de manera **independiente pero conectados**:

```
raffle/
├── api/          → API REST (Backend)
├── cms/          → Panel de Administración
├── web/          → Frontend Público
└── template/     → Plantillas HTML Estáticas
```

---

## 🔌 1. API (Backend REST)

### 📍 Ubicación: `/api/`

### 🎯 Función:
- **API REST** que maneja todas las operaciones de base de datos
- Se conecta directamente a MySQL (`raffledb`)
- Proporciona endpoints para CRUD (Create, Read, Update, Delete)

### 🔑 Características:
- **URL Base**: `http://api.raffle.com/`
- **Autenticación**: Requiere header `Authorization` con API Key
- **API Key**: `gsdfgdfhdsfhsdfgh4332465dfhdfgh34sdgsdfg345AFSGFghdrfh4`
- **Base de Datos**: `raffledb` (MySQL en localhost)

### 📂 Estructura:
```
api/
├── index.php              → Punto de entrada
├── routes/
│   ├── routes.php         → Enrutador principal
│   └── services/          → Servicios por método HTTP
│       ├── get.php        → GET requests
│       ├── post.php       → POST requests
│       ├── put.php        → PUT requests
│       └── delete.php     → DELETE requests
├── controllers/           → Controladores de lógica
├── models/                → Modelos de datos
│   └── connection.php     → Conexión a BD
└── vendor/                → Dependencias (JWT, etc.)
```

### 🔄 Cómo Funciona:
1. Recibe peticiones HTTP (GET, POST, PUT, DELETE)
2. Valida la API Key en el header `Authorization`
3. Procesa la petición según el método HTTP
4. Interactúa con la base de datos MySQL
5. Retorna respuestas en formato JSON

### 📝 Ejemplo de Uso:
```php
// GET request
GET http://api.raffle.com/raffles?linkTo=id_raffle&equalTo=1

// POST request
POST http://api.raffle.com/clients
Headers: Authorization: gsdfgdfhdsfhsdfgh4332465dfhdfgh34sdgsdfg345AFSGFghdrfh4
Body: name_client=Juan&email_client=juan@email.com
```

---

## 🌐 2. WEB (Frontend Público)

### 📍 Ubicación: `/web/`

### 🎯 Función:
- **Frontend público** para los usuarios finales
- Muestra sorteos, permite comprar números, procesa pagos
- Se conecta a la API para obtener y enviar datos

### 🔗 Conexión con API:
- Usa `CurlController` para hacer peticiones HTTP a la API
- URL de la API: `http://api.raffle.com/`
- Envía el header `Authorization` con la API Key

### 📂 Estructura:
```
web/
├── index.php              → Punto de entrada
├── controllers/
│   ├── template.controller.php  → Controlador de plantillas
│   ├── curl.controller.php      → Cliente HTTP para API
│   └── orders.controller.php     → Lógica de órdenes/pedidos
├── views/
│   ├── template.php       → Plantilla principal
│   ├── pages/             → Páginas (home, checkout, thanks)
│   └── modules/           → Módulos reutilizables
└── extensions/            → Librerías externas (PHPMailer, etc.)
```

### 🔄 Flujo de una Compra:
1. Usuario selecciona números en el frontend
2. `OrdersController` valida disponibilidad (consulta API)
3. Crea cliente y orden (POST a API)
4. Integra con PayPal o D-Local para pagos
5. Redirige a página de agradecimiento

### 💡 Ejemplo de Conexión:
```php
// En web/controllers/curl.controller.php
$url = "raffles?linkTo=id_raffle&equalTo=1";
$method = "GET";
$fields = array();

$response = CurlController::request($url, $method, $fields);
// Hace petición a: http://api.raffle.com/raffles?linkTo=id_raffle&equalTo=1
```

---

## 🎛️ 3. CMS (Panel de Administración)

### 📍 Ubicación: `/cms/`

### 🎯 Función:
- **Panel administrativo** para gestionar el sistema
- Permite crear/editar sorteos, ver órdenes, gestionar clientes
- También se conecta a la API para todas las operaciones

### 🔗 Conexión con API:
- Usa su propio `CurlController` (similar al de `/web/`)
- Misma URL: `http://api.raffle.com/`
- Misma API Key para autenticación

### 📂 Estructura:
```
cms/
├── index.php              → Punto de entrada
├── controllers/
│   ├── template.controller.php  → Controlador de plantillas
│   ├── curl.controller.php      → Cliente HTTP para API
│   └── [otros controllers]      → Lógica administrativa
├── views/
│   ├── template.php       → Plantilla del CMS
│   ├── pages/             → Páginas del admin
│   └── modules/            → Módulos del admin
├── ajax/                  → Endpoints AJAX
└── extensions/            → Librerías externas
```

### 🔄 Funcionamiento:
- Los administradores hacen login
- Gestionan sorteos, clientes, órdenes
- Todas las operaciones pasan por la API
- Interfaz con tablas dinámicas y formularios

---

## 🎨 4. TEMPLATE (Plantillas Estáticas)

### 📍 Ubicación: `/template/`

### 🎯 Función:
- **Archivos HTML/CSS/JS estáticos** de referencia
- Plantillas de diseño para el frontend
- No tiene lógica PHP, solo diseño

### 📂 Estructura:
```
template/
├── index.html         → Página principal
├── checkout.html      → Página de checkout
├── thanks.html        → Página de agradecimiento
├── css/               → Estilos
├── js/                → JavaScript
└── img/               → Imágenes
```

### 💡 Nota:
- Estos archivos son **referencia de diseño**
- El código real está en `/web/views/` con PHP dinámico
- Puedes usarlos como guía visual

---

## 🔄 Cómo Se Conectan Todo

### Diagrama de Flujo:

```
┌─────────────┐
│   USUARIO   │
└──────┬──────┘
       │
       ▼
┌─────────────┐      HTTP Request      ┌─────────────┐
│    WEB     │ ────────────────────► │     API     │
│  (Frontend)│                        │  (Backend)  │
└────────────┘◄────────────────────  └──────┬──────┘
       │         JSON Response               │
       │                                     ▼
       │                            ┌─────────────┐
       │                            │   MySQL     │
       │                            │  (raffledb) │
       │                            └─────────────┘
       │
       ▼
┌─────────────┐      HTTP Request      ┌─────────────┐
│    CMS     │ ────────────────────► │     API     │
│  (Admin)   │                        │  (Backend)  │
└────────────┘◄────────────────────  └─────────────┘
       │         JSON Response
       │
       ▼
   [Gestiona]
```

### Flujo Completo de una Compra:

1. **Usuario en WEB** selecciona números
2. **WEB** consulta API: `GET /raffles?id=1` → Verifica disponibilidad
3. **API** consulta MySQL → Retorna datos del sorteo
4. **WEB** crea orden: `POST /orders` → Crea cliente y orden
5. **API** guarda en MySQL → Retorna ID de orden
6. **WEB** integra con PayPal/D-Local → Procesa pago
7. **WEB** redirige a página de agradecimiento

---

## ✅ ¿Son Independientes o Funcionan Juntos?

### **Respuesta: Funcionan en conjunto, pero son independientes**

### Independientes:
- ✅ Cada carpeta tiene su propio `index.php`
- ✅ Pueden ejecutarse en servidores diferentes
- ✅ El CMS y WEB no dependen directamente entre sí
- ✅ La API puede usarse desde cualquier cliente (web, móvil, etc.)

### En Conjunto:
- ✅ WEB y CMS **ambos dependen de la API**
- ✅ La API es el **corazón del sistema**
- ✅ Todos comparten la misma base de datos
- ✅ Todos usan la misma API Key

---

## 🚀 ¿Puedo Usar la API en Otro Lado?

### **¡SÍ! La API es completamente reutilizable**

### Ejemplos de Uso:

#### 1. **Aplicación Móvil (Android/iOS)**
```javascript
// Ejemplo en JavaScript/React Native
fetch('http://api.raffle.com/raffles', {
  method: 'GET',
  headers: {
    'Authorization': 'gsdfgdfhdsfhsdfgh4332465dfhdfgh34sdgsdfg345AFSGFghdrfh4'
  }
})
.then(response => response.json())
.then(data => console.log(data));
```

#### 2. **Otra Aplicación Web**
```php
// Puedes crear otro frontend que use la misma API
$curl = curl_init();
curl_setopt($curl, CURLOPT_URL, 'http://api.raffle.com/raffles');
curl_setopt($curl, CURLOPT_HTTPHEADER, array(
  'Authorization: gsdfgdfhdsfhsdfgh4332465dfhdfgh34sdgsdfg345AFSGFghdrfh4'
));
$response = curl_exec($curl);
```

#### 3. **Integración con Otros Sistemas**
- Puedes conectar la API con WordPress, Shopify, etc.
- Cualquier sistema que pueda hacer HTTP requests puede usarla

### Requisitos:
- ✅ Conocer la URL de la API: `http://api.raffle.com/`
- ✅ Tener la API Key para autenticación
- ✅ Enviar requests HTTP (GET, POST, PUT, DELETE)
- ✅ Procesar respuestas JSON

---

## 🔧 Configuración Actual

### API:
- **URL**: `http://api.raffle.com/`
- **Base de Datos**: `raffledb` (MySQL)
- **Host**: `localhost`
- **Usuario**: `root`
- **Password**: (vacío)

### API Key:
```
gsdfgdfhdsfhsdfgh4332465dfhdfgh34sdgsdfg345AFSGFghdrfh4
```

### Endpoints Principales:
- `GET /raffles` → Obtener sorteos
- `POST /clients` → Crear cliente
- `POST /orders` → Crear orden
- `POST /sales` → Crear venta
- `PUT /orders?id=X` → Actualizar orden
- `DELETE /[tabla]?id=X` → Eliminar registro

---

## 📝 Resumen

| Componente | Función | Depende de | Puede Usarse Solo |
|------------|---------|------------|-------------------|
| **API** | Backend REST, Base de datos | MySQL | ✅ Sí |
| **WEB** | Frontend público | API | ❌ No (necesita API) |
| **CMS** | Panel admin | API | ❌ No (necesita API) |
| **TEMPLATE** | Diseño estático | Ninguno | ✅ Sí (solo HTML) |

---

## 💡 Recomendaciones

1. **La API es el núcleo**: Si cambias algo en la API, afecta a WEB y CMS
2. **Puedes crear nuevos clientes**: La API puede servir a múltiples aplicaciones
3. **Mantén la API Key segura**: Es la llave de acceso a todos los datos
4. **Configuración de dominios**: Asegúrate de que `api.raffle.com` apunte al servidor correcto

---

## 🆘 ¿Necesitas Cambiar Algo?

### Cambiar la URL de la API:
Edita estos archivos:
- `/web/controllers/curl.controller.php` (línea 14)
- `/cms/controllers/curl.controller.php` (línea 24)

### Cambiar la API Key:
Edita estos archivos:
- `/api/models/connection.php` (línea 30)
- `/web/controllers/curl.controller.php` (línea 24)
- `/cms/controllers/curl.controller.php` (línea 15)

### Cambiar la Base de Datos:
Edita:
- `/api/models/connection.php` (líneas 14-16)

---

¿Tienes alguna pregunta específica sobre cómo funciona alguna parte del proyecto?


