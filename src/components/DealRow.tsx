"use client";

import { Clock, ExternalLink, MapPin, Store } from "lucide-react";
import { categoryConfig, getExpiryInfo } from "@/components/DealCard";
import type { Deal } from "@/lib/types";

export function DealRow({ deal }: { deal: Deal }) {
  const config = categoryConfig[deal.category] ?? categoryConfig.activity;
  const Icon = config.icon;
  const expiry = getExpiryInfo(deal.expiry);
  const savings =
    deal.original_price && deal.deal_price
      ? Math.round(deal.original_price - deal.deal_price)
      : null;

  return (
    <a
      href={deal.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group relative flex overflow-hidden rounded-xl border border-white/[0.08] bg-zinc-900/70 backdrop-blur-xl transition-colors hover:bg-zinc-800/70"
    >
      {/* Image */}
      <div className="relative w-24 shrink-0 self-stretch overflow-hidden sm:w-44">
        {deal.image_url ? (
          <>
            <img
              src={deal.image_url}
              alt=""
              loading="lazy"
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-zinc-900/90" />
          </>
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-zinc-800/80">
            <span
              className="text-base italic tracking-wide sm:text-2xl"
              style={{ fontFamily: "Georgia, 'Times New Roman', serif", color: "#c9a84c" }}
            >
              {config.label}
            </span>
          </div>
        )}
        {/* Discount badge */}
        {deal.discount_pct != null && deal.discount_pct > 0 && (
          <div className="absolute left-1.5 top-1.5 z-[2] rounded-md bg-red-500 px-1.5 py-0.5 text-[10px] font-bold text-white shadow-lg sm:left-2 sm:top-2 sm:rounded-lg sm:px-2 sm:text-xs">
            -{deal.discount_pct}%
          </div>
        )}
        {/* Sold-out overlay */}
        {!!deal.sold_out && (
          <div className="absolute inset-0 z-[3] flex items-center justify-center bg-black/60">
            <span className="rounded-md border border-white/30 bg-black/70 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-white sm:px-3 sm:py-1 sm:text-xs">
              Sold out
            </span>
          </div>
        )}
      </div>

      {/* Content — stacked on mobile, row on desktop */}
      <div className="flex min-w-0 flex-1 flex-col sm:flex-row">
        {/* Mobile layout: 4 rows */}
        <div className="flex min-w-0 flex-1 flex-col justify-center gap-1 px-2.5 py-2 sm:hidden">
          {/* Row 1: Category + expiry + source */}
          <div className="flex items-center gap-1.5">
            <span className={`inline-flex items-center gap-0.5 rounded-full border border-white/[0.08] px-1.5 py-0.5 text-[9px] font-semibold ${config.bg}`}>
              <Icon className="h-2.5 w-2.5" />
              {config.label}
            </span>
            {expiry && (
              <span className={`inline-flex items-center gap-0.5 text-[9px] font-semibold ${expiry.urgent ? "text-red-400" : "text-amber-400"}`}>
                <Clock className="h-2.5 w-2.5" />
                {expiry.text}
              </span>
            )}
            <span className="ml-auto shrink-0 text-[9px] text-zinc-600">via {deal.source}</span>
          </div>

          {/* Row 2: Title + description */}
          <h3 className="text-[13px] font-bold leading-tight text-zinc-100 line-clamp-1">
            {deal.title}
          </h3>
          {deal.description && (
            <p className="text-[11px] leading-tight text-zinc-500 line-clamp-1">{deal.description}</p>
          )}

          {/* Row 3: Location + source */}
          <div className="flex items-center gap-2 text-[10px] text-zinc-500">
            {deal.location && (
              <span className="inline-flex items-center gap-0.5 truncate">
                <MapPin className="h-2.5 w-2.5 shrink-0" />
                <span className="truncate">{deal.location}</span>
              </span>
            )}
            {deal.provider && (
              <span className="inline-flex items-center gap-0.5 truncate">
                <Store className="h-2.5 w-2.5 shrink-0" />
                <span className="truncate">{deal.provider}</span>
              </span>
            )}
          </div>

          {/* Row 4: Price */}
          <div className="flex items-center gap-1.5">
            {deal.deal_price != null ? (
              <>
                <span className="text-base font-black text-white">
                  {Math.round(deal.deal_price)}
                  <span className="ml-0.5 text-[10px] font-semibold text-zinc-400">kr.</span>
                </span>
                {deal.original_price != null && (
                  <span className="text-[10px] text-zinc-500 line-through">
                    {Math.round(deal.original_price)} kr.
                  </span>
                )}
                {savings != null && savings > 0 && (
                  <span className="rounded border border-emerald-500/20 bg-emerald-500/10 px-1 py-0.5 text-[9px] font-bold text-emerald-400">
                    Save {savings} kr.
                  </span>
                )}
              </>
            ) : (
              <span className="text-[11px] text-zinc-500">See price on site</span>
            )}
          </div>
        </div>

        {/* Desktop layout: info column */}
        <div className="hidden min-w-0 flex-1 flex-col justify-center gap-2 px-5 py-4 sm:flex">
          <div className="flex items-center gap-2">
            <span className={`inline-flex items-center gap-1 rounded-full border border-white/[0.08] px-2.5 py-0.5 text-[11px] font-semibold ${config.bg}`}>
              <Icon className="h-3 w-3" />
              {config.label}
            </span>
            {expiry && (
              <span className={`inline-flex items-center gap-1 text-xs font-semibold ${expiry.urgent ? "text-red-400 animate-pulse" : "text-amber-400"}`}>
                <Clock className="h-3 w-3" />
                {expiry.text}
              </span>
            )}
          </div>
          <h3 className="text-base font-bold leading-snug text-zinc-100 line-clamp-1 group-hover:text-white">
            {deal.title}
          </h3>
          {deal.description && (
            <p className="text-sm text-zinc-400 line-clamp-1">{deal.description}</p>
          )}
          <div className="flex items-center gap-4 text-xs text-zinc-500">
            {deal.provider && (
              <span className="inline-flex items-center gap-1 truncate">
                <Store className="h-3 w-3 shrink-0" />
                <span className="truncate">{deal.provider}</span>
              </span>
            )}
            {deal.location && (
              <span className="inline-flex items-center gap-1 truncate">
                <MapPin className="h-3 w-3 shrink-0" />
                <span className="truncate">{deal.location}</span>
              </span>
            )}
          </div>
        </div>

        {/* Desktop: price column */}
        <div className="hidden shrink-0 flex-col items-end justify-center gap-2 px-5 py-4 sm:flex">
          <div className="text-right">
            {deal.deal_price != null ? (
              <>
                <span className="text-2xl font-black text-white">
                  {Math.round(deal.deal_price)}
                  <span className="ml-0.5 text-sm font-semibold text-zinc-400">kr.</span>
                </span>
                {deal.original_price != null && (
                  <div className="text-xs text-zinc-500 line-through">
                    {Math.round(deal.original_price)} kr.
                  </div>
                )}
              </>
            ) : (
              <span className="text-sm text-zinc-500">See price on site</span>
            )}
          </div>
          {savings != null && savings > 0 && (
            <span className="rounded-md border border-emerald-500/20 bg-emerald-500/10 px-2 py-1 text-xs font-bold text-emerald-400">
              Save {savings} kr.
            </span>
          )}
          <div className="flex items-center gap-3 text-xs text-zinc-600">
            <span>via {deal.source}</span>
            <span className="flex items-center gap-1 text-zinc-500 transition-colors group-hover:text-zinc-300">
              View deal <ExternalLink className="h-3 w-3" />
            </span>
          </div>
        </div>
      </div>
    </a>
  );
}
