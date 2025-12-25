# 📊 Plan de Revisión de Supabase - Paso a Paso

## 🎯 Objetivo

Verificar que todo esté correctamente configurado en Supabase para que el sistema funcione en producción.

---

## 📍 PASO 1: Acceder a Supabase Dashboard

1. Ve a: https://supabase.com/dashboard
2. Inicia sesión con tu cuenta
3. Selecciona tu proyecto: **Rifassorteados** (o el nombre que tengas)

---

## 🗄️ PASO 2: Verificar Base de Datos

### 2.1 Tablas Existentes

**Ubicación:** `Table Editor` (menú lateral izquierdo)

Verifica que existan estas tablas:

- [ ] `users`
- [ ] `raffles`
- [ ] `customers`
- [ ] `sales`
- [ ] `tickets`
- [ ] `payments`
- [ ] `notifications`
- [ ] `transaction_logs`

**Cómo verificar:**
1. Click en "Table Editor"
2. Deberías ver todas las tablas listadas
3. Si falta alguna, ejecuta el SQL de `sql.supabase`

### 2.2 Estructura de Tablas Críticas

**Verificar tabla `payments`:**

1. Click en tabla `payments`
2. Verifica que tenga estas columnas:
   - [ ] `id` (UUID)
   - [ ] `sale_id` (UUID, referencia a sales)
   - [ ] `payment_id` (VARCHAR, único)
   - [ ] `transaction_id` (INTEGER, nullable)
   - [ ] `client_transaction_id` (VARCHAR, nullable)
   - [ ] `amount` (DECIMAL)
   - [ ] `currency` (VARCHAR)
   - [ ] `status` (VARCHAR)
   - [ ] `payphone_response` (JSONB)
   - [ ] `webhook_received` (BOOLEAN)
   - [ ] `webhook_data` (JSONB)
   - [ ] `created_at` (TIMESTAMP)
   - [ ] `updated_at` (TIMESTAMP)

**Si falta alguna columna:**
```sql
-- Ejecutar en SQL Editor
ALTER TABLE payments 
ADD COLUMN IF NOT EXISTS transaction_id INTEGER,
ADD COLUMN IF NOT EXISTS client_transaction_id VARCHAR(255);
```

---

## 🔐 PASO 3: Verificar Políticas RLS (Row Level Security)

**Ubicación:** `Authentication` > `Policies` (o en cada tabla)

### 3.1 Verificar que RLS esté habilitado

Para cada tabla importante:
1. Click en la tabla
2. Ve a la pestaña "Policies"
3. Verifica que diga "RLS Enabled"

**Tablas que DEBEN tener RLS:**
- [ ] `users`
- [ ] `raffles`
- [ ] `customers`
- [ ] `sales`
- [ ] `tickets`
- [ ] `payments`
- [ ] `notifications`

### 3.2 Verificar Políticas Existentes

**Para tabla `customers`:**
- [ ] Política INSERT: "Anyone can create customer"
- [ ] Política SELECT: "Users can view own customer record"

**Para tabla `sales`:**
- [ ] Política INSERT: "Anyone can create sale"
- [ ] Política SELECT: "Users can view own sales"
- [ ] Política UPDATE: Para actualizar `payment_status`

**Si faltan políticas:**
Ejecuta este SQL en `SQL Editor`:

```sql
-- Política INSERT para customers (permite guests)
CREATE POLICY "Anyone can create customer"
  ON customers FOR INSERT
  WITH CHECK (true);

-- Política UPDATE para customers (usuarios autenticados)
CREATE POLICY "Users can update own customer"
  ON customers FOR UPDATE
  USING (user_id = (SELECT id FROM users WHERE auth_user_id = auth.uid()))
  WITH CHECK (user_id = (SELECT id FROM users WHERE auth_user_id = auth.uid()));

-- Política INSERT para sales (permite guests)
CREATE POLICY "Anyone can create sale"
  ON sales FOR INSERT
  WITH CHECK (true);

-- Política UPDATE para sales (actualizar payment_status)
CREATE POLICY "Anyone can update sale payment status"
  ON sales FOR UPDATE
  USING (true)
  WITH CHECK (true);
```

---

## ⚙️ PASO 4: Verificar Funciones SQL

**Ubicación:** `Database` > `Functions` (o en SQL Editor)

