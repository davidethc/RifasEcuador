/**
 * Script para subir el GIF grande a Supabase Storage
 * 
 * Uso:
 * 1. Asegúrate de tener las variables de entorno configuradas:
 *    - NEXT_PUBLIC_SUPABASE_URL
 *    - NEXT_PUBLIC_SUPABASE_ANON_KEY (o SUPABASE_SERVICE_ROLE_KEY para admin)
 * 
 * 2. Ejecuta: npx tsx scripts/upload-gif-to-supabase.ts
 * 
 * 3. El script creará un bucket "public-assets" si no existe
 * 4. Subirá el GIF y te dará la URL pública
 */

import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Error: Faltan variables de entorno');
  console.error('Necesitas: NEXT_PUBLIC_SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY (o NEXT_PUBLIC_SUPABASE_ANON_KEY)');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const BUCKET_NAME = 'public-assets';
const FILE_NAME = 'Diseño Video.gif';
const FILE_PATH = path.join(process.cwd(), 'public', FILE_NAME);

async function uploadGif() {
  try {
    console.log('📦 Iniciando subida del GIF a Supabase Storage...');
    console.log(`📁 Archivo: ${FILE_PATH}`);

    // Verificar que el archivo existe
    if (!fs.existsSync(FILE_PATH)) {
      console.error(`❌ Error: El archivo ${FILE_PATH} no existe`);
      process.exit(1);
    }

    const fileStats = fs.statSync(FILE_PATH);
    const fileSizeMB = (fileStats.size / (1024 * 1024)).toFixed(2);
    console.log(`📊 Tamaño del archivo: ${fileSizeMB} MB`);

    // Leer el archivo
    const fileBuffer = fs.readFileSync(FILE_PATH);

    // Verificar si el bucket existe, si no, crearlo
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();
    
    if (listError) {
      console.error('❌ Error al listar buckets:', listError);
      process.exit(1);
    }

    const bucketExists = buckets?.some(b => b.name === BUCKET_NAME);

    if (!bucketExists) {
      console.log(`📦 Creando bucket "${BUCKET_NAME}"...`);
      const { data: bucket, error: createError } = await supabase.storage.createBucket(BUCKET_NAME, {
        public: true, // Hacer el bucket público para que las imágenes sean accesibles
        fileSizeLimit: 104857600, // 100 MB
        allowedMimeTypes: ['image/gif', 'image/png', 'image/jpeg', 'video/mp4'],
      });

      if (createError) {
        console.error('❌ Error al crear bucket:', createError);
        console.error('💡 Nota: Puede que necesites usar SUPABASE_SERVICE_ROLE_KEY en lugar de ANON_KEY');
        process.exit(1);
      }
      console.log('✅ Bucket creado exitosamente');
    } else {
      console.log(`✅ Bucket "${BUCKET_NAME}" ya existe`);
    }

    // Subir el archivo
    console.log(`⬆️  Subiendo "${FILE_NAME}"...`);
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(FILE_NAME, fileBuffer, {
        contentType: 'image/gif',
        upsert: true, // Sobrescribir si ya existe
        cacheControl: '3600', // Cache por 1 hora
      });

    if (uploadError) {
      console.error('❌ Error al subir archivo:', uploadError);
      process.exit(1);
    }

    console.log('✅ Archivo subido exitosamente');

    // Obtener URL pública
    const { data: urlData } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(FILE_NAME);

    console.log('\n🎉 ¡Subida completada!');
    console.log(`\n📎 URL pública del GIF:`);
    console.log(`   ${urlData.publicUrl}`);
    console.log(`\n💡 Agrega esta URL a tu variable de entorno:`);
    console.log(`   NEXT_PUBLIC_GIF_URL=${urlData.publicUrl}`);
    console.log(`\n   O úsala directamente en el código:`);
    console.log(`   const gifUrl = "${urlData.publicUrl}";`);

  } catch (error) {
    console.error('❌ Error inesperado:', error);
    process.exit(1);
  }
}

uploadGif();
