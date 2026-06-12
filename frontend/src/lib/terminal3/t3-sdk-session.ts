import {
  T3nClient,
  createDefaultHandlers,
  createEthAuthInput,
  eth_get_address,
  getNodeUrl,
  loadWasmComponent,
  metamask_sign,
  setEnvironment,
  type Environment,
  type UsagePage,
} from "@terminal3/t3n-sdk";

export interface T3SdkSession {
  client: T3nClient;
  ownerDid: `did:t3n:${string}`;
  ethAddress: string;
  environment: Environment;
  nodeUrl: string;
}

let sessionPromise: Promise<T3SdkSession> | null = null;

function resolveEnvironment(): Environment {
  const env = process.env.T3_ENVIRONMENT ?? "testnet";
  if (env !== "testnet" && env !== "production") {
    throw new Error(`Invalid T3_ENVIRONMENT "${env}" — expected "testnet" or "production"`);
  }
  return env;
}

async function initSession(): Promise<T3SdkSession> {
  const apiKey = process.env.T3_API_KEY?.trim();
  if (!apiKey) {
    throw new Error("T3_API_KEY is required when T3_ADAPTER=remote");
  }

  const environment = resolveEnvironment();
  setEnvironment(environment);

  const nodeUrl = process.env.T3_NODE_URL?.trim() || getNodeUrl();
  const wasmComponent = await loadWasmComponent();
  const ethAddress = eth_get_address(apiKey);

  const client = new T3nClient({
    baseUrl: nodeUrl,
    wasmComponent,
    handlers: {
      ...createDefaultHandlers(nodeUrl),
      EthSign: metamask_sign(ethAddress, undefined, apiKey),
    },
  });

  await client.handshake();
  const did = await client.authenticate(createEthAuthInput(ethAddress));

  const configuredOwner = process.env.T3_OWNER_DID?.trim();
  const ownerDid = (configuredOwner || did.value) as `did:t3n:${string}`;

  return {
    client,
    ownerDid,
    ethAddress,
    environment,
    nodeUrl,
  };
}

/** Lazily connects to the T3 network using server-side credentials. */
export async function getT3SdkSession(): Promise<T3SdkSession> {
  if (!sessionPromise) {
    sessionPromise = initSession().catch((error) => {
      sessionPromise = null;
      throw error;
    });
  }
  return sessionPromise;
}

export async function getT3Usage(): Promise<UsagePage | null> {
  try {
    const { client } = await getT3SdkSession();
    return await client.getUsage({ limit: 5 });
  } catch {
    return null;
  }
}

export function resetT3SdkSession(): void {
  sessionPromise = null;
}
