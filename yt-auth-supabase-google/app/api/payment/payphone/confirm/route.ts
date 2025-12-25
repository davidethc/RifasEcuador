import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Cliente de Supabase con service role para bypass de RLS
const getSupabaseAdmin = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Missing Supabase environment variables');
  }

  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
};

/**
 * API Route para confirmar transacciones de la Cajita de Pagos
 * 
 * Este endpoint se llama después de que el usuario complete el pago
 * y sea redirigido con los parámetros id y clientTransactionId
 * 
 * ⚠️ IMPORTANTE: Debe ejecutarse dentro de los primeros 5 minutos
 * o Payphone reversará automáticamente la transacción
 * 
 * Documentación: https://docs.payphone.app/confirmar-boton-de-pago
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, clientTxId } = body;

    console.log('📥 Confirmando transacción:', { id, clientTxId });

    // Validar parámetros
    if (!id || !clientTxId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Parámetros faltantes: id y clientTxId son requeridos',
        },
        { status: 400 }
      );
    }

    // Validar token
    const token = process.env.NEXT_PUBLIC_PAYPHONE_TOKEN;

    if (!token) {
      console.error('❌ Token de Payphone no configurado');
      return NextResponse.json(
        {
          success: false,
          error: 'Configuración de Payphone incompleta',
        },
        { status: 500 }
      );
    }

    // Llamar al endpoint de confirmación de Payphone
    const confirmUrl = 'https://pay.payphonetodoesposible.com/api/button/V2/Confirm';

    console.log('🔄 Enviando confirmación a Payphone...');

    const response = await fetch(confirmUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        id: parseInt(id),
        clientTxId: clientTxId,
      }),
    });

    const responseText = await response.text();
    console.log('📤 Respuesta de Payphone (raw):', responseText);

    if (!response.ok) {
      console.error('❌ Error HTTP de Payphone:', response.status, responseText);
      
      let errorData = null;
      try {
        errorData = JSON.parse(responseText);
      } catch {
        // No se pudo parsear
      }

      return NextResponse.json(
        {
          success: false,
          error: errorData?.message || 'Error al confirmar la transacción',
          errorCode: errorData?.errorCode,
        },
        { status: response.status }
      );
    }

    // Parsear respuesta exitosa
    const transaction = JSON.parse(responseText);

    console.log('✅ Transacción confirmada:', {
      transactionId: transaction.transactionId,
      status: transaction.transactionStatus,
      statusCode: transaction.statusCode,
    });

    // Extraer orderId del clientTransactionId
    // Formato nuevo: ord-{primeros8chars}-{timestamp}
    // Formato antiguo: order-{orderId}-{timestamp}
    let orderId: string | null = null;
    
    // Intentar formato nuevo primero
    const newFormatMatch = clientTxId.match(/^ord-([a-f0-9]{8})-/);
    if (newFormatMatch) {
      // Solo tenemos los primeros 8 caracteres, necesitamos buscar la orden completa
      const orderPrefix = newFormatMatch[1];
      console.log('🔍 Buscando orden con prefijo:', orderPrefix);
      
      // Buscar en la base de datos por el prefijo del ID
      const supabase = getSupabaseAdmin();
      const { data: orders } = await supabase
        .from('orders')
        .select('id')
        .ilike('id', `${orderPrefix}%`)
        .order('created_at', { ascending: false })
        .limit(1);
      
      if (orders && orders.length > 0) {
        orderId = orders[0].id;
        console.log('✅ Orden encontrada:', orderId);
      }
    } else {
      // Intentar formato antiguo
      const oldFormatMatch = clientTxId.match(/order-([a-f0-9-]+)-/);
      if (oldFormatMatch) {
        orderId = oldFormatMatch[1];
      }
    }

    if (!orderId) {
      console.error('❌ No se pudo extraer orderId de:', clientTxId);
      return NextResponse.json({
        success: true,
        transaction,
        orderId: null,
        warning: 'No se pudo actualizar la orden en la base de datos',
      });
    }
    
    console.log('✅ OrderId completo recuperado:', orderId);

    // Actualizar la orden en la base de datos según el estado
    if (transaction.statusCode === 3) {
      // statusCode 3 = Approved
      console.log('✅ Pago aprobado, actualizando orden...');

      // Crear o actualizar registro de pago
      const supabase = getSupabaseAdmin();
      const { data: existingPayment } = await supabase
        .from('payments')
        .select('id')
        .eq('order_id', orderId)
        .maybeSingle();

      const paymentData = {
        order_id: orderId,
        provider: 'payphone',
        provider_reference: transaction.transactionId.toString(),
        amount: transaction.amount / 100, // Convertir centavos a dólares
        status: 'approved',
        metadata: transaction,
        created_at: new Date().toISOString(),
      };

      if (existingPayment) {
        await supabase
          .from('payments')
          .update({
            provider_reference: transaction.transactionId.toString(),
            status: 'approved',
            metadata: transaction,
          })
          .eq('id', existingPayment.id);
      } else {
        await supabase.from('payments').insert(paymentData);
      }

      // Actualizar la orden a completada
      const { error: updateError } = await supabase
        .from('orders')
        .update({
          status: 'completed',
          payment_method: 'payphone',
        })
        .eq('id', orderId);

      if (updateError) {
        console.error('❌ Error al actualizar orden:', updateError);
      } else {
        console.log('✅ Orden actualizada a completada');
        
        // Enviar correo de confirmación (no bloquea si falla)
        try {
          console.log('📧 Intentando enviar correo de confirmación para orden:', orderId);
          const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
          const emailUrl = `${baseUrl}/api/email/send-purchase-confirmation`;
          console.log('📧 URL del correo:', emailUrl);
          
          const emailResponse = await fetch(emailUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ orderId }),
          });
          
          const emailData = await emailResponse.json();
          
          if (emailResponse.ok) {
            console.log('✅ Correo de confirmación enviado exitosamente:', emailData);
          } else {
            console.error('⚠️ Error al enviar correo:', emailData);
            console.warn('⚠️ No se pudo enviar correo de confirmación');
          }
        } catch (emailError) {
          console.error('❌ Error al enviar correo (no crítico):', emailError);
          // No lanzamos error para no bloquear el flujo
        }
      }

    } else if (transaction.statusCode === 2) {
      // statusCode 2 = Canceled
      console.log('⚠️ Pago cancelado');

      const supabase = getSupabaseAdmin();
      await supabase
        .from('orders')
        .update({
          status: 'expired',
        })
        .eq('id', orderId);

    } else {
      // statusCode 1 = Pending
      console.log('⏳ Pago pendiente');
    }

    return NextResponse.json({
      success: true,
      transaction,
      orderId, // Retornar el orderId completo para usar en el callback
    });

  } catch (error) {
    console.error('❌ Error al confirmar transacción:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido',
      },
      { status: 500 }
    );
  }
}
