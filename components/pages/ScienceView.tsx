"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { PRODUCTS, type Product } from "@/lib/products";
import { REVIEWS } from "@/lib/reviews";
import Rating from "../Rating";
import {
  ArrowUpRight,
  BeakerIcon,
  DocIcon,
  LockIcon,
  ShieldIcon,
  StarIcon,
  TruckIcon,
} from "../icons";

/**
 * /science — modelled on the reference's science page:
 *   1. a left-aligned title + prompt, then one bordered row per product
 *      (render left, name + stars + one headline result, "View product"
 *      top-right, a "Show lab results" tab sitting on the bottom border),
 *   2. a five-up icon strip of standards,
 *   3. "Don't just take our word for it." — a washed quote panel,
 *   4. two bordered stat tiles,
 * every number here comes from the product's own Janoshik report.
 */

/** One soft tile colour per standard, so the strip reads at a glance. */
const STANDARD_TONES = [
  { bg: "#EDE7FF", fg: "#5B4CD6" },
  { bg: "#E3F5E8", fg: "#1E6F3D" },
  { bg: "#DDF2F6", fg: "#1F7C8F" },
  { bg: "#FFEBD9", fg: "#B4561A" },
  { bg: "#FCE4EE", fg: "#AF3460" },
];

const STANDARDS = [
  { Icon: BeakerIcon, strong: "Independently", rest: "assayed batches" },
  { Icon: ShieldIcon, strong: "Sealed,", rest: "tamper-evident fill" },
  { Icon: TruckIcon, strong: "Cold-chain", rest: "2–8°C handling" },
  { Icon: DocIcon, strong: "Batch-coded", rest: "paperwork in every box" },
  { Icon: LockIcon, strong: "Research use", rest: "only — never for humans" },
];

const QUOTE_IMAGE = "/images/take-our-word.webp";

function headline(p: Product): { strong: string; rest: string } {
  const j = p.janoshik;
  if (j?.purity) return { strong: j.purity, rest: "purity confirmed by Janoshik Analytical" };
  const first = j?.rows[0];
  if (first) return { strong: first.verified, rest: `of ${first.compound} verified per device` };
  return { strong: "100%", rest: "of batches third-party tested" };
}

