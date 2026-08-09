"use client";

import { useState } from "react";
import Image from "next/image";
import { Link2, Copy, Check, Video, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { extractYouTubeVideoId, getYouTubeThumbnail } from "@/utils/media";

export function YouTubeParser() {
  const [url, setUrl] = useState("");
  const [parsedUrl, setParsedUrl] = useState("");
  const [copied, setCopied] = useState<string | null>(null);

  const videoId = extractYouTubeVideoId(parsedUrl);
  const embedUrl = videoId ? `https://www.youtube.com/embed/${videoId}` : "";
  const thumbnailUrl = videoId ? getYouTubeThumbnail(videoId, "maxresdefault") : "";

  const parse = () => {
    setParsedUrl(url);
  };

  const copy = async (text: string, key: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(key);
      setTimeout(() => setCopied(null), 1500);
    } catch {
      setCopied(null);
    }
  };

  return (
    <div className="flex max-w-2xl flex-col gap-6">
      <div>
        <label htmlFor="youtube-url" className="mb-1.5 block text-sm font-medium">
          URL YouTube
        </label>
        <div className="flex gap-2">
          <Input
            id="youtube-url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && parse()}
            placeholder="https://youtube.com/watch?v=... atau https://youtu.be/..."
            invalid={parsedUrl.length > 0 && !videoId}
          />
          <Button type="button" onClick={parse}>
            <Link2 className="h-4 w-4" />
            Parse
          </Button>
        </div>
        {parsedUrl.length > 0 && !videoId && (
          <p className="mt-1.5 text-sm text-danger">URL YouTube tidak valid.</p>
        )}
      </div>

      {videoId && (
        <div className="flex flex-col gap-4 rounded-xl border border-border bg-surface p-4">
          <Image
            src={thumbnailUrl}
            alt="Preview video"
            width={384}
            height={216}
            className="aspect-video w-full max-w-96 rounded-lg object-cover"
          />

          <div className="grid gap-3 text-sm sm:grid-cols-2">
            <div>
              <p className="flex items-center gap-1 font-medium">
                <Video className="h-4 w-4 text-brand" />
                Video ID
              </p>
              <div className="mt-1 flex items-center gap-2">
                <code className="rounded-md bg-muted/50 px-2 py-1 font-mono text-xs">{videoId}</code>
                <Button size="icon" variant="ghost" aria-label="Salin video ID"
                  onClick={() => copy(videoId, "id")}>
                  {copied === "id" ? <Check className="h-4 w-4 text-success" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            <div>
              <p className="flex items-center gap-1 font-medium">
                <Link2 className="h-4 w-4 text-brand" />
                Embed URL
              </p>
              <div className="mt-1 flex items-center gap-2">
                <code className="min-w-0 truncate rounded-md bg-muted/50 px-2 py-1 font-mono text-xs">{embedUrl}</code>
                <Button size="icon" variant="ghost" aria-label="Salin embed URL"
                  onClick={() => copy(embedUrl, "embed")}>
                  {copied === "embed" ? <Check className="h-4 w-4 text-success" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            <div>
              <p className="flex items-center gap-1 font-medium">
                <Copy className="h-4 w-4 text-brand" />
                Thumbnail URL
              </p>
              <div className="mt-1 flex items-center gap-2">
                <code className="min-w-0 truncate rounded-md bg-muted/50 px-2 py-1 font-mono text-xs">{thumbnailUrl}</code>
                <Button size="icon" variant="ghost" aria-label="Salin thumbnail URL"
                  onClick={() => copy(thumbnailUrl, "thumb")}>
                  {copied === "thumb" ? <Check className="h-4 w-4 text-success" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            <div className="flex items-end">
              <Button variant="outline" size="sm" asChild>
                <a href={`https://www.youtube.com/watch?v=${videoId}`} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-4 w-4" />
                  Buka di YouTube
                </a>
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="rounded-xl border border-border bg-surface p-4 text-sm">
        <p className="mb-2 font-medium">Format URL yang didukung</p>
        <ul className="list-inside list-disc space-y-1 text-muted">
          <li><code className="font-mono text-xs">youtube.com/watch?v=VIDEOID</code></li>
          <li><code className="font-mono text-xs">youtu.be/VIDEOID</code></li>
          <li><code className="font-mono text-xs">youtube.com/shorts/VIDEOID</code></li>
          <li><code className="font-mono text-xs">youtube.com/embed/VIDEOID</code></li>
        </ul>
      </div>
    </div>
  );
}
