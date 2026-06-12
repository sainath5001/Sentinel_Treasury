import type { IT3SdkAdapter, T3SdkAdapterFactory } from "@/lib/terminal3/adapters/IT3SdkAdapter";
import { LocalT3Adapter } from "@/lib/terminal3/adapters/LocalT3Adapter";
import { RemoteT3Adapter } from "@/lib/terminal3/adapters/RemoteT3Adapter";

export type { IT3SdkAdapter, T3SdkAdapterFactory } from "@/lib/terminal3/adapters/IT3SdkAdapter";

function resolveAdapterMode(): "local" | "remote" {
  const configured = process.env.T3_ADAPTER?.trim().toLowerCase();
  if (configured === "remote") return "remote";
  if (configured === "local") return "local";
  return process.env.T3_API_KEY?.trim() ? "remote" : "local";
}

/**
 * Resolves the active T3 SDK adapter based on environment.
 *
 * - `local`  → LocalT3Adapter (demo / offline)
 * - `remote` → RemoteT3Adapter (@terminal3/t3n-sdk)
 *
 * When T3_API_KEY is set and T3_ADAPTER is unset, remote is selected automatically.
 */
export function createT3Adapter(): IT3SdkAdapter {
  switch (resolveAdapterMode()) {
    case "remote":
      return new RemoteT3Adapter();
    case "local":
    default:
      return new LocalT3Adapter();
  }
}

let singleton: IT3SdkAdapter | null = null;

export function getT3Adapter(): IT3SdkAdapter {
  if (!singleton) singleton = createT3Adapter();
  return singleton;
}

export function setT3AdapterFactory(factory: T3SdkAdapterFactory): void {
  singleton = factory();
}
