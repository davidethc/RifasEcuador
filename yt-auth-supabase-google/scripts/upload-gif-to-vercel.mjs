/**
 * Script para subir el GIF a Vercel Blob Storage
 * 
 * Requiere:
 * - BLOB_READ_WRITE_TOKEN de Vercel (obtener desde Vercel Dashboard > Settings > Storage)
 * 
 * Ejecutar: node scripts/upload-gif-to-vercel.mjs
 */

import { put } from '@vercel/blob';
import { readFile } from 'fs/promises';
import { join } from 'path';
import { config } from 'dotenv';
import { resolve } from 'path';

// Cargar variables de entorno desde .env.local
config({ path: resolve(process.cwd(), '.env.local') });

const blobToken = process.env.BLOB_READ_WRITE_TOKEN;

if (!blobToken) {
  console.error('❌ Error: Falta variable de entorno BLOB_READ_WRITE_TOKEN');
  console.error('\n💡 Para obtener el token:');
  console.error('   1. Ve a https://vercel.com/dashboard');
  console.error('   2. Settings > Storage > Blob');
  console.error('   3. Crea un nuevo Blob Store si no existe');
  console.error('   4. Copia el "Read and Write Token"');
  console.error('   5. Agrégalo a .env.local como: BLOB_READ_WRITE_TOKEN=tu_token');
  process.exit(1);
}

const FILE_NAME = 'gifhero.gif';
const FILE_PATH = join(process.cwd(), 'public', FILE_NAME);

async function uploadGif() {
  try {
    console.log('📦 Iniciando subida del GIF a Vercel Blob Storage...');
    console.log(`📁 Archivo: ${FILE_PATH}`);

    // Leer el archivo
    const fileBuffer = await readFile(FILE_PATH);
    const fileSizeMB = (fileBuffer.length / (1024 * 1024)).toFixed(2);
    console.log(`📊 Tamaño: ${fileSizeMB} MB`);

    // Subir a Vercel Blob
    console.log(`⬆️  Subiendo "${FILE_NAME}" a Vercel Blob...`);
    
    const blob = await put(FILE_NAME, fileBuffer, {
      access: 'public',
      contentType: 'image/gif',
      token: blobToken,
    });

    console.log('\n🎉 ¡Subida completada!');
    console.log(`\n📎 URL pública:`);
    console.log(`   ${blob.url}`);
    console.log(`\n💡 Agrega a tu .env.local:`);
    console.log(`   NEXT_PUBLIC_GIF_URL=${blob.url}`);
    console.log(`\n✅ El GIF está disponible públicamente en: ${blob.url}`);

  } catch (error) {
    console.error('❌ Error:', error);
    if (error.message?.includes('token')) {
      console.error('\n💡 Verifica que BLOB_READ_WRITE_TOKEN sea correcto');
    }
    process.exit(1);
  }
}

uploadGif();
