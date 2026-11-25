"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, CheckCircleIcon, CloseIcon, ShieldIcon } from "@/components/icons";

/**
 * Site-entry partner modal.
 *
 * States the Alluvi Healthcare reseller relationship once per browsing
 * session — the single piece of context a first-time visitor needs before
 * they read a price. Shown after a short delay so it never competes with
 * the hero's LCP, and recorded in sessionStorage so it cannot nag.
 *
 * Dressed as the reference's promo archetype (see `CTA.tsx`): one 30px
 * rounded panel carrying the lavender -> powder wash, cut-out photography
 * on the left, copy set right over the plain side of the wash. Type,
 * chips and buttons are the hero's — Poppins throughout, a sentence-case
 * headline with an italic accent line, white pill chips, and the 52px
 * black button.
 */

const STORAGE_KEY = "peptiva:partner-modal-seen";
/** Long enough for the hero to paint and settle before anything overlays it. */
const OPEN_DELAY = 1200;
/** Matches the close transition below; keeps the exit from snapping. */
const CLOSE_DURATION = 260;

/** The panel wash, lifted verbatim from the home page's promo block. */
const WASH = "linear-gradient(180deg,#F1E6FD 0%,#F9F1F6 100%)";
/** Sampled off `sealed.png` so the photo's own backdrop meets the panel seamlessly. */
const PHOTO_BG = "#E9E4F6";

const PROOF = [
  { icon: ShieldIcon, label: "Genuine Alluvi batches" },
  { icon: CheckCircleIcon, label: "Janoshik verified" },
];

