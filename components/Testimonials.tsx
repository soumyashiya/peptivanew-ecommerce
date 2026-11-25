"use client";

import { useMemo, useState } from "react";
import Rating from "./Rating";
import Rail from "./Rail";
import { useReveal } from "./useReveal";
import { REVIEWS, type Review } from "@/lib/reviews";

/**
 * Customer reviews.
 *
 * Reference archetype: a rounded lavender panel carrying a large sentence-case
 * heading, an italic "Verified Customer Reviews" byline and a tab/sort row;
 * the review cards then break out of the panel's bottom edge as a snap
 * carousel of white cards — stars, product name, quote, then reviewer and
 * "Verified Buyer" on one baseline.
 */

const TABS: { label: string; kind: Review["kind"] | "all" }[] = [
  { label: "Product reviews", kind: "product" },
  { label: "Company reviews", kind: "company" },
];

export default function Testimonials() {
  const scope = useReveal<HTMLDivElement>();
  const [tab, setTab] = useState(0);
  const [query, setQuery] = useState("");

  const items = useMemo(() => {
    const kind = TABS[tab].kind;
    const q = query.trim().toLowerCase();
    return REVIEWS.filter(
      (r) =>
        (kind === "all" || r.kind === kind) &&
        (!q ||
          r.quote.toLowerCase().includes(q) ||
          r.product.toLowerCase().includes(q) ||
          r.name.toLowerCase().includes(q))
    );
  }, [tab, query]);

  return (
    <section id="testimonial" className="section bg-white">
      <div ref={scope} className="shell">
        <div data-reveal className="rounded-[30px] bg-grad-routine pb-10 pt-12 sm:pb-14 sm:pt-[55px] lg:rounded-[40px]">
          <div className="px-6 text-center sm:px-10">
            <h2 className="text-[clamp(28px,3.4vw,50px)] font-bold leading-[1.3] text-black">
              Join the labs who verify with Peptiva Labs
            </h2>
            <p className="mt-8 text-base italic text-black sm:text-[20px]">
              Verified customer reviews
            </p>
          </div>

          <div className="mt-8 flex flex-col items-center gap-5 px-6 sm:flex-row sm:justify-center sm:gap-8">
            <div className="flex gap-6 sm:gap-8" role="tablist" aria-label="Review type">
              {TABS.map((t, i) => (
                <button
                  key={t.label}
                  type="button"
                  role="tab"
                  aria-selected={i === tab}
                  data-active={i === tab}
                  onClick={() => setTab(i)}
                  className="tab"
                >
                  {t.label}
                </button>
              ))}
            </div>

            <label className="flex items-center gap-2 border-b-2 border-grey-200 pb-2">
              <span className="sr-only">Search reviews</span>
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search reviews"
                className="w-44 bg-transparent text-base text-black outline-none placeholder:text-grey-600"
              />
            </label>
          </div>

        <div className="mt-10 px-3 sm:px-6 lg:mt-12 lg:px-[55px]">
          {items.length === 0 ? (
            <div className="rounded-lg bg-white p-10 text-center text-base text-grey-600 shadow-soft">
              No reviews match “{query}”.
            </div>
          ) : (
            <Rail
              ariaLabel="Customer reviews"
              gap="gap-4 lg:gap-6"
              arrowOffset="-left-[30px] -right-[30px]"
              arrowClassName="btn-round h-[50px] w-[50px] bg-[rgba(27,27,27,0.55)] disabled:opacity-40"
              itemClassName="-mx-4 -my-10 scroll-px-4 px-4 py-10"
              showProgress={false}
            >
              {items.map((r) => (
                <figure
                  key={r.name + r.product}
                  className="flex min-h-[324px] w-[80vw] flex-col rounded-[20px] bg-white p-6 shadow-soft sm:w-[46vw] lg:w-[calc((100%-72px)/4)]"
                >
                  <Rating value={r.stars} size={18} />
                  <figcaption className="mt-5 text-[18px] font-medium text-black">
                    {r.product}
                  </figcaption>
                  <blockquote className="mt-2 flex-1 text-[17px] leading-[29px] text-black">
                    “{r.quote}”
                  </blockquote>
                  <div className="mt-6 flex items-center justify-between gap-3 text-small font-medium text-grey-700">
                    <span>{r.name}</span>
                    <span>Verified buyer</span>
                  </div>
                </figure>
              ))}
            </Rail>
          )}
        </div>
        </div>
      </div>
    </section>
  );
}
