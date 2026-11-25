"use client";

import { Fragment, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Rating from "@/components/Rating";
import Rail from "@/components/Rail";
import ProductCard from "@/components/ProductCard";
import CommunityStrip from "@/components/CommunityStrip";
import { useCart } from "@/components/CartContext";
import { useToast } from "@/components/Toast";
import { REVIEWS } from "@/lib/reviews";
import {
  ArrowUpRight,
  ArrowRightLong,
  BeakerIcon,
  CalendarCheckIcon,
  CheckCircleIcon,
  CheckIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  CloseIcon,
  DocIcon,
  LockIcon,
  MinusIcon,
  PlusIcon,
  SearchIcon,
  ShieldIcon,
  TagIcon,
  TruckIcon,
  UserIcon,
} from "@/components/icons";
import { formatUSD, isPhoto, type JanoshikRow, type Product } from "@/lib/products";
import { PRODUCT_CONTENT } from "@/lib/productContent";

/**
 * Product detail page — modelled on the reference's flagship product page
 * (essential-multivitamin), top to bottom:
 *
 *   hero on a diagonal product wash: thumb rail + rounded gallery card,
 *     buying column (shipping chip, title, stars, tag pills, blurb) and a
 *     warm buy panel with a purchase option row, pack-size tiles, benefit
 *     rows and one black CTA
 *   bordered section-jump buttons · community strip · rating summary
 *   "Explore our N compounds" tabbed explorer in a rounded panel
 *   gradient promo banner with checks + Order now
 *   comparison table in a rounded panel
 *   "Join researchers…" review wall beside a photo
 *   verification card + four bordered check cards
 *   certificate of analysis · wide image banner · FAQ · everything you
 *   need to know · standards strip · reviews · we also recommend
 *
 * Behaviour preserved from before: cart `add(slug, qty)`, the toast, the
 * once-per-session Janoshik modal (sessionStorage), escape + scroll lock.
 */

/** Per-product hero wash in the reference's three-stop diagonal style. */
const HERO_WASH: Record<string, string> = {
  "bg-goal-bones": "linear-gradient(123deg, #BFE6EE 1.7%, #DDF2F6 56.76%, #F4FCFD 100%)",
  "bg-goal-skin": "linear-gradient(107.68deg, #FFBACC 0.3%, #FFE7E3 56.14%, #FFF6F4 100%)",
  "bg-goal-weight": "linear-gradient(123deg, #C6EBD0 1.7%, #E3F5E8 56.76%, #F5FCF7 100%)",
  "bg-goal-gut": "linear-gradient(123deg, #FFD9A8 1.7%, #FFEED6 56.76%, #FFF9F0 100%)",
  "bg-goal-energy": "linear-gradient(123deg, #F7E39A 1.7%, #FFF4CF 56.76%, #FFFCF0 100%)",
  "bg-tint-lavender-50": "linear-gradient(123deg, #E0C3FD 1.7%, #D7ECF9 56.76%, #F2FCFD 100%)",
};
const DEFAULT_WASH = "linear-gradient(123deg, #E0C3FD 1.7%, #D7ECF9 56.76%, #F2FCFD 100%)";

/**
 * Washes sampled from each product's own photography (the studio
 * backdrop behind the portrait), so the page tone matches its pictures:
 * the backdrop colour at the left, easing to near-white at the right.
 */
const PHOTO_WASH: Record<string, string> = {
  glow: "linear-gradient(123deg, #DCBBDC 1.7%, #F0DDF0 56.76%, #FBF5FB 100%)",
  /* pink-to-peach studio backdrop of the NAD+ photos */
  "nad-plus-1000mg": "linear-gradient(123deg, #F79AC4 1.7%, #FEE7B4 56.76%, #FFF8EE 100%)",
  retatrutide: "linear-gradient(123deg, #EEBA96 1.7%, #F9DCC6 56.76%, #FFF7F1 100%)",
  /* the cream-to-pink-to-lilac pastel backdrop of the carton photos */
  tirzepatide: "linear-gradient(123deg, #F2C8E8 1.7%, #F8E1F2 56.76%, #F8F5FC 100%)",
  /* same periwinkle studio backdrop as the tirzepatide set */
  "bpc-157-tb-500": "linear-gradient(123deg, #C9BEF9 1.7%, #DEE9FC 56.76%, #F7F6FE 100%)",
  /* the cyan-to-mint studio backdrop of the Retatrutide 40mg photos */
  "retatrutide-40mg": "linear-gradient(123deg, #91F4FE 1.7%, #BDFAF3 56.76%, #F4FEFB 100%)",
  "cjc-1295": "linear-gradient(123deg, #C7E3E3 1.7%, #E1F1F1 56.76%, #F6FBFB 100%)",
  /* the pink-over-yellow two-tone set of the MOTS-C photos */
  "mots-c": "linear-gradient(123deg, #FDB0E5 1.7%, #FEF8B8 56.76%, #FEFCF0 100%)",
  /* the pink studio backdrop of the Tesamorelin photos, at its lightest stop */
  tesamorelin: "linear-gradient(123deg, #FBB4CB 1.7%, #FDD6E2 56.76%, #FEF7FA 100%)",
};

const washFor = (p: Product) => PHOTO_WASH[p.slug] ?? HERO_WASH[p.bg] ?? DEFAULT_WASH;

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



/** Bordered card with a hard offset shadow — the reference's card style. */
const HARD_CARD = "border-2 border-black bg-white shadow-[4px_4px_0_#000]";

/**
 * Section bands follow the reference's structure (white -> tint -> tint ->
 * white fades and warm rounded panels) but take their colours from the
 * product's own wash, so every band below the hero stays in the same colour
 * family as the product photography instead of a fixed lilac / blue.
 */
type Palette = { deep: string; mid: string; light: string };

function paletteFrom(wash: string): Palette {
  const hex = wash.match(/#[0-9A-Fa-f]{6}/g) ?? [];
  const [deep = "#E0C3FD", mid = "#D7ECF9", light = "#F2FCFD"] = hex;
  return { deep, mid, light };
}

/** Blend a hex colour toward white (0 = unchanged, 1 = white). */
function tint(hex: string, amount: number): string {
  const n = parseInt(hex.slice(1), 16);
  const ch = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((c) => Math.round(c + (255 - c) * amount));
  return "#" + ch.map((c) => c.toString(16).padStart(2, "0")).join("");
}

function bandsFor(p: Palette) {
  const a = tint(p.mid, 0.45); // soft tint, replaces #F2E4FF
  const b = tint(p.light, 0.2); // palest tint, replaces #EBF8FC
  return {
    rise: `linear-gradient(0deg, ${b} 0%, ${a} 74.64%, #FFFFFF 100%)`,
    fade: `linear-gradient(0deg, #FFFFFF 0%, ${b} 45.13%, ${a} 74.64%, #FFFFFF 100%)`,
    fall: `linear-gradient(180deg, #FFFFFF 0%, ${b} 25.13%, ${a} 55.64%, #FFFFFF 100%)`,
    soft: `linear-gradient(0deg, #FFFFFF 0%, ${b} 100%)`,
    panel: `linear-gradient(180deg, #F8F5F2 0%, ${tint(p.mid, 0.55)} 100%)`,
    card: `linear-gradient(98deg, ${tint(p.mid, 0.6)} 20.03%, #FFFFFF 99.07%)`,
    accent: p.deep,
    accentSoft: tint(p.deep, 0.6),
    /** Reference: everything below the hero sits on one flat, very pale
     *  tint of the product colour (e.g. Pro Creatine #F7FFF4). */
    page: tint(p.deep, 0.8),
  };
}

function OrderNow({ className = "" }: { className?: string }) {
  return (
    <a
      href="#buy"
      className={`inline-flex h-[42px] w-[175px] items-center justify-center rounded-md bg-black text-small font-medium text-white transition-opacity hover:opacity-85 ${className}`}
    >
      Order now
    </a>
  );
}


export default function ProductDetail({
  product,
  related,
}: {
  product: Product;
  related: Product[];
}) {
  const { add } = useCart();
  const toast = useToast();
  const [qty, setQty] = useState(1);
  const gallery =
    product.gallery && product.gallery.length > 0 ? product.gallery : [product.img];
  const [activeImg, setActiveImg] = useState(0);
  const [labOpen, setLabOpen] = useState(false);

  useEffect(() => {
    if (!product.janoshik) return;
    if (typeof window === "undefined") return;
    const key = `janoshik-seen:${product.slug}`;
    if (window.sessionStorage.getItem(key)) return;
    const t = window.setTimeout(() => {
      setLabOpen(true);
      window.sessionStorage.setItem(key, "1");
    }, 600);
    return () => window.clearTimeout(t);
  }, [product.slug, product.janoshik]);

  useEffect(() => {
    if (!labOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLabOpen(false);
    };
    window.addEventListener("keydown", onKey);
    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = overflow;
    };
  }, [labOpen]);

  function handleAdd() {
    add(product.slug, qty);
    toast.success(
      qty > 1
        ? `${qty} × ${product.name} added to your cart.`
        : `${product.name} added to your cart.`,
      "Added to cart"
    );
  }

  const step = (dir: 1 | -1) =>
    setActiveImg((i) => (i + dir + gallery.length) % gallery.length);

  const rows = product.janoshik?.rows ?? [];
  const totalMg = useMemo(
    () => rows.reduce((n, r) => n + (parseFloat(r.verified) || 0), 0),
    [rows]
  );
  const band = bandsFor(paletteFrom(washFor(product)));
  const stories = storiesFor(product);
  const content = PRODUCT_CONTENT[product.slug];
  const compoundRows: JanoshikRow[] = rows.length
    ? rows
    : Object.keys(content?.compounds ?? {}).map((compound) => ({ compound, concentration: "", verified: "" }));

  return (
    <>
      <Navbar />

      {/* ================= hero on the product wash ================== */}
      <div style={{ background: washFor(product) }}>
        <main id="home" className="pb-16 pt-28 lg:pt-32">
          <div className="mx-auto w-full max-w-[1340px] px-4 lg:px-10">
            <nav aria-label="Breadcrumb" className="text-small text-grey-700">
              <Link href="/" className="transition-colors hover:text-black">Home</Link>
              <span className="mx-2">/</span>
              <Link href="/products" className="transition-colors hover:text-black">Shop</Link>
              <span className="mx-2">/</span>
              <span className="text-black">{product.name}</span>
            </nav>

            <div className="mt-6 grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,670px)] lg:gap-12">
              {/* ---- gallery ---------------------------------------- */}
              <div className="flex gap-5 lg:sticky lg:top-32 lg:self-start">
                {gallery.length > 1 && (
                  <div className="hidden w-[66px] flex-none flex-col gap-3 sm:flex">
                    {gallery.map((src, i) => (
                      <button
                        key={src + i}
                        type="button"
                        aria-label={`View image ${i + 1} of ${gallery.length}`}
                        aria-current={i === activeImg}
                        onClick={() => setActiveImg(i)}
                        className={`relative aspect-[66/78] overflow-hidden rounded-md bg-white/80 transition-shadow ${
                          i === activeImg ? "ring-2 ring-black" : "ring-1 ring-black/10 hover:ring-black/40"
                        }`}
                      >
                        <Image
                          src={src}
                          alt=""
                          fill
                          sizes="66px"
                          className={isPhoto(src) ? "object-cover" : "object-contain p-1"}
                        />
                      </button>
                    ))}
                  </div>
                )}

                <div className="min-w-0 flex-1">
                  <div className="relative mx-auto aspect-[4/5] max-h-[680px] w-full max-w-[544px] overflow-hidden rounded-[20px] bg-white/60">
                    {gallery.map((src, i) => (
                      <Image
                        key={src + i}
                        src={src}
                        alt={i === activeImg ? `${product.name} — ${product.meta}` : ""}
                        fill
                        priority={i === 0}
                        aria-hidden={i !== activeImg}
                        sizes="(min-width: 1024px) 40vw, 100vw"
                        className={`transition-opacity duration-fast ease-standard ${
                          isPhoto(src) ? "object-cover" : "object-contain p-8 sm:p-12"
                        } ${i === activeImg ? "opacity-100" : "opacity-0"}`}
                      />
                    ))}
                  </div>

                  {gallery.length > 1 && (
                    <div className="mt-5 flex items-center justify-center gap-6">
                      <button
                        type="button"
                        onClick={() => step(-1)}
                        aria-label="Previous image"
                        className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-black/10 text-black transition-colors hover:bg-black/20"
                      >
                        <ChevronLeftIcon />
                      </button>
                      <button
                        type="button"
                        onClick={() => step(1)}
                        aria-label="Next image"
                        className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-black/10 text-black transition-colors hover:bg-black/20"
                      >
                        <ChevronRightIcon />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* ---- buying column ---------------------------------- */}
              <div className="flex flex-col">
                <span className="inline-flex w-fit items-center gap-1 rounded-pill bg-white/90 px-2.5 py-1 text-[12px] text-grey-700">
                  Free shipping via <strong className="font-bold text-berry-500">cold-chain</strong>
                </span>

                <h1 className="mt-4 text-[clamp(26px,2.2vw,32px)] font-medium leading-tight text-black">
                  {product.name}
                </h1>
                <p className="mt-1 text-small text-grey-700">
                  {product.category} • {product.meta}
                  {!product.comingSoon && <> • {formatUSD(product.price)} per kit</>}
                </p>

                {product.rating !== undefined && (
                  <a href="#reviews" className="mt-2 w-fit">
                    <Rating
                      value={product.rating}
                      count={product.reviews?.toLocaleString("en-US")}
                      size={18}
                    />
                  </a>
                )}

                {product.janoshik && (
                <div className="mt-3 flex flex-wrap gap-2">
                  <a href="#ingredients" className="inline-flex items-center gap-1 rounded-pill bg-[#E9D9FF] px-3 py-1 text-[13px] font-medium text-plum-700 transition-opacity hover:opacity-80">
                    Compounds <ChevronRightIcon width={13} height={13} />
                  </a>
                  <a href="#analysis" className="inline-flex items-center gap-1 rounded-pill bg-[#E9D9FF] px-3 py-1 text-[13px] font-medium text-plum-700 transition-opacity hover:opacity-80">
                    Lab report <ChevronRightIcon width={13} height={13} />
                  </a>
                </div>
                )}

                <p className="mt-4 max-w-[640px] text-[15px] leading-relaxed text-black">{product.blurb}</p>

                {/* ---- buy panel ------------------------------------ */}
                {product.comingSoon ? (
                  <div id="buy" className="mt-6 scroll-mt-32 bg-[#F8F5F2]/95 p-5 sm:p-7">
                    <div className="rounded-[20px] border-2 border-black bg-white p-6 text-center sm:p-8">
                      <span className="inline-block rounded-pill bg-black px-3 py-1 text-[11px] font-semibold uppercase tracking-label text-white">
                        Coming soon
                      </span>
                      <p className="mt-4 text-[20px] font-medium text-black">
                        {product.name} is not available to order yet
                      </p>
                      <p className="mx-auto mt-2 max-w-[420px] text-small leading-relaxed text-grey-700">
                        Batches are being prepared and tested. Leave your details and we will
                        let you know as soon as it is released, with its lab report.
                      </p>
                      <Link
                        href="/contact"
                        className="mt-6 inline-flex h-[50px] w-full max-w-[360px] items-center justify-center rounded-md bg-black text-base font-medium text-white transition-opacity hover:opacity-85"
                      >
                        Register interest
                      </Link>
                    </div>
                  </div>
                ) : (
                <div id="buy" className="mt-6 scroll-mt-32 bg-[#F8F5F2]/95 p-5 sm:p-7">
                  {product.janoshik && (
                    <p className="flex items-center justify-end gap-1.5 text-[12px] text-grey-700">
                      <CheckCircleIcon width={14} height={14} />
                      Janoshik verified
                    </p>
                  )}

                  <div className="mt-3 flex items-center justify-between rounded-[14px] border border-grey-300 bg-white/60 px-4 py-3.5">
                    <span className="flex items-center gap-3 text-[15px] font-medium text-black">
                      <span className="inline-flex h-[18px] w-[18px] items-center justify-center rounded-full border-2 border-black">
                        <span className="h-2 w-2 rounded-full bg-black" />
                      </span>
                      One-time purchase
                    </span>
                    <span className="text-[17px] font-medium text-black">{formatUSD(product.price)}</span>
                  </div>

                  <div className="mt-4 rounded-[20px] border-2 border-black bg-white p-4 sm:p-6">
                    <p className="text-[15px] font-medium text-black">How many kits?</p>
                    <div className="mt-4 grid grid-cols-3 gap-3">
                      {[1, 2, 3].map((n) => (
                        <button
                          key={n}
                          type="button"
                          onClick={() => setQty(n)}
                          aria-pressed={qty === n}
                          className={`flex flex-col items-center rounded-[14px] px-2 py-4 text-center transition-colors ${
                            qty === n ? "border-2 border-black bg-white" : "border-2 border-transparent bg-grey-100 hover:bg-grey-200"
                          }`}
                        >
                          <span className="flex h-[44px] items-end justify-center -space-x-2">
                            {Array.from({ length: n }, (_, k) => (
                              <span key={k} className="relative h-[40px] w-[46px]">
                                <Image src={product.img} alt="" fill sizes="46px" className="object-contain" />
                              </span>
                            ))}
                          </span>
                          <span className="mt-2 text-[14px] font-medium text-black">
                            {n} kit{n > 1 ? "s" : ""}
                          </span>
                          <span className="mt-1 text-[14px] font-semibold text-black">
                            {formatUSD(product.price * n)}
                          </span>
                          <span className="text-[11px] text-grey-600">{formatUSD(product.price)} per kit</span>
                        </button>
                      ))}
                    </div>

                    <div className="mt-4 flex items-center justify-between gap-3 text-small text-grey-700">
                      <span>Need a different amount?</span>
                      <span className="inline-flex items-center rounded-md border border-grey-300 bg-white">
                        <button
                          type="button"
                          aria-label="Decrease quantity"
                          onClick={() => setQty((q) => Math.max(1, q - 1))}
                          disabled={qty <= 1}
                          className="inline-flex h-9 w-9 items-center justify-center text-black hover:bg-grey-100 disabled:text-grey-500"
                        >
                          <MinusIcon width={14} height={14} />
                        </button>
                        <span className="w-8 text-center font-medium tabular-nums text-black" aria-live="polite">
                          {qty}
                        </span>
                        <button
                          type="button"
                          aria-label="Increase quantity"
                          onClick={() => setQty((q) => q + 1)}
                          className="inline-flex h-9 w-9 items-center justify-center text-black hover:bg-grey-100"
                        >
                          <PlusIcon width={14} height={14} />
                        </button>
                      </span>
                    </div>

                    <ul className="mt-5 space-y-2.5 text-small">
                      {[
                        { Icon: ShieldIcon, strong: "Third-party assayed", rest: "certificate published per batch" },
                        { Icon: TagIcon, strong: "Volume pricing", rest: "applied automatically at checkout" },
                        { Icon: CalendarCheckIcon, strong: "Dispatched in 1 business day", rest: "tracked and insulated" },
                      ].map(({ Icon, strong, rest }) => (
                        <li key={strong} className="flex items-center gap-3 text-black">
                          <Icon width={17} height={17} className="flex-none" />
                          <span>
                            <strong className="font-semibold">{strong}</strong>
                            <span className="text-grey-700"> · {rest}</span>
                          </span>
                        </li>
                      ))}
                    </ul>

                    <button
                      type="button"
                      onClick={handleAdd}
                      className="mt-6 inline-flex h-[50px] w-full items-center justify-center rounded-md bg-black text-base font-medium text-white transition-opacity hover:opacity-85"
                    >
                      Add to cart · {formatUSD(product.price * qty)}
                    </button>

                    <p className="mt-4 flex flex-wrap items-center justify-center gap-2 text-small">
                      <span className="inline-flex items-center gap-2 font-medium text-leaf-800">
                        <span className="h-2 w-2 rounded-full bg-leaf-600" aria-hidden />
                        In stock
                      </span>
                      <span className="text-grey-600">·</span>
                      <Link href="/shipping-policy" className="text-grey-700 underline underline-offset-2 hover:text-black">
                        Shipping &amp; delivery times
                      </Link>
                    </p>
                  </div>
                </div>
                )}
              </div>
            </div>
          </div>
        </main>

        {/* ---- section jump buttons (reference: Reviews / Description / How it works) */}
        {/* Buttons straddle the edge between the wash and the white page, as in
            the reference: half on the gradient, half below it. */}
        <div className="relative z-10 -mb-[25px] flex flex-wrap justify-center gap-4 px-4">
          {[
            { label: "Reviews", href: "#reviews" },
            { label: "Description", href: compoundRows.length ? "#ingredients" : "#contents" },
            { label: "How it works", href: "#contents" },
          ].map((s) => (
            <a
              /* Not the href: without a Janoshik report the last two buttons
                 both point at #contents, which collides as a key. */
              key={s.label}
              href={s.href}
              className={`${HARD_CARD} inline-flex h-[50px] w-[205px] items-center justify-center gap-3 rounded-[6px] px-6 text-[15px] font-medium text-black transition-transform hover:-translate-y-0.5`}
            >
              {s.label}
              <ChevronRightIcon width={14} height={14} />
            </a>
          ))}
        </div>
      </div>

      <div className="pt-[25px]" style={{ background: band.page }}>
        <div className="pt-16">
          <CommunityStrip title="Loved by the Peptiva Labs" sentenceCase background="bg-transparent" />
        </div>

        {/* ================= rating summary ========================== */}
        {product.rating !== undefined && (
          <section className="py-16" aria-label="Rating summary">
            <div className="mx-auto flex max-w-[640px] flex-col items-center gap-2 px-4 text-center">
              <p className="text-[clamp(60px,6vw,88px)] font-medium leading-none text-black">
                {product.rating.toFixed(1)}
              </p>
              <Rating value={product.rating} size={22} />
              <p className="text-small font-medium text-black">
                based on {product.reviews?.toLocaleString("en-US")} ratings
              </p>
            </div>
          </section>
        )}

        {/* ================= story splits (reference: alternating
            image / copy blocks, ORDER NOW after the first) ========== */}
        {stories.map((st, i) => (
          <Fragment key={st.title}>
            <section className="px-4 py-10 lg:py-12">
              <div
                className={`mx-auto grid max-w-[1340px] items-center gap-8 lg:grid-cols-2 lg:gap-24 ${
                  i % 2 === 1 ? "lg:[&>*:first-child]:order-2" : ""
                }`}
              >
                {/* The frame takes the shot's own shape when it declares one,
                    so a photo that isn't 652/786 neither crops nor bands. */}
                <div
                  className={`relative w-full overflow-hidden ${
                    st.aspect ? "" : "aspect-[652/786]"
                  } ${st.width ?? "lg:max-w-[652px]"}`}
                  style={{
                    background: washFor(product),
                    ...(st.aspect ? { aspectRatio: st.aspect } : {}),
                  }}
                >
                  <Image
                    src={st.img}
                    alt=""
                    fill
                    sizes="(min-width: 1024px) 500px, 100vw"
                    className={
                      st.cover
                        ? "object-cover"
                        : st.contain
                          ? "object-contain"
                          : "object-contain p-10 sm:p-16"
                    }
                  />
                </div>
                <div className={`max-w-[580px] ${i % 2 === 1 ? "lg:ml-auto" : ""}`}>
                  <p className="text-[13px] font-semibold uppercase tracking-label text-black/60">
                    {String(i + 1).padStart(2, "0")} · {product.name}
                  </p>
                  <h2 className="mt-3 text-[clamp(30px,3.2vw,48px)] font-medium leading-[1.2] text-black">{st.title}</h2>
                  {st.body.map((p) => (
                    <p key={p} className="mt-5 text-[clamp(17px,1.4vw,20px)] leading-[1.75] text-black">
                      {p}
                    </p>
                  ))}
                  <dl className="mt-8 grid grid-cols-2 gap-3">
                    {storyFacts(product, i).map((f) => (
                      <div key={f.k} className="rounded-[14px] bg-white/80 px-4 py-4">
                        <dt className="text-[11px] font-semibold uppercase tracking-label text-grey-600">{f.k}</dt>
                        <dd className="mt-1.5 text-[17px] font-medium leading-snug text-black">{f.v}</dd>
                      </div>
                    ))}
                  </dl>
                  {i === 0 && <OrderNow className="mt-8 w-[260px] uppercase tracking-[0.04em]" />}
                </div>
              </div>
            </section>
          </Fragment>
        ))}

        {/* ================= key compound highlights ================ */}
        {compoundRows.length > 0 && (
          <section id="ingredients" className="scroll-mt-28 px-4 py-14">
            <h2 className="text-center text-[clamp(26px,2.6vw,40px)] font-normal text-black">
              Peptiva Labs compound highlights
            </h2>
            <div className="mx-auto mt-10 flex max-w-[1180px] flex-wrap justify-center gap-8">
              {compoundRows.map((row) => (
                <CompoundCard key={row.compound} row={row} product={product} />
              ))}
            </div>
          </section>
        )}

        {/* ================= assay table ============================= */}
        {product.janoshik && (
          <section id="analysis" className="scroll-mt-28 py-16" aria-labelledby="analysis-heading">
            <div className="shell">
              <h2 id="analysis-heading" className="heading-caps">
                Peptiva Labs certificate of analysis
              </h2>
              <p className="mx-auto mt-5 max-w-prose text-center lead">
                Independently tested and verified by Janoshik Analytical.
              </p>

              <div className={`${HARD_CARD} mx-auto mt-10 max-w-4xl overflow-hidden rounded-[14px]`}>
                <div className="grid grid-cols-2 gap-px bg-grey-200 sm:grid-cols-3">
                  <Stat label="Batch number" value={product.janoshik.batch} />
                  <Stat label="Fill volume" value={product.janoshik.fillVolume} />
                  <Stat
                    label="Purity"
                    value={product.janoshik.purity ?? "Verified"}
                    className="col-span-2 sm:col-span-1"
                  />
                </div>
                <div className="overflow-x-auto bg-white">
                  <table className="w-full border-collapse text-base">
                    <thead>
                      <tr className="bg-sand-100 text-left">
                        <th className="px-5 py-3 text-small font-medium uppercase tracking-caps text-grey-700">Compound</th>
                        <th className="px-5 py-3 text-small font-medium uppercase tracking-caps text-grey-700">Concentration</th>
                        <th className="px-5 py-3 text-small font-medium uppercase tracking-caps text-grey-700">Verified content</th>
                      </tr>
                    </thead>
                    <tbody>
                      {product.janoshik.rows.map((row) => (
                        <tr key={row.compound} className="border-t border-grey-200">
                          <td className="px-5 py-4 font-medium text-black">{row.compound}</td>
                          <td className="px-5 py-4 text-grey-700">{row.concentration}</td>
                          <td className="px-5 py-4 text-grey-700">{row.verified}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="flex flex-wrap items-center justify-between gap-4 border-t border-grey-200 bg-white px-5 py-4">
                  <p className="max-w-xl text-small leading-relaxed text-grey-600">
                    Concentration is measured per ml; verified content reflects the total assayed
                    mass across the stated fill volume.
                  </p>
                  <a href={product.janoshik.verifyUrl} target="_blank" rel="noreferrer" className="btn-secondary btn-sm">
                    View full report
                    <ArrowUpRight width={15} height={15} />
                  </a>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ================= wide image banner ======================= */}
        <section className="px-4 py-8">
          <h2 className="mb-8 text-center text-[clamp(26px,2.6vw,40px)] font-medium text-black">
            {content?.tagline ?? `${product.name}, built for the bench`}
          </h2>
          <div className="relative mx-auto aspect-[4/3] max-w-[1340px] overflow-hidden sm:aspect-[16/8]" style={{ background: washFor(product) }}>
            <Image
              src={product.bannerImg ?? product.img}
              alt=""
              fill
              sizes="(min-width: 1340px) 1340px, 100vw"
              className={
                product.bannerImg
                  ? "object-cover"
                  : "object-contain px-10 pb-24 pt-10 sm:px-24 sm:pb-28"
              }
            />
            <OrderNow className="absolute bottom-8 left-1/2 -translate-x-1/2" />
          </div>
        </section>

        {/* ================= FAQ + everything you need to know ======== */}
        <ProductFaq product={product} />
        <div className="flex justify-center pb-4">
          <OrderNow className="w-[300px] uppercase tracking-[0.04em]" />
        </div>

        {/* ================= standards strip ========================= */}
        <section className="py-14">
          <div className="mx-auto grid max-w-[1100px] grid-cols-2 gap-10 px-4 sm:grid-cols-3 lg:grid-cols-5">
            {STANDARDS.map(({ Icon, strong, rest }, i) => (
              <div key={strong} className="flex flex-col items-start gap-4">
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
          </div>
          <div className="mx-auto mt-12 max-w-[860px] px-4">
            <Accordion
              items={[
                {
                  q: "References",
                  a: product.janoshik ? (
                    <ol className="list-decimal space-y-1.5 pl-4">
                      <li>
                        Janoshik Analytical, batch {product.janoshik.batch} —{" "}
                        <a href={product.janoshik.verifyUrl} target="_blank" rel="noreferrer" className="underline underline-offset-2">
                          public verification report
                        </a>
                        .
                      </li>
                      {product.janoshik.rows.map((row) => (
                        <li key={row.compound}>
                          {row.compound}: {row.concentration} measured, {row.verified} verified per device.
                        </li>
                      ))}
                    </ol>
                  ) : (
                    "The independent lab report for this batch will be published here when it is released."
                  ),
                },
              ]}
            />
          </div>
          <div className={`${HARD_CARD} mx-auto mt-5 max-w-[828px] px-5 py-3 text-[12px] leading-relaxed text-black`}>
            <p><strong className="font-semibold">{product.name}</strong> is supplied strictly for laboratory and analytical research.</p>
            <p>Not for human or veterinary use. Not intended to diagnose, treat, cure or prevent any disease.</p>
            <p>Store as directed on the carton and keep out of reach of unauthorised persons.</p>
          </div>
          <p className="mx-auto mt-12 max-w-[900px] px-4 text-center text-[clamp(20px,1.8vw,28px)] text-black">
            It&apos;s part of our mission to make research material verifiable.
          </p>
        </section>

        {/* ================= product reviews ========================= */}
        <div id="reviews" className="scroll-mt-28">
          <ProductReviews product={product} />
        </div>

        {/* ================= related ================================= */}
        {related.length > 0 && (
          <section className="py-16" aria-labelledby="related-heading">
            <div className="shell">
              <div className="flex flex-wrap items-end justify-between gap-4">
                <h2 id="related-heading" className="text-[clamp(26px,2.4vw,34px)] font-medium text-black">
                  More from Peptiva Labs
                </h2>
                <Link href="/products" className="link-micro">
                  View all
                </Link>
              </div>
              <div className="mt-10">
                <Rail ariaLabel="Related products">
                  {related.map((r) => (
                    <div key={r.slug} className="w-[74vw] sm:w-[45vw] lg:w-[calc((100%-60px)/4)]">
                      <ProductCard product={r} hoverOnly />
                    </div>
                  ))}
                </Rail>
              </div>
            </div>
          </section>
        )}
      </div>

      {/* ================= first-visit assay modal ==================
          Header carries the product's own wash and kit render; the body
          is a warm stat strip, one row per compound with its share of the
          measured content, and the two actions. Bottom sheet on phones,
          centred card on larger screens. */}
      {product.janoshik && labOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="janoshik-modal-heading"
          className="fixed inset-0 z-[1000] flex items-end justify-center bg-black/45 backdrop-blur-[2px] sm:items-center sm:p-4"
          onClick={() => setLabOpen(false)}
        >
          <div
            className="relative flex max-h-[92vh] w-full flex-col overflow-hidden rounded-t-[28px] bg-white shadow-[0_24px_70px_rgba(0,0,0,0.25)] animate-fade-up sm:max-w-[560px] sm:rounded-[28px]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* ---- header on the product wash ---- */}
            <div className="relative flex-none overflow-hidden px-6 pb-6 pt-7 sm:px-8" style={{ background: washFor(product) }}>
              <button
                type="button"
                aria-label="Close"
                onClick={() => setLabOpen(false)}
                className="absolute right-4 top-4 z-10 inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/85 text-black shadow-tile transition-colors hover:bg-white"
              >
                <CloseIcon width={15} height={15} />
              </button>

              <div className="relative grid grid-cols-[1fr_auto] items-end gap-4">
                <div>
                  <span className="inline-flex items-center gap-1.5 rounded-pill bg-white/85 px-3 py-1 text-[12px] font-medium text-black">
                    <CheckCircleIcon width={14} height={14} className="text-leaf-600" />
                    Janoshik verified
                  </span>
                  <h2 id="janoshik-modal-heading" className="mt-4 text-[clamp(24px,3vw,30px)] font-medium leading-tight text-black">
                    Independently assayed
                  </h2>
                  <p className="mt-1.5 max-w-[280px] text-small leading-relaxed text-black/75">
                    {product.name} · batch {product.janoshik.batch} was tested by Janoshik Analytical.
                  </p>
                </div>
                <span className="relative hidden h-[96px] w-[130px] sm:block" aria-hidden>
                  <Image src={product.img} alt="" fill sizes="130px" className="object-contain drop-shadow-[0_10px_18px_rgba(0,0,0,0.12)]" />
                </span>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-6 pb-6 pt-5 sm:px-8">
              {/* ---- stat strip ---- */}
              <dl className="grid grid-cols-3 gap-2.5">
                {[
                  { k: "Batch", v: product.janoshik.batch },
                  { k: "Fill volume", v: product.janoshik.fillVolume },
                  { k: "Purity", v: product.janoshik.purity ?? "Verified" },
                ].map((s) => (
                  <div key={s.k} className="rounded-[14px] bg-[#F7F4F1] px-3 py-3">
                    <dt className="whitespace-nowrap text-[10px] uppercase tracking-label text-grey-600 sm:text-[11px]">{s.k}</dt>
                    <dd className="mt-1 break-all text-[13px] font-semibold text-black sm:text-[15px]">{s.v}</dd>
                  </div>
                ))}
              </dl>

              {/* ---- compounds ---- */}
              <p className="mt-6 text-[12px] font-semibold uppercase tracking-label text-black">Measured content</p>
              <ul className="mt-3 space-y-2.5">
                {product.janoshik.rows.map((row) => {
                  const share = totalMg > 0 ? ((parseFloat(row.verified) || 0) / totalMg) * 100 : 100;
                  return (
                    <li key={row.compound} className="rounded-[14px] border border-grey-200 px-4 py-3.5">
                      <div className="flex items-baseline justify-between gap-3">
                        <span className="text-[15px] font-medium text-black">{row.compound}</span>
                        <span className="text-[17px] font-semibold text-black">{row.verified}</span>
                      </div>
                      <div className="mt-2 flex items-center gap-3">
                        <span className="h-[6px] flex-1 rounded-full bg-grey-100">
                          <span className="block h-full rounded-full" style={{ width: `${share}%`, background: band.accent }} />
                        </span>
                        <span className="w-[86px] text-right text-[12px] text-grey-600">{row.concentration}</span>
                      </div>
                    </li>
                  );
                })}
              </ul>

              {/* ---- actions ---- */}
              <div className="mt-6 grid gap-2.5 sm:grid-cols-[1fr_auto]">
                <a
                  href={product.janoshik.verifyUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex h-[50px] items-center justify-center gap-2 rounded-[10px] bg-black text-base font-medium text-white transition-opacity hover:opacity-85"
                >
                  Verify on Janoshik
                  <ArrowUpRight width={16} height={16} />
                </a>
                <a
                  href="#analysis"
                  onClick={() => setLabOpen(false)}
                  className="inline-flex h-[50px] items-center justify-center rounded-[10px] border border-black px-6 text-small text-black transition-colors hover:bg-black hover:text-white"
                >
                  See certificate
                </a>
              </div>
              <p className="mt-4 text-center text-[11px] text-grey-600">
                For laboratory research use only — not for human or veterinary use.
              </p>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </>
  );
}

function Stat({
  label,
  value,
  className = "",
  compact = false,
}: {
  label: string;
  value: string;
  className?: string;
  compact?: boolean;
}) {
  return (
    <div className={`bg-white ${compact ? "px-3 py-3" : "px-5 py-4"} ${className}`}>
      <p className="text-small uppercase tracking-caps text-grey-600">{label}</p>
      <p
        className={`mt-1 font-medium text-black ${compact ? "text-small" : "text-base"}`}
      >
        {value}
      </p>
    </div>
  );
}

/* ---------------------------------------------------------------------- */

function Accordion({ items }: { items: { q: string; a: React.ReactNode }[] }) {
  const [open, setOpen] = useState<string | null>(null);
  return (
    <div className="flex flex-col gap-4">
      {items.map((it) => {
        const isOpen = open === it.q;
        return (
          <div key={it.q} className={HARD_CARD}>
            <button
              type="button"
              aria-expanded={isOpen}
              onClick={() => setOpen(isOpen ? null : it.q)}
              className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left text-[15px] text-black"
            >
              {it.q}
              <span className={`flex-none text-grey-600 transition-transform ${isOpen ? "rotate-45" : ""}`}>
                <PlusIcon width={16} height={16} />
              </span>
            </button>
            {isOpen && (
              <div className="px-5 pb-5 text-small leading-relaxed text-grey-700">{it.a}</div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function ProductFaq({ product }: { product: Product }) {
  const [query, setQuery] = useState("");
  const contents = product.packageContents ?? [];

  const faq = [
    ...(PRODUCT_CONTENT[product.slug]?.faq ?? []),
    {
      q: `How should ${product.name} be stored?`,
      a: product.storageLogic ?? "Store refrigerated (2–8°C). Do not freeze.",
    },
    {
      q: "How is each batch verified?",
      a: product.janoshik
        ? `Batch ${product.janoshik.batch} was tested by Janoshik Analytical. The full report, including measured content per compound, is public and can be checked with the verification link on this page.`
        : "Every batch is tested by an independent laboratory before it is listed.",
    },
    {
      q: "How is it shipped?",
      a: "Orders are dispatched within one business day in insulated, temperature-controlled packaging with tracking.",
    },
    {
      q: "Who is this product for?",
      a: "Peptiva Labs supplies laboratories and qualified research professionals only. This material is for laboratory research use — not for human or veterinary use.",
    },
  ];
  const q = query.trim().toLowerCase();
  const filtered = q ? faq.filter((f) => `${f.q} ${f.a}`.toLowerCase().includes(q)) : faq;

  const more: { q: string; a: React.ReactNode }[] = [
    {
      q: "What's in the kit",
      a: contents.length ? (
        <ul className="space-y-1.5">
          {contents.map((c, i) => (
            <li key={i} className={i === 0 ? "text-black" : ""}>
              {i === 0 ? c : `• ${c}`}
            </li>
          ))}
        </ul>
      ) : (
        "Information coming soon."
      ),
    },
    { q: "Storage & handling", a: product.storageLogic ?? "Information coming soon." },
    {
      q: "Highlights",
      a: (
        <ul className="space-y-2">
          {product.highlights.map((h) => (
            <li key={h} className="flex items-start gap-2">
              <CheckCircleIcon width={16} height={16} className="mt-0.5 flex-none text-leaf-800" />
              {h}
            </li>
          ))}
        </ul>
      ),
    },
    ...(product.safetyProtocol ? [{ q: "Safety protocol", a: product.safetyProtocol }] : []),
  ];

  return (
    <section id="contents" className="scroll-mt-28 py-16">
      <div className="mx-auto max-w-[900px] px-4">
        <h2 className="text-center text-[clamp(28px,2.8vw,40px)] font-medium text-black">Peptiva Labs FAQ</h2>
        <label className="mt-8 flex items-center gap-2 border border-grey-300 bg-white px-3">
          <SearchIcon width={15} height={15} className="flex-none text-black" />
          <span className="sr-only">Search questions</span>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Start typing your question"
            className="h-11 w-full bg-transparent text-[14px] text-black outline-none placeholder:text-grey-600"
          />
        </label>
        <div className="mt-4">
          {filtered.length ? (
            <Accordion items={filtered} />
          ) : (
            <p className="py-6 text-center text-small text-grey-600">No questions match “{query}”.</p>
          )}
        </div>

        <h2 id="highlights" className="mt-20 text-center text-[clamp(26px,2.6vw,38px)] font-medium text-black">
          Everything you need to know from Peptiva Labs
        </h2>
        <div className="mt-10">
          <Accordion items={more} />
        </div>
      </div>
    </section>
  );
}

function ProductReviews({ product }: { product: Product }) {
  const base = product.name.toLowerCase().split(" ")[0];
  const [sort, setSort] = useState<"high" | "low">("high");
  const [q, setQ] = useState("");
  const all = REVIEWS.filter(
    (r) => r.kind === "product" && r.product.toLowerCase().startsWith(base)
  );
  if (!all.length) return null;
  const list = all
    .filter((r) => !q.trim() || `${r.name} ${r.quote}`.toLowerCase().includes(q.trim().toLowerCase()))
    .sort((x, y) => (sort === "high" ? y.stars - x.stars : x.stars - y.stars));
  return (
    <section className="py-12" aria-labelledby="reviews-heading">
      <div className="mx-auto max-w-[920px] px-4">
        <div className="flex items-center justify-center gap-6">
          <h2 id="reviews-heading" className="text-[18px] italic text-black">
            Verified Peptiva Labs reviews
          </h2>
          {product.rating !== undefined && (
            <span className="flex flex-col items-center">
              <Rating value={product.rating} size={20} />
              <span className="mt-1 text-[12px] text-black">{product.reviews?.toLocaleString("en-US")} ratings</span>
            </span>
          )}
        </div>
        <div className="mt-6 grid grid-cols-2 border-y border-black">
          <label className="relative flex items-center border-r border-black">
            <span className="sr-only">Sort reviews</span>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as "high" | "low")}
              className="h-10 w-full appearance-none bg-transparent pl-2 text-[14px] font-semibold text-black outline-none"
            >
              <option value="high">Sort: highest rated</option>
              <option value="low">Sort: lowest rated</option>
            </select>
          </label>
          <label className="flex items-center gap-2 px-3">
            <SearchIcon width={14} height={14} className="flex-none" />
            <span className="sr-only">Search reviews</span>
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search reviews"
              className="h-10 w-full bg-transparent text-[13px] text-black outline-none placeholder:text-grey-600"
            />
          </label>
        </div>
        {list.length === 0 && (
          <p className="mt-8 text-center text-small text-grey-600">No reviews match “{q}”.</p>
        )}
        <div className="mt-8 flex flex-col gap-5">
          {list.map((r) => (
            <article key={r.name} className={`${HARD_CARD} grid gap-4 p-5 sm:grid-cols-[180px_1fr] sm:p-6`}>
              <div className="text-small">
                <p className="flex items-center gap-2 font-medium text-black">
                  <UserIcon width={15} height={15} />
                  {r.name}
                </p>
                <p className="mt-1 flex items-center gap-1.5 text-[12px] text-grey-700">
                  <CheckCircleIcon width={13} height={13} />
                  Verified buyer
                </p>
              </div>
              <div>
                <Rating value={r.stars} size={17} />
                <h3 className="mt-2 text-[17px] font-semibold text-black">{r.product}</h3>
                <p className="mt-2 text-[15px] leading-relaxed text-grey-700">“{r.quote}”</p>
              </div>
            </article>
          ))}
        </div>
        <div className="mt-8 flex justify-center">
          <Link href="/reviews" className="link-micro">
            Read all reviews
          </Link>
        </div>
      </div>
    </section>
  );
}

/* ---- story blocks ------------------------------------------------------ */
type StoryBlock = {
  title: string;
  body: string[];
  img: string;
  cover: boolean;
  contain?: boolean;
  aspect?: string;
  width?: string;
};

function storiesFor(p: Product): StoryBlock[] {
  const own = PRODUCT_CONTENT[p.slug]?.stories;
  if (own) {
    const imgs = p.storyImgs
      ? p.storyImgs.map(({ src, fit = "cover", aspect, width }) => ({
          img: src,
          cover: fit === "cover",
          contain: fit === "contain",
          aspect,
          width,
        }))
      : [
          { img: p.cardImg ?? p.img, cover: !!p.cardImg },
          { img: p.hoverImg ?? p.gallery?.[0] ?? p.img, cover: !!p.hoverImg || isPhoto(p.gallery?.[0] ?? "") },
          { img: p.img, cover: false },
        ];
    return own.map((st, i) => ({ ...st, ...imgs[i] }));
  }
  const j = p.janoshik;
  const headline = j?.purity
    ? `The latest batch measured ${j.purity} purity.`
    : j?.rows[0]
      ? `The latest batch measured ${j.rows[0].verified} of ${j.rows[0].compound} per device.`
      : "Its report is published the day the batch is released.";
  return [
    {
      title: "Measured, not estimated.",
      body: [
        `Every ${p.name} batch goes to Janoshik Analytical before it is listed — an independent lab, not an in-house test.`,
        `${headline} The batch code, the measured content and a public verification link are on this page.`,
      ],
      img: p.cardImg ?? p.img,
      cover: !!p.cardImg,
    },
    {
      title: "Sealed the moment it is filled.",
      body: [
        "Each pen is filled, sealed and tamper-evidenced in one controlled pass. No decanting, no repackaging, no guesswork.",
        "The batch code printed on the device matches the report, so a result can be traced from the lab to your bench.",
      ],
      img: p.hoverImg ?? p.img,
      cover: !!p.hoverImg,
    },
    {
      title: "Cold from our shelf to your bench.",
      body: [
        "Reference material is stored at 2–8°C and shipped insulated and temperature-controlled, dispatched within one business day.",
        "Stability is a handling problem long before it is a chemistry problem — so the cold chain is part of the product.",
      ],
      img: p.img,
      cover: false,
    },
  ];
}

/* ---- facts beside each story: real product data, different per block --
   Each block owns its own four facts and never repeats one from another
   block, so the three tile rows stay worth reading as you scroll. */
function storyFacts(p: Product, i: number): { k: string; v: string }[] {
  const j = p.janoshik;
  const compounds = Object.keys(PRODUCT_CONTENT[p.slug]?.compounds ?? {});
  if (i === 0) {
    return j
      ? [
          { k: j.purity ? "Purity" : "Compounds", v: j.purity ?? `${j.rows.length} measured` },
          { k: "Batch", v: j.batch },
          ...j.rows.slice(0, 2).map((r) => ({ k: r.compound, v: r.verified })),
          // Single-compound reports leave a gap in the 2×2 grid; fill it.
          { k: "Fill volume", v: j.fillVolume },
        ].slice(0, 4)
      : [
          { k: "Research focus", v: p.tags?.join(" · ") || p.category },
          { k: "Category", v: p.category },
          { k: "Compound", v: compounds.join(" · ") || p.name },
          { k: "Testing", v: "Independent, Janoshik" },
        ];
  }
  if (i === 1) {
    return [
      { k: "Format", v: "Pre-filled research pen" },
      { k: "Reconstitution", v: "Not required" },
      { k: "Fill volume", v: j?.fillVolume ?? "Fixed, sealed" },
      { k: "Seal", v: "Tamper-evident" },
    ];
  }
  return [
    { k: "Storage", v: "2–8°C, do not freeze" },
    { k: "Shipping", v: "Insulated cold chain" },
    { k: "Dispatch", v: "Within 1 business day" },
    { k: "Paperwork", v: j ? `Batch ${j.batch}` : "Batch-coded" },
  ];
}

/* ---- key compound card ------------------------------------------------- */
function CompoundCard({ row, product }: { row: JanoshikRow; product: Product }) {
  const [more, setMore] = useState(false);
  const info = PRODUCT_CONTENT[product.slug]?.compounds[row.compound];
  return (
    <article className={`${HARD_CARD} w-full max-w-[560px] p-7 sm:p-8`}>
      <h3 className="text-[20px] font-medium text-black">{row.compound}</h3>
      {info && <p className="mt-1 text-[12px] font-semibold uppercase tracking-label text-grey-600">{info.label}</p>}
      {info && <p className="mt-3 text-small leading-relaxed text-black">{info.note}</p>}
      {more &&
        (row.verified ? (
          <p className="mt-2 text-small leading-relaxed text-grey-700">
            Measured by Janoshik Analytical at <strong className="font-semibold text-black">{row.concentration}</strong>,
            for <strong className="font-semibold text-black">{row.verified}</strong> verified per device. Batch{" "}
            {product.janoshik?.batch} · {product.janoshik?.fillVolume} fill.
          </p>
        ) : (
          <p className="mt-2 text-small leading-relaxed text-grey-700">
            The independent Janoshik report for this batch is published on this page when it is released.
          </p>
        ))}
      <button
        type="button"
        onClick={() => setMore((v) => !v)}
        aria-expanded={more}
        className="mt-3 inline-flex items-center gap-1 text-[12px] font-medium text-black"
      >
        {more ? "Show less" : "Show more"}
        <ChevronRightIcon width={12} height={12} className={more ? "-rotate-90" : "rotate-90"} />
      </button>
      <div className="mt-6 flex justify-center gap-10 text-center text-[12px] font-medium text-black">
        {[
          { Icon: BeakerIcon, label: "Independently assayed" },
          { Icon: ShieldIcon, label: "Sealed fill" },
          { Icon: TruckIcon, label: "Cold-chain handled" },
        ].map(({ Icon, label }) => (
          <span key={label} className="flex w-[84px] flex-col items-center gap-2">
            <Icon width={30} height={30} strokeWidth={1.3} />
            {label}
          </span>
        ))}
      </div>
    </article>
  );
}
