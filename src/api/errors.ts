/**
 * Errores tipados de la capa de API. Cada tipo se traduce a un mensaje
 * comprensible para el usuario (nunca se muestran trazas ni detalles internos).
 */
export type ApiErrorKind =
  | 'validation' // parámetros inválidos detectados antes de llamar a la API
  | 'network' // sin conexión / DNS / TLS
  | 'timeout' // la API tardó demasiado
  | 'rate_limit' // HTTP 429 o límite local de solicitudes alcanzado
  | 'bad_request' // HTTP 400 (la API rechazó los parámetros)
  | 'server' // HTTP 5xx u otro código inesperado
  | 'invalid_response' // JSON mal formado o con estructura inesperada
  | 'aborted'; // la solicitud fue cancelada por la app (no se muestra)

export class ApiError extends Error {
  readonly kind: ApiErrorKind;
  readonly status?: number;
  readonly retryAfterSeconds?: number;

  constructor(
    kind: ApiErrorKind,
    message: string,
    options: { status?: number; retryAfterSeconds?: number } = {},
  ) {
    super(message);
    this.name = 'ApiError';
    this.kind = kind;
    this.status = options.status;
    this.retryAfterSeconds = options.retryAfterSeconds;
    // Garantiza que `instanceof` funcione aunque la clase se transpile.
    Object.setPrototypeOf(this, ApiError.prototype);
  }
}

export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError || (error as { name?: string } | null)?.name === 'ApiError';
}

/** Convierte cualquier error en un mensaje en español apto para la interfaz. */
export function toUserMessage(error: unknown): string {
  if (!isApiError(error)) {
    return 'Ocurrió un error inesperado. Intenta de nuevo.';
  }
  switch (error.kind) {
    case 'validation':
      return error.message;
    case 'network':
      return 'No hay conexión con el servicio. Revisa tu conexión a internet e intenta de nuevo.';
    case 'timeout':
      return 'El servicio tardó demasiado en responder. Intenta de nuevo en unos segundos.';
    case 'rate_limit': {
      const wait = error.retryAfterSeconds ?? 60;
      return `Se alcanzó el límite de solicitudes. Espera ${wait} segundos antes de volver a intentarlo.`;
    }
    case 'bad_request':
      return 'El servicio rechazó la consulta. Verifica los datos e intenta de nuevo.';
    case 'server':
      return 'El servicio de clima no está disponible en este momento. Intenta más tarde.';
    case 'invalid_response':
      return 'Se recibió una respuesta inesperada del servicio. Intenta de nuevo más tarde.';
    case 'aborted':
      return 'La solicitud fue cancelada.';
  }
}
