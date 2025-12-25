# 🔧 Funcionalidades del Backend (API)

## 📋 Resumen Ejecutivo

Tu backend es una **API REST genérica y dinámica** que funciona como un **ORM (Object-Relational Mapping) automático**. Esto significa que:

- ✅ **No necesitas escribir código SQL específico** para cada tabla
- ✅ **Funciona con cualquier tabla** de tu base de datos
- ✅ **Genera queries automáticamente** según los parámetros que envíes
- ✅ **Valida automáticamente** que las columnas existan antes de ejecutar

---

## 🎯 ¿Qué Implementa el Backend?

### 1. **Sistema de Autenticación**

#### 🔑 API Key (Autenticación Simple)
- **Ubicación**: Header `Authorization`
- **Valor**: `gsdfgdfhdsfhsdfgh4332465dfhdfgh34sdgsdfg345AFSGFghdrfh4`
- **Uso**: Todas las peticiones (excepto públicas) requieren esta key

#### 🔐 JWT Tokens (Autenticación de Usuarios)
- **Librería**: Firebase JWT (`firebase/php-jwt`)
- **Funciones**:
  - `postRegister()` - Registro de usuarios con contraseña encriptada
  - `postLogin()` - Login que genera y retorna JWT token
  - `tokenValidate()` - Valida si un token es válido y no ha expirado

**Características del JWT:**
- Expiración: 24 horas (1 día)
- Algoritmo: HS256
- Secret Key: `dfhsdfg34dfchs4xgsrsdry46`
- Guarda token en BD: `token_[suffix]` y `token_exp_[suffix]`

---

### 2. **Operaciones CRUD Completas**

#### 📖 GET (Leer Datos)

**Funcionalidades implementadas:**

1. **GET Simple** - Obtener todos los registros
   ```
   GET /tabla?select=*
   ```

2. **GET con Filtro** - Filtrar por columnas específicas
   ```
   GET /tabla?linkTo=columna1,columna2&equalTo=valor1,valor2
   ```

3. **GET con Ordenamiento**
   ```
   GET /tabla?orderBy=columna&orderMode=ASC|DESC
   ```

4. **GET con Paginación**
   ```
   GET /tabla?startAt=0&endAt=10
   ```

5. **GET con Búsqueda (LIKE)**
   ```
   GET /tabla?linkTo=nombre&search=texto
   ```

6. **GET con Rangos (BETWEEN)**
   ```
   GET /tabla?linkTo=fecha&between1=2024-01-01&between2=2024-12-31
   ```

7. **GET con Relaciones (JOIN)**
   ```
   GET /relations?rel=tabla1,tabla2&type=tipo1,tipo2&select=*
   ```
   - Hace `INNER JOIN` automático entre tablas relacionadas
   - Genera las relaciones basándose en convenciones de nombres

8. **GET con Relaciones + Filtros**
   ```
   GET /relations?rel=tabla1,tabla2&type=tipo1,tipo2&linkTo=columna&equalTo=valor
   ```

9. **GET con Relaciones + Búsqueda**
   ```
   GET /relations?rel=tabla1,tabla2&type=tipo1,tipo2&linkTo=columna&search=texto
   ```

10. **GET con Relaciones + Rangos**
    ```
    GET /relations?rel=tabla1,tabla2&type=tipo1,tipo2&linkTo=fecha&between1=2024-01-01&between2=2024-12-31
    ```

**Validaciones automáticas:**
- ✅ Verifica que la tabla exista
- ✅ Verifica que las columnas existan
- ✅ Previene SQL Injection con prepared statements

---

#### ✏️ POST (Crear Datos)

**Funcionalidades implementadas:**

1. **POST Simple** - Crear registro
   ```
   POST /tabla
   Body: { "columna1": "valor1", "columna2": "valor2" }
   ```

2. **POST con Registro de Usuario**
   ```
   POST /tabla?register=true&suffix=user
   ```
   - Encripta la contraseña automáticamente
   - Genera JWT token
   - Guarda token en BD

3. **POST con Login**
   ```
   POST /tabla?login=true&suffix=user
   ```
   - Valida email y contraseña
   - Genera nuevo JWT token
   - Retorna usuario con token

4. **POST sin Autenticación** (para endpoints públicos)
   ```
   POST /tabla?token=no&except=id_tabla
   ```
   - Permite crear sin API Key
   - Excluye campos automáticamente (como IDs)

5. **POST con Token JWT** (para usuarios autenticados)
   ```
   POST /tabla?token=JWT_TOKEN&table=users&suffix=user
   ```
   - Valida que el token sea válido
   - Valida que no haya expirado

**Características:**
- ✅ Genera `lastId` automáticamente (ID del registro creado)
- ✅ Maneja valores NULL correctamente
- ✅ Valida que las columnas existan antes de insertar
- ✅ Retorna errores descriptivos de MySQL

---

#### 🔄 PUT (Actualizar Datos)

**Funcionalidades implementadas:**

1. **PUT Simple** - Actualizar registro
   ```
   PUT /tabla?id=123&nameId=id_tabla
   Body: { "columna1": "nuevo_valor" }
   ```

