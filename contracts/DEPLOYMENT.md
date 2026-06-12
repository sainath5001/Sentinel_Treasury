# Sentinel Treasury — Sepolia Deployment Guide

This guide walks through deploying `TreasuryToken` and `TreasuryManager` to Ethereum Sepolia using Foundry.

## Prerequisites

- [Foundry](https://book.getfoundry.sh/getting-started/installation) installed (`forge`, `cast`, `anvil`)
- A Sepolia-funded deployer wallet ([Sepolia faucet](https://sepoliafaucet.com/))
- [Alchemy](https://dashboard.alchemy.com) account with a Sepolia app (free tier works)
- Optional: [Etherscan API key](https://etherscan.io/myapikey) for verification

## 1. Install Dependencies

From the `contracts/` directory:

```bash
cd contracts
forge install
```

OpenZeppelin and forge-std are already configured as git submodules.

## 2. Configure Environment

### Get your Alchemy RPC URL

1. Sign up at [dashboard.alchemy.com](https://dashboard.alchemy.com)
2. **Create new app** → Chain: **Ethereum**, Network: **Sepolia**
3. Open the app → **API Key** → copy the HTTPS URL  
   Format: `https://eth-sepolia.g.alchemy.com/v2/<YOUR_API_KEY>`

```bash
cp .env.example .env
```

Edit `.env`:

```env
PRIVATE_KEY=your_private_key_without_0x
SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_ALCHEMY_API_KEY
ETHERSCAN_API_KEY=your_etherscan_api_key

# Optional
ADMIN_ADDRESS=0xYourAdminAddress
INITIAL_SUPPLY=1000000000000000000000000
```

Load variables into your shell:

```bash
source .env
# or: export $(grep -v '^#' .env | xargs)
```

## 3. Build and Test

```bash
forge build
forge test -vv
```

Expected output: all tests passing.

## 4. Deploy to Sepolia

Dry run (simulation only):

```bash
forge script script/Deploy.s.sol:DeploySentinelTreasury \
  --rpc-url $SEPOLIA_RPC_URL \
  -vvvv
```

Broadcast deployment:

```bash
forge script script/Deploy.s.sol:DeploySentinelTreasury \
  --rpc-url $SEPOLIA_RPC_URL \
  --broadcast \
  --verify \
  -vvvv
```

The script will:

1. Deploy `TreasuryToken` and mint the initial supply to the deployer
2. Deploy `TreasuryManager` wired to the token
3. Transfer the full initial supply into the manager vault

Save the logged addresses:

```
TreasuryToken:  0x...
TreasuryManager: 0x...
```

Deployment artifacts are written to `broadcast/Deploy.s.sol/11155111/`.

## 5. Verify Contracts (Manual)

If `--verify` fails, verify manually:

```bash
forge verify-contract \
  --chain-id 11155111 \
  --watch \
  <TREASURY_TOKEN_ADDRESS> \
  src/TreasuryToken.sol:TreasuryToken \
  --constructor-args $(cast abi-encode "constructor(address,address,uint256)" \
    <DEPLOYER> <DEPLOYER> <INITIAL_SUPPLY>)

forge verify-contract \
  --chain-id 11155111 \
  --watch \
  <TREASURY_MANAGER_ADDRESS> \
  src/TreasuryManager.sol:TreasuryManager \
  --constructor-args $(cast abi-encode "constructor(address,address)" \
    <ADMIN_ADDRESS> <TREASURY_TOKEN_ADDRESS>)
```

## 6. Post-Deployment Setup

### Grant agent roles

Replace addresses with your agent executor wallets:

```bash
MANAGER=0xYourTreasuryManagerAddress
TREASURY_AGENT=0x...
COMPLIANCE_AGENT=0x...
APPROVER=0x...

cast send $MANAGER "grantRole(bytes32,address)" \
  $(cast keccak "TREASURY_ROLE") $TREASURY_AGENT \
  --rpc-url $SEPOLIA_RPC_URL --private-key $PRIVATE_KEY

cast send $MANAGER "grantRole(bytes32,address)" \
  $(cast keccak "COMPLIANCE_ROLE") $COMPLIANCE_AGENT \
  --rpc-url $SEPOLIA_RPC_URL --private-key $PRIVATE_KEY

cast send $MANAGER "grantRole(bytes32,address)" \
  $(cast keccak "APPROVER_ROLE") $APPROVER \
  --rpc-url $SEPOLIA_RPC_URL --private-key $PRIVATE_KEY
```

### Confirm vault balance

```bash
cast call $MANAGER "treasuryBalance()(uint256)" --rpc-url $SEPOLIA_RPC_URL
```

## 7. End-to-End Smoke Test

```bash
TOKEN=0xYourTreasuryTokenAddress
RECIPIENT=0xRecipientAddress

# 1. Create request (TREASURY_ROLE)
cast send $MANAGER \
  "createPaymentRequest(address,uint256,string)" \
  $RECIPIENT 1000000000000000000 "Smoke test payment" \
  --rpc-url $SEPOLIA_RPC_URL --private-key $TREASURY_AGENT_KEY

# 2. Compliance approve (COMPLIANCE_ROLE)
cast send $MANAGER "validateCompliance(uint256)" 1 \
  --rpc-url $SEPOLIA_RPC_URL --private-key $COMPLIANCE_AGENT_KEY

# 3. Human approve (APPROVER_ROLE)
cast send $MANAGER "approveRequest(uint256)" 1 \
  --rpc-url $SEPOLIA_RPC_URL --private-key $APPROVER_KEY

# 4. Execute payment (TREASURY_ROLE)
cast send $MANAGER "executePayment(uint256)" 1 \
  --rpc-url $SEPOLIA_RPC_URL --private-key $TREASURY_AGENT_KEY

# 5. Read request state
cast call $MANAGER "getRequest(uint256)" 1 --rpc-url $SEPOLIA_RPC_URL
```

## 8. Contract Addresses Template

Record deployed addresses for frontend integration:

```json
{
  "chainId": 11155111,
  "TreasuryToken": "0x...",
  "TreasuryManager": "0x...",
  "deployedAt": "2026-06-12",
  "deployer": "0x..."
}
```

## Architecture Reference

### Payment lifecycle

```
Pending → ComplianceApproved → Approved → Executed
   ↓              ↓
Rejected       Rejected
```

### Roles

| Role | Function |
|------|----------|
| `TREASURY_ROLE` | `createPaymentRequest`, `executePayment` |
| `COMPLIANCE_ROLE` | `validateCompliance`, reject from `Pending` |
| `APPROVER_ROLE` | `approveRequest`, reject from `ComplianceApproved` |
| `DEFAULT_ADMIN_ROLE` | Grant/revoke roles |

### Security features

- OpenZeppelin `AccessControl` for role separation
- `ReentrancyGuard` on `executePayment`
- `SafeERC20` for token transfers
- Custom errors for gas-efficient reverts
- Strict state machine — invalid transitions revert

## Troubleshooting

| Issue | Fix |
|-------|-----|
| `InsufficientTreasuryBalance` | Fund the manager: `token.transfer(manager, amount)` |
| `InvalidStatus` | Ensure lifecycle order: create → compliance → approve → execute |
| Verification failed | Pass exact constructor args and compiler settings from `foundry.toml` |
| Out of gas on deploy | Increase gas limit or retry with higher priority fee |

## Local Development

```bash
anvil
forge script script/Deploy.s.sol:DeploySentinelTreasury \
  --rpc-url http://127.0.0.1:8545 \
  --broadcast
```
