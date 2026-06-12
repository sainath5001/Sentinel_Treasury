export const treasuryManagerAbi = [
  {
    type: "function",
    name: "getAllRequests",
    inputs: [],
    outputs: [
      {
        name: "requests",
        type: "tuple[]",
        components: [
          { name: "id", type: "uint256" },
          { name: "recipient", type: "address" },
          { name: "amount", type: "uint256" },
          { name: "description", type: "string" },
          { name: "status", type: "uint8" },
          { name: "createdAt", type: "uint64" },
          { name: "executedAt", type: "uint64" },
        ],
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getRequestCount",
    inputs: [],
    outputs: [{ name: "count", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "treasuryBalance",
    inputs: [],
    outputs: [{ name: "balance", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "createPaymentRequest",
    inputs: [
      { name: "recipient", type: "address" },
      { name: "amount", type: "uint256" },
      { name: "description", type: "string" },
    ],
    outputs: [{ name: "id", type: "uint256" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "validateCompliance",
    inputs: [{ name: "id", type: "uint256" }],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "approveRequest",
    inputs: [{ name: "id", type: "uint256" }],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "executePayment",
    inputs: [{ name: "id", type: "uint256" }],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "rejectRequest",
    inputs: [{ name: "id", type: "uint256" }],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "hasRole",
    inputs: [
      { name: "role", type: "bytes32" },
      { name: "account", type: "address" },
    ],
    outputs: [{ name: "", type: "bool" }],
    stateMutability: "view",
  },
  {
    type: "event",
    name: "PaymentRequested",
    inputs: [
      { name: "id", type: "uint256", indexed: true },
      { name: "recipient", type: "address", indexed: true },
      { name: "amount", type: "uint256", indexed: false },
      { name: "requester", type: "address", indexed: true },
    ],
  },
  {
    type: "event",
    name: "ComplianceValidated",
    inputs: [
      { name: "id", type: "uint256", indexed: true },
      { name: "validator", type: "address", indexed: true },
      { name: "approved", type: "bool", indexed: false },
    ],
  },
  {
    type: "event",
    name: "ApprovalGranted",
    inputs: [
      { name: "id", type: "uint256", indexed: true },
      { name: "approver", type: "address", indexed: true },
    ],
  },
  {
    type: "event",
    name: "PaymentExecuted",
    inputs: [
      { name: "id", type: "uint256", indexed: true },
      { name: "recipient", type: "address", indexed: true },
      { name: "amount", type: "uint256", indexed: false },
      { name: "executor", type: "address", indexed: true },
    ],
  },
  {
    type: "event",
    name: "PaymentRejected",
    inputs: [
      { name: "id", type: "uint256", indexed: true },
      { name: "rejector", type: "address", indexed: true },
      { name: "previousStatus", type: "uint8", indexed: false },
    ],
  },
] as const;