export default function PartnerModal() {
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const restoreFocusRef = useRef<HTMLElement | null>(null);

  /* ---- open once per session ---------------------------------------- */
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      if (window.sessionStorage.getItem(STORAGE_KEY)) return;
    } catch {
      /* private mode — fall through and show it this once */
    }

    const t = window.setTimeout(() => {
      restoreFocusRef.current =
        document.activeElement instanceof HTMLElement
          ? document.activeElement
          : null;
      setMounted(true);
      try {
        window.sessionStorage.setItem(STORAGE_KEY, "1");
      } catch {
        /* ignore */
      }
    }, OPEN_DELAY);

    return () => window.clearTimeout(t);
  }, []);

  /* Paint the closed state first, then flip to visible so the entrance
     transition actually runs. */
  useEffect(() => {
    if (!mounted) return;
    const id = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(id);
  }, [mounted]);

  const close = useCallback(() => {
    setVisible(false);
    window.setTimeout(() => {
      setMounted(false);
      restoreFocusRef.current?.focus?.();
    }, CLOSE_DURATION);
  }, []);

  /* ---- scroll lock, escape, focus trap ------------------------------- */
  useEffect(() => {
    if (!mounted) return;

    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";
    /* Focus the dialog itself rather than the close button: screen readers
       still announce the dialog and Tab stays trapped inside, but the panel
       does not open with a focus ring drawn around its dismiss control. */
    dialogRef.current?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        close();
        return;
      }
      if (e.key !== "Tab") return;

      const nodes = dialogRef.current?.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
      );
      if (!nodes || nodes.length === 0) return;

      const first = nodes[0];
      const last = nodes[nodes.length - 1];
      /* Focus starts on the dialog itself, which is not in `nodes` — without
         this, the first Shift+Tab would escape to the page behind. */
      if (e.shiftKey && document.activeElement === dialogRef.current) {
        e.preventDefault();
        last.focus();
      } else if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = overflow;
    };
  }, [mounted, close]);

  if (!mounted) return null;

  return (
    <div
      className="fixed inset-0 z-[1200] flex items-end justify-center sm:items-center sm:p-6"
      role="presentation"
    >
      {/* backdrop */}
      <div
        aria-hidden
        onClick={close}
        className={`absolute inset-0 bg-black/45 backdrop-blur-[3px] transition-opacity duration-500 ease-standard ${
          visible ? "opacity-100" : "opacity-0"
        }`}
      />

      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="partner-modal-heading"
        aria-describedby="partner-modal-body"
        tabIndex={-1}
        data-no-focus-ring
        style={{ backgroundImage: WASH }}
        /* 30px radius + soft elevation are the reference's panel values. */
        className={`relative flex max-h-[92svh] w-full max-w-[940px] flex-col overflow-hidden rounded-t-[30px] shadow-soft transition-[opacity,transform] duration-[520ms] ease-out sm:rounded-[30px] ${
          visible
            ? "translate-y-0 opacity-100 sm:scale-100"
            : "translate-y-8 opacity-0 sm:translate-y-0 sm:scale-[0.97]"
        }`}
      >
        <button
          ref={closeRef}
          type="button"
          onClick={close}
          aria-label="Close"
          className="absolute right-4 top-4 z-20 inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/70 text-black transition-colors duration-fast ease-standard hover:bg-white"
        >
          <CloseIcon width={16} height={16} />
        </button>

        {/* Scrolls as one block rather than per-pane: a short landscape phone
            should not strand the actions behind an inner scrollbar. */}
        <div className="grid min-h-0 flex-1 overflow-y-auto md:grid-cols-[0.82fr_1fr]">
          {/* ---- photography --------------------------------------- */}
          {/* `sealed.png` is portrait and already shot on the lavender/powder
              palette this panel is washed in, so it fills the column without
              cropping the pen, and its own backdrop meets `PHOTO_BG` without
              a visible seam — the trick the hero uses for its banners. */}
          <figure
            className="relative m-0 h-[194px] overflow-hidden sm:h-[230px] md:h-auto md:min-h-[460px]"
            style={{ background: PHOTO_BG }}
          >
            <Image
              src="/new-images/sealed.png"
              alt="An Alluvi Healthcare Retatrutide pre-filled research pen, sealed and standing on a marble plinth"
              fill
              sizes="(max-width: 767px) 100vw, 390px"
              /* Phone band lands on the pen's branded label; the desktop
                 column sits higher so the whole pen and plinth read. */
              className="object-cover object-[50%_54%] md:object-[50%_38%]"
            />
            {/* Softens the seam into the copy pane on desktop, and the one
                into the copy below it on phones. */}
            <span
              aria-hidden
              className="absolute inset-x-0 bottom-0 h-11 md:hidden"
              style={{
                background:
                  "linear-gradient(180deg, rgba(241,230,253,0) 0%, rgba(241,230,253,0.9) 100%)",
              }}
            />
            <span
              aria-hidden
              className="absolute inset-y-0 right-0 hidden w-32 md:block"
              style={{
                background:
                  "linear-gradient(90deg, rgba(243,236,251,0) 0%, rgba(243,236,251,0.55) 55%, rgba(244,237,251,0.95) 100%)",
              }}
            />
          </figure>

          {/* ---- copy ---------------------------------------------- */}
          <div className="flex flex-col px-6 pb-[max(24px,env(safe-area-inset-bottom))] pt-6 md:px-10 md:pb-10 md:pt-11">
            {/* The hero's white pill chip, same height and type size. */}
            <p>
              <span className="inline-flex h-[26px] items-center gap-1.5 rounded-pill bg-white px-3 text-[13px] text-grey-700">
                <span className="rounded-[4px] bg-[#3BFFC1] px-1 text-[11px] font-bold leading-[16px] text-black">
                  OFFICIAL
                </span>
                Alluvi Healthcare partner
              </span>
            </p>

            <h2
              id="partner-modal-heading"
              /* Hero headline voice: regular weight, 1.25 leading, italic
                 accent — not the all-caps band heading. */
              className="mt-5 text-[clamp(24px,2.6vw,32px)] font-normal leading-[1.25] text-black md:mt-6"
            >
              Authorised reseller of{" "}
              <em className="font-normal italic">Alluvi</em> biohacking
              products.
            </h2>

            <p
              id="partner-modal-body"
              className="mt-4 max-w-[46ch] text-base leading-[1.75] text-black"
            >
              Every pen on this site is a genuine Alluvi Healthcare kit, supplied
              through our authorised partnership, batch-verified by Janoshik
              Analytical and shipped sealed and cold.
            </p>

            <ul className="mt-5 flex flex-wrap gap-2 md:mt-6">
              {PROOF.map(({ icon: Icon, label }) => (
                <li
                  key={label}
                  className="inline-flex h-[32px] items-center gap-2 rounded-pill bg-white px-3.5 text-[13px] text-grey-700 shadow-tile"
                >
                  <Icon width={14} height={14} className="text-leaf-600" />
                  {label}
                </li>
              ))}
            </ul>

            {/* The reference's 52px black button, with the outlined twin. */}
            <div className="mt-6 flex flex-col gap-2.5 sm:flex-row md:mt-8">
              <Link
                href="/products"
                onClick={close}
                className="inline-flex h-[52px] flex-1 items-center justify-center gap-2 rounded-md bg-black px-6 text-base font-medium text-white transition-opacity duration-fast hover:opacity-85"
              >
                Shop the range
                <ArrowRight width={16} height={16} />
              </Link>
              <Link
                href="/science"
                onClick={close}
                className="inline-flex h-[52px] flex-1 items-center justify-center rounded-md border border-black px-6 text-base font-medium text-black transition-colors duration-fast hover:bg-black/[0.04]"
              >
                How we verify
              </Link>
            </div>

            <p className="mt-5 border-t border-black/10 pt-3.5 text-[11px] uppercase leading-relaxed tracking-label text-grey-700 md:mt-7 md:pt-4">
              For research use only — not for human or veterinary use.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
