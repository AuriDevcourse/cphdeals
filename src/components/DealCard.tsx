"use client";

import { useCallback, useRef } from "react";
import {
  Clock,
  ExternalLink,
  Dumbbell,
  UtensilsCrossed,
  Clapperboard,
  Download,
  MapPin,
  Store,
  Tag,
} from "lucide-react";
import html2canvas from "html2canvas-pro";
import type { Deal } from "@/lib/types";


export const categoryConfig = {
  activity: {
    gradient: "from-emerald-600 to-emerald-400",
    bg: "bg-emerald-500/10 text-emerald-400",
    icon: Dumbbell,
    label: "Activity",
    glowInner: "16, 185, 129",   // emerald
    glowOuter: "52, 211, 153",   // emerald lighter
    borderA: "16, 185, 129",
    borderB: "52, 211, 153",
  },
  food: {
    gradient: "from-orange-600 to-amber-400",
    bg: "bg-orange-500/10 text-orange-400",
    icon: UtensilsCrossed,
    label: "Food",
    glowInner: "234, 138, 30",   // orange
    glowOuter: "245, 184, 60",   // amber
    borderA: "234, 138, 30",
    borderB: "245, 184, 60",
  },
  entertainment: {
    gradient: "from-purple-600 to-violet-400",
    bg: "bg-purple-500/10 text-purple-400",
    icon: Clapperboard,
    label: "Entertainment",
    glowInner: "147, 51, 234",   // purple
    glowOuter: "167, 100, 247",  // violet
    borderA: "147, 51, 234",
    borderB: "167, 100, 247",
  },
} as const;

export function getExpiryInfo(expiry: string | null) {
  if (!expiry) return null;
  const now = new Date();
  const exp = new Date(expiry);
  const diffMs = exp.getTime() - now.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMs < 0) return { text: "Expired", urgent: true };
  if (diffDays === 0) return { text: "Ends today!", urgent: true };
  if (diffDays === 1) return { text: "Ends tomorrow", urgent: true };
  if (diffDays <= 7) return { text: `${diffDays}d left`, urgent: false };
  return null;
}

