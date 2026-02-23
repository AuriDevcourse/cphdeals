"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { LayoutGrid, List, Map as MapIcon, ChevronDown, SlidersHorizontal, EyeOff, LocateFixed, Loader2 } from "lucide-react";
import { DealMapWrapper } from "@/components/map/DealMapWrapper";
import { useDeals, useSearchDeals, useExpiring } from "@/hooks/useDeals";
import { useGeolocation } from "@/hooks/useGeolocation";
import { COPENHAGEN_COORDS, haversineKm } from "@/lib/geocode";
import { DealCard } from "@/components/DealCard";
import { DealRow } from "@/components/DealRow";
import { DealSkeleton } from "@/components/DealSkeleton";
import { CategoryFilter } from "@/components/CategoryFilter";
import { PriceFilter } from "@/components/PriceFilter";
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
  const [category, setCategory] = useState<string | undefined>(undefined);
  const [maxPrice, setMaxPrice] = useState<number | undefined>(undefined);
  const [searchQuery, setSearchQuery] = useState("");
  const [showExpiring, setShowExpiring] = useState(false);
  const [maxAge, setMaxAge] = useState<number | undefined>(undefined);
  const [viewMode, setViewMode] = useState<"grid" | "list" | "map">("grid");
  const [sort, setSort] = useState<SortOption>("newest");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [hideSoldOut, setHideSoldOut] = useState(true);
  const [nearMe, setNearMe] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const isMobile = useIsMobile();
  const geo = useGeolocation();

  const dealsQuery = useDeals(category, maxPrice);
  const searchResults = useSearchDeals(searchQuery, maxPrice);
  const expiringQuery = useExpiring();

  const handleSearch = useCallback((q: string) => {
    setSearchQuery(q);
    setVisibleCount(PAGE_SIZE);
  }, []);

  const handleCategorySelect = (cat: string | undefined) => {
    setShowExpiring(false);
    setCategory(cat);
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

  const handlePriceChange = (price: number | undefined) => {
    setMaxPrice(price);
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
  } else if (showExpiring) {
    deals = expiringQuery.data?.deals ?? [];
    isLoading = expiringQuery.isLoading;
    isError = expiringQuery.isError;
  } else {
    deals = dealsQuery.data?.deals ?? [];
    isLoading = dealsQuery.isLoading;
    isError = dealsQuery.isError;
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

  // Apply sorting — expiring view always sorts soonest-first
  if (showExpiring) {
    deals = [...deals].sort((a, b) => {
      const ea = a.expiry ? new Date(a.expiry).getTime() : Infinity;
      const eb = b.expiry ? new Date(b.expiry).getTime() : Infinity;
      return ea - eb;
    });
  } else {
    deals = sortDeals(deals, sort);
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
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="flex items-center gap-3 text-2xl font-bold text-zinc-900 dark:text-zinc-100">
              <img src="/logo.png" alt="CPH Deal Finder" className="h-10 w-10" />
              CPH Deals
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-full sm:w-64">
              <SearchBar onSearch={handleSearch} />
            </div>
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
          selected={category}
          expiring={showExpiring}
          onSelect={handleCategorySelect}
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
          {!showExpiring && (
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-zinc-500">Price</span>
                <PriceFilter selected={maxPrice} onSelect={handlePriceChange} />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-zinc-500">Added</span>
                <TimeFilter selected={maxAge} onSelect={handleTimeChange} />
              </div>
            </div>
          )}
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

      {/* Telegram Banner — prevent scroll anchoring */}
      <div style={{ overflowAnchor: "none" }}>
        <TelegramBanner />
      </div>

      {/* Back to top */}
      <BackToTop />
    </main>
    </PullToRefresh>
  );
}
