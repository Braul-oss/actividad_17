/**
 * Limitador de solicitudes del lado del cliente (ventana deslizante).
 *
 * Open-Meteo permite hasta 600 llamadas/minuto y 10 000/día por IP en su plan
 * gratuito. La app se autolimita muy por debajo de eso para no abusar del
 * servicio aunque el usuario pulse repetidamente "Actualizar" o "Buscar".
 */
export class RateLimiter {
  private timestamps: number[] = [];

  constructor(
    private readonly maxRequests: number,
    private readonly windowMs: number,
    private readonly now: () => number = Date.now,
  ) {}

  /**
   * Registra una solicitud si hay cupo. Devuelve 0 si se permitió, o los
   * segundos que faltan para que se libere un lugar.
   */
  tryAcquire(): number {
    const current = this.now();
    this.timestamps = this.timestamps.filter((t) => current - t < this.windowMs);
    if (this.timestamps.length >= this.maxRequests) {
      const oldest = this.timestamps[0];
      return Math.max(1, Math.ceil((this.windowMs - (current - oldest)) / 1000));
    }
    this.timestamps.push(current);
    return 0;
  }

  reset(): void {
    this.timestamps = [];
  }
}

/** Límite global de la app: 30 solicitudes por minuto. */
export const apiRateLimiter = new RateLimiter(30, 60_000);
