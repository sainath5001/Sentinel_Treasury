import type { IT3SdkAdapter } from "@/lib/terminal3/adapters/IT3SdkAdapter";
import { getT3Adapter } from "@/lib/terminal3/adapters";

/**
 * Terminal3Client — entry point for all T3 network interactions.
 *
 * Application code should depend on this client or higher-level services,
 * never on adapter implementations directly.
 */
export class Terminal3Client {
  private readonly adapter: IT3SdkAdapter;
  private ready = false;

  constructor(adapter?: IT3SdkAdapter) {
    this.adapter = adapter ?? getT3Adapter();
  }

  getAdapterName(): string {
    return this.adapter.name;
  }

  async connect(): Promise<void> {
    if (this.ready) return;
    await this.adapter.authenticate();
    this.ready = true;
  }

  async ensureConnected(): Promise<void> {
    if (!this.ready) await this.connect();
  }

  getAdapter(): IT3SdkAdapter {
    return this.adapter;
  }
}

let clientSingleton: Terminal3Client | null = null;

export function getTerminal3Client(): Terminal3Client {
  if (!clientSingleton) clientSingleton = new Terminal3Client();
  return clientSingleton;
}
