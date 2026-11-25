"use client";

import { Fragment, useMemo, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { PRODUCTS, formatUSD, getProduct, type Product } from "@/lib/products";
import ProductCard from "./ProductCard";
import Rail from "./Rail";
import { useCart } from "./CartContext";
import { useToast } from "./Toast";
import { useReveal } from "./useReveal";
import { ChevronDownIcon } from "./icons";

/**
 * Collection page, modelled on the reference's /products:
 *   1. a warm band with "Shop by research goal" photo tiles (the active one
 *      tinted), a centred "Bundle & save" button and a "Sort by" control,
 *   2. a three-up grid of warm product cards with tall bundle cards slotted
 *      in at fixed positions (only on "All products"),
 *   3. "Bundles built around your research goals" carousel,
 *   4. a bordered "Backed by real analysis" card,
 *   5. "Lab results" — one headline figure per product from its Janoshik
 *      report, each linking to the full certificate,
 *   6. the research-use notice.
 * Category and sort live in the URL (?category=…&sort=…) so the home-page
 * goal tiles open the shop already filtered.
 */

export const CATEGORIES = [
  { label: "View all", slug: "", tag: "", img: "/new-images/hover/reta.png" },
  { label: "Blends", slug: "blends", tag: "Blends", img: "/new-images/hover/ALLUVI carton on pastel marble.png" },
  { label: "Metabolic", slug: "metabolic", tag: "Metabolic", img: "/new-images/hover/Pastel ranunculus and tirzepatide carton.png" },
  { label: "Recovery", slug: "recovery", tag: "Recovery", img: "/new-images/hover/ALLUVI carton on pastel marble.png" },
  { label: "Skin & hair", slug: "skin-hair", tag: "Skin & hair", img: "/new-images/hover/Alluvi Glow pen with chestnut hair sweep.png" },
  { label: "Anti-ageing", slug: "anti-ageing", tag: "Anti-ageing", img: "/new-images/shop/antiage-tile.png" },
  { label: "Energy", slug: "energy", tag: "Energy", img: "/new-images/hover/Three Pens on a Warm Gradient.png" },
];

const SORTS = [
  { value: "featured", label: "Featured" },
  { value: "price-asc", label: "Price: low to high" },
  { value: "price-desc", label: "Price: high to low" },
  { value: "rating", label: "Top rated" },
] as const;
type SortValue = (typeof SORTS)[number]["value"];

type Bundle = {
  key: string;
  title: string;
  blurb: string;
  slugs: string[];
  img: string;
  /** Small square crop for the round avatar in the carousel. */
  thumb: string;
  /** How the cut-out / photo sits in the tall grid card. */
  fit: string;
  bg: string;
  /** Photo covers the whole card (title sits on its plain top area). */
  full?: boolean;
};

const BUNDLES: Bundle[] = [
  {
    key: "metabolic",
    title: "Metabolic Bundle",
    blurb: "Pair a dual and a triple agonist across one metabolic study design.",
    slugs: ["tirzepatide", "retatrutide"],
    img: "/new-images/shop/reta-model.png",
    thumb: "/new-images/shop/thumbs/reta.webp",
    fit: "object-cover object-top",
    bg: "#FBD8F3",
  },
  {
    key: "anti-ageing",
    title: "Anti-ageing Bundle",
    blurb: "GHK-Cu blend alongside NAD+ for cellular-repair and skin research.",
    slugs: ["glow", "nad-plus-1000mg"],
    img: "/new-images/shop/nad-model.png",
    thumb: "/new-images/shop/thumbs/nad.webp",
    fit: "object-cover object-top",
    bg: "#FEF7DE",
  },
  {
    key: "recovery",
    title: "Recovery Bundle",
    blurb: "Two tissue-repair blends for side-by-side recovery protocols.",
    slugs: ["bpc-157-tb-500", "glow"],
    img: "/new-images/shop/glow-model (1).png",
    thumb: "/new-images/shop/thumbs/glow.webp",
    fit: "object-cover object-top",
    bg: "#DCDBFD",
  },
];

/** Grid slots (0-based) where bundle cards are inserted on "View all". */
const BUNDLE_SLOTS = [1, 4, 9];

const productsOf = (b: Bundle) =>
  b.slugs.map((s) => getProduct(s)).filter((p): p is Product => !!p && !p.comingSoon);

function useAddBundle() {
  const { add } = useCart();
  const toast = useToast();
  return (b: Bundle) => {
    const items = productsOf(b);
    items.forEach((p) => add(p.slug, 1));
    toast.success(`${items.map((p) => p.name).join(" + ")} added to your cart.`, `${b.title} added`);
  };
}

/* ---- tall bundle card inside the grid --------------------------------- */
function BundleCard({ bundle }: { bundle: Bundle }) {
  const addBundle = useAddBundle();
  const items = productsOf(bundle);
  return (
    <article
      className="relative flex min-h-[560px] flex-col overflow-hidden rounded-[20px] p-6"
      style={{ background: bundle.bg }}
    >
      <h3 className="relative z-10 text-center text-[clamp(24px,2vw,30px)] font-normal text-black">
        {bundle.title}
      </h3>
      <div className={`absolute inset-x-0 bottom-0 ${bundle.full ? "top-0" : "top-[70px]"}`}>
        <Image src={bundle.img} alt="" fill quality={100} sizes="(min-width: 1024px) 760px, 100vw" className={bundle.fit} />
      </div>
      <ul className="relative z-10 ml-auto mt-5 flex w-[112px] flex-col gap-3 rounded-[12px] bg-white/90 p-3 shadow-tile backdrop-blur-sm">
        {items.map((p) => (
          <li key={p.slug}>
            <Link href={`/products/${p.slug}`} className="flex flex-col items-center text-center">
              <span className="relative h-[54px] w-[76px]">
                <Image src={p.img} alt="" fill sizes="76px" className="object-contain" />
              </span>
              <span className="mt-1 text-[12px] font-semibold leading-tight text-black">{p.name}</span>
            </Link>
          </li>
        ))}
      </ul>
      <button
        type="button"
        onClick={() => addBundle(bundle)}
        className="relative z-10 mt-auto inline-flex h-[42px] w-full items-center justify-center rounded-[10px] border border-black bg-white text-small font-medium text-black transition-colors hover:bg-black hover:text-white"
      >
        Add bundle · {formatUSD(items.reduce((n, p) => n + p.price, 0))}
      </button>
    </article>
  );
}

/* ---- wide bundle card in the carousel --------------------------------- */
function BundleOffer({ bundle }: { bundle: Bundle }) {
  const addBundle = useAddBundle();
  const items = productsOf(bundle);
  const label = bundle.title.replace(" Bundle", "");
  return (
    <article className="flex h-full w-[86vw] flex-col rounded-[14px] bg-[#F7F4F1] p-6 sm:w-[520px] lg:w-[580px]">
      <div className="flex items-start justify-between gap-6">
        <div>
          <h3 className="text-[24px] font-normal text-black">{label}</h3>
          <p className="mt-3 min-h-[52px] max-w-[340px] text-[16px] leading-relaxed text-black">{bundle.blurb}</p>
        </div>
        <span className="relative h-[92px] w-[92px] flex-none overflow-hidden rounded-full" style={{ background: bundle.bg }}>
          <Image src={bundle.thumb} alt="" fill unoptimized className="object-cover" />
        </span>
      </div>
      <ul className="mb-6 mt-6 flex gap-4">
        {items.map((p) => (
          <li key={p.slug} className="w-[120px]">
            <Link href={`/products/${p.slug}`} className="flex flex-col items-center rounded-[10px] bg-white p-2 text-center">
              <span className="relative h-[70px] w-full">
                <Image src={p.img} alt="" fill sizes="120px" className="object-contain" />
              </span>
              <span className="mt-1 flex h-[32px] items-center text-[12px] leading-tight text-black">{p.name}</span>
            </Link>
          </li>
        ))}
      </ul>
      <button
        type="button"
        onClick={() => addBundle(bundle)}
        className="mt-auto inline-flex h-[46px] w-full items-center justify-center rounded-md bg-black text-small font-medium text-white transition-opacity hover:opacity-85"
      >
        Bundle and save · {formatUSD(items.reduce((n, p) => n + p.price, 0))}
      </button>
    </article>
  );
}

/* ---- lab-result figure per product ------------------------------------ */
function labFigure(p: Product): { big: string; small: string } | null {
  const j = p.janoshik;
  if (!j) return null;
  if (j.purity) return { big: j.purity, small: "purity confirmed by Janoshik Analytical" };
  const r = j.rows[0];
  return { big: r.verified, small: `of ${r.compound} measured per device` };
}

/* ---- "Backed by real analysis" slider ---------------------------------
   Slide 1 is the bordered gradient card; slides 2–4 are the framed banners
   in /new-images/shop (each already carries its own border and shadow), with
   the copy laid over the empty side. Dash pagination, 6s autoplay. */
type BackedSlide =
  | { kind: "card" }
  | { kind: "banner"; img: string; ratio: string; side: "left" | "right"; slug: string };

const BACKED: BackedSlide[] = [
  { kind: "card" },
  { kind: "banner", img: "/new-images/shop/Tirzepatide.png", ratio: "1902/827", side: "left", slug: "tirzepatide" },
  { kind: "banner", img: "/new-images/shop/Glow.png", ratio: "2032/774", side: "left", slug: "glow" },
  { kind: "banner", img: "/new-images/shop/MOTS-C.png", ratio: "2009/783", side: "left", slug: "mots-c" },
];

function bannerCopy(slug: string): { title: string; body: string; cta: string; href: string } {
  const p = getProduct(slug);
  if (!p) return { title: "", body: "", cta: "", href: "/products" };
  const j = p.janoshik;
  if (p.comingSoon || !j) {
    return {
      title: `${p.name} — coming soon`,
      body: "Batches are being tested now. The independent report is published the day it is released.",
      cta: "Register interest",
      href: `/products/${p.slug}`,
    };
  }
  const big = j.purity ? `${j.purity} purity` : `${j.rows[0].verified} ${j.rows[0].compound}`;
  return {
    title: `${p.name}: ${big}`,
    body: `Measured by Janoshik Analytical, batch ${j.batch}. The full report and verification link are on the product page.`,
    cta: "View lab report",
    href: `/products/${p.slug}#analysis`,
  };
}

function BackedByAnalysis() {
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  useEffect(() => {
    if (paused) return;
    const id = window.setInterval(() => setI((n) => (n + 1) % BACKED.length), 6000);
    return () => window.clearInterval(id);
  }, [paused]);

  return (
    <section
      className="mx-auto mt-20 w-full max-w-[1200px] px-4"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="grid">
        {BACKED.map((s, n) => {
          const shown = n === i;
          const cls = `[grid-area:1/1] transition-opacity duration-base ease-standard ${
            shown ? "opacity-100" : "pointer-events-none opacity-0"
          }`;
          if (s.kind === "card") {
            return (
              <div
                key="card"
                aria-hidden={!shown}
                className={`${cls} relative grid self-center overflow-hidden rounded-[20px] border-2 border-black shadow-[4px_4px_0_#000] md:grid-cols-[1.1fr_1fr]`}
                style={{ background: "linear-gradient(98deg, #FFF6EC 0%, #FCE9F3 55%, #F1E6FD 100%)" }}
              >
                <div className="p-8 sm:p-12">
                  <h2 className="text-[clamp(28px,3.2vw,48px)] font-bold uppercase leading-[1.15] text-black">
                    Peptiva Labs, backed by real analysis
                  </h2>
                  <p className="mt-5 max-w-[440px] text-[17px] leading-[1.7] text-black">
                    Every batch is assayed by Janoshik Analytical before it is listed. Batch codes,
                    measured content and public verification links — not marketing claims.
                  </p>
                  <Link href="/science" className="mt-6 inline-block text-small underline underline-offset-4">
                    See the lab results
                  </Link>
                </div>
                <div className="relative hidden min-h-[300px] md:block">
                  <Image src="/new-images/review1-cut.webp" alt="" fill sizes="520px" className="object-contain object-bottom mix-blend-multiply" />
                </div>
              </div>
            );
          }
          const c = bannerCopy(s.slug);
          return (
            <div key={s.img} aria-hidden={!shown} className={`${cls} self-center`}>
              <div className="relative w-full" style={{ aspectRatio: s.ratio }}>
                <Image src={s.img} alt="" fill sizes="(min-width: 1200px) 1170px, 100vw" className="object-contain" />
                {/* desktop: copy over the empty side of the banner */}
                <div
                  className={`absolute inset-y-0 hidden w-[44%] flex-col justify-center md:flex ${
                    s.side === "left" ? "left-[6%]" : "right-[5%]"
                  }`}
                >
                  <p className="text-[12px] font-semibold uppercase tracking-label text-black/70">Backed by real analysis</p>
                  <h3 className="mt-3 text-[clamp(24px,2.6vw,38px)] font-bold leading-[1.2] text-black">{c.title}</h3>
                  <p className="mt-4 max-w-[420px] text-[16px] leading-[1.7] text-black">{c.body}</p>
                  <Link href={c.href} tabIndex={shown ? 0 : -1} className="mt-5 inline-block w-fit text-small underline underline-offset-4">
                    {c.cta}
                  </Link>
                </div>
              </div>
              {/* phones: copy below the banner */}
              <div className="px-1 pt-5 md:hidden">
                <h3 className="text-[22px] font-bold leading-[1.25] text-black">{c.title}</h3>
                <p className="mt-2 text-[15px] leading-[1.6] text-black">{c.body}</p>
                <Link href={c.href} tabIndex={shown ? 0 : -1} className="mt-3 inline-block text-small underline underline-offset-4">
                  {c.cta}
                </Link>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-6 flex justify-center gap-2">
        {BACKED.map((_, n) => (
          <button
            key={n}
            type="button"
            aria-label={`Show slide ${n + 1}`}
            aria-current={n === i ? "true" : undefined}
            onClick={() => setI(n)}
            className="py-2"
          >
            <span className="dash block w-[26px]" data-active={n === i} />
          </button>
        ))}
      </div>
    </section>
  );
}

export default function Shop() {
  const scope = useReveal<HTMLDivElement>();
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const filter = Math.max(0, CATEGORIES.findIndex((c) => c.slug === (params.get("category") ?? "")));
  const sort = (SORTS.find((s) => s.value === params.get("sort"))?.value ?? "featured") as SortValue;

  const setQuery = (next: { category?: string; sort?: string }) => {
    const q = new URLSearchParams(params.toString());
    for (const [k, v] of Object.entries(next)) {
      if (v) q.set(k, v);
      else q.delete(k);
    }
    const s = q.toString();
    router.replace(s ? `${pathname}?${s}` : pathname, { scroll: false });
  };

  const items = useMemo(() => {
    const tag = CATEGORIES[filter].tag;
    const list = PRODUCTS.filter((p) => !tag || !!p.tags?.includes(tag));
    const ready = list.filter((p) => !p.comingSoon);
    const soon = list.filter((p) => p.comingSoon);
    if (sort === "price-asc") ready.sort((a, b) => a.price - b.price);
    if (sort === "price-desc") ready.sort((a, b) => b.price - a.price);
    if (sort === "rating") ready.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
    return [...ready, ...soon];
  }, [filter, sort]);

  // Bundle cards only interleave with the unfiltered, featured listing.
  const showBundles = filter === 0 && sort === "featured";
  const cells: ({ kind: "product"; p: Product } | { kind: "bundle"; b: Bundle })[] = [];
  let bi = 0;
  items.forEach((p) => {
    while (showBundles && bi < BUNDLES.length && cells.length === BUNDLE_SLOTS[bi]) {
      cells.push({ kind: "bundle", b: BUNDLES[bi++] });
    }
    cells.push({ kind: "product", p });
  });

  const lab = PRODUCTS.filter((p) => !p.comingSoon && labFigure(p)).slice(0, 4);

  return (
    <div ref={scope} className="bg-white pb-20">
      <h1 className="sr-only">Shop all research products</h1>

      {/* ---- 1. goal band ------------------------------------------- */}
      <section className="bg-[#F6F1EC] pb-6 pt-28 lg:pt-[118px]">
        <div className="mx-auto w-full max-w-[1200px] px-4">
          <p className="text-base font-medium text-black">Shop by research goal</p>
          <div className="no-scrollbar -mx-4 mt-4 flex gap-3 overflow-x-auto px-4 pb-1" role="tablist" aria-label="Filter by research goal">
            {CATEGORIES.map((c, i) => (
              <button
                key={c.label}
                type="button"
                role="tab"
                aria-selected={i === filter}
                onClick={() => setQuery({ category: c.slug })}
                className={`flex w-[132px] flex-none flex-col items-center rounded-b-[10px] px-2.5 pb-3.5 pt-2.5 transition-colors sm:w-[153px] ${
                  i === filter ? "bg-[#DACEC2]" : "bg-white hover:bg-[#EFE7DF]"
                }`}
              >
                <span className="relative block aspect-[133/108] w-full overflow-hidden" style={{ background: (c as { fill?: string }).fill }}>
                  <Image src={c.img} alt="" fill sizes="153px" className={(c as { fit?: string }).fit === "contain" ? "object-contain object-bottom" : "object-cover"} />
                </span>
                <span className="mt-2.5 text-[14px] font-light text-black/80">{c.label}</span>
              </button>
            ))}
          </div>

          <div className="relative mt-6 flex flex-col items-center gap-3">
            {filter === 0 && (
              <a
                href="#bundles"
                className="inline-flex h-[41px] items-center justify-center rounded-[10px] border border-black px-9 text-[15px] text-black transition-colors hover:bg-black hover:text-white"
              >
                Bundle &amp; save up to 15%
              </a>
            )}
            <label className="flex items-center gap-1.5 text-small text-black sm:absolute sm:right-0 sm:top-2">
              <span className="sr-only">Sort products</span>
              <select
                value={sort}
                onChange={(e) => setQuery({ sort: e.target.value === "featured" ? "" : e.target.value })}
                className="appearance-none bg-transparent pr-5 text-small font-medium text-black outline-none"
              >
                {SORTS.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.value === "featured" ? "Sort by" : s.label}
                  </option>
                ))}
              </select>
              <ChevronDownIcon width={14} height={14} className="pointer-events-none -ml-5" />
            </label>
          </div>
        </div>
      </section>

      {/* ---- 2. grid -------------------------------------------------- */}
      <section className="mx-auto mt-8 w-full max-w-[1200px] px-4">
        {cells.length === 0 ? (
          <p className="py-24 text-center text-base text-grey-600">No products in this category yet.</p>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {cells.map((cell, i) =>
              cell.kind === "bundle" ? (
                <BundleCard key={cell.b.key} bundle={cell.b} />
              ) : (
                <Fragment key={cell.p.slug}>
                  <ProductCard product={cell.p} variant="grid" priority={i < 3} />
                </Fragment>
              )
            )}
          </div>
        )}
      </section>

      {/* ---- 3. bundles carousel ------------------------------------- */}
      <section id="bundles" className="mx-auto mt-24 w-full max-w-[1260px] scroll-mt-28 px-4">
        <h2 className="text-center text-[clamp(26px,2.6vw,38px)] font-normal text-black">
          Peptiva Labs bundles built around your research goals
        </h2>
        <div className="mt-10">
          <Rail ariaLabel="Research bundles" gap="gap-4" arrowOffset="-left-6 -right-6" showProgress={false}>
            {BUNDLES.map((b) => (
              <div key={b.key}>
                <BundleOffer bundle={b} />
              </div>
            ))}
          </Rail>
        </div>
      </section>

      {/* ---- 4. backed by analysis (slider) ------------------------- */}
      <BackedByAnalysis />

      {/* ---- 5. lab results ------------------------------------------ */}
      {lab.length > 0 && (
        <section className="mx-auto mt-20 w-full max-w-[1100px] px-4">
          <h2 className="text-[clamp(24px,2.2vw,32px)] font-normal text-black">Peptiva Labs lab results</h2>
          <div className="mt-8 grid grid-cols-2 gap-8 lg:grid-cols-4">
            {lab.map((p) => {
              const f = labFigure(p)!;
              return (
                <div key={p.slug} className="flex flex-col">
                  <span className="relative h-[110px] w-full">
                    <Image src={p.img} alt="" fill sizes="240px" className="object-contain object-left" />
                  </span>
                  <p className="mt-4 text-small text-black">{p.name}</p>
                  <p className="mt-1 text-[32px] font-normal leading-tight text-black">{f.big}</p>
                  <p className="mb-4 mt-1 min-h-[36px] text-[13px] leading-snug text-black">{f.small}</p>
                  <Link
                    href={`/products/${p.slug}#analysis`}
                    className="mt-auto inline-flex h-[34px] items-center justify-center rounded-md border border-black text-[13px] text-black transition-colors hover:bg-black hover:text-white"
                  >
                    Learn more
                  </Link>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* ---- 6. compliance ------------------------------------------- */}
      <aside
        aria-label="Research-use compliance disclaimer"
        className="mx-auto mt-20 w-full max-w-[1200px] px-4"
      >
        <div className="rounded-lg bg-sand-100 p-7 sm:p-10">
          <p className="eyebrow">For research purposes only</p>
          <p className="mt-3 max-w-4xl text-base leading-relaxed text-grey-700">
            Not intended for human or veterinary use. Not intended to diagnose, treat, cure, or
            prevent any disease. Products are supplied strictly for laboratory and analytical
            research conducted by qualified professionals. By purchasing, you confirm you are
            ordering these products for research use only.
          </p>
        </div>
      </aside>
    </div>
  );
}
