import { Shield } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface AgentIdentityBadgeProps {
  did: string;
  verified?: boolean;
  className?: string;
}

export function AgentIdentityBadge({ did, verified = true, className }: AgentIdentityBadgeProps) {
  return (
    <Badge
      variant={verified ? "info" : "destructive"}
      className={cn("font-mono text-[10px] gap-1", className)}
    >
      <Shield className="h-3 w-3" />
      {did.length > 28 ? `${did.slice(0, 22)}…` : did}
    </Badge>
  );
}
