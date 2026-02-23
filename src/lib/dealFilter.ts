import type { Deal } from "./types";

// Providers that sell random products or non-Copenhagen travel packages
const BLOCKED_PROVIDERS = new Set([
  "just-half-price",
  "odendo",
  "take offer",
  "risskov bilferie",
  "traveldeal",
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
  if (!deal.location) return false;
  const loc = deal.location.toLowerCase();
  return NON_CPH_SUBSTRINGS.some((sub) => loc.includes(sub));
}

export function filterJunkDeals(deals: Deal[]): Deal[] {
  return deals.filter((d) => {
    const provider = (d.provider ?? "").toLowerCase();

    // Block known junk providers
    if (BLOCKED_PROVIDERS.has(provider)) return false;

    // Block Bownty deals with no provider and no location (products / random inn stays)
    if (d.source === "Bownty" && !d.provider && !d.location) return false;

    // Block deals that match product keywords in title/description
    if (isProductDeal(d)) return false;

    // Block deals outside Copenhagen area
    if (isOutsideCopenhagen(d)) return false;

    return true;
  });
}
