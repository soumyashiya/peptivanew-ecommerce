"use client";

import { useMemo, useState } from "react";
import { PRODUCTS } from "@/lib/products";
import ProductCard from "./ProductCard";
import Rail from "./Rail";
import { useReveal } from "./useReveal";

/**
 * Best sellers.
 *
 * Reference archetype: a centred all-caps heading, a row of underlined filter
 * tabs beneath it, then a snap carousel of product cards with a progress rail.
 * Tabs filter the same rail in place rather than navigating.
 */

const TABS = [
  { label: "Best sellers", match: () => true },
  { label: "Metabolic", match: (t?: string[]) => !!t?.includes("Metabolic") },
  { label: "Recovery", match: (t?: string[]) => !!t?.includes("Recovery") },
  { label: "Skin", match: (t?: string[]) => !!t?.includes("Skin") },
  { label: "Cellular", match: (t?: string[]) => !!t?.includes("Cellular") },
];

/** Products kept off the home-page rail (still in the shop and on their pages). */
const HIDDEN = ["retatrutide"];

/** Home-page best-seller order (catalogue order elsewhere is unchanged). */
const RAIL_ORDER = [
  "glow",
  "bpc-157-tb-500",
  "tirzepatide",
  "retatrutide",
  "retatrutide-40mg",
  "nad-plus-1000mg",
  "cjc-1295",
  "mots-c",
  "tesamorelin",
];

/** Corner labels on the home-page rail. New arrivals keep their own "New". */
const BADGES: Record<string, string> = {
  glow: "Best seller",
  "bpc-157-tb-500": "Best seller",
  tirzepatide: "Best seller",
  "retatrutide-40mg": "Limited",
  "nad-plus-1000mg": "Limited",
};

export default function BestSellers() {
  const scope = useReveal<HTMLDivElement>();
  const [tab] = useState(0);

  const items = useMemo(
    () => {
      const list = PRODUCTS.filter(
        (p) => !HIDDEN.includes(p.slug) && TABS[tab].match(p.tags)
      );
      // Rail order for the home page; anything not listed keeps catalogue order after these.
      const rank = (slug: string) => {
        const i = RAIL_ORDER.indexOf(slug);
        return i === -1 ? RAIL_ORDER.length : i;
      };
      list.sort((x, y) => rank(x.slug) - rank(y.slug));
      return list;
    },
    [tab]
  );

  return (
    <section id="products" className="section bg-white">
      <div ref={scope}>
        <h2 data-reveal className="heading-caps px-4">
          Peptiva Labs best sellers
        </h2>

        {/* ---- rail ----------------------------------------------------- */}
        {/* The rail runs to the right edge of the window; its left inset and
            the progress line match the hero/header (12px mobile, 52px desktop). */}
        <div data-reveal className="mt-10 sm:mt-14">
          {items.length === 0 ? (
            <p className="py-16 text-center text-base text-grey-600">
              Nothing in this category yet.
            </p>
          ) : (
            <Rail
              ariaLabel="Best selling products"
              key={tab}
              autoplay
              gap="gap-4 lg:gap-8"
              itemClassName="px-3 scroll-px-3 lg:px-[52px] lg:scroll-px-[52px]"
              arrowOffset="left-[26px] right-[26px]"
              arrowInset="top-0 bottom-[128px]"
              arrowClassName="btn-round h-[50px] w-[50px] bg-black/15 backdrop-blur-sm disabled:opacity-60"
              progressClassName="mx-3 mt-10 w-auto lg:mx-[45px]"
            >
              {items.map((p, i) => (
                <div
                  key={p.slug}
                  className="w-[72vw] sm:w-[42vw] lg:w-[23vw] xl:w-[300px]"
                >
                  <ProductCard product={p} priority={i < 2} badge={BADGES[p.slug]} />
                </div>
              ))}
            </Rail>
          )}
        </div>
      </div>
    </section>
  );
}
