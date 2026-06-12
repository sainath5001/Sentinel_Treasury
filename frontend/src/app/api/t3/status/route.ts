import { NextResponse } from "next/server";
import { AGENT_REGISTRY, getOwnerDid } from "@/config/agents";
import { RemoteT3Adapter } from "@/lib/terminal3/adapters/RemoteT3Adapter";
import { AgentIdentityService, AuthorizationService, getTerminal3Client } from "@/lib/terminal3";
import { getT3Usage } from "@/lib/terminal3/t3-sdk-session";

export const runtime = "nodejs";

export async function GET() {
  try {
    const client = getTerminal3Client();
    const identityService = new AgentIdentityService(client);
    const authService = new AuthorizationService(client);
    const adapter = client.getAdapter();

    const [identities, delegations, adapterName, usage] = await Promise.all([
      identityService.listAllIdentities(),
      authService.listDelegations(),
      Promise.resolve(client.getAdapterName()),
      adapter instanceof RemoteT3Adapter ? getT3Usage() : Promise.resolve(null),
    ]);

    const ownerDid =
      adapter instanceof RemoteT3Adapter
        ? adapter.getConnectionInfo().ownerDid
        : getOwnerDid();

    return NextResponse.json({
      adapter: adapterName,
      ownerDid,
      agents: Object.values(AGENT_REGISTRY),
      identities,
      delegations,
      network:
        adapter instanceof RemoteT3Adapter
          ? {
              connected: true,
              ...adapter.getConnectionInfo(),
              usage: usage
                ? {
                    balance: usage.balance,
                    entryCount: usage.entries.length,
                  }
                : null,
            }
          : { connected: false },
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "T3 status failed";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
