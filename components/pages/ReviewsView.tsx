"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { REVIEWS, averageRating, starBreakdown, type Review } from "@/lib/reviews";
import { PRODUCTS } from "@/lib/products";
import Rating from "../Rating";
import { CheckCircleIcon, CheckIcon, ChevronDownIcon, ChevronLeftIcon, ChevronRightIcon, StarIcon } from "../icons";

/**
 * /reviews — modelled on the reference's "Tried, tested and loved by …"
 * page:
 *   1. a single headline and a row of product filter pills,
 *   2. full-width bordered cards with a hard offset shadow and a soft
 *      tinted wash: reviewer on the left, quote with "read more" on the right,
 *   3. small square pagination with chevrons,
 *   4. a promise carousel with dash pagination and a "View products" button,
 *   5. a bordered rating-summary card with Service / Product tabs.
 * Every number is computed from the published reviews.
 */

const PAGE_SIZE = 5;
const PILLS_SHOWN = 5;
const COMPANY = "Peptiva Labs";

/** Soft washes rotated across the cards, as on the reference. */
const WASHES = [
  "linear-gradient(180deg, #FDE9EF 0%, #FFFFFF 100%)",
  "linear-gradient(180deg, #F8E8FB 0%, #FFFFFF 100%)",
  "linear-gradient(180deg, #FFF1E2 0%, #FFFFFF 100%)",
  "linear-gradient(180deg, #E9F1FD 0%, #FFFFFF 100%)",
];

const HARD = "rounded-[14px] border-[1.5px] border-black shadow-[3px_3px_0_#000]";

const slugFor = (name: string) => PRODUCTS.find((p) => p.name === name)?.slug;

const initials = (name: string) =>
  name
    .replace(/^Dr\.?\s+/i, "")
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