### 4.1 Funciones Críticas

Verifica que existan estas funciones:

- [ ] `assign_tickets_atomic`
- [ ] `get_raffle_sold_percentage`
- [ ] `check_tickets_availability`
- [ ] `format_ticket_number`
- [ ] `find_winning_ticket`
- [ ] `handle_new_user` (trigger function)
- [ ] `sync_customer_with_user` (trigger function)
- [ ] `update_updated_at_column` (trigger function)
- [ ] `log_transaction` (trigger function)

**Cómo verificar:**
1. Ve a `Database` > `Functions`
2. O ejecuta en SQL Editor:
```sql
SELECT routine_name, routine_type
FROM information_schema.routines
WHERE routine_schema = 'public'
ORDER BY routine_name;
```

**Si falta alguna:**
Ejecuta el SQL completo de `sql.supabase`

---

## 🔔 PASO 5: Verificar Triggers

**Ubicación:** `Database` > `Triggers` (o en SQL Editor)

### 5.1 Triggers Importantes

- [ ] `on_auth_user_created` - Crea perfil automáticamente
- [ ] `on_user_created_sync_customer` - Sincroniza customer
- [ ] `update_*_updated_at` - Actualiza timestamps
- [ ] `log_*_changes` - Logs de auditoría

**Cómo verificar:**
```sql
SELECT trigger_name, event_object_table, action_statement
FROM information_schema.triggers
WHERE trigger_schema = 'public'
ORDER BY trigger_name;
```

---

## 🔗 PASO 6: Verificar Vistas

**Ubicación:** `Database` > `Views` (o en SQL Editor)

### 6.1 Vistas Importantes

- [ ] `public_raffles` - Vista pública de sorteos
- [ ] `my_tickets` - Vista de boletos del usuario

**Cómo verificar:**
```sql
SELECT table_name, view_definition
FROM information_schema.views
WHERE table_schema = 'public';
```

---

## 🚀 PASO 7: Verificar Edge Functions

**Ubicación:** `Edge Functions` (menú lateral)

### 7.1 Funciones Necesarias

- [ ] `confirm-payphone-button` - Confirma pagos de Cajita
- [ ] `create-payphone-payment` - Crea pagos (API Sale, opcional)
- [ ] `check-payphone-status` - Consulta estado (API Sale, opcional)

**Cómo verificar:**
1. Click en "Edge Functions"
2. Deberías ver las funciones listadas
3. Si falta alguna, créala desde el Dashboard o despliega con CLI

### 7.2 Variables de Entorno de Edge Functions

**Ubicación:** `Edge Functions` > `Settings` > `Secrets`

Verifica que estén configuradas:

- [ ] `PAYPHONE_TOKEN` - Token de Payphone
- [ ] `PAYPHONE_STORE_ID` - Store ID (opcional, puede ir en .env)
- [ ] `SUPABASE_URL` - URL de tu proyecto (ya existe)
- [ ] `SUPABASE_SERVICE_ROLE_KEY` - Service role key (ya existe)

**Cómo configurar:**
1. Ve a `Edge Functions` > `Settings`
2. Sección "Secrets"
3. Click en "Add new secret"
4. Agrega cada variable

---

## 🔑 PASO 8: Verificar Autenticación

**Ubicación:** `Authentication` > `Providers`

### 8.1 Proveedores Habilitados

- [ ] Email (debe estar habilitado)
- [ ] Otros (opcional)

### 8.2 Configuración de Email

**Ubicación:** `Authentication` > `Email Templates`

- [ ] Templates de email configurados
- [ ] SMTP configurado (si usas emails personalizados)

---

## 📊 PASO 9: Verificar Índices

**Ubicación:** SQL Editor

Ejecuta para verificar índices importantes:

```sql
-- Ver índices de payments (crítico para pagos)
SELECT 
  indexname,
  tablename,
  indexdef
FROM pg_indexes
WHERE schemaname = 'public'
  AND tablename = 'payments'
ORDER BY indexname;

-- Deberías ver:
-- idx_payments_sale_id
-- idx_payments_payment_id
-- idx_payments_transaction_id
-- idx_payments_client_transaction_id
-- idx_payments_status
```

**Si falta algún índice:**
```sql
CREATE INDEX IF NOT EXISTS idx_payments_transaction_id 
ON payments(transaction_id) 
WHERE transaction_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_payments_client_transaction_id 
ON payments(client_transaction_id) 
WHERE client_transaction_id IS NOT NULL;
```

