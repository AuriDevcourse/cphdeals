"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { LayoutGrid, List, Map as MapIcon, ChevronDown, SlidersHorizontal, EyeOff, LocateFixed, Loader2, BadgeCheck } from "lucide-react";
import { DealMapWrapper } from "@/components/map/DealMapWrapper";
import { useDeals, useSearchDeals } from "@/hooks/useDeals";
import { useGeolocation } from "@/hooks/useGeolocation";
import { COPENHAGEN_COORDS, haversineKm } from "@/lib/geocode";
import { DealCard } from "@/components/DealCard";
import { DealRow } from "@/components/DealRow";
import { DealSkeleton } from "@/components/DealSkeleton";
import { CategoryFilter } from "@/components/CategoryFilter";
import { PriceFilter } from "@/components/PriceFilter";
import type { PriceRange } from "@/components/PriceFilter";
import { TimeFilter } from "@/components/TimeFilter";
import { SortFilter } from "@/components/SortFilter";
import type { SortOption } from "@/components/SortFilter";
import { SearchBar } from "@/components/SearchBar";
import { StatsBar } from "@/components/StatsBar";
import { ThemeToggle } from "@/components/ThemeToggle";
import { TelegramBanner } from "@/components/TelegramBanner";
import { BackToTop } from "@/components/BackToTop";
import { PullToRefresh } from "@/components/PullToRefresh";
import type { Deal } from "@/lib/types";

const PAGE_SIZE = 30;

function sortDeals(deals: Deal[], sort: SortOption): Deal[] {
  const sorted = [...deals];
  switch (sort) {
    case "newest":
      return sorted.sort((a, b) => {
        const ta = new Date(a.created_at ?? a.updated_at).getTime();
        const tb = new Date(b.created_at ?? b.updated_at).getTime();
        return tb - ta;
      });
    case "cheapest":
      return sorted.sort((a, b) => {
        const pa = a.deal_price ?? Infinity;
        const pb = b.deal_price ?? Infinity;
        return pa - pb;
      });
    case "discount":
      return sorted.sort((a, b) => {
        const da = a.discount_pct ?? 0;
        const db = b.discount_pct ?? 0;
        return db - da;
      });
    default:
      return sorted;
  }
}

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 640);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);
  return isMobile;
}