/* ---- review card -------------------------------------------------------- */
function ReviewCard({ r, wash }: { r: Review; wash: string }) {
  const [open, setOpen] = useState(false);
  const long = r.quote.length > 220;
  const slug = slugFor(r.product);
  return (
    <article className={`${HARD} grid gap-6 px-6 py-7 sm:px-8 md:grid-cols-[minmax(0,300px)_1fr] md:gap-10`} style={{ background: wash }}>
      <div className="flex items-start gap-5">
        <span className="inline-flex h-[70px] w-[70px] flex-none items-center justify-center rounded-full bg-black text-[20px] font-medium text-white">
          {initials(r.name)}
        </span>
        <div>
          <p className="text-[16px] font-medium text-black">{r.name}</p>
          <p className="mt-1 flex items-center gap-1.5 text-[12px] text-black">
            <CheckCircleIcon width={13} height={13} />
            {r.kind === "company" ? "Verified customer" : "Verified buyer"}
          </p>
          <div className="mt-3">
            <Rating value={r.stars} size={15} />
          </div>
        </div>
      </div>

      <div className="flex gap-3">
        <span aria-hidden className="mt-[-2px] font-serif text-[30px] leading-none text-grey-500">
          &ldquo;
        </span>
        <div className="min-w-0">
          <p className={`text-[17px] leading-[1.75] text-black ${!open && long ? "line-clamp-4" : ""}`}>{r.quote}</p>
          <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2">
            {long && (
              <button
                type="button"
                onClick={() => setOpen((v) => !v)}
                aria-expanded={open}
                className="inline-flex items-center gap-1 text-[15px] text-black underline underline-offset-4"
              >
                {open ? "read less" : "read more"}
                <ChevronDownIcon width={14} height={14} className={open ? "rotate-180" : ""} />
              </button>
            )}
            {slug ? (
              <Link href={`/products/${slug}`} className="text-[13px] text-grey-700 underline underline-offset-4 hover:text-black">
                {r.product}
              </Link>
            ) : (
              <span className="text-[13px] text-grey-700">{r.product}</span>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}

/* ---- promise carousel -------------------------------------------------- */
const PROMISES: { title: string; points: string[]; img: string }[] = [
  {
    title: "Tested quality",
    points: ["Every batch assayed by Janoshik", "Public verification links", "Batch code on every pen"],
    img: "/new-images/hover/Pastel ranunculus and tirzepatide carton.png",
  },
  {
    title: "Handled cold",
    points: ["Stored at 2–8°C", "Insulated, tracked shipping", "Dispatched in 1 business day"],
    img: "/new-images/hover/nad.png",
  },
  {
    title: "Sealed & traceable",
    points: ["Pre-filled, sealed pens", "Tamper-evident packaging", "Paperwork in every box"],
    img: "/new-images/hover/ALLUVI carton on pastel marble.png",
  },
  {
    title: "Research grade",
    points: ["For laboratory research only", "Clear batch documentation", "Real support from real people"],
    img: "/new-images/hover/Three Pens on a Warm Gradient.png",
  },
];

function Promises() {
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  useEffect(() => {
    if (paused) return;
    const id = window.setInterval(() => setI((n) => (n + 1) % PROMISES.length), 5000);
    return () => window.clearInterval(id);
  }, [paused]);

  return (
    <section className="mt-24" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
      <div className="mx-auto w-full max-w-[1170px] px-4"><div className="overflow-hidden pb-1 pr-1">
        <div
          className="flex gap-6 transition-transform duration-base ease-standard"
          style={{ transform: `translateX(calc(${-i} * (100% + 24px)))` }}
        >
          {PROMISES.map((p, n) => (
            <div
              key={p.title}
              aria-hidden={n !== i}
              className={`${HARD} grid w-full flex-none overflow-hidden sm:grid-cols-[1.1fr_1fr]`}
              style={{ background: "linear-gradient(110deg, #FFF6EC 0%, #FCE9F3 55%, #F1E6FD 100%)" }}
            >
              <div className="flex flex-col justify-center p-8 sm:p-10">
                <h3 className="text-[clamp(30px,3.6vw,48px)] font-bold uppercase leading-[1.05] text-black">{p.title}</h3>
                <ul className="mt-6 space-y-2.5">
                  {p.points.map((t) => (
                    <li key={t} className="flex items-center gap-3 text-[18px] text-black">
                      <CheckIcon width={18} height={18} className="flex-none" />
                      {t}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="relative min-h-[260px] sm:min-h-[340px]">
                <Image src={p.img} alt="" fill sizes="(min-width: 640px) 560px, 100vw" className="object-cover" />
              </div>
            </div>
          ))}
        </div>
      </div>
      </div>

      <div className="mt-6 flex justify-center gap-2">
        {PROMISES.map((p, n) => (
          <button key={p.title} type="button" aria-label={`Show ${p.title}`} aria-current={n === i ? "true" : undefined} onClick={() => setI(n)} className="py-2">
            <span className="dash block" data-active={n === i} />
          </button>
        ))}
      </div>
      <div className="mt-6 flex justify-center">
        <Link
          href="/products"
          className="inline-flex h-[48px] w-[230px] items-center justify-center bg-black text-[17px] text-white transition-opacity hover:opacity-85"
        >
          View products
        </Link>
      </div>
    </section>
  );
}

/* ---- rating summary card ----------------------------------------------- */
const SUMMARY_TABS: { label: string; kind: Review["kind"] }[] = [
  { label: "Service rating", kind: "company" },
  { label: "Product rating", kind: "product" },
];

function Summary() {
  const [tab, setTab] = useState(0);
  const list = REVIEWS.filter((r) => r.kind === SUMMARY_TABS[tab].kind);
  const avg = averageRating(list);
  const bars = starBreakdown(list);
  const max = Math.max(1, ...bars.map((b) => b.count));

  return (
    <section className={`mx-auto mt-24 w-[calc(100%-32px)] max-w-[1138px] ${HARD} bg-white px-6 pb-8 pt-6 sm:px-10`}>
      <div className="flex justify-center gap-4 sm:justify-start sm:pl-[112px]" role="tablist" aria-label="Rating type">
        {SUMMARY_TABS.map((t, i) => {
          const a = averageRating(REVIEWS.filter((r) => r.kind === t.kind));
          return (
            <button
              key={t.label}
              type="button"
              role="tab"
              aria-selected={i === tab}
              onClick={() => setTab(i)}
              className={`border-b-2 pb-1 text-[14px] sm:min-w-[130px] ${i === tab ? "border-black text-black" : "border-grey-300 text-grey-600 hover:text-black"}`}
            >
              {t.label} ({a.toFixed(1)})
            </button>
          );
        })}
      </div>

      <div className="mt-5 grid items-center gap-8 sm:grid-cols-[auto_1fr_auto]">
        <div className="text-center sm:text-left">
          <p className="inline-flex items-start text-[68px] font-normal leading-none text-black">
            {avg.toFixed(1)}
            <span className="ml-1 text-[22px] text-grey-500">/5</span>
          </p>
          <div className="mt-3 flex justify-center sm:justify-start">
            <Rating value={avg} size={20} />
          </div>
        </div>
        <div>
          <ul className="space-y-1">
            {bars.map((b) => (
              <li key={b.stars} className="flex items-center gap-2 text-[12px] font-medium text-black">
                <span className="flex w-7 items-center gap-0.5">
                  {b.stars}
                  <StarIcon size={11} />
                </span>
                <span className="h-[9px] flex-1 bg-grey-200">
                  <span className="block h-full bg-black" style={{ width: `${(b.count / max) * 100}%` }} />
                </span>
                <span className="w-6 text-right text-grey-600">{b.count}</span>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-[12px] text-grey-600">
            Based on <strong className="font-semibold text-black">{list.length}</strong> published{" "}
            {list.length === 1 ? "review" : "reviews"}.
          </p>
        </div>
        <Link
          href="/products"
          className="inline-flex h-[42px] items-center justify-center border border-black px-8 text-[14px] text-black transition-colors hover:bg-black hover:text-white"
        >
          Shop the range
        </Link>
      </div>
    </section>
  );
}

/* ---- page ---------------------------------------------------------------- */
export default function ReviewsView() {
  const [filter, setFilter] = useState<string>("");
  const [showAll, setShowAll] = useState(false);
  const [page, setPage] = useState(0);

  const pills = useMemo(() => {
    const names = Array.from(new Set(REVIEWS.filter((r) => r.kind === "product").map((r) => r.product)));
    return REVIEWS.some((r) => r.kind === "company") ? [...names, COMPANY] : names;
  }, []);
  const visiblePills = showAll ? pills : pills.slice(0, PILLS_SHOWN);

  const items = useMemo(() => {
    if (!filter) return REVIEWS;
    if (filter === COMPANY) return REVIEWS.filter((r) => r.kind === "company");
    return REVIEWS.filter((r) => r.kind === "product" && r.product === filter);
  }, [filter]);

  const pages = Math.max(1, Math.ceil(items.length / PAGE_SIZE));
  const current = Math.min(page, pages - 1);
  const visible = items.slice(current * PAGE_SIZE, current * PAGE_SIZE + PAGE_SIZE);
  const pick = (v: string) => {
    setFilter(v);
    setPage(0);
  };

  return (
    <div className="bg-white pb-24 pt-32 lg:pt-[150px]">
      <section className="mx-auto w-full max-w-[1170px] px-4">
        <h1 className="text-[clamp(28px,2.6vw,38px)] font-normal leading-tight text-black">
          Peptiva Labs: tried, tested and trusted by {REVIEWS.length} verified researchers
        </h1>

        {/* ---- filter pills ---- */}
        <div className="mt-8 flex flex-wrap items-center gap-3">
          {[{ label: "All products", value: "" }, ...visiblePills.map((p) => ({ label: p, value: p }))].map((p) => (
            <button
              key={p.label}
              type="button"
              aria-pressed={filter === p.value}
              onClick={() => pick(p.value)}
              className={`h-[38px] rounded-pill border px-5 text-[15px] transition-colors ${
                filter === p.value ? "border-black bg-black text-white" : "border-grey-400 bg-white text-black hover:border-black"
              }`}
            >
              {p.label}
            </button>
          ))}
          {pills.length > PILLS_SHOWN && (
            <button type="button" onClick={() => setShowAll((v) => !v)} className="ml-4 text-[15px] text-black underline underline-offset-4">
              {showAll ? "Show less" : "Show more"}
            </button>
          )}
        </div>

        {/* ---- cards ---- */}
        <div className="mt-8 flex flex-col gap-8">
          {visible.length === 0 ? (
            <p className={`${HARD} p-10 text-center text-base text-grey-600`}>No reviews for this product yet.</p>
          ) : (
            visible.map((r, n) => (
              <ReviewCard key={r.name + r.product} r={r} wash={WASHES[(current * PAGE_SIZE + n) % WASHES.length]} />
            ))
          )}
        </div>

        {/* ---- pagination ---- */}
        {pages > 1 && (
          <nav className="mt-12 flex items-center justify-center gap-2" aria-label="Review pages">
            <button
              type="button"
              aria-label="Previous page"
              disabled={current === 0}
              onClick={() => setPage(current - 1)}
              className="px-1 text-grey-600 hover:text-black disabled:opacity-30"
            >
              <ChevronLeftIcon width={14} height={14} />
            </button>
            {Array.from({ length: pages }, (_, n) => (
              <button
                key={n}
                type="button"
                onClick={() => setPage(n)}
                aria-current={n === current ? "page" : undefined}
                className={`h-[24px] min-w-[24px] border px-1 text-[11px] ${
                  n === current ? "border-black text-black" : "border-grey-400 text-grey-600 hover:border-black"
                }`}
              >
                {n + 1}
              </button>
            ))}
            <button
              type="button"
              aria-label="Next page"
              disabled={current === pages - 1}
              onClick={() => setPage(current + 1)}
              className="px-1 text-grey-600 hover:text-black disabled:opacity-30"
            >
              <ChevronRightIcon width={14} height={14} />
            </button>
          </nav>
        )}
      </section>

      <Promises />
      <Summary />
    </div>
  );
}
