/** Demo payee directory — maps names to known Sepolia addresses. */
export const RECIPIENT_DIRECTORY: Record<string, `0x${string}`> = {
  rahul: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
  vendor: "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC",
  alice: "0x90F79bf6EB2c4f870365E785982E1f101E93b906",
  bob: "0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65",
  treasury: "0xAE7168d00595a769C9434AB1ddE4D9F0273177CE",
};

export function formatRecipientDirectoryForPrompt(): string {
  const entries = Object.entries(RECIPIENT_DIRECTORY)
    .map(([name, addr]) => `- ${name}: ${addr}`)
    .join("\n");
  return `Known payees:\n${entries}\nIf a name is not listed, set recipientAddress to null and add a clarification request.`;
}

export function resolveRecipientName(name: string): `0x${string}` | null {
  const key = name.trim().toLowerCase();
  return RECIPIENT_DIRECTORY[key] ?? null;
}