export default function Home() {
  const [categories, setCategories] = useState<Set<string>>(new Set());
  const [priceRange, setPriceRange] = useState<PriceRange>({});
  const [searchQuery, setSearchQuery] = useState("");
  const [showExpiring, setShowExpiring] = useState(false);
  const [maxAge, setMaxAge] = useState<number | undefined>(undefined);
  const [viewMode, setViewMode] = useState<"grid" | "list" | "map">("grid");
  const [sort, setSort] = useState<SortOption>("newest");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [hideSoldOut, setHideSoldOut] = useState(true);
  const [noFeeOnly, setNoFeeOnly] = useState(false);
  const [nearMe, setNearMe] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const isMobile = useIsMobile();
  const geo = useGeolocation();

  const dealsQuery = useDeals(undefined, priceRange.max);
  const searchResults = useSearchDeals(searchQuery, priceRange.max);

  const handleSearch = useCallback((q: string) => {
    setSearchQuery(q);
    setVisibleCount(PAGE_SIZE);
  }, []);

  const handleCategoryToggle = (cat: string) => {
    setCategories((prev) => {
      const next = new Set(prev);
      if (next.has(cat)) next.delete(cat);
      else next.add(cat);
      return next;
    });
    setVisibleCount(PAGE_SIZE);
  };

  const handleExpiringToggle = () => {
    setShowExpiring((prev) => !prev);
    setVisibleCount(PAGE_SIZE);
  };

  const handleSortChange = (s: SortOption) => {
    setSort(s);
    setVisibleCount(PAGE_SIZE);
  };

  const handleNearMeToggle = () => {
    const next = !nearMe;
    setNearMe(next);
    if (next && !geo.coords) geo.request();
  };

  const handleTimeChange = (hours: number | undefined) => {
    setMaxAge(hours);
    setVisibleCount(PAGE_SIZE);
  };

  const handlePriceChange = (range: PriceRange) => {
    setPriceRange(range);
    setVisibleCount(PAGE_SIZE);
  };

  // Determine which data to show
  let deals: Deal[] = [];
  let isLoading = false;
  let isError = false;

  if (searchQuery) {
    deals = searchResults.data?.deals ?? [];
    isLoading = searchResults.isLoading;
    isError = searchResults.isError;
  } else {
    deals = dealsQuery.data?.deals ?? [];
    isLoading = dealsQuery.isLoading;
    isError = dealsQuery.isError;
  }

  // Filter by selected categories (client-side)
  if (categories.size > 0) {
    deals = deals.filter((d) => categories.has(d.category));
  }

  // Filter by min price (client-side, for ">500" option)
  if (priceRange.min != null) {
    deals = deals.filter((d) => (d.deal_price ?? 0) >= priceRange.min!);
  }

  // Filter by expiring (deals with expiry within 7 days)
  if (showExpiring) {
    const now = Date.now();
    const weekMs = 7 * 24 * 60 * 60 * 1000;
    deals = deals.filter((d) => {
      if (!d.expiry) return false;
      const exp = new Date(d.expiry).getTime();
      return exp > now && exp - now <= weekMs;
    });
  }

  // Apply time filter (based on when the deal was first added)
  if (maxAge && deals.length > 0) {
    const cutoff = Date.now() - maxAge * 60 * 60 * 1000;
    deals = deals.filter((d) => {
      const added = d.created_at ?? d.updated_at;
      return new Date(added).getTime() >= cutoff;
    });
  }

  // Hide sold-out deals
  if (hideSoldOut) {
    deals = deals.filter((d) => !d.sold_out);
  }

  // Show only no-fee deals (fee must be explicitly 0, not null/unknown)
  if (noFeeOnly) {
    deals = deals.filter((d) => d.fee === 0);
  }

  // Apply sorting — when expiring is active, sort by soonest-first as secondary
  deals = sortDeals(deals, sort);
  if (showExpiring) {
    deals = [...deals].sort((a, b) => {
      const ea = a.expiry ? new Date(a.expiry).getTime() : Infinity;
      const eb = b.expiry ? new Date(b.expiry).getTime() : Infinity;
      return ea - eb;
    });
  }

  // Compute distances when user location is available
  const distanceMap = useMemo(() => {
    if (!geo.coords) return new Map<string, number>();
    const map = new Map<string, number>();
    for (const [name, pos] of Object.entries(COPENHAGEN_COORDS)) {
      map.set(name, haversineKm(geo.coords.lat, geo.coords.lng, pos.lat, pos.lng));
    }
    return map;
  }, [geo.coords]);

  const getDealDistance = useCallback(
    (deal: Deal): number | undefined => {
      if (!deal.location || distanceMap.size === 0) return undefined;
      const key = deal.location.trim().toLowerCase();
      return distanceMap.get(key);
    },
    [distanceMap]
  );

  // When "Near me" is active, use distance as secondary sort (tiebreaker)
  if (nearMe && geo.coords) {
    deals = [...deals].sort((a, b) => {
      const da = getDealDistance(a) ?? Infinity;
      const db = getDealDistance(b) ?? Infinity;
      return da - db;
    });
  }

  // Pagination
  const totalDeals = deals.length;
  const visibleDeals = deals.slice(0, visibleCount);
  const hasMore = visibleCount < totalDeals;

  // On mobile, use list view unless map is selected
  const effectiveView = isMobile && viewMode !== "map" ? "list" : viewMode;



  return (
    <PullToRefresh>
    <main className="relative z-10 mx-auto max-w-[1400px] px-4 py-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between gap-3">
          {/* Mobile: search left */}
          <div className="flex flex-1 items-center gap-2 sm:hidden">
            <SearchBar onSearch={handleSearch} />
          </div>
          {/* Desktop: logo left */}
          <div className="hidden sm:block">
            <h1 className="flex items-center">
              <img src="/logo-black.png" alt="Dealround" className="h-14 dark:hidden" />
              <img src="/logo-white.png" alt="Dealround" className="h-14 hidden dark:block" />
            </h1>
          </div>
          {/* Right side: search (desktop only) + LinkedIn + theme */}
          <div className="flex items-center gap-2">
            <div className="hidden sm:block">
              <SearchBar onSearch={handleSearch} />
            </div>
            <a
              href="https://www.linkedin.com/in/auribaci/"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-lg p-2 text-emerald-500 transition-colors hover:bg-zinc-200 hover:text-emerald-600 dark:hover:bg-zinc-800 dark:hover:text-emerald-400"
              title="LinkedIn"
            >
              <svg className="h-5 w-5" viewBox="0 0 504.4 504.4" fill="currentColor"><path d="M377.6,0.2H126.4C56.8,0.2,0,57,0,126.6v251.6c0,69.2,56.8,126,126.4,126H378c69.6,0,126.4-56.8,126.4-126.4V126.6C504,57,447.2,0.2,377.6,0.2z M168,408.2H96v-208h72V408.2z M131.6,168.2c-20.4,0-36.8-16.4-36.8-36.8c0-20.4,16.4-36.8,36.8-36.8c20.4,0,36.8,16.4,36.8,36.8C168,151.8,151.6,168.2,131.6,168.2z M408.4,408.2H408h-60V307.4c0-24.4-3.2-55.6-36.4-55.6c-34,0-39.6,26.4-39.6,54v102.4h-60v-208h56v28h1.6c8.8-16,29.2-28.4,61.2-28.4c66,0,77.6,38,77.6,94.4V408.2z"/></svg>
            </a>
            <ThemeToggle />
          </div>
        </div>
        <div className="mt-3">
          <StatsBar />
        </div>
      </div>

      {/* Filters — always visible on desktop, collapsible on mobile */}
      <div className="mb-6">
        {/* Category row — always visible */}
        <CategoryFilter
          selected={categories}
          expiring={showExpiring}
          onToggle={handleCategoryToggle}
          onExpiringToggle={handleExpiringToggle}
        />

        {/* Mobile: toggle button */}
        <button
          onClick={() => setFiltersOpen((o) => !o)}
          className="mt-3 flex w-full items-center justify-between rounded-lg border border-zinc-200 bg-zinc-100 px-3 py-2 text-xs font-medium text-zinc-600 dark:border-white/[0.08] dark:bg-white/[0.04] dark:text-zinc-400 sm:hidden"
        >
          <span className="flex items-center gap-2">
            <SlidersHorizontal className="h-3.5 w-3.5" />
            Filters & Sort
          </span>
          <ChevronDown className={`h-4 w-4 transition-transform ${filtersOpen ? "rotate-180" : ""}`} />
        </button>

        {/* Filter content — always visible on sm+, toggled on mobile */}
        <div className={`mt-3 space-y-3 ${filtersOpen ? "block" : "hidden"} sm:block`}>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-zinc-500">Price</span>
              <PriceFilter selected={priceRange} onSelect={handlePriceChange} />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-zinc-500">Added</span>
              <TimeFilter selected={maxAge} onSelect={handleTimeChange} />
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-zinc-500">Sort</span>
              <SortFilter selected={sort} onSelect={handleSortChange} />
            </div>
            <button
              onClick={handleNearMeToggle}
              className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold transition-colors ${
                nearMe
                  ? "border-sky-500/30 bg-sky-500/10 text-sky-600 dark:text-sky-400"
                  : "border-zinc-200 bg-zinc-100 text-zinc-600 hover:text-zinc-800 dark:border-white/[0.08] dark:bg-white/[0.04] dark:text-zinc-400 dark:hover:text-zinc-200"
              }`}
            >
              {geo.loading ? <Loader2 className="h-3 w-3 animate-spin" /> : <LocateFixed className="h-3 w-3" />}
              Near Me
            </button>
            <button
              onClick={() => { setHideSoldOut((v) => !v); setVisibleCount(PAGE_SIZE); }}
              className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold transition-colors ${
                hideSoldOut
                  ? "border-red-500/30 bg-red-500/10 text-red-500 dark:text-red-400"
                  : "border-zinc-200 bg-zinc-100 text-zinc-600 hover:text-zinc-800 dark:border-white/[0.08] dark:bg-white/[0.04] dark:text-zinc-400 dark:hover:text-zinc-200"
              }`}
            >
              <EyeOff className="h-3 w-3" />
              Hide Sold Out
            </button>
            <button
              onClick={() => { setNoFeeOnly((v) => !v); setVisibleCount(PAGE_SIZE); }}
              className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold transition-colors ${
                noFeeOnly
                  ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                  : "border-zinc-200 bg-zinc-100 text-zinc-600 hover:text-zinc-800 dark:border-white/[0.08] dark:bg-white/[0.04] dark:text-zinc-400 dark:hover:text-zinc-200"
              }`}
            >
              <BadgeCheck className="h-3 w-3" />
              No Fee
            </button>
          </div>
        </div>
      </div>

      {/* Deals */}
      {isLoading ? (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <DealSkeleton key={i} />
          ))}
        </div>
      ) : isError ? (
        <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-8 text-center backdrop-blur-md">
          <p className="text-sm text-red-600 dark:text-red-400">
            Failed to load deals. Try refreshing.
          </p>
        </div>
      ) : deals.length === 0 ? (
        <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-12 text-center backdrop-blur-md dark:border-white/[0.06] dark:bg-white/[0.03]">
          <p className="text-zinc-500">No deals found. Try different filters.</p>
        </div>
      ) : (
        <>
          <div className="mb-3 flex items-center justify-between">
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              {totalDeals} deal{totalDeals !== 1 ? "s" : ""}
              {hasMore && (
                <span className="text-zinc-600"> · showing {visibleCount}</span>
              )}
            </p>
            <div className="flex items-center gap-1 rounded-lg border border-zinc-200 bg-zinc-100 p-1 dark:border-white/[0.08] dark:bg-white/[0.04]">
              <button
                onClick={() => setViewMode("grid")}
                className={`hidden rounded-md p-1.5 transition-colors sm:block ${viewMode === "grid" ? "bg-zinc-200 text-zinc-800 dark:bg-white/[0.1] dark:text-zinc-200" : "text-zinc-400 hover:text-zinc-700 dark:text-zinc-500 dark:hover:text-zinc-300"}`}
                title="Grid view"
              >
                <LayoutGrid className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`rounded-md p-1.5 transition-colors ${viewMode === "map" ? "" : "hidden sm:block"} ${viewMode === "list" ? "bg-zinc-200 text-zinc-800 dark:bg-white/[0.1] dark:text-zinc-200" : "text-zinc-400 hover:text-zinc-700 dark:text-zinc-500 dark:hover:text-zinc-300"}`}
                title="List view"
              >
                <List className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode("map")}
                className={`rounded-md p-1.5 transition-colors ${viewMode === "map" ? "bg-zinc-200 text-zinc-800 dark:bg-white/[0.1] dark:text-zinc-200" : "text-zinc-400 hover:text-zinc-700 dark:text-zinc-500 dark:hover:text-zinc-300"}`}
                title="Map view"
              >
                <MapIcon className="h-4 w-4" />
              </button>
            </div>
          </div>
          {effectiveView === "map" ? (
            <DealMapWrapper deals={deals} />
          ) : effectiveView === "grid" ? (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {visibleDeals.map((deal) => (
                <DealCard key={deal.deal_id} deal={deal} distanceKm={nearMe ? getDealDistance(deal) : undefined} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {visibleDeals.map((deal) => (
                <DealRow key={deal.deal_id} deal={deal} distanceKm={nearMe ? getDealDistance(deal) : undefined} />
              ))}
            </div>
          )}

          {/* Show more — hidden in map view */}
          {effectiveView !== "map" && hasMore && (
            <div className="mt-6 flex justify-center" style={{ overflowAnchor: "none" }}>
              <button
                onClick={() => setVisibleCount((c) => c + PAGE_SIZE)}
                className="flex items-center gap-2 rounded-full border border-zinc-200 bg-zinc-100 px-6 py-2.5 text-sm font-medium text-zinc-600 backdrop-blur-md transition-all hover:bg-zinc-200 hover:text-zinc-800 dark:border-white/[0.08] dark:bg-white/[0.04] dark:text-zinc-400 dark:hover:bg-white/[0.1] dark:hover:text-zinc-200"
              >
                Show more
                <ChevronDown className="h-4 w-4" />
                <span className="text-xs text-zinc-600">
                  ({totalDeals - visibleCount} remaining)
                </span>
              </button>
            </div>
          )}
        </>
      )}


      {/* Footer */}
      <footer className="mt-12 border-t border-zinc-200 py-6 dark:border-zinc-800">
        <div className="flex items-center justify-between text-xs text-zinc-400 dark:text-zinc-600">
          <span>Dealround &mdash; Project by Auri</span>
          <a
            href="https://www.linkedin.com/in/auribaci/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 rounded-md px-2 py-1 text-emerald-500 transition-colors hover:bg-emerald-500 hover:text-white"
          >
            <svg className="h-4 w-4" viewBox="0 0 504.4 504.4" fill="currentColor"><path d="M377.6,0.2H126.4C56.8,0.2,0,57,0,126.6v251.6c0,69.2,56.8,126,126.4,126H378c69.6,0,126.4-56.8,126.4-126.4V126.6C504,57,447.2,0.2,377.6,0.2z M168,408.2H96v-208h72V408.2z M131.6,168.2c-20.4,0-36.8-16.4-36.8-36.8c0-20.4,16.4-36.8,36.8-36.8c20.4,0,36.8,16.4,36.8,36.8C168,151.8,151.6,168.2,131.6,168.2z M408.4,408.2H408h-60V307.4c0-24.4-3.2-55.6-36.4-55.6c-34,0-39.6,26.4-39.6,54v102.4h-60v-208h56v28h1.6c8.8-16,29.2-28.4,61.2-28.4c66,0,77.6,38,77.6,94.4V408.2z"/></svg>
            LinkedIn
          </a>
        </div>
      </footer>

      {/* Back to top */}
      <BackToTop />
    </main>
    </PullToRefresh>
  );
}