2. **PUT sin Autenticación**
   ```
   PUT /tabla?id=123&nameId=id_tabla&token=no&except=id_tabla
   ```

3. **PUT con Token JWT**
   ```
   PUT /tabla?id=123&nameId=id_tabla&token=JWT_TOKEN
   ```

**Características:**
- ✅ Valida que el ID exista antes de actualizar
- ✅ Actualiza solo las columnas enviadas
- ✅ Usa prepared statements (seguro contra SQL Injection)

---

#### 🗑️ DELETE (Eliminar Datos)

**Funcionalidades implementadas:**

1. **DELETE Simple**
   ```
   DELETE /tabla?id=123&nameId=id_tabla
   ```

2. **DELETE con Token JWT**
   ```
   DELETE /tabla?id=123&nameId=id_tabla&token=JWT_TOKEN
   ```

**Características:**
- ✅ Valida que el ID exista antes de eliminar
- ✅ Retorna confirmación de eliminación

---

### 3. **Sistema de Validación Automática**

#### 🔍 Validación de Tablas y Columnas

El backend valida automáticamente:
- ✅ Que la tabla exista en la base de datos
- ✅ Que las columnas solicitadas existan
- ✅ Que los campos enviados coincidan con las columnas de la tabla

**Método usado:**
```php
Connection::getColumnsData($table, $columns)
```
- Consulta `information_schema.columns` de MySQL
- Verifica existencia antes de ejecutar queries

---

### 4. **Sistema de Relaciones Automáticas**

#### 🔗 JOINs Automáticos

El backend puede hacer JOINs automáticos entre tablas basándose en convenciones de nombres:

**Convención de nombres:**
- Si tienes `tabla1` y `tabla2`
- Y usas `rel=tabla1,tabla2&type=tipo1,tipo2`
- El backend genera: `INNER JOIN tabla2 ON tabla1.id_tipo2_tipo1 = tabla2.id_tipo2`

**Ejemplo:**
```
GET /relations?rel=orders,clients&type=order,client&select=*
```
Genera:
```sql
SELECT * FROM orders 
INNER JOIN clients ON orders.id_client_order = clients.id_client
```

---

### 5. **Sistema de Respuestas Estandarizadas**

#### 📤 Formato de Respuestas

**GET exitoso:**
```json
{
  "status": 200,
  "total": 5,
  "results": [...]
}
```

**POST exitoso:**
```json
{
  "status": 200,
  "results": [
    {
      "lastId": 123,
      "comment": "The process was successful"
    }
  ]
}
```

**PUT/DELETE exitoso:**
```json
{
  "status": 200,
  "results": {
    "comment": "The process was successful"
  }
}
```

**Errores:**
```json
{
  "status": 400|404|500,
  "results": "Mensaje de error"
}
```

---

### 6. **Seguridad Implementada**

#### 🛡️ Características de Seguridad

1. **Prepared Statements**
   - Todas las queries usan PDO prepared statements
   - Previene SQL Injection

2. **Validación de Columnas**
   - No permite insertar/actualizar columnas que no existen
   - Previene errores y posibles exploits

3. **Autenticación por Capas**
   - API Key para acceso general
   - JWT Tokens para usuarios específicos
   - Validación de expiración de tokens

4. **Encriptación de Contraseñas**
   - Usa `crypt()` con salt personalizado
   - Salt: `$2a$07$azybxcags23425sdg23sdfhsd$`

5. **CORS Configurado**
   - Permite peticiones desde cualquier origen
   - Headers configurados en `index.php`

---

## 📊 Funciones Específicas por Método HTTP

### GET - Funciones Disponibles

| Función | Descripción | Parámetros |
|---------|-------------|------------|
| `getData()` | Obtener todos los registros | `select`, `orderBy`, `orderMode`, `startAt`, `endAt` |
| `getDataFilter()` | Filtrar registros | `linkTo`, `equalTo`, + parámetros de ordenamiento |
| `getDataSearch()` | Búsqueda con LIKE | `linkTo`, `search` |
| `getDataRange()` | Filtrar por rango (BETWEEN) | `linkTo`, `between1`, `between2`, `filterTo`, `inTo` |
| `getRelData()` | JOIN sin filtros | `rel`, `type`, `select` |
| `getRelDataFilter()` | JOIN con filtros | `rel`, `type`, `linkTo`, `equalTo` |
| `getRelDataSearch()` | JOIN con búsqueda | `rel`, `type`, `linkTo`, `search` |
| `getRelDataRange()` | JOIN con rangos | `rel`, `type`, `linkTo`, `between1`, `between2` |

---

### POST - Funciones Disponibles

| Función | Descripción | Parámetros Especiales |
|---------|-------------|----------------------|
| `postData()` | Crear registro normal | Ninguno |
| `postRegister()` | Registrar usuario | `?register=true&suffix=user` |
| `postLogin()` | Login de usuario | `?login=true&suffix=user` |
| `postData()` (sin auth) | Crear sin autenticación | `?token=no&except=id_campo` |
| `postData()` (con JWT) | Crear con token | `?token=JWT_TOKEN&table=users&suffix=user` |

---

