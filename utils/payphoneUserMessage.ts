export type PayphoneFailureReason =
  | 'insufficient_funds'
  | 'canceled'
  | 'domain_not_allowed'
  | 'rejected'
  | 'expired'
  | 'unknown';

export interface PayphoneErrorExplanationInput {
  forcedReason?: PayphoneFailureReason | null;
  statusCode?: number | null;
  transactionStatus?: string | null;
  message?: string | null;
  messageCode?: number | null;
  rawError?: string | null;
}

export interface PayphoneErrorExplanation {
  reason: PayphoneFailureReason;
  title: string;
  userMessage: string;
  possibleCauses: string[];
  nextSteps: string[];
  technicalHint?: string;
}

function normalizeText(value: string | null | undefined): string {
  return (value ?? '').toString().trim().toLowerCase();
}

export function buildPayphoneErrorExplanation(
  input: PayphoneErrorExplanationInput
): PayphoneErrorExplanation {
  const forcedReason = input.forcedReason ?? null;
  const statusCode = input.statusCode ?? null;
  const transactionStatus = input.transactionStatus ?? null;
  const message = input.message ?? null;
  const messageCode = input.messageCode ?? null;
  const rawError = input.rawError ?? null;

  const haystack = [
    normalizeText(transactionStatus),
    normalizeText(message),
    normalizeText(rawError),
  ].join(' | ');

  // Heurísticas basadas en mensajes típicos + docs Payphone.
  const isDomainError =
    haystack.includes('acceso denegado') ||
    haystack.includes('dominio') ||
    haystack.includes('domain') ||
    haystack.includes('no permitido') ||
    haystack.includes('denegado');

  const isInsufficientFunds =
    haystack.includes('insufficient') ||
    haystack.includes('fondos') ||
    haystack.includes('saldo') ||
    haystack.includes('cupo');

  const isExpired =
    haystack.includes('expir') ||
    haystack.includes('timeout') ||
    haystack.includes('vigencia') ||
    haystack.includes('10 minutos');

  const isCanceled =
    statusCode === 2 ||
    normalizeText(transactionStatus) === 'canceled' ||
    haystack.includes('cancel');

  const isRejected =
    haystack.includes('rechaz') ||
    haystack.includes('rejected') ||
    // A veces llega como statusCode 3 pero no Approved (implementación actual lo trata así)
    (statusCode === 3 && normalizeText(transactionStatus) !== 'approved' && !isCanceled);

  let reason: PayphoneFailureReason = 'unknown';
  if (forcedReason) {
    reason = forcedReason;
  } else {
    if (isDomainError) reason = 'domain_not_allowed';
    else if (isInsufficientFunds) reason = 'insufficient_funds';
    else if (isExpired) reason = 'expired';
    else if (isCanceled) reason = 'canceled';
    else if (isRejected) reason = 'rejected';
  }

  const technicalHintParts: string[] = [];
  if (messageCode && messageCode !== 0) technicalHintParts.push(`messageCode=${messageCode}`);
  if (statusCode) technicalHintParts.push(`statusCode=${statusCode}`);
  if (transactionStatus) technicalHintParts.push(`status=${transactionStatus}`);

  const technicalHint =
    technicalHintParts.length > 0 ? `Payphone (${technicalHintParts.join(', ')})` : undefined;

  switch (reason) {
    case 'domain_not_allowed':
      return {
        reason,
        title: 'No se pudo abrir el pago',
        userMessage:
          'Payphone bloqueó el pago porque el dominio (sitio web) no está autorizado para esta integración.',
        possibleCauses: [
          'El dominio actual no coincide con el “Dominio Web” configurado en Payphone Developer.',
          'La URL de respuesta (callback) configurada en Payphone Developer no coincide con la del sitio.',
          'Configuración de seguridad del navegador/servidor que impide enviar el referrer (origen).',
        ],
        nextSteps: [
          'Intenta nuevamente desde el dominio oficial del sitio.',
          'Si eres admin: revisa en Payphone Developer el Dominio Web y la URL de Respuesta.',
          'Si persiste: contáctanos por WhatsApp indicando el ID de orden / transacción.',
        ],
        technicalHint,
      };

    case 'insufficient_funds':
      return {
        reason,
        title: 'Pago rechazado',
        userMessage:
          'El pago fue rechazado. Lo más común es fondos/cupo insuficiente o un rechazo del banco.',
        possibleCauses: [
          'Fondos insuficientes o cupo disponible insuficiente.',
          'El banco rechazó la transacción por políticas de seguridad o límites diarios.',
          'Datos de la tarjeta incorrectos (CVV, fecha) o autenticación fallida.',
        ],
        nextSteps: [
          'Intenta con otra tarjeta o método de pago.',
          'Verifica saldo/cupo y límites de tu banco (o llama a tu banco para autorizar la compra).',
          'Vuelve a intentar la compra (la reserva de números dura 10 minutos).',
        ],
        technicalHint,
      };

    case 'canceled':
      return {
        reason,
        title: 'Pago cancelado',
        userMessage:
          'El pago no se completó porque fue **cancelado** antes de terminar.',
        possibleCauses: [
          'Se cerró la ventana o se canceló desde Payphone.',
          'La cajita expiró (vigencia de 10 minutos) y se debe generar un pago nuevo.',
          'Conexión inestable durante el proceso.',
        ],
        nextSteps: [
          'Intenta nuevamente y completa el pago en el momento.',
          'Si sigue pasando, prueba con otra red (datos móviles/Wi‑Fi).',
          'Si necesitas ayuda, escríbenos por WhatsApp con tu ID de orden.',
        ],
        technicalHint,
      };

    case 'rejected':
      return {
        reason,
        title: 'Pago rechazado',
        userMessage:
          'El pago fue **rechazado** por el emisor (banco) o por validaciones de seguridad.',
        possibleCauses: [
          'El banco rechazó la transacción (riesgo, límites, validación 3DS).',
          'Datos del titular no coinciden (cédula / email / teléfono).',
          'Tarjeta sin habilitación para compras en línea.',
        ],
        nextSteps: [
          'Verifica que tus datos sean correctos (cédula, email, teléfono).',
          'Prueba con otra tarjeta o con saldo Payphone.',
          'Si persiste, contacta a tu banco para autorizar compras en línea.',
        ],
        technicalHint,
      };

    case 'expired':
      return {
        reason,
        title: 'Pago expirado',
        userMessage:
          'La sesión de pago expiró o Payphone no pudo confirmar a tiempo la transacción.',
        possibleCauses: [
          'La cajita estuvo abierta más de 10 minutos.',
          'Se perdió conexión o hubo un timeout confirmando la transacción.',
          'Payphone tardó en responder y la confirmación quedó pendiente.',
        ],
        nextSteps: [
          'Vuelve a intentar el pago (no tardes más de 10 minutos).',
          'Si ya pagaste, espera 1–2 minutos y revisa si llega la confirmación.',
          'Si no se confirma, escríbenos por WhatsApp con el ID de transacción.',
        ],
        technicalHint,
      };

    default:
      return {
        reason: 'unknown',
        title: 'No se pudo completar el pago',
        userMessage:
          (message && message.trim()) ||
          (rawError && rawError.trim()) ||
          'Ocurrió un error al procesar el pago.',
        possibleCauses: [
          'Fondos/cupo insuficiente o rechazo del banco.',
          'Conexión inestable o tiempo de espera agotado.',
          'Configuración del comercio (Payphone) incompleta.',
        ],
        nextSteps: [
          'Intenta nuevamente o prueba con otro método de pago.',
          'Si el error continúa, contáctanos por WhatsApp con tu ID de orden/compra.',
        ],
        technicalHint,
      };
  }
}

