"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth/client";

export function LogoutButton({ className }: { className?: string }) {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);

  const onClick = async () => {
    setIsPending(true);
    try {
      await authClient.signOut();
    } finally {
      setIsPending(false);
    }
    router.push("/");
    router.refresh();
  };

  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      className={className}
      onClick={onClick}
      disabled={isPending}
    >
      <LogOut className="h-4 w-4" aria-hidden />
      {isPending ? "Keluar…" : "Keluar"}
    </Button>
  );
}
