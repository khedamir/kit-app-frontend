import { Shield, User } from "lucide-react";
import { cn } from "@/lib/utils";

interface AuthorBadgeProps {
  name: string;
  role: string;
  size?: "sm" | "md";
  className?: string;
}

export function AuthorBadge({ name, role, size = "md", className }: AuthorBadgeProps) {
  const isAdmin = role === "admin";
  const iconSize = size === "sm" ? "h-3 w-3" : "h-4 w-4";
  const textSize = size === "sm" ? "text-xs" : "text-sm";

  return (
    <span className={cn("flex items-center gap-1", className)}>
      {isAdmin ? (
        <Shield className={cn(iconSize, "text-primary")} />
      ) : (
        <User className={iconSize} />
      )}
      <span className={cn(textSize, isAdmin && "text-primary")}>
        {name}
      </span>
    </span>
  );
}

