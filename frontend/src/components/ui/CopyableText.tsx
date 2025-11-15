import { useState } from "react";
import { ClipboardCopy, Check } from "lucide-react";

export function CopyableText({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000); // Reset after 2s
    } catch (err) {
      console.error("Failed to copy!", err);
    }
  };

  return (
    <div className="flex items-center justify-between bg-muted px-4 py-2 rounded-md border">
      <span className="truncate text-sm font-mono">{value}</span>
      <button
        onClick={copyToClipboard}
        className="ml-4 p-1 rounded-md hover:bg-primary/10 transition"
        title="Copy"
      >
        {copied ? <Check className="w-4 h-4 text-green-600" /> : <ClipboardCopy className="w-4 h-4" />}
      </button>
    </div>
  );
}