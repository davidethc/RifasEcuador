/**
 * Crea un usuario admin en Supabase Auth y lo registra en user_roles.
 *
 * Uso (desde la raíz del proyecto, con .env.local cargado):
 *   npx tsx scripts/create-admin-user.ts
 *
 * Requiere en .env.local:
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 */

import { config } from 'dotenv';
import { resolve } from 'path';
import { createClient } from '@supabase/supabase-js';

// Cargar .env.local desde la raíz del proyecto
config({ path: resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Faltan NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY en .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const ADMIN_EMAIL = 'santiago@altokeec.com';
const ADMIN_PASSWORD = 'SantiagoTokeec123';

async function main() {
  console.log('Creando usuario admin:', ADMIN_EMAIL);

  const { data: userData, error: createError } = await supabase.auth.admin.createUser({
    email: ADMIN_EMAIL,
    password: ADMIN_PASSWORD,
    email_confirm: true,
  });

  if (createError) {
    if (createError.message?.includes('already been registered') || createError.message?.toLowerCase().includes('already exists')) {
      console.log('El usuario ya existe. Buscando id para asignar rol admin...');
      const { data: list } = await supabase.auth.admin.listUsers();
      const existing = list?.users?.find((u) => u.email === ADMIN_EMAIL);
      if (!existing) {
        console.error('❌ No se pudo encontrar el usuario existente:', createError.message);
        process.exit(1);
      }
      await addAdminRole(existing.id);
      return;
    }
    console.error('❌ Error al crear usuario:', createError.message);
    process.exit(1);
  }

  const userId = userData.user?.id;
  if (!userId) {
    console.error('❌ No se devolvió el id del usuario');
    process.exit(1);
  }

  await addAdminRole(userId);
  console.log('✅ Usuario admin creado:', ADMIN_EMAIL);
  console.log('   Contraseña:', ADMIN_PASSWORD);
  console.log('   Inicia sesión en el panel admin con este correo y contraseña.');
}

async function addAdminRole(userId: string) {
  const { error } = await supabase.from('user_roles').insert({ user_id: userId, role: 'admin' });
  if (error) {
    if (error.code === '23505') {
      console.log('✅ El usuario ya tenía rol admin en user_roles.');
      return;
    }
    console.error('❌ Error al asignar rol admin (¿existe la tabla user_roles?):', error.message);
    process.exit(1);
  }
  console.log('✅ Rol admin asignado en user_roles.');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
