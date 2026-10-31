import { ApiError, toUserMessage } from '../src/api/errors';
import { buildUrl, getJson } from '../src/api/http';
import { RateLimiter } from '../src/api/rateLimiter';

const URL_OK = 'https://api.open-meteo.com/v1/forecast?latitude=0&longitude=0';

function jsonResponse(status: number, body: unknown, headers: Record<string, string> = {}): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    headers: { get: (name: string) => headers[name.toLowerCase()] ?? null },
    json: async () => body,
  } as unknown as Response;
}

function textResponse(status: number): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    headers: { get: () => null },
    json: async () => {
      throw new SyntaxError('Unexpected token <');
    },
  } as unknown as Response;
}

const limiter = () => new RateLimiter(1000, 60_000);

async function expectApiError(promise: Promise<unknown>, kind: ApiError['kind']) {
  await expect(promise).rejects.toMatchObject({ name: 'ApiError', kind });
}

describe('buildUrl', () => {
  it('codifica los parámetros', () => {
    expect(buildUrl('https://geocoding-api.open-meteo.com/v1/search', { name: 'Ciudad de México', count: 10 })).toBe(
      'https://geocoding-api.open-meteo.com/v1/search?name=Ciudad%20de%20M%C3%A9xico&count=10',
    );
  });

  it('impide inyectar parámetros adicionales', () => {
    expect(buildUrl('https://api.open-meteo.com/v1/forecast', { name: 'a&count=100' })).toContain('a%26count%3D100');
  });

  it('rechaza HTTP sin cifrar', () => {
    expect(() => buildUrl('http://api.open-meteo.com/v1/forecast', {})).toThrow(ApiError);
  });

  it('rechaza hosts no permitidos', () => {
    expect(() => buildUrl('https://evil.example.com/v1/forecast', {})).toThrow('Host no permitido');
    expect(() => buildUrl('https://api.open-meteo.com.evil.com/x', {})).toThrow('Host no permitido');
  });
});

describe('getJson', () => {
  it('devuelve el JSON en una respuesta 200', async () => {
    const fetchImpl = jest.fn().mockResolvedValue(jsonResponse(200, { hello: 'world' }));
    await expect(getJson(URL_OK, { fetchImpl, rateLimiter: limiter() })).resolves.toEqual({ hello: 'world' });
    expect(fetchImpl).toHaveBeenCalledWith(URL_OK, expect.objectContaining({ method: 'GET' }));
  });

  it('no llama a fetch con URLs no permitidas', async () => {
    const fetchImpl = jest.fn();
    await expectApiError(getJson('http://api.open-meteo.com/x', { fetchImpl, rateLimiter: limiter() }), 'validation');
    expect(fetchImpl).not.toHaveBeenCalled();
  });

  it('convierte HTTP 400 en bad_request con el motivo de la API', async () => {
    const fetchImpl = jest
      .fn()
      .mockResolvedValue(jsonResponse(400, { error: true, reason: 'Latitude must be in range of -90 to 90°.' }));
    await expect(getJson(URL_OK, { fetchImpl, rateLimiter: limiter() })).rejects.toMatchObject({
      kind: 'bad_request',
      status: 400,
      message: 'Latitude must be in range of -90 to 90°.',
    });
  });

  it('convierte HTTP 429 en rate_limit y respeta Retry-After', async () => {
    const fetchImpl = jest.fn().mockResolvedValue(jsonResponse(429, {}, { 'retry-after': '30' }));
    await expect(getJson(URL_OK, { fetchImpl, rateLimiter: limiter() })).rejects.toMatchObject({
      kind: 'rate_limit',
      retryAfterSeconds: 30,
    });
    expect(fetchImpl).toHaveBeenCalledTimes(1); // 429 no se reintenta
  });

  it('reintenta una vez ante un error 5xx y luego tiene éxito', async () => {
    const fetchImpl = jest
      .fn()
      .mockResolvedValueOnce(textResponse(503))
      .mockResolvedValueOnce(jsonResponse(200, { ok: 1 }));
    await expect(getJson(URL_OK, { fetchImpl, rateLimiter: limiter() })).resolves.toEqual({ ok: 1 });
    expect(fetchImpl).toHaveBeenCalledTimes(2);
  });

  it('informa error de servidor si el 5xx persiste', async () => {
    const fetchImpl = jest.fn().mockResolvedValue(textResponse(500));
    await expectApiError(getJson(URL_OK, { fetchImpl, rateLimiter: limiter() }), 'server');
    expect(fetchImpl).toHaveBeenCalledTimes(2);
  });

  it('convierte fallas de red en network', async () => {
    const fetchImpl = jest.fn().mockRejectedValue(new TypeError('Network request failed'));
    await expectApiError(getJson(URL_OK, { fetchImpl, rateLimiter: limiter(), retries: 0 }), 'network');
  });

  it('aborta la solicitud cuando vence el tiempo de espera', async () => {
    const fetchImpl = jest.fn(
      (_url: string, init?: RequestInit) =>
        new Promise<Response>((_resolve, reject) => {
          init?.signal?.addEventListener('abort', () => reject(new Error('aborted')));
        }),
    );
    await expectApiError(
      getJson(URL_OK, { fetchImpl: fetchImpl as unknown as typeof fetch, rateLimiter: limiter(), timeoutMs: 20, retries: 0 }),
      'timeout',
    );
  });

  it('distingue la cancelación hecha por la app', async () => {
    const controller = new AbortController();
    const fetchImpl = jest.fn(
      (_url: string, init?: RequestInit) =>
        new Promise<Response>((_resolve, reject) => {
          init?.signal?.addEventListener('abort', () => reject(new Error('aborted')));
        }),
    );
    const promise = getJson(URL_OK, {
      fetchImpl: fetchImpl as unknown as typeof fetch,
      rateLimiter: limiter(),
      signal: controller.signal,
    });
    controller.abort();
    await expectApiError(promise, 'aborted');
  });

  it('detecta JSON inválido en respuestas 200', async () => {
    const fetchImpl = jest.fn().mockResolvedValue(textResponse(200));
    await expectApiError(getJson(URL_OK, { fetchImpl, rateLimiter: limiter() }), 'invalid_response');
  });

  it('aplica el límite local de solicitudes sin llamar a la red', async () => {
    const fetchImpl = jest.fn().mockResolvedValue(jsonResponse(200, {}));
    const strict = new RateLimiter(2, 60_000);
    await getJson(URL_OK, { fetchImpl, rateLimiter: strict });
    await getJson(URL_OK, { fetchImpl, rateLimiter: strict });
    await expectApiError(getJson(URL_OK, { fetchImpl, rateLimiter: strict }), 'rate_limit');
    expect(fetchImpl).toHaveBeenCalledTimes(2);
  });
});

describe('toUserMessage', () => {
  it('produce mensajes en español sin detalles técnicos', () => {
    expect(toUserMessage(new ApiError('network', 'TypeError: x'))).toMatch(/conexión/);
    expect(toUserMessage(new ApiError('rate_limit', 'x', { retryAfterSeconds: 12 }))).toMatch(/12 segundos/);
    expect(toUserMessage(new Error('boom'))).toBe('Ocurrió un error inesperado. Intenta de nuevo.');
  });
});

describe('RateLimiter', () => {
  it('libera cupo al terminar la ventana', () => {
    let now = 0;
    const rl = new RateLimiter(2, 1000, () => now);
    expect(rl.tryAcquire()).toBe(0);
    expect(rl.tryAcquire()).toBe(0);
    expect(rl.tryAcquire()).toBe(1);
    now = 1001;
    expect(rl.tryAcquire()).toBe(0);
  });
});
