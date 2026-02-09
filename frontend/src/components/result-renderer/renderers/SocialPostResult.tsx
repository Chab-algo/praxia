"use client";

import { MessageSquare, Copy, Check } from "lucide-react";
import { useState } from "react";
import type { SocialPostOutput } from "@/types/result-renderer";

export function SocialPostResult({
  data,
}: {
  data: Record<string, unknown>;
}) {
  const d = data as unknown as SocialPostOutput;
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    const text = `${d.post_text}\n\n${d.hashtags
      ?.map((h) => (h.startsWith("#") ? h : `#${h}`))
      .join(" ")}`;
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-4">
      {/* Post Preview Card */}
      <div className="rounded-xl border-2 border-muted p-5 bg-white">
        <div className="flex items-center gap-3 mb-3">
          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-cyan-400 to-violet-500 flex items-center justify-center">
            <MessageSquare className="h-5 w-5 text-white" />
          </div>
          <div>
            <p className="text-sm font-semibold">Your Brand</p>
            <p className="text-xs text-muted-foreground">Just now</p>
          </div>
          <button
            onClick={handleCopy}
            className="ml-auto inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            {copied ? (
              <>
                <Check className="h-3.5 w-3.5 text-green-600" />
                <span className="text-green-600">Copied</span>
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5" />
                Copy
              </>
            )}
          </button>
        </div>
        <p className="text-sm leading-relaxed whitespace-pre-wrap mb-3">
          {d.post_text}
        </p>
        {d.hashtags && d.hashtags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {d.hashtags.map((tag, i) => (
              <span key={i} className="text-sm text-blue-600 font-medium">
                {tag.startsWith("#") ? tag : `#${tag}`}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* CTA */}
      {d.call_to_action && (
        <div className="flex items-center gap-2">
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Call to Action
          </label>
          <span className="rounded-full bg-violet-100 text-violet-700 px-3 py-1 text-xs font-medium">
            {d.call_to_action}
          </span>
        </div>
      )}
    </div>
  );
}
