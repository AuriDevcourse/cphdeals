"use client";

import { useCallback, useRef } from "react";
import {
  Clock,
  ExternalLink,
  Dumbbell,
  UtensilsCrossed,
  Clapperboard,
  Beer,
  Download,
  MapPin,
  Store,
} from "lucide-react";
import html2canvas from "html2canvas-pro";
import type { Deal } from "@/lib/types";


export const categoryConfig = {
  activity: {
    bg: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    hoverBorder: "group-hover:border-emerald-500/40",
    gradient: "from-emerald-600 to-emerald-400",
    glow: "16, 185, 129",
    icon: Dumbbell,
    label: "Activity",
  },
  food: {
    bg: "bg-orange-500/10 text-orange-600 dark:text-orange-400",
    hoverBorder: "group-hover:border-orange-500/40",
    gradient: "from-orange-600 to-amber-400",
    glow: "234, 138, 30",
    icon: UtensilsCrossed,
    label: "Food",
  },
  drinks: {
    bg: "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400",
    hoverBorder: "group-hover:border-cyan-500/40",
    gradient: "from-cyan-600 to-teal-400",
    glow: "6, 182, 212",
    icon: Beer,
    label: "Drinks",
  },
  entertainment: {
    bg: "bg-purple-500/10 text-purple-600 dark:text-purple-400",
    hoverBorder: "group-hover:border-purple-500/40",
    gradient: "from-purple-600 to-violet-400",
    glow: "147, 51, 234",
    icon: Clapperboard,
    label: "Entertainment",
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
      backgroundColor: "#18181b",
      scale: 2,
      logging: false,
      useCORS: true,
      ignoreElements: (element) =>
        element.getAttribute("data-export-hide") === "true",
    });

    const link = document.createElement("a");
    link.download = `deal-${title.slice(0, 30).replace(/[^a-zA-Z0-9]/g, "-")}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  } catch (err) {
    console.error("Failed to save image:", err);
  } finally {
    originalSrcs.forEach((src, img) => {
      URL.revokeObjectURL(img.src);
      img.src = src;
    });
  }
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  const month = d.toLocaleDateString("en-US", { month: "short" });
  const date = d.getDate();
  return { month, date };
}

export function DealCard({ deal, distanceKm }: { deal: Deal; distanceKm?: number }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
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
    const glow = glowRef.current;
    if (!card || !glow) return;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    glow.style.background = `radial-gradient(600px circle at ${x}px ${y}px, rgba(${config.glow}, 0.15), rgba(${config.glow}, 0.05) 40%, transparent 70%)`;
    glow.style.opacity = "1";
  }, [config.glow]);

  const handleMouseLeave = useCallback(() => {
    if (glowRef.current) glowRef.current.style.opacity = "0";
  }, []);

  const dateInfo = deal.created_at ? formatDate(deal.created_at) : null;

  return (
    <div className="group relative" onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave}>
      <a href={deal.url} target="_blank" rel="noopener noreferrer" className="block">
        <div
          ref={cardRef}
          className={`relative overflow-hidden rounded-2xl border border-zinc-200 bg-white transition-all duration-300 hover:shadow-xl dark:border-zinc-800 dark:bg-zinc-900 ${config.hoverBorder}`}
        >
          {/* Cursor-following category glow */}
          <div
            ref={glowRef}
            className="pointer-events-none absolute inset-0 z-[1] rounded-2xl opacity-0 transition-opacity duration-300"
          />

          {/* Top accent bar */}
          <div className={`h-1 bg-gradient-to-r ${config.gradient}`} />

          {/* Sold-out overlay */}
          {!!deal.sold_out && (
            <div className="absolute inset-0 z-[4] flex items-center justify-center bg-black/60">
              <span className="rounded-lg border-2 border-white/30 bg-black/70 px-5 py-2 text-lg font-black uppercase tracking-widest text-white">
                Sold out
              </span>
            </div>
          )}

          <div className="relative z-[2] p-5">
            {/* Header: Category + Date/Expiry */}
            <div className="mb-4 flex items-start justify-between">
              <span
                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${config.bg}`}
              >
                <Icon className="h-3.5 w-3.5" />
                {config.label}
              </span>
              <div className="text-right">
                {dateInfo && (
                  <span className="text-xs text-zinc-400 dark:text-zinc-500">
                    Added {dateInfo.month} {dateInfo.date}
                  </span>
                )}
                {expiry && (
                  <p className={`mt-0.5 text-xs font-medium ${
                    expiry.urgent ? "text-red-500" : "text-amber-500"
                  }`}>
                    <Clock className="mr-1 inline h-3 w-3" />
                    {expiry.text}
                  </p>
                )}
              </div>
            </div>

            {/* Image */}
            <div className="relative mb-4 h-48 w-full overflow-hidden rounded-xl">
              {deal.image_url ? (
                <img
                  src={deal.image_url}
                  alt=""
                  loading="lazy"
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-zinc-100 dark:bg-zinc-800">
                  <Icon className="h-12 w-12 text-zinc-300 dark:text-zinc-600" />
                </div>
              )}
              {/* Discount badge */}
              {deal.discount_pct != null && deal.discount_pct > 0 && (
                <div className="absolute left-3 top-3 rounded-lg bg-red-500 px-2 py-0.5 text-xs font-bold text-white shadow">
                  -{deal.discount_pct}%
                </div>
              )}
            </div>

            {/* Title */}
            <h3 className="mb-3 text-base font-bold leading-snug text-zinc-900 line-clamp-2 dark:text-white">
              {deal.title}
            </h3>

            {/* Info rows */}
            <div className="mb-4 space-y-1.5">
              {deal.location && (
                <div className="flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400">
                  <MapPin className="h-3.5 w-3.5 shrink-0" />
                  <span className="truncate">{deal.location}</span>
                  {distanceKm != null && (
                    <span className="shrink-0 rounded-full bg-sky-500/10 px-2 py-0.5 text-xs font-semibold text-sky-600 dark:text-sky-400">
                      {distanceKm.toFixed(1)} km
                    </span>
                  )}
                </div>
              )}
              {deal.provider && (
                <div className="flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400">
                  <Store className="h-3.5 w-3.5 shrink-0" />
                  <span className="truncate">{deal.provider}</span>
                </div>
              )}
            </div>

            {/* Price row */}
            <div className="flex items-end justify-between">
              <div>
                {deal.deal_price != null ? (
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-black text-zinc-900 dark:text-white">
                      {Math.round(deal.deal_price)}
                      <span className="ml-0.5 text-sm font-semibold text-zinc-400">kr.</span>
                    </span>
                    {deal.original_price != null && (
                      <span className="text-sm text-zinc-400 line-through dark:text-zinc-500">
                        {Math.round(deal.original_price)} kr.
                      </span>
                    )}
                  </div>
                ) : (
                  <span className="text-sm font-medium text-zinc-400">
                    See price on site
                  </span>
                )}
                {deal.deal_price != null && deal.fee != null && deal.fee > 0 && (
                  <div className="text-[11px] text-zinc-400 dark:text-zinc-500">
                    + {deal.fee % 1 === 0 ? deal.fee : deal.fee.toFixed(2)} kr. fee
                  </div>
                )}
              </div>
              {savings != null && savings > 0 && (
                <span className="rounded-lg bg-emerald-500/10 px-2.5 py-1 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                  Save {savings} kr.
                </span>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="border-t border-zinc-100 dark:border-zinc-800">
            <div data-export-hide="true" className="flex items-center justify-between px-5 py-3">
              <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 transition-colors group-hover:text-emerald-500 dark:text-emerald-400 dark:group-hover:text-emerald-300">
                View deal
                <ExternalLink className="h-3.5 w-3.5" />
              </span>
              <div className="flex items-center gap-3">
                <span className="text-[11px] text-zinc-400 dark:text-zinc-600">
                  via {deal.source}
                </span>
                <button
                  onClick={handleSave}
                  className="flex items-center gap-1 rounded-md px-2 py-1 text-xs text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-600 dark:text-zinc-500 dark:hover:bg-zinc-800 dark:hover:text-zinc-300"
                  title="Save as image"
                >
                  <Download className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </a>
    </div>
  );
}
