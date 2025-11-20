"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

type CopyButtonProps = {
  value: string;
  label?: string;
};

export function CopyButton({ value, label = "Copiar" }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Clipboard error", error);
    }
  };

  return (
    <Button type="button" variant="outline" onClick={handleCopy} className="text-xs">
      {copied ? "Copiado" : label}
    </Button>
  );
}
