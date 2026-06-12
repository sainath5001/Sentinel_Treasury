"use client";

import { useState } from "react";
import { isAddress } from "viem";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useTreasuryActions } from "@/hooks/useTreasuryActions";
import { useUserRoles } from "@/hooks/useUserRoles";
import { usePaymentRequests } from "@/hooks/usePaymentRequests";

export function CreatePaymentForm() {
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");

  const { roles, isConnected } = useUserRoles();
  const { createRequest, isPending, isConfirming, isSuccess, hash } = useTreasuryActions();
  const { refetch } = usePaymentRequests();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!isConnected) {
      setError("Connect your wallet first");
      return;
    }

    if (!roles.TREASURY_ROLE) {
      setError("Your wallet does not have TREASURY_ROLE");
      return;
    }

    if (!isAddress(recipient)) {
      setError("Invalid recipient address");
      return;
    }

    if (!amount || Number.parseFloat(amount) <= 0) {
      setError("Enter a valid amount");
      return;
    }

    if (!description.trim()) {
      setError("Description is required");
      return;
    }

    createRequest(recipient as `0x${string}`, amount, description);
  };

  if (isSuccess) {
    void refetch();
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create Payment Request</CardTitle>
        <CardDescription>Treasury Agent — submit a new outbound payment</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="recipient">Recipient Address</Label>
            <Input
              id="recipient"
              placeholder="0x..."
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="amount">Amount (STT)</Label>
            <Input
              id="amount"
              type="number"
              step="0.0001"
              min="0"
              placeholder="1000"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Invoice #1042 — Vendor payment"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {error && <p className="text-sm text-red-400">{error}</p>}
          {isSuccess && hash && (
            <p className="text-sm text-emerald-400">Transaction submitted: {hash.slice(0, 10)}…</p>
          )}

          <Button type="submit" disabled={isPending || isConfirming || !isConnected} className="w-full">
            {isPending || isConfirming ? "Confirming…" : "Create Request"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