async function saveAsImage(el: HTMLElement, title: string) {
  // Swap cross-origin images to proxied same-origin versions
  const images = el.querySelectorAll<HTMLImageElement>("img");
  const originalSrcs = new Map<HTMLImageElement, string>();

  await Promise.all(
    Array.from(images).map(async (img) => {
      if (!img.src || img.src.startsWith("data:") || img.src.startsWith("blob:")) return;
      originalSrcs.set(img, img.src);
      try {
        const res = await fetch(`/api/img?url=${encodeURIComponent(img.src)}`);
        if (!res.ok) return;
        const blob = await res.blob();
        img.src = URL.createObjectURL(blob);
        await new Promise<void>((resolve) => {
          if (img.complete) { resolve(); return; }
          img.onload = () => resolve();
          img.onerror = () => resolve();
        });
      } catch { /* leave original src */ }
    })
  );

  try {
    const canvas = await html2canvas(el, {
      backgroundColor: "#09090b",
      scale: 2,
      logging: false,
      useCORS: true,
      ignoreElements: (element) =>
        element.classList?.contains("holo-shimmer") ||
        element.getAttribute("data-export-hide") === "true",
    });

    const link = document.createElement("a");
    link.download = `deal-${title.slice(0, 30).replace(/[^a-zA-Z0-9]/g, "-")}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  } catch (err) {
    console.error("Failed to save image:", err);
  } finally {
    // Restore original srcs
    originalSrcs.forEach((src, img) => {
      URL.revokeObjectURL(img.src);
      img.src = src;
    });
  }
}

export function DealCard({ deal, distanceKm }: { deal: Deal; distanceKm?: number }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const holoRef = useRef<HTMLDivElement>(null);
  const config = categoryConfig[deal.category] ?? categoryConfig.activity;
  const Icon = config.icon;
  const expiry = getExpiryInfo(deal.expiry);
  const savings =
    deal.original_price && deal.deal_price
      ? Math.round(deal.original_price - deal.deal_price)
      : null;

  const handleSave = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (cardRef.current) saveAsImage(cardRef.current, deal.title);
  };

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    const card = cardRef.current;
    const holo = holoRef.current;
    if (!card || !holo) return;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    holo.style.setProperty("--holo-x", `${x}px`);
    holo.style.setProperty("--holo-y", `${y}px`);
    holo.style.opacity = "1";
  }, []);

  const handleMouseLeave = useCallback(() => {
    if (holoRef.current) holoRef.current.style.opacity = "0";
  }, []);

  return (
    <div className="group relative" onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave}>
      <a href={deal.url} target="_blank" rel="noopener noreferrer" className="block">
        <div
          ref={cardRef}
          className="holo-card relative overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-lg backdrop-blur-xl transition-shadow duration-300 hover:shadow-2xl hover:shadow-zinc-300/50 dark:border-white/[0.08] dark:bg-zinc-900/70 dark:hover:shadow-zinc-900/50"
          style={{
            "--glow-inner": config.glowInner,
            "--glow-outer": config.glowOuter,
            "--border-a": config.borderA,
            "--border-b": config.borderB,
          } as React.CSSProperties}
        >
          {/* Cursor-following holographic overlay */}
          <div ref={holoRef} className="holo-shimmer" />
          {/* Top gradient accent bar */}
          <div className={`relative z-[2] h-1.5 bg-gradient-to-r ${config.gradient}`} />

          {/* Deal image or category fallback */}
          <div className="relative z-[2] h-64 w-full overflow-hidden">
            {deal.image_url ? (
              <>
                <img
                  src={deal.image_url}
                  alt=""
                  loading="lazy"
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-white via-white/40 to-transparent dark:from-zinc-900 dark:via-zinc-900/40" />
              </>
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-zinc-200 dark:bg-zinc-800/80">
                <span
                  className="text-5xl italic tracking-wide"
                  style={{ fontFamily: "Georgia, 'Times New Roman', serif", color: "#c9a84c" }}
                >
                  {config.label}
                </span>
              </div>
            )}
          </div>

          {/* Sold-out overlay */}
          {!!deal.sold_out && (
            <div className="absolute inset-0 z-[4] flex items-center justify-center bg-black/60">
              <span className="rounded-lg border-2 border-white/30 bg-black/70 px-5 py-2 text-lg font-black uppercase tracking-widest text-white">
                Sold out
              </span>
            </div>
          )}

          {/* Discount badge */}
          {deal.discount_pct != null && deal.discount_pct > 0 && (
            <div className="absolute right-3 top-5 z-[3] rounded-lg bg-red-500 px-2.5 py-1 text-sm font-black text-white shadow-lg">
              -{deal.discount_pct}%
            </div>
          )}

          <div className="relative z-[2] p-6">
            {/* Category badge + expiry */}
            <div className="mb-4 flex items-center justify-between">
              <span
                className={`inline-flex items-center gap-1.5 rounded-full border border-zinc-200 px-3 py-1 text-xs font-semibold backdrop-blur-sm dark:border-white/[0.08] ${config.bg}`}
              >
                <Icon className="h-3.5 w-3.5" />
                {config.label}
              </span>
              {expiry && (
                <span
                  className={`inline-flex items-center gap-1 text-xs font-semibold ${
                    expiry.urgent
                      ? "text-red-400 animate-pulse"
                      : "text-amber-400"
                  }`}
                >
                  <Clock className="h-3.5 w-3.5" />
                  {expiry.text}
                </span>
              )}
            </div>

            {/* Title */}
            <h3 className="mb-4 text-lg font-bold leading-snug text-zinc-900 line-clamp-2 group-hover:text-black dark:text-zinc-100 dark:group-hover:text-white">
              {deal.title}
            </h3>

            {/* Info rows */}
            <div className="mb-4 space-y-2">
              {/* Provider / venue */}
              {deal.provider && (
                <div className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-300">
                  <Store className="h-3.5 w-3.5 shrink-0 text-zinc-400 dark:text-zinc-500" />
                  <span className="truncate">{deal.provider}</span>
                </div>
              )}

              {/* Location */}
              {deal.location && (
                <div className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-300">
                  <MapPin className="h-3.5 w-3.5 shrink-0 text-zinc-400 dark:text-zinc-500" />
                  <span className="truncate">{deal.location}</span>
                  {distanceKm != null && (
                    <span className="shrink-0 rounded-full border border-sky-500/20 bg-sky-500/10 px-2 py-0.5 text-xs font-semibold text-sky-600 dark:text-sky-400">
                      {distanceKm.toFixed(1)} km
                    </span>
                  )}
                </div>
              )}

              {/* What you get */}
              {deal.description && (
                <div className="flex items-start gap-2 text-sm text-zinc-500 dark:text-zinc-400">
                  <Tag className="mt-0.5 h-3.5 w-3.5 shrink-0 text-zinc-400 dark:text-zinc-500" />
                  <span className="line-clamp-2">{deal.description}</span>
                </div>
              )}
            </div>

            {/* Price block */}
            <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-4 backdrop-blur-sm dark:border-white/[0.06] dark:bg-white/[0.04]">
              <div className="flex items-end justify-between">
                <div>
                  {deal.deal_price != null ? (
                    <div className="flex items-baseline gap-3">
                      <span className="text-3xl font-black text-zinc-900 dark:text-white">
                        {Math.round(deal.deal_price)}
                        <span className="ml-1 text-lg font-semibold text-zinc-500 dark:text-zinc-400">
                          kr.
                        </span>
                      </span>
                      {deal.original_price != null && (
                        <span className="text-base text-zinc-400 line-through dark:text-zinc-500">
                          {Math.round(deal.original_price)} kr.
                        </span>
                      )}
                    </div>
                  ) : (
                    <span className="text-lg font-semibold text-zinc-500 dark:text-zinc-400">
                      See price on site
                    </span>
                  )}
                </div>
                {savings != null && savings > 0 && (
                  <span className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-3 py-1.5 text-sm font-bold text-emerald-400 backdrop-blur-sm">
                    Save {savings} kr.
                  </span>
                )}
              </div>
            </div>

            {/* Source tag */}
            <div className="mt-3 text-xs text-zinc-400 dark:text-zinc-600">
              via {deal.source}
            </div>
          </div>

          {/* Perforated edge */}
          <div className="voucher-edge relative z-[2]" />

          {/* Footer — hidden from image export */}
          <div data-export-hide="true" className="relative z-[2] flex items-center justify-between px-5 py-2.5">
            <span className="flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium uppercase tracking-wider text-zinc-400 transition-colors group-hover:bg-zinc-100 group-hover:text-zinc-700 dark:text-zinc-500 dark:group-hover:bg-zinc-800 dark:group-hover:text-zinc-300">
              View deal
              <ExternalLink className="h-3.5 w-3.5" />
            </span>
            <button
              onClick={handleSave}
              className="flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-700 dark:text-zinc-500 dark:hover:bg-zinc-800 dark:hover:text-zinc-300"
              title="Save as image"
            >
              <Download className="h-3.5 w-3.5" />
              Save
            </button>
          </div>
        </div>
      </a>
    </div>
  );
}