---

## 🧪 PASO 10: Pruebas Básicas

### 10.1 Probar Crear Usuario

1. Ve a `Authentication` > `Users`
2. Click en "Add user" > "Create new user"
3. Crea un usuario de prueba
4. Verifica que se cree automáticamente en tabla `users`

### 10.2 Probar Query Básica

En SQL Editor, ejecuta:

```sql
-- Ver sorteos activos
SELECT * FROM public_raffles LIMIT 5;

-- Ver usuarios
SELECT id, email, name FROM users LIMIT 5;

-- Ver customers
SELECT id, name, email FROM customers LIMIT 5;
```

### 10.3 Probar Función de Asignación

```sql
-- Obtener un sorteo de prueba
SELECT id FROM raffles WHERE status = 'active' LIMIT 1;

-- Verificar disponibilidad (reemplaza UUID con uno real)
SELECT * FROM check_tickets_availability(
  'TU_RAFFLE_ID_AQUI'::uuid,
  5
);
```

---

## 📝 PASO 11: Verificar Logs y Monitoreo

**Ubicación:** `Logs` (menú lateral)

### 11.1 Revisar Logs Recientes

1. Ve a `Logs`
2. Revisa si hay errores recientes
3. Filtra por nivel: Error, Warning

### 11.2 Configurar Alertas (Opcional)

- [ ] Alertas de errores
- [ ] Alertas de uso de recursos
- [ ] Alertas de seguridad

---

## 🔒 PASO 12: Verificar Seguridad

### 12.1 API Keys

**Ubicación:** `Settings` > `API`

- [ ] `anon` key - Para frontend (pública)
- [ ] `service_role` key - Para Edge Functions (secreta)

**⚠️ IMPORTANTE:**
- Nunca expongas `service_role` en el frontend
- Solo úsala en Edge Functions

### 12.2 RLS Verificado

- [ ] Todas las tablas tienen RLS habilitado
- [ ] Políticas correctas para cada tabla
- [ ] Usuarios guest pueden crear customers y sales
- [ ] Usuarios autenticados ven solo sus datos

---

## 📋 Checklist Final de Supabase

### Base de Datos
- [ ] Todas las tablas creadas
- [ ] Todas las columnas necesarias
- [ ] Índices creados
- [ ] Funciones SQL funcionando
- [ ] Triggers activos
- [ ] Vistas creadas

### Seguridad
- [ ] RLS habilitado
- [ ] Políticas correctas
- [ ] API keys seguras
- [ ] Service role solo en Edge Functions

### Edge Functions
- [ ] Funciones desplegadas
- [ ] Variables de entorno configuradas
- [ ] Funciones probadas

### Autenticación
- [ ] Email provider habilitado
- [ ] Templates configurados
- [ ] Triggers de usuario funcionando

---

## 🎯 Resumen de Verificación

**Ejecuta este SQL para verificar todo:**

```sql
-- Resumen completo
SELECT 
  'Tablas' as tipo,
  COUNT(*) as cantidad
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_type = 'BASE TABLE'

UNION ALL

SELECT 
  'Funciones' as tipo,
  COUNT(*) as cantidad
FROM information_schema.routines
WHERE routine_schema = 'public'

UNION ALL

SELECT 
  'Triggers' as tipo,
  COUNT(*) as cantidad
FROM information_schema.triggers
WHERE trigger_schema = 'public'

UNION ALL

SELECT 
  'Vistas' as tipo,
  COUNT(*) as cantidad
FROM information_schema.views
WHERE table_schema = 'public';
```

**Resultado esperado:**
- Tablas: 8
- Funciones: ~9
- Triggers: ~8
- Vistas: 2

---

## 🆘 Si Algo Falla

1. **Revisa los logs** en `Logs` > `Postgres Logs`
2. **Ejecuta el SQL completo** de `sql.supabase`
3. **Verifica las políticas RLS** una por una
4. **Consulta la documentación** de Supabase

---

## ✅ Estado Final

Una vez completado este checklist, tu Supabase estará:
- ✅ Configurado correctamente
- ✅ Seguro (RLS habilitado)
- ✅ Optimizado (índices creados)
- ✅ Listo para producción
