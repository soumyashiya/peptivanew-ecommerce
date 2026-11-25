"use client";

import Image from "next/image";
import Link from "next/link";
import { useReveal } from "./useReveal";

/**
 * Promo block + trust marks.
 *
 * Reference archetype: a rounded washed panel with a cut-out photograph
 * bleeding off the left edge and the offer set right — bold all-caps heading,
 * one supporting line, one black pill CTA. Beneath it, a row of three
 * equal tinted tiles carrying certification marks.
 */

const MARKS = [
  {
    title: "Third-party assayed",
    detail: "Janoshik Analytical",
    img: "/images/verify-seo.webp",
  },
  {
    title: "Sealed & tamper-evident",
    detail: "Filled under control",
    img: "/images/source-seo.webp",
  },
  {
    title: "Cold-chain shipping",
    detail: "2–8°C, insulated",
    img: "/images/ship-seo.webp",
  },
];

export default function CTA() {
  const scope = useReveal<HTMLDivElement>();

  return (
    <section className="bg-white">
      <div ref={scope} className="shell">
        {/* ---- promo panel ------------------------------------------
            Reference geometry: 500px tall, 30px radius, lavender→sand wash.
            The cut-out artwork sits in the left half and is cropped by the
            panel's bottom edge; copy starts at the panel's midline with a
            40/56 bold caps heading, a 25/40 line and a 260×52 button. */}
        <div
          data-reveal
          className="relative overflow-hidden rounded-[30px] bg-[linear-gradient(180deg,#F1E6FD_0%,#F9F1F6_100%)]"
        >
          {/* save.png: the subject with two kits on the left, plain wash on the
              right — laid across the whole panel, copy on the plain side. */}
          <div className="relative aspect-[1600/592] w-full lg:absolute lg:inset-0 lg:aspect-auto">
            <Image
              src="/new-images/save.png"
              alt="Researcher holding two Peptiva kits"
              fill
              unoptimized
              className="origin-bottom-left scale-[0.9] object-cover object-left [mask-image:linear-gradient(to_left,transparent_0%,#000_10%),linear-gradient(to_bottom,transparent_0%,#000_10%)] [mask-composite:intersect] [-webkit-mask-composite:source-in]"
            />
          </div>
          <div className="relative grid lg:h-[500px] lg:grid-cols-2">
            <div className="flex flex-col justify-center px-6 pb-10 pt-8 sm:px-12 lg:col-start-2 lg:py-0 lg:pl-[40px] lg:pr-[60px]">
              <h2 className="max-w-[660px] text-[clamp(26px,3vw,40px)] font-bold uppercase leading-[1.4] tracking-caps text-black">
                Save up to 15% on Peptiva Labs multi&#8209;kit orders
              </h2>
              <p className="mt-5 max-w-[580px] text-[clamp(17px,1.6vw,22px)] leading-[1.8] text-black">
                Researchers pair compounds across a study — volume pricing is
                applied automatically at checkout.
              </p>
              <Link
                href="/products"
                className="mt-8 inline-flex h-[52px] w-[260px] items-center justify-center rounded-md bg-black text-base font-medium text-white transition-opacity duration-fast hover:opacity-85"
              >
                Bundle and save
              </Link>
            </div>
          </div>
        </div>

        {/* ---- certification tiles ----------------------------------- */}
        <div
          data-reveal
          className="mx-auto mt-14 grid max-w-[1060px] grid-cols-1 gap-4 sm:grid-cols-3 sm:gap-6 lg:mt-20 lg:gap-[57px]"
        >
          {MARKS.map((m) => (
            <div
              key={m.title}
              className="flex h-[200px] flex-col items-center justify-center gap-4 rounded-[30px] bg-grad-routine px-6 text-center lg:h-[220px]"
            >
              <span className="relative h-[84px] w-[84px] overflow-hidden rounded-full bg-white">
                <Image src={m.img} alt="" fill sizes="84px" className="object-cover" />
              </span>
              <span>
                <span className="block text-base font-medium text-black">
                  {m.title}
                </span>
                <span className="mt-1 block text-small text-grey-700">
                  {m.detail}
                </span>
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