### PUT - Funciones Disponibles

| Función | Descripción | Parámetros |
|---------|-------------|------------|
| `putData()` | Actualizar registro | `id`, `nameId` (nombre del campo ID) |
| `putData()` (sin auth) | Actualizar sin auth | `?token=no&except=id_campo` |
| `putData()` (con JWT) | Actualizar con token | `?token=JWT_TOKEN` |

---

### DELETE - Funciones Disponibles

| Función | Descripción | Parámetros |
|---------|-------------|------------|
| `deleteData()` | Eliminar registro | `id`, `nameId` |

---

## 🔄 Flujo de una Petición

```
1. Cliente hace petición HTTP
   ↓
2. api/index.php recibe la petición
   ↓
3. api/routes/routes.php analiza la URL
   ↓
4. Valida API Key (si es necesario)
   ↓
5. Determina método HTTP (GET/POST/PUT/DELETE)
   ↓
6. Incluye el servicio correspondiente (get.php/post.php/etc)
   ↓
7. El servicio valida parámetros y columnas
   ↓
8. Llama al Controller correspondiente
   ↓
9. El Controller llama al Model
   ↓
10. El Model ejecuta la query en MySQL
   ↓
11. Retorna respuesta JSON estandarizada
```

---

## 💡 Ventajas de este Backend

### ✅ **Genérico y Reutilizable**
- Funciona con **cualquier tabla** sin modificar código
- Solo necesitas seguir las convenciones de nombres

### ✅ **Seguro**
- Prepared statements previenen SQL Injection
- Validación automática de columnas
- Sistema de autenticación por capas

### ✅ **Flexible**
- Múltiples formas de filtrar, ordenar, paginar
- Soporte para relaciones complejas
- Búsquedas y rangos de fechas

### ✅ **Fácil de Usar**
- No necesitas escribir SQL manualmente
- Parámetros simples en la URL
- Respuestas JSON consistentes

---

## 📝 Ejemplos de Uso Real

### Ejemplo 1: Obtener un sorteo específico
```
GET http://api.raffle.com/raffles?linkTo=id_raffle,status_raffle&equalTo=1,1&select=id_raffle,price_raffle
```

### Ejemplo 2: Crear un cliente
```
POST http://api.raffle.com/clients?token=no&except=id_client
Body: {
  "name_client": "Juan",
  "email_client": "juan@email.com",
  "phone_client": "123456789"
}
```

### Ejemplo 3: Buscar sorteos activos
```
GET http://api.raffle.com/raffles?linkTo=status_raffle&equalTo=1&orderBy=date_created_raffle&orderMode=DESC
```

### Ejemplo 4: Obtener órdenes con datos del cliente (JOIN)
```
GET http://api.raffle.com/relations?rel=orders,clients&type=order,client&select=*&linkTo=status_order&equalTo=PENDING
```

### Ejemplo 5: Actualizar estado de una orden
```
PUT http://api.raffle.com/orders?id=123&nameId=id_order&token=no&except=id_order
Body: {
  "status_order": "COMPLETED"
}
```

---

## 🎯 Resumen de Funcionalidades

| Funcionalidad | ¿Está Implementada? | Descripción |
|---------------|---------------------|-------------|
| CRUD Completo | ✅ Sí | Create, Read, Update, Delete |
| Filtros | ✅ Sí | Por columnas específicas |
| Búsqueda | ✅ Sí | LIKE en columnas |
| Rangos | ✅ Sí | BETWEEN para fechas/números |
| Ordenamiento | ✅ Sí | ASC/DESC por cualquier columna |
| Paginación | ✅ Sí | LIMIT con startAt/endAt |
| JOINs | ✅ Sí | Relaciones automáticas |
| Autenticación API Key | ✅ Sí | Header Authorization |
| Autenticación JWT | ✅ Sí | Tokens para usuarios |
| Validación de Columnas | ✅ Sí | Automática |
| Seguridad SQL Injection | ✅ Sí | Prepared statements |
| Respuestas JSON | ✅ Sí | Formato estandarizado |
| Manejo de Errores | ✅ Sí | Códigos HTTP apropiados |

---

## 🚀 ¿Qué Puedes Hacer con Este Backend?

1. **Crear cualquier tipo de aplicación** que necesite CRUD
2. **Conectar múltiples frontends** (web, móvil, desktop)
3. **Gestionar cualquier tabla** sin escribir código nuevo
4. **Implementar autenticación** de usuarios fácilmente
5. **Hacer consultas complejas** con JOINs automáticos
6. **Escalar fácilmente** agregando nuevas tablas

---

## ⚠️ Limitaciones Actuales

1. **No tiene validación de tipos de datos** (solo valida existencia de columnas)
2. **No tiene validación de reglas de negocio** (ej: email válido, números positivos)
3. **No tiene soft deletes** (elimina permanentemente)
4. **No tiene auditoría** (no guarda quién hizo qué)
5. **No tiene rate limiting** (no limita peticiones por tiempo)
6. **No tiene caché** (siempre consulta la BD)

---

¿Quieres que te explique alguna funcionalidad específica en más detalle o que te ayude a implementar algo nuevo?

