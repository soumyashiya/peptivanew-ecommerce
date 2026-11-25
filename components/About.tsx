"use client";

import Image from "next/image";
import Link from "next/link";
import { ChevronRightIcon } from "./icons";
import { useReveal } from "./useReveal";

/**
 * Research-area grid.
 *
 * Reference archetype: a centred all-caps heading over a rounded container
 * washed with a lavender→sand gradient. Inside, a two-column stack of white
 * pill rows — each a circular thumbnail, a label and a chevron — with a
 * cut-out photograph bled against the right edge of the same container.
 */

const AREAS = [
  { label: "Blends", href: "/products?category=blends", img: "/new-images/ALLUVI-Glow.png" },
  { label: "Metabolic", href: "/products?category=metabolic", img: "/new-images/ALLUVI-Tirzepatide.png" },
  { label: "Recovery", href: "/products?category=recovery", img: "/new-images/hover/ALLUVI carton on pastel marble.png" },
  { label: "Skin & hair", href: "/products?category=skin-hair", img: "/new-images/hover/Alluvi Glow pen with chestnut hair sweep.png" },
  { label: "Anti-ageing", href: "/products?category=anti-ageing", img: "/new-images/ALLUVI-NAD-Plus.png" },
  { label: "Energy", href: "/products?category=energy", img: "/new-images/ALLUVI-MOTS-C.png" },
];

export default function About() {
  const scope = useReveal<HTMLDivElement>();

  return (
    <section id="about" className="section bg-white">
      <div ref={scope} className="shell">
        <h2 data-reveal className="heading-caps lg:mb-[50px]">
          Build your Peptiva Labs research protocol
        </h2>

        {/* Measured: 30px radius, and inset further than the shell so the
            gradient panel reads narrower than the heading above it. */}
        {/* The panel's background is a single wide photograph: plain wash on
            the left (behind the pills), the subject on the right. */}
        <div
          data-reveal
          className="relative overflow-hidden rounded-xl bg-grad-routine lg:mx-[27px] lg:bg-[linear-gradient(180deg,#F3EBFD_0%,#F9F4F6_100%)]"
        >
          <Image
            src="/new-images/protocol-bg.png"
            alt=""
            fill
            unoptimized
            className="hidden origin-bottom-right scale-[1.02] object-contain object-right-bottom lg:block"
          />
          {/* Measured: 45px top/bottom, pills 300×75 on a 24px grid starting
              56px in; the photograph fills the right side to the panel edge. */}
          <div className="relative grid items-stretch lg:min-h-[462px] lg:grid-cols-[auto_1fr]">
            <div className="grid grid-cols-1 content-center gap-3 p-5 sm:grid-cols-2 sm:p-10 lg:grid-cols-[300px_300px] lg:gap-6 lg:py-[45px] lg:pl-[56px] lg:pr-0">
              {AREAS.map((a) => (
                <Link
                  key={a.label}
                  href={a.href}
                  className="group flex h-[75px] items-center gap-4 rounded-tile bg-gradient-to-b from-white to-white/40 px-4 py-3 shadow-tile transition-shadow duration-fast ease-standard hover:shadow-nav"
                >
                  <span className="relative h-[54px] w-[54px] flex-none overflow-hidden rounded-full bg-sand-100">
                    <Image
                      src={a.img}
                      alt=""
                      fill
                      sizes="108px"
                      className="object-cover"
                    />
                  </span>
                  <span className="min-w-0 flex-1 truncate text-[17px] font-semibold text-black">
                    {a.label}
                  </span>
                  <ChevronRightIcon className="flex-none text-black transition-transform duration-fast ease-standard group-hover:translate-x-1" />
                </Link>
              ))}
            </div>

            <div aria-hidden className="hidden lg:block" />
          </div>
        </div>
      </div>
    </section>
  );
}
