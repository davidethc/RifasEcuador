/**
 * Script para gestionar usuarios administradores
 * 
 * Uso:
 * npx tsx scripts/manage-admin.ts create <email> <password>
 * npx tsx scripts/manage-admin.ts reset-password <email> <new-password>
 * npx tsx scripts/manage-admin.ts list
 */

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import { resolve } from 'path';

// Cargar variables de entorno desde .env.local
config({ path: resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Faltan variables de entorno NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function createAdminUser(email: string, password: string) {
  console.log(`\n🔧 Creando usuario admin: ${email}`);
  
  // 1. Crear usuario en auth
  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true, // Auto-confirmar email
  });

  if (authError) {
    console.error('❌ Error creando usuario:', authError.message);
    return;
  }

  console.log('✅ Usuario creado en auth:', authData.user?.id);

  // 2. Crear perfil
  const { error: profileError } = await supabase
    .from('profiles')
    .insert({
      id: authData.user!.id,
      email: email,
      full_name: email.split('@')[0],
    });

  if (profileError) {
    console.error('⚠️  Error creando perfil:', profileError.message);
  } else {
    console.log('✅ Perfil creado');
  }

  // 3. Asignar rol admin
  const { error: roleError } = await supabase
    .from('user_roles')
    .insert({
      user_id: authData.user!.id,
      role: 'admin',
      created_by: authData.user!.id,
    });

  if (roleError) {
    console.error('❌ Error asignando rol admin:', roleError.message);
    return;
  }

  console.log('✅ Rol admin asignado');
  console.log(`\n✨ ¡Usuario admin creado exitosamente!`);
  console.log(`   Email: ${email}`);
  console.log(`   Password: ${password}`);
  console.log(`\n🌐 Puedes iniciar sesión en: http://localhost:3000/admin/login\n`);
}

async function resetPassword(email: string, newPassword: string) {
  console.log(`\n🔧 Reseteando contraseña para: ${email}`);

  // Buscar usuario por email
  const { data: users, error: listError } = await supabase.auth.admin.listUsers();
  
  if (listError) {
    console.error('❌ Error listando usuarios:', listError.message);
    return;
  }

  const user = users.users.find(u => u.email === email);
  
  if (!user) {
    console.error(`❌ Usuario no encontrado: ${email}`);
    return;
  }

  // Actualizar contraseña
  const { error: updateError } = await supabase.auth.admin.updateUserById(
    user.id,
    { password: newPassword }
  );

  if (updateError) {
    console.error('❌ Error actualizando contraseña:', updateError.message);
    return;
  }

  console.log('✅ Contraseña actualizada exitosamente');
  console.log(`\n🔑 Nuevas credenciales:`);
  console.log(`   Email: ${email}`);
  console.log(`   Password: ${newPassword}`);
  console.log(`\n🌐 Puedes iniciar sesión en: http://localhost:3000/admin/login\n`);
}

async function listAdminUsers() {
  console.log('\n📋 Listando usuarios admin...\n');

  const { data: roles, error: roleError } = await supabase
    .from('user_roles')
    .select('user_id, role, created_at')
    .eq('role', 'admin');

  if (roleError) {
    console.error('❌ Error obteniendo roles:', roleError.message);
    return;
  }

  if (!roles || roles.length === 0) {
    console.log('⚠️  No hay usuarios admin');
    return;
  }

  const { data: users, error: usersError } = await supabase.auth.admin.listUsers();
  
  if (usersError) {
    console.error('❌ Error obteniendo usuarios:', usersError.message);
    return;
  }

  const userMap = new Map(users.users.map(u => [u.id, u]));

  console.log('Usuarios Admin:\n');
  roles.forEach((role, index) => {
    const user = userMap.get(role.user_id);
    console.log(`${index + 1}. ${user?.email || 'Email desconocido'}`);
    console.log(`   ID: ${role.user_id}`);
    console.log(`   Email confirmado: ${user?.email_confirmed_at ? '✅ Sí' : '❌ No'}`);
    console.log(`   Creado: ${new Date(role.created_at).toLocaleString('es-EC')}`);
    console.log('');
  });
}

// Main
const args = process.argv.slice(2);
const command = args[0];

(async () => {
  try {
    switch (command) {
      case 'create':
        const email = args[1];
        const password = args[2];
        if (!email || !password) {
          console.error('❌ Uso: npx tsx scripts/manage-admin.ts create <email> <password>');
          process.exit(1);
        }
        await createAdminUser(email, password);
        break;

      case 'reset-password':
        const resetEmail = args[1];
        const newPassword = args[2];
        if (!resetEmail || !newPassword) {
          console.error('❌ Uso: npx tsx scripts/manage-admin.ts reset-password <email> <new-password>');
          process.exit(1);
        }
        await resetPassword(resetEmail, newPassword);
        break;

      case 'list':
        await listAdminUsers();
        break;

      default:
        console.log(`
🔧 Gestor de Usuarios Admin

Comandos disponibles:

  npx tsx scripts/manage-admin.ts create <email> <password>
      Crea un nuevo usuario admin

  npx tsx scripts/manage-admin.ts reset-password <email> <new-password>
      Resetea la contraseña de un usuario existente

  npx tsx scripts/manage-admin.ts list
      Lista todos los usuarios admin

Ejemplos:
  npx tsx scripts/manage-admin.ts create admin@test.com MiPassword123
  npx tsx scripts/manage-admin.ts reset-password santiago@altokeec.com NuevaPassword123
  npx tsx scripts/manage-admin.ts list
        `);
        break;
    }
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
})();
