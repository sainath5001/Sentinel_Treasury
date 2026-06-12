export { Terminal3Client, getTerminal3Client } from "./client";
export { AgentIdentityService, AgentIdentityVerificationError } from "./identity";
export { AuthorizationService, AuthorizationDeniedError } from "./authorization";
export { ProtectedActionService } from "./protected-action";
export type { ExecuteProtectedActionParams, ProtectedActionResult } from "./protected-action";
export { T3Gateway, getT3Gateway } from "./gateway";
export { getT3Adapter, createT3Adapter, setT3AdapterFactory } from "./adapters";
export type { IT3SdkAdapter } from "./adapters";
