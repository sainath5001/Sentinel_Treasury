/**
 * In-memory nonce store for replay protection.
 * TODO: Replace with Redis or persistent store for multi-instance production deployments.
 */
class NonceStore {
  private used = new Map<string, number>();
  private readonly ttlMs: number;

  constructor(ttlMs = 5 * 60 * 1000) {
    this.ttlMs = ttlMs;
  }

  private key(agentDid: string, nonce: string): string {
    return `${agentDid}:${nonce}`;
  }

  private prune(): void {
    const now = Date.now();
    for (const [k, expiresAt] of this.used) {
      if (expiresAt < now) this.used.delete(k);
    }
  }

  /** Returns true if nonce was consumed (first use). False if replay. */
  consume(agentDid: string, nonce: string): boolean {
    this.prune();
    const k = this.key(agentDid, nonce);
    if (this.used.has(k)) return false;
    this.used.set(k, Date.now() + this.ttlMs);
    return true;
  }

  isUsed(agentDid: string, nonce: string): boolean {
    this.prune();
    return this.used.has(this.key(agentDid, nonce));
  }
}

export const globalNonceStore = new NonceStore();
