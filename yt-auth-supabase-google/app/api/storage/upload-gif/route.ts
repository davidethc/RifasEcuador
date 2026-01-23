import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { readFile } from 'fs/promises';
import { join } from 'path';
import { logger } from '@/utils/logger';

/**
 * API Route para subir el GIF grande a Supabase Storage
 * 
 * POST /api/storage/upload-gif
 * 
 * Requiere:
 * - NEXT_PUBLIC_SUPABASE_URL
 * - SUPABASE_SERVICE_ROLE_KEY (para crear buckets y subir archivos)
 */
export async function POST(_request: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      logger.error('❌ [STORAGE] Faltan variables de entorno de Supabase');
      return NextResponse.json(
        { 
          success: false, 
          error: 'Faltan variables de entorno: NEXT_PUBLIC_SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY' 
        },
        { status: 500 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const BUCKET_NAME = 'public-assets';
    const FILE_NAME = 'Diseño Video.gif';
    const FILE_PATH = join(process.cwd(), 'public', FILE_NAME);

    logger.log('📦 [STORAGE] Iniciando subida del GIF a Supabase Storage...');

    // Leer el archivo
    let fileBuffer: Buffer;
    try {
      fileBuffer = await readFile(FILE_PATH);
      const fileSizeMB = (fileBuffer.length / (1024 * 1024)).toFixed(2);
      logger.log(`📊 [STORAGE] Tamaño del archivo: ${fileSizeMB} MB`);
    } catch (error) {
      logger.error('❌ [STORAGE] Error al leer archivo:', error);
      return NextResponse.json(
        { success: false, error: 'No se pudo leer el archivo GIF' },
        { status: 404 }
      );
    }

    // Verificar si el bucket existe, si no, crearlo
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();
    
    if (listError) {
      logger.error('❌ [STORAGE] Error al listar buckets:', listError);
      return NextResponse.json(
        { success: false, error: 'Error al verificar buckets' },
        { status: 500 }
      );
    }

    const bucketExists = buckets?.some(b => b.name === BUCKET_NAME);

    if (!bucketExists) {
      logger.log(`📦 [STORAGE] Creando bucket "${BUCKET_NAME}"...`);
      const { error: createError } = await supabase.storage.createBucket(BUCKET_NAME, {
        public: true, // Hacer el bucket público
        fileSizeLimit: 104857600, // 100 MB
        allowedMimeTypes: ['image/gif', 'image/png', 'image/jpeg', 'video/mp4'],
      });

      if (createError) {
        logger.error('❌ [STORAGE] Error al crear bucket:', createError);
        return NextResponse.json(
          { success: false, error: 'Error al crear bucket en Supabase' },
          { status: 500 }
        );
      }
      logger.log('✅ [STORAGE] Bucket creado exitosamente');
    }

    // Subir el archivo
    logger.log(`⬆️  [STORAGE] Subiendo "${FILE_NAME}"...`);
    const { error: uploadError } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(FILE_NAME, fileBuffer, {
        contentType: 'image/gif',
        upsert: true, // Sobrescribir si ya existe
        cacheControl: '3600',
      });

    if (uploadError) {
      logger.error('❌ [STORAGE] Error al subir archivo:', uploadError);
      return NextResponse.json(
        { success: false, error: 'Error al subir archivo a Supabase Storage' },
        { status: 500 }
      );
    }

    // Obtener URL pública
    const { data: urlData } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(FILE_NAME);

    logger.log('✅ [STORAGE] Archivo subido exitosamente');
    logger.log(`📎 [STORAGE] URL pública: ${urlData.publicUrl}`);

    return NextResponse.json({
      success: true,
      url: urlData.publicUrl,
      message: 'GIF subido exitosamente a Supabase Storage',
    });

  } catch (error) {
    logger.error('❌ [STORAGE] Error inesperado:', error);
    return NextResponse.json(
      { success: false, error: 'Error inesperado al subir archivo' },
      { status: 500 }
    );
  }
}
