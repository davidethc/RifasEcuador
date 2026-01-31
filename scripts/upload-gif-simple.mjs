/**
 * Script simple para subir el GIF a Supabase Storage
 * Usa las variables de entorno de .env.local
 * 
 * Ejecutar: node scripts/upload-gif-simple.mjs
 */

import { createClient } from '@supabase/supabase-js';
import { readFile } from 'fs/promises';
import { join } from 'path';
import { config } from 'dotenv';
import { resolve } from 'path';

// Cargar variables de entorno desde .env.local
config({ path: resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Error: Faltan variables de entorno');
  console.error('Necesitas: NEXT_PUBLIC_SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY en .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);
const BUCKET_NAME = 'public-assets';
const FILE_NAME = 'gifhero.gif';
const FILE_PATH = join(process.cwd(), 'public', FILE_NAME);

async function uploadGif() {
  try {
    console.log('📦 Iniciando subida del GIF a Supabase Storage...');
    console.log(`🔗 Proyecto: ${supabaseUrl}`);
    console.log(`📁 Archivo: ${FILE_PATH}`);

    // Leer el archivo
    const fileBuffer = await readFile(FILE_PATH);
    const fileSizeMB = (fileBuffer.length / (1024 * 1024)).toFixed(2);
    console.log(`📊 Tamaño: ${fileSizeMB} MB`);

    // Verificar si el bucket existe
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();
    
    if (listError) {
      console.error('❌ Error al listar buckets:', listError);
      process.exit(1);
    }

    const bucketExists = buckets?.some(b => b.name === BUCKET_NAME);

    if (!bucketExists) {
      console.log(`📦 Creando bucket "${BUCKET_NAME}"...`);
      // Intentar crear bucket sin límite de tamaño primero
      const { error: createError } = await supabase.storage.createBucket(BUCKET_NAME, {
        public: true,
        // No especificar fileSizeLimit para usar el límite por defecto del plan
        allowedMimeTypes: ['image/gif', 'image/png', 'image/jpeg', 'video/mp4'],
      });

      if (createError) {
        console.error('❌ Error al crear bucket:', createError);
        console.error('💡 Asegúrate de usar SUPABASE_SERVICE_ROLE_KEY (no ANON_KEY)');
        process.exit(1);
      }
      console.log('✅ Bucket creado');
    } else {
      console.log(`✅ Bucket "${BUCKET_NAME}" existe`);
    }

    // Subir el archivo
    const storageFileName = 'gifhero.gif';
    console.log(`⬆️  Subiendo como "${storageFileName}"...`);
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(storageFileName, fileBuffer, {
        contentType: 'image/gif',
        upsert: true,
        cacheControl: '3600',
      });

    if (uploadError) {
      console.error('❌ Error al subir:', uploadError);
      process.exit(1);
    }

    // Obtener URL pública
    const { data: urlData } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(storageFileName);

    console.log('\n🎉 ¡Subida completada!');
    console.log(`\n📎 URL pública:`);
    console.log(`   ${urlData.publicUrl}`);
    console.log(`\n💡 Agrega a tu .env.local:`);
    console.log(`   NEXT_PUBLIC_GIF_URL=${urlData.publicUrl}`);

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

uploadGif();
