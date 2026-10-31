import { ApiError } from './errors';
import { apiRateLimiter, RateLimiter } from './rateLimiter';

/**
 * Únicos hosts a los que la app puede conectarse. Cualquier otra URL (o una
 * URL que no sea HTTPS) se rechaza antes de enviar la solicitud.
 */
export const ALLOWED_HOSTS: readonly string[] = [
  'api.open-meteo.com',
  'geocoding-api.open-meteo.com',
];

const DEFAULT_TIMEOUT_MS = 10_000;
const RETRY_DELAY_MS = 800;

export type QueryParams = Record<string, string | number | boolean>;

/** Construye una URL HTTPS con parámetros codificados de forma segura. */
export function buildUrl(baseUrl: string, params: QueryParams): string {
  assertAllowedUrl(baseUrl);
  const query = Object.keys(params)
    .map((key) => `${encodeURIComponent(key)}=${encodeURIComponent(String(params[key]))}`)
    .join('&');
  return query ? `${baseUrl}?${query}` : baseUrl;
}

export function assertAllowedUrl(url: string): void {
  const match = /^https:\/\/([a-z0-9.-]+)(?:[/?#]|$)/i.exec(url);
  if (!match) {
    throw new ApiError('validation', 'Solo se permiten conexiones seguras (HTTPS).');
  }
  const host = match[1].toLowerCase();
  if (!ALLOWED_HOSTS.includes(host)) {
    throw new ApiError('validation', `Host no permitido: ${host}`);
  }
}

export interface GetJsonOptions {
  /** Señal para cancelar la solicitud (p. ej. el usuario cambió la búsqueda). */
  signal?: AbortSignal;
  timeoutMs?: number;
  /** Reintentos ante fallas transitorias (red, timeout, 5xx). */
  retries?: number;
  rateLimiter?: RateLimiter;
  fetchImpl?: typeof fetch;
}

/**
 * Realiza una solicitud HTTP GET y devuelve el cuerpo JSON ya parseado.
 * Traduce cada falla a un `ApiError` con un tipo concreto.
 */
export async function getJson(url: string, options: GetJsonOptions = {}): Promise<unknown> {
  const { retries = 1 } = options;
  let attempt = 0;
  while (true) {
    try {
      return await getJsonOnce(url, options);
    } catch (error) {
      const retryable =
        error instanceof ApiError &&
        (error.kind === 'network' || error.kind === 'timeout' || error.kind === 'server');
      if (!retryable || attempt >= retries || options.signal?.aborted) throw error;
      attempt += 1;
      await delay(RETRY_DELAY_MS * attempt, options.signal);
    }
  }
}

async function getJsonOnce(url: string, options: GetJsonOptions): Promise<unknown> {
  const {
    signal,
    timeoutMs = DEFAULT_TIMEOUT_MS,
    rateLimiter = apiRateLimiter,
    fetchImpl = fetch,
  } = options;

  assertAllowedUrl(url);

  if (signal?.aborted) throw new ApiError('aborted', 'Solicitud cancelada');

  const waitSeconds = rateLimiter.tryAcquire();
  if (waitSeconds > 0) {
    throw new ApiError('rate_limit', 'Límite local de solicitudes alcanzado', {
      retryAfterSeconds: waitSeconds,
    });
  }

  const controller = new AbortController();
  let timedOut = false;
  const timer = setTimeout(() => {
    timedOut = true;
    controller.abort();
  }, timeoutMs);
  const onExternalAbort = () => controller.abort();
  signal?.addEventListener('abort', onExternalAbort);

  let response: Response;
  try {
    response = await fetchImpl(url, {
      method: 'GET',
      headers: { Accept: 'application/json' },
      signal: controller.signal,
    });
  } catch {
    if (timedOut) throw new ApiError('timeout', 'Tiempo de espera agotado');
    if (signal?.aborted) throw new ApiError('aborted', 'Solicitud cancelada');
    throw new ApiError('network', 'Error de red');
  } finally {
    clearTimeout(timer);
    signal?.removeEventListener('abort', onExternalAbort);
  }

  if (response.status === 429) {
    const retryAfter = Number(response.headers.get('retry-after'));
    throw new ApiError('rate_limit', 'Demasiadas solicitudes (HTTP 429)', {
      status: 429,
      retryAfterSeconds: Number.isFinite(retryAfter) && retryAfter > 0 ? retryAfter : undefined,
    });
  }

  let body: unknown;
  try {
    body = await response.json();
  } catch {
    if (!response.ok) {
      throw new ApiError(response.status >= 500 ? 'server' : 'bad_request', 'Error HTTP', {
        status: response.status,
      });
    }
    throw new ApiError('invalid_response', 'La respuesta no es JSON válido', {
      status: response.status,
    });
  }

  if (!response.ok) {
    // Open-Meteo responde {"error": true, "reason": "..."} ante parámetros inválidos.
    const reason =
      typeof (body as { reason?: unknown })?.reason === 'string'
        ? (body as { reason: string }).reason
        : `HTTP ${response.status}`;
    const kind = response.status >= 500 ? 'server' : response.status === 400 ? 'bad_request' : 'server';
    throw new ApiError(kind, reason, { status: response.status });
  }

  if ((body as { error?: unknown })?.error === true) {
    throw new ApiError('bad_request', String((body as { reason?: unknown }).reason ?? 'Error'), {
      status: response.status,
    });
  }

  return body;
}

function delay(ms: number, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(resolve, ms);
    signal?.addEventListener('abort', () => {
      clearTimeout(timer);
      reject(new ApiError('aborted', 'Solicitud cancelada'));
    });
  });
}
