import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface BackButtonProps {
  to: string;
  label: string;
  className?: string;
}

export function BackButton({ to, label, className }: BackButtonProps) {
  return (
    <Link to={to} className={cn("inline-block mb-4", className)}>
      <Button variant="ghost" size="sm" className="-ml-2 text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4 mr-1.5" />
        {label}
      </Button>
    </Link>
  );
}
