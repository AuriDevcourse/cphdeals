import type { Deal } from "./types";

// Providers that sell random products or non-Copenhagen travel packages
const BLOCKED_PROVIDERS = new Set([
  "just-half-price",
  "odendo",
  "take offer",
  "risskov bilferie",
  "traveldeal",
  "my price", // Bownty reseller with vague titles and no location
]);

// Physical product keywords — specific Danish compound words that are clearly
// products, not experiences. Matched as substrings against title + description.
const PRODUCT_KEYWORDS = [
  "gasblus",
  "gasflask",
  "badevægt",
  "krøllejern",
  "glattejern",
  "massageapparat",
  "fitnessarmbånd",
  "tærteform",
  "kagerulle",
  "pastamaskine",
  "cbd-olie",
  "cbd olie",
  "hårtørrer",
  "støvsuger",
  "kropsanalyse",
  "kropsholdning",
  "prepping-udstyr",
  "prepping udstyr",
];

// Non-Copenhagen locations to block. Uses ASCII-safe substrings because the API
// has double-encoded UTF-8 (ø → Ã¸) so exact Unicode matching breaks.
// Checked against location AND description fields.
const NON_CPH_SUBSTRINGS = [
  "nordsj",    // Nordsjælland
  "roskilde",
  "helsing",   // Helsingør
  "odense",
  "aalborg",
  "aarhus",
];

function isProductDeal(deal: Deal): boolean {
  const text = `${deal.title} ${deal.description ?? ""}`.toLowerCase();
  return PRODUCT_KEYWORDS.some((kw) => text.includes(kw));
}

function isOutsideCopenhagen(deal: Deal): boolean {
  // Check both location and description for non-CPH substrings
  const loc = (deal.location ?? "").toLowerCase();
  const desc = (deal.description ?? "").toLowerCase();
  return NON_CPH_SUBSTRINGS.some(
    (sub) => loc.includes(sub) || desc.includes(sub)
  );
}

function isFakeDiscount(deal: Deal): boolean {
  // Deals where deal_price equals original_price (no actual discount)
  if (
    deal.deal_price != null &&
    deal.original_price != null &&
    deal.original_price > 0 &&
    deal.deal_price >= deal.original_price
  ) {
    return true;
  }
  return false;
}

function isExpiredDeal(deal: Deal): boolean {
  if (!deal.expiry) return false;
  return new Date(deal.expiry).getTime() < Date.now();
}

function isFullPriceEvent(deal: Deal): boolean {
  // Madbillet events with no original_price are just ticket sales, not deals
  if (deal.source === "Madbillet" && deal.original_price == null) return true;
  return false;
}

/** Clean up provider names that are actually discount labels (e.g. "Spar 79 %") */
function cleanProvider(deal: Deal): Deal {
  if (!deal.provider) return deal;
  if (/^spar\s+\d+\s*%$/i.test(deal.provider)) {
    return { ...deal, provider: null };
  }
  return deal;
}

// Keywords that indicate a deal is about drinks (bars, pubs, cocktails, wine, beer)
const DRINKS_KEYWORDS = [
  "cocktail",
  "cocktails",
  "øl",
  "beer",
  "beers",
  "draft beer",
  "fadøl",
  "vin ",       // "vin " with trailing space to avoid matching "vindue" etc.
  "vine ",
  "wine",
  "vinbar",
  "wine bar",
  "bar ",        // trailing space to avoid matching "barbecue" etc.
  "barer",
  "pub",
  "happy hour",
  "drinks",
  "drink",
  "cocktailbar",
  "gin ",
  "gin&tonic",
  "g&t",
  "spritz",
  "aperol",
  "mojito",
  "tasting board",
  "fadbamser",
  "glas vin",
  "naturvin",
];

/** Reclassify food deals as "drinks" when they match drink-related keywords */
function reclassifyDrinks(deal: Deal): Deal {
  // Only reclassify food deals (don't touch activity/entertainment)
  if (deal.category !== "food") return deal;

  const text = `${deal.title} ${deal.description ?? ""} ${deal.provider ?? ""}`.toLowerCase();
  const isDrink = DRINKS_KEYWORDS.some((kw) => text.includes(kw));

  if (isDrink) {
    return { ...deal, category: "drinks" };
  }
  return deal;
}

/**
 * Deduplicate deals that appear on multiple sources for the same venue.
 * Keeps the version with the lowest price (best deal). Matches on
 * normalized title similarity.
 */
function deduplicateDeals(deals: Deal[]): Deal[] {
  const seen = new Map<string, Deal>();

  for (const deal of deals) {
    // Normalize title: lowercase, strip common suffixes, collapse whitespace
    const normTitle = deal.title
      .toLowerCase()
      .replace(/[^\w\sæøå]/g, "")
      .replace(/\s+/g, " ")
      .trim();

    // Build a key from normalized title (ignoring source)
    const key = normTitle;

    const existing = seen.get(key);
    if (!existing) {
      seen.set(key, deal);
    } else {
      // Keep the one with the better price (lower deal_price), or the one
      // that is not sold out
      const existingSoldOut = !!existing.sold_out;
      const newSoldOut = !!deal.sold_out;

      if (existingSoldOut && !newSoldOut) {
        seen.set(key, deal);
      } else if (!existingSoldOut && newSoldOut) {
        // keep existing
      } else {
        const existingPrice = existing.deal_price ?? Infinity;
        const newPrice = deal.deal_price ?? Infinity;
        if (newPrice < existingPrice) {
          seen.set(key, deal);
        }
      }
    }
  }

  return Array.from(seen.values());
}

export function filterJunkDeals(deals: Deal[]): Deal[] {
  const filtered = deals
    .map(cleanProvider)
    .map(reclassifyDrinks)
    .filter((d) => {
      const provider = (d.provider ?? "").toLowerCase();

      // Block known junk providers
      if (BLOCKED_PROVIDERS.has(provider)) return false;

      // Block Bownty deals with no provider and no location (products / random inn stays)
      if (d.source === "Bownty" && !d.provider && !d.location) return false;

      // Block deals that match product keywords in title/description
      if (isProductDeal(d)) return false;

      // Block deals outside Copenhagen area (checks location + description)
      if (isOutsideCopenhagen(d)) return false;

      // Block fake discounts (deal_price == original_price)
      if (isFakeDiscount(d)) return false;

      // Block expired deals
      if (isExpiredDeal(d)) return false;

      // Block full-price events masquerading as deals (Madbillet tickets)
      if (isFullPriceEvent(d)) return false;

      return true;
    });

  return deduplicateDeals(filtered);
}