function ProductResult({ product }: { product: Product }) {
  const [open, setOpen] = useState(false);
  const j = product.janoshik;
  const h = headline(product);

  return (
    <article className="relative border border-black bg-white pb-10">
      <div className="grid grid-cols-[96px_1fr] gap-5 p-5 sm:grid-cols-[230px_1fr] sm:gap-0 sm:p-0">
        <div className="relative h-[96px] sm:h-[200px]">
          <Image
            src={product.img}
            alt={product.name}
            fill
            sizes="(min-width: 640px) 230px, 96px"
            className="object-contain sm:p-8"
          />
        </div>

        <div className="min-w-0 sm:py-7 sm:pr-12">
          <div className="flex items-start justify-between gap-4">
            <h2 className="text-[clamp(20px,1.9vw,28px)] font-normal leading-tight text-black">
              {product.name}
            </h2>
            <Link
              href={`/products/${product.slug}`}
              className="mt-1 hidden flex-none text-[12px] font-medium text-black underline underline-offset-2 hover:opacity-60 sm:block"
            >
              View product
            </Link>
          </div>
          {product.rating !== undefined && (
            <Rating
              value={product.rating}
              count={product.reviews?.toLocaleString("en-US")}
              size={20}
              className="mt-2"
              countClassName="text-small text-grey-600"
            />
          )}
          <p className="mt-4 text-[17px] leading-snug text-black sm:text-[20px]">
            <strong className="font-semibold">{h.strong}</strong> {h.rest}
          </p>
          {j && (
            <p className="mt-3 text-small font-medium text-grey-600">
              Batch {j.batch} · {j.rows.length} compound{j.rows.length === 1 ? "" : "s"} measured
            </p>
          )}
        </div>
      </div>

      {open && j && (
        <div className="mx-5 mb-2 border-t border-grey-200 pt-5 sm:ml-[230px] sm:mr-12">
          <table className="w-full text-left text-small">
            <thead className="text-grey-600">
              <tr>
                <th className="pb-2 font-medium">Compound</th>
                <th className="pb-2 font-medium">Concentration</th>
                <th className="pb-2 font-medium">Verified content</th>
              </tr>
            </thead>
            <tbody className="text-black">
              {j.rows.map((r) => (
                <tr key={r.compound} className="border-t border-grey-200">
                  <td className="py-2.5">{r.compound}</td>
                  <td className="py-2.5">{r.concentration}</td>
                  <td className="py-2.5 font-medium">{r.verified}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <a
            href={j.verifyUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex items-center gap-1.5 text-small font-medium text-black underline underline-offset-2 hover:opacity-60"
          >
            Verify this batch on Janoshik
            <ArrowUpRight width={14} height={14} />
          </a>
        </div>
      )}

      {/* The tab straddles the card's bottom border, as in the reference. */}
      {j && (
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          className="absolute bottom-0 left-1/2 h-[33px] w-[194px] -translate-x-1/2 translate-y-px border border-b-0 border-black bg-white text-[12px] text-black transition-colors hover:bg-grey-100"
        >
          {open ? "Hide lab results" : "Show lab results"}
        </button>
      )}
    </article>
  );
}

function QuoteCard() {
  const q = REVIEWS.find((r) => r.stars === 5);
  if (!q) return null;

  return (
    <div className="overflow-hidden rounded-[30px] bg-grad-routine">
      <div className="grid items-end lg:grid-cols-[1fr_1fr]">
        <div className="relative order-last h-[300px] lg:order-first lg:h-[480px]">
          <Image
            src={QUOTE_IMAGE}
            alt=""
            fill
            sizes="(min-width: 1024px) 600px, 100vw"
            className="object-cover"
          />
        </div>
        <div className="flex flex-col justify-center px-8 py-10 lg:h-[480px] lg:px-14">
          <div>
            <p className="text-[clamp(20px,2vw,30px)] font-light leading-[1.55] text-black">
              “{q.quote}”
            </p>
            <p className="mt-6 text-base font-semibold text-black">{q.name}</p>
            <p className="mt-1 text-small text-grey-700">Verified buyer · {q.product}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ScienceView() {
  const tested = PRODUCTS.filter((p) => p.janoshik);
  const totalReviews = PRODUCTS.reduce((n, p) => n + (p.reviews ?? 0), 0);

  return (
    <div className="bg-white pb-24 pt-28 lg:pt-[140px]">
      {/* ---- 1. results list ---------------------------------------- */}
      <section className="mx-auto w-full max-w-[1000px] px-4 lg:px-0">
        <h1 className="text-[clamp(24px,2.4vw,32px)] font-normal leading-snug text-black">
          Peptiva Labs results, backed by independent analysis
        </h1>
        <p className="mt-1 text-[clamp(18px,1.8vw,26px)] font-light text-grey-700">
          Select a compound and view its lab results:
        </p>

        <div className="mt-12 flex flex-col gap-8">
          {tested.map((p) => (
            <ProductResult key={p.slug} product={p} />
          ))}
        </div>
      </section>

      {/* ---- 2. standards strip --------------------------------------- */}
      <section className="mx-auto mt-24 grid w-full max-w-[1200px] grid-cols-2 gap-10 px-4 sm:grid-cols-3 lg:grid-cols-5 lg:px-6">
        {STANDARDS.map(({ Icon, strong, rest }, i) => (
          <div key={strong} className="flex flex-col items-start gap-5">
            <span
                  className="inline-flex h-[64px] w-[64px] items-center justify-center rounded-[18px]"
                  style={{ background: STANDARD_TONES[i % STANDARD_TONES.length].bg, color: STANDARD_TONES[i % STANDARD_TONES.length].fg }}
                >
                  <Icon width={32} height={32} strokeWidth={1.5} />
                </span>
            <p className="text-small leading-snug text-black">
              <strong className="font-semibold">{strong}</strong>
              <br />
              {rest}
            </p>
          </div>
        ))}
      </section>

      {/* ---- 3. quotes ------------------------------------------------ */}
      <section className="mx-auto mt-28 w-full max-w-[1190px] px-4 lg:px-6">
        <h2 className="mb-12 text-center text-[clamp(28px,3vw,46px)] font-normal text-black">
          Don&apos;t just take Peptiva Labs&apos; word for it.
        </h2>
        <QuoteCard />
      </section>

      {/* ---- 4. stat tiles -------------------------------------------- */}
      <section className="mx-auto mt-12 grid w-full max-w-[790px] grid-cols-1 gap-8 px-4 sm:grid-cols-2 sm:gap-[54px]">
        <div className="flex h-[170px] flex-col items-center justify-center border border-black text-center">
          <p className="text-[clamp(36px,3.4vw,52px)] font-normal leading-none text-black">
            1,800+
          </p>
          <p className="mt-4 max-w-[200px] text-[18px] leading-snug text-black">
            Assays on file across the range
          </p>
        </div>
        <div className="flex h-[170px] flex-col items-center justify-center border border-black text-center">
          <p className="flex items-center gap-3 text-[clamp(36px,3.4vw,52px)] font-normal leading-none text-black">
            4.8
            <span className="inline-flex h-[44px] w-[44px] items-center justify-center bg-black text-white">
              <StarIcon size={30} fill={1} />
            </span>
          </p>
          <p className="mt-4 max-w-[220px] text-[18px] leading-snug text-black">
            Based on {totalReviews.toLocaleString("en-US")} product ratings
          </p>
        </div>
      </section>

      <div className="mt-16 flex justify-center">
        <Link
          href="/products"
          className="inline-flex h-[52px] w-[260px] items-center justify-center rounded-md bg-black text-base font-medium text-white transition-opacity hover:opacity-85"
        >
          Shop the range
        </Link>
      </div>
    </div>
  );
}
