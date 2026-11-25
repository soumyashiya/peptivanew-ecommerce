"use client";

import Image from "next/image";
import Link from "next/link";
import { ChevronRightIcon } from "./icons";
import { useReveal } from "./useReveal";
import CountUp from "./CountUp";

/**
 * Social-proof stats — measured off the reference's "home-modal" block at
 * 1902px:
 *   - 40/56 bold all-caps heading, two lines, 30px above the cards
 *   - two 420px columns, 54px apart; inside each, a 380 × 235 white card
 *     (20px radius, shadow 0 13px 26px rgba(0,0,0,.1)) sitting 60px below
 *     the top of a 335 × 295 cut-out photo, so the subject breaks out of the
 *     card's top edge
 *   - a 16px stat link with a chevron 24px under each card
 *   - a 260 × 52 black "Shop now" button (10px radius) 45px below
 */

const CARDS = [
  {
    value: "1,800+",
    label: "Assays on file",
    img: "/new-images/review1-cut.webp",
    href: "/science",
  },
  {
    value: "1,600+",
    label: "Customer reviews",
    img: "/new-images/review2.webp",
    href: "/reviews",
  },
];

export default function Features() {
  const scope = useReveal<HTMLDivElement>();

  return (
    <section className="section bg-white">
      <div ref={scope} className="shell">
        <h2
          data-reveal
          className="mx-auto max-w-[24ch] text-center text-[clamp(28px,3.2vw,40px)] font-bold uppercase leading-[1.4] tracking-[0.025em] text-black"
        >
          Peptiva Labs, tested and trusted by researchers
        </h2>

        <div
          data-reveal
          className="mx-auto mt-[30px] grid max-w-[894px] grid-cols-1 justify-items-center gap-12 sm:grid-cols-2 sm:gap-[54px]"
        >
          {CARDS.map((c) => (
            <div key={c.label} className="flex w-full max-w-[380px] flex-col items-center">
              {/* 295px block: card fills its lower 235px, photo the whole height. */}
              <div className="relative h-[255px] w-full sm:h-[295px]">
                <div className="absolute inset-x-0 bottom-0 top-[50px] rounded-[20px] bg-white shadow-[0_13px_26px_rgba(0,0,0,0.1)] sm:top-[60px]" />
                <div className="absolute bottom-0 left-1/2 h-full w-full -translate-x-1/2 overflow-hidden rounded-b-[20px]">
                  <Image
                    src={c.img}
                    alt=""
                    fill
                    unoptimized
                    className="object-contain object-bottom"
                  />
                </div>
              </div>

              <Link
                href={c.href}
                className="group mt-6 inline-flex items-center gap-1.5 text-base text-black"
              >
                <span className="font-semibold">
                  <CountUp value={c.value} /> {c.label}
                </span>
                <ChevronRightIcon
                  width={18}
                  height={18}
                  className="ml-3 transition-transform duration-fast ease-standard group-hover:translate-x-1"
                />
              </Link>
            </div>
          ))}
        </div>

        <div data-reveal className="mt-[45px] flex justify-center">
          <Link
            href="/products"
            className="inline-flex h-[52px] w-[260px] items-center justify-center rounded-[10px] bg-black text-base text-white transition-opacity duration-fast hover:opacity-85"
          >
            Shop now
          </Link>
        </div>
      </div>
    </section>
  );
}
