/**
 * Caché en memoria con tiempo de expiración. Reduce llamadas repetidas a la
 * API (por ejemplo, al volver a abrir la misma ciudad en pocos minutos).
 */
export class TtlCache<T> {
  private store = new Map<string, { expiresAt: number; value: T }>();

  constructor(
    private readonly ttlMs: number,
    private readonly maxEntries = 50,
    private readonly now: () => number = Date.now,
  ) {}

  get(key: string): T | undefined {
    const entry = this.store.get(key);
    if (!entry) return undefined;
    if (entry.expiresAt <= this.now()) {
      this.store.delete(key);
      return undefined;
    }
    return entry.value;
  }

  set(key: string, value: T): void {
    if (this.store.size >= this.maxEntries) {
      // Elimina la entrada más antigua (orden de inserción del Map).
      const oldestKey = this.store.keys().next().value;
      if (oldestKey !== undefined) this.store.delete(oldestKey);
    }
    this.store.set(key, { expiresAt: this.now() + this.ttlMs, value });
  }

  clear(): void {
    this.store.clear();
  }
}
