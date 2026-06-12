# Terminal 3 Integration — Sentinel Treasury

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Agent Orchestrator                       │
└──────────────────────────┬──────────────────────────────────┘
                           │
                    ┌──────▼──────┐
                    │  T3Gateway  │  ← every agent step
                    └──────┬──────┘
                           │
         ┌─────────────────┼─────────────────┐
         ▼                 ▼                 ▼
┌────────────────┐ ┌───────────────┐ ┌──────────────────┐
│ AgentIdentity  │ │ Authorization │ │ ProtectedAction  │
│    Service     │ │    Service    │ │     Service      │
└────────┬───────┘ └───────┬───────┘ └────────┬─────────┘
         │                 │                   │
         └─────────────────┼───────────────────┘
                           ▼
                  ┌─────────────────┐
                  │ Terminal3Client │
                  └────────┬────────┘
                           ▼
                  ┌─────────────────┐
                  │  IT3SdkAdapter  │  ← swappable
                  ├─────────────────┤
                  │ LocalT3Adapter  │  (current)
                  │ RemoteT3Adapter │  (TODO)
                  └─────────────────┘
```

## Protected Action Flow

Every payment-related agent action executes these steps:

1. **Verify identity** — `AgentIdentityService.verifyAgent()`
2. **Verify authorization** — `AuthorizationService.authorizeOrThrow()`
3. **Create protected action** — signed intent envelope + action record
4. **Record agent identity** — DID + attestation stored in trail
5. **Generate audit metadata** — nonce, payload hash, signatures

## Agent Registry

| Agent | DID | Actions |
|-------|-----|---------|
| Treasury | `did:t3n:treasury-agent-sentinel` | CREATE_PAYMENT_REQUEST |
| Compliance | `did:t3n:compliance-agent-sentinel` | RECORD_COMPLIANCE |
| Approval | `did:t3n:approval-agent-sentinel` | EVALUATE_APPROVAL |
| Audit | `did:t3n:audit-agent-sentinel` | ANCHOR_AUDIT |

Agent cards: `/public/agents/*_agent_card.json`

## Adapter Pattern

Application code depends on **services**, not SDK internals:

```typescript
// Swap adapter via environment
T3_ADAPTER=local   // LocalT3Adapter (default)
T3_ADAPTER=remote  // TODO: RemoteT3Adapter when SDK available
```

Implement `IT3SdkAdapter` in `src/lib/terminal3/adapters/` to integrate the official T3 SDK.

## API Endpoints

| Route | Method | Description |
|-------|--------|-------------|
| `/api/t3/status` | GET | Agent identities + delegations |
| `/api/t3/revoke` | POST | Revoke agent delegation (kill switch) |
| `/api/orchestrate` | POST | Full pipeline with T3 trail in response |

## Environment Variables

```env
T3_ADAPTER=local
T3_SIGNING_SECRET=your-secret
NEXT_PUBLIC_APP_URL=http://localhost:3000
# T3_API_KEY=              # TODO
# AGENT_IDENTITY_CONFIG_PATH=  # TODO
```

## Upgrading to Production T3 SDK

1. Request SDK access: enterprise@terminal3.io
2. Create `RemoteT3Adapter` implementing `IT3SdkAdapter`
3. Register agent DIDs via T3 CLI / Dashboard
4. Host `agent_card.json` files publicly
5. Configure delegations in T3 Dashboard
6. Set `T3_ADAPTER=remote`

## Demo: Revocation Kill Switch

1. Go to **Settings → Terminal 3 Delegations**
2. Click **Revoke Agent** on Treasury Agent
3. Run a payment in **Agent Workspace**
4. Pipeline fails with `T3_AUTHORIZATION_DENIED`
