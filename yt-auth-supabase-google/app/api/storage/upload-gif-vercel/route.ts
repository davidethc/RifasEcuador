import { NextRequest, NextResponse } from 'next/server';
import { put } from '@vercel/blob';
import { readFile } from 'fs/promises';
import { join } from 'path';
import { logger } from '@/utils/logger';

/**
 * API Route para subir el GIF a Vercel Blob Storage
 * 
 * POST /api/storage/upload-gif-vercel
 * 
 * Requiere:
 * - BLOB_READ_WRITE_TOKEN (obtener desde Vercel Dashboard > Settings > Storage)
 */
export async function POST(_request: NextRequest) {
  try {
    const blobToken = process.env.BLOB_READ_WRITE_TOKEN;

    if (!blobToken) {
      logger.error('❌ [VERCEL BLOB] Falta BLOB_READ_WRITE_TOKEN');
      return NextResponse.json(
        { 
          success: false, 
          error: 'Falta variable de entorno: BLOB_READ_WRITE_TOKEN. Obténla desde Vercel Dashboard > Settings > Storage' 
        },
        { status: 500 }
      );
    }

    const FILE_NAME = 'gifhero.gif';
    const FILE_PATH = join(process.cwd(), 'public', FILE_NAME);

    logger.log('📦 [VERCEL BLOB] Iniciando subida del GIF...');

    // Leer el archivo
    let fileBuffer: Buffer;
    try {
      fileBuffer = await readFile(FILE_PATH);
      const fileSizeMB = (fileBuffer.length / (1024 * 1024)).toFixed(2);
      logger.log(`📊 [VERCEL BLOB] Tamaño: ${fileSizeMB} MB`);
    } catch (error) {
      logger.error('❌ [VERCEL BLOB] Error al leer archivo:', error);
      return NextResponse.json(
        { success: false, error: 'No se pudo leer el archivo GIF' },
        { status: 404 }
      );
    }

    // Subir a Vercel Blob
    logger.log(`⬆️  [VERCEL BLOB] Subiendo "${FILE_NAME}"...`);
    
    const blob = await put(FILE_NAME, fileBuffer, {
      access: 'public',
      contentType: 'image/gif',
      token: blobToken,
    });

    logger.log('✅ [VERCEL BLOB] Archivo subido exitosamente');
    logger.log(`📎 [VERCEL BLOB] URL: ${blob.url}`);

    return NextResponse.json({
      success: true,
      url: blob.url,
      message: 'GIF subido exitosamente a Vercel Blob Storage',
    });

  } catch (error) {
    logger.error('❌ [VERCEL BLOB] Error inesperado:', error);
    return NextResponse.json(
      { success: false, error: 'Error inesperado al subir archivo' },
      { status: 500 }
    );
  }
}
