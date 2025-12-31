# 🧾 Confirmación de Transacciones Payphone

## 📋 Resumen del Flujo

Una vez que el usuario completa el pago, Payphone redirige automáticamente a la **URL de respuesta** configurada en el panel de Payphone con dos parámetros esenciales en la cadena de consulta:

1. **`id`**: Número entero que representa el identificador único de la transacción generado por Payphone
2. **`clientTransactionId`**: Cadena de texto definida como identificador único por tu plataforma al iniciar el pago

## ✅ Confirmar el Estado de la Transacción

Para verificar si una transacción fue aprobada, cancelada o fallida, debes realizar una solicitud POST al endpoint de confirmación de Payphone.

### 🔗 Endpoint del API Confirm

```
POST https://pay.payphonetodoesposible.com/api/button/V2/Confirm
```

### 📦 Cuerpo de la Solicitud (JSON)

El cuerpo de la solicitud debe ser un objeto JSON que contenga los siguientes parámetros:

```json
{
  "id": 0,
  "clientTxId": "string"
}
```

**Parámetros:**
- `id`: El valor del parámetro `id` recibido en la URL (convertido a número entero)
- `clientTxId`: El valor del parámetro `clientTransactionId` recibido en la URL

### 🔐 Headers Requeridos

Es fundamental incluir las siguientes cabeceras en la solicitud:

```
Authorization: Bearer TU_TOKEN
Content-Type: application/json
```

- **Authorization**: Debe contener el token de autenticación de tu aplicación, precedido por la palabra "Bearer". Este token es el mismo que utilizaste al preparar la transacción inicialmente.
- **Content-Type**: Indica que el formato de los datos enviados en el cuerpo de la solicitud es JSON.

## 📬 Respuesta Satisfactoria

Si la solicitud es correcta, recibirás un objeto JSON con el detalle de la transacción:

```json
{
    "email": "aloy@mail.com",
    "cardType": "Credit",
    "bin": "530219",
    "lastDigits": "XX17",
    "deferredCode": "00000000",
    "deferred": false,
    "cardBrandCode": "51",
    "cardBrand": "Mastercard Produbanco/Promerica",
    "amount": 315,
    "clientTransactionId": "ID_UNICO_X_TRANSACCION-001",
    "phoneNumber": "593999999999",
    "statusCode": 3,
    "transactionStatus": "Approved",
    "authorizationCode": "W23178284",
    "message": null,
    "messageCode": 0,
    "transactionId": 23178284,
    "document": "1234567890",
    "currency": "USD",
    "optionalParameter3": "Descripción Extra",
    "optionalParameter4": "ELISABETH SOBECK",
    "storeName": "Tienda Payphone",
    "date": "2023-10-10T11:57:26.367",
    "regionIso": "EC",
    "transactionType": "Classic",
    "reference": "Pago por venta Fact#001"
}
```

### 📝 Descripción de Parámetros de Respuesta

| Parámetro | Descripción |
|-----------|-------------|
| `statusCode` | Código de estado de la transacción. **2 = Cancelado**, **3 = Aprobada** |
| `transactionStatus` | Estado de la transacción (`Approved` o `Canceled`) |
| `clientTransactionId` | Identificador de transacción que enviaste en la petición |
| `authorizationCode` | Código de autorización bancario |
| `transactionId` | Identificador de transacción asignado por Payphone |
| `email` | El correo electrónico registrado en el formulario para el pago |
| `phoneNumber` | Número de teléfono registrado en el formulario para el pago |
| `document` | Número de cédula registrado en el formulario para el pago |
| `amount` | Monto total pagado (en centavos) |
| `cardType` | Tipo de tarjeta utilizada (`Credit` o `Debit`) |
| `cardBrandCode` | Código de la marca de la tarjeta |
| `cardBrand` | Marca de la tarjeta: Visa, MasterCard, Diners Club, Discover y Banco Emisor |
| `bin` | Primeros 6 dígitos de la tarjeta utilizada |
| `lastDigits` | Últimos dígitos de la tarjeta utilizada |
| `deferredCode` | Código de diferido empleado por el usuario |
| `deferredMessage` | Mensaje del diferido |
| `deferred` | Indica si se usó un diferido (booleano) |
| `message` | Mensaje de error, si corresponde |
| `messageCode` | Código de mensaje |
| `currency` | Moneda utilizada para el pago |
| `reference` | Motivo de la transacción |
| `optionalParameter3` | Parámetro opcional |
| `optionalParameter4` | Nombre del titular si el pago es con tarjeta |
| `storeName` | Nombre de la tienda que cobró |
| `date` | Fecha de cobro en formato ISO 8601 |
| `regionIso` | Códigos de país en ISO 3166-1 |
| `transactionType` | Tipo de Transacción |

## 📬 Respuesta con Error

Si la solicitud contiene algún error, recibirás un objeto JSON con el detalle del error:

```json
{
    "message": "La transacción no existe, verifique que el identificador enviado sea correcto.",
    "errorCode": 20
}
```

## 🔙 ⚠️ IMPORTANTE: Reverso Automático

**Si tu sistema no ejecuta la fase de confirmación dentro de los primeros 5 minutos después del pago, Payphone reversará automáticamente la transacción.**

Esto se hace para proteger tanto al comercio como al cliente, evitando:

1. **Cobros indebidos**
2. **Procesos incompletos por falta de datos**
3. **Conflictos o reclamos por parte del cliente**

**📖 En resumen:** Si no confirmas el pago, **Payphone lo cancela automáticamente**, ya que no puede garantizar que el comercio haya registrado correctamente la transacción.

## 🔧 Implementación en el Proyecto

### 1. Callback Route (`/api/payment/payphone/callback`)

Este endpoint recibe la redirección de Payphone con los parámetros `id` y `clientTransactionId`:

```typescript
// GET /api/payment/payphone/callback?id=123456&clientTransactionId=ord-abc123-1234567890
```

### 2. Confirmación de Transacción

El callback llama internamente a la función `confirmPayphoneTransaction()` que realiza:

```typescript
POST https://pay.payphonetodoesposible.com/api/button/V2/Confirm
Headers:
  Authorization: Bearer ${token}
  Content-Type: application/json
Body:
{
  "id": parseInt(transactionId),
  "clientTxId": clientTransactionId
}
```

### 3. Procesamiento de la Respuesta

Según el `statusCode` recibido:

- **`statusCode === 3`** (Aprobada):
  - Actualizar orden a `status: 'completed'`
  - Actualizar tickets a `status: 'paid'`
  - Crear/actualizar registro en tabla `payments`
  - Enviar correo de confirmación
  - Redirigir a página de éxito

- **`statusCode === 2`** (Cancelado):
  - Actualizar orden a `status: 'expired'`
  - Redirigir a página de error

- **Otro estado** (Pendiente):
  - Mantener orden en estado actual
  - Redirigir a página de espera

## 📚 Referencias

- **Documentación oficial**: https://www.docs.payphone.app/boton-de-pago-por-redireccion#sect4
- **Endpoint de confirmación**: `https://pay.payphonetodoesposible.com/api/button/V2/Confirm`
- **Código implementado**: 
  - `/app/api/payment/payphone/callback/route.ts`
  - `/app/api/payment/payphone/confirm/route.ts`

---

**Última actualización**: Enero 2025
