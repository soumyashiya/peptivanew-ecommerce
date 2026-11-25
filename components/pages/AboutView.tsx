"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { ChevronLeftIcon, ChevronRightIcon } from "../icons";

/**
 * /about — modelled on the reference's "our story" page:
 *   1. an oversized light, all-caps two-line statement in a pastel gradient,
 *   2. a white rounded card slider on a soft pink wash — copy left, photo
 *      right — with circular arrows outside the card and dash pagination,
 *   3. three stacked gradient value words,
 *   4. a split slider: rounded photo left, heading + body right, dashes and
 *      arrows under the copy.
 */

const GRADIENT_TEXT =
  "bg-[linear-gradient(90deg,#EFA4A4_0%,#D9B8C9_45%,#A9D7EE_100%)] bg-clip-text text-transparent";

const STORY = [
  {
    lead: "At Peptiva Labs, we believe research material should be verifiable, consistent and documented end to end.",
    body: [
      "We started Peptiva Labs to cut through a category crowded with unverifiable claims, repackaged powder and certificates nobody can check.",
    ],
    img: "/new-images/about/story-glow-pen.png",
  },
  {
    lead: "Every batch we list has already been tested by an independent laboratory.",
    body: [
      "We publish the batch code, the measured content and a public verification link for every product — so the result is something you can check, not something you have to trust.",
    ],
    img: "/new-images/about/story-nad.png",
  },
  {
    lead: "We supply laboratories and qualified research professionals — nothing else.",
    body: [
      "All Peptiva Labs material is sold strictly for laboratory and analytical research. It is not for human or veterinary use, and we do not make therapeutic claims.",
    ],
    img: "/new-images/about/story-tesamorelin-shelf.png",
  },
];

const PILLARS = [
  {
    title: "Backed by analysis",
    body: "Our standard is simple: if it has not been measured by an independent lab, it is not listed. Every release is assayed by Janoshik Analytical and the report is published alongside the product, with the batch code printed on the device itself.",
    img: "/new-images/about/pillar-lab-scene.png",
  },
  {
    title: "Handled cold",
    body: "Reference material is stored at 2–8°C and shipped in insulated, temperature-controlled packaging. Stability is a handling problem long before it is a chemistry problem, so we treat the cold chain as part of the product.",
    img: "/new-images/about/pillar-glow-orb.png",
  },
  {
    title: "Sealed at the source",
    body: "Devices are filled, sealed and tamper-evidenced in a single controlled pass. No decanting and no repackaging — what reaches your bench is exactly what the certificate describes.",
    img: "/new-images/about/pillar-tirzepatide-plinth.png",
  },
];

function useCycle(length: number, ms: number) {
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  const go = useCallback((d: 1 | -1) => setI((n) => (n + d + length) % length), [length]);
  useEffect(() => {
    if (paused) return;
    const id = window.setInterval(() => go(1), ms);
    return () => window.clearInterval(id);
  }, [paused, go, ms]);
  return { i, setI, go, setPaused };
}

function Dashes({ count, index, onPick }: { count: number; index: number; onPick: (n: number) => void }) {
  return (
    <div className="flex gap-2">
      {Array.from({ length: count }, (_, n) => (
        <button
          key={n}
          type="button"
          aria-label={`Show slide ${n + 1}`}
          aria-current={n === index ? "true" : undefined}
          onClick={() => onPick(n)}
          className="py-2"
        >
          <span className="dash block" data-active={n === index} />
        </button>
      ))}
    </div>
  );
}

const ROUND =
  "inline-flex h-[50px] w-[50px] flex-none items-center justify-center rounded-full bg-black/10 text-black transition-colors hover:bg-black/20";

export default function AboutView() {
  const story = useCycle(STORY.length, 7000);
  const pillar = useCycle(PILLARS.length, 8000);
  const s = STORY[story.i];
  const p = PILLARS[pillar.i];

  return (
    <div className="bg-white pb-24 pt-28 lg:pt-[150px]">
      {/* ---- 1. statement -------------------------------------------- */}
      <section className="mx-auto w-full max-w-[1190px] px-4 lg:px-6">
        <h1
          className={`text-[clamp(30px,4.4vw,66px)] font-light uppercase leading-[1.2] tracking-[0.01em] ${GRADIENT_TEXT}`}
        >
          Peptiva Labs: research that makes sense.
          <br />
          Material that holds up.
        </h1>
      </section>

      {/* ---- 2. story card slider ------------------------------------ */}
      <section
        className="mt-12 py-12 lg:mt-14"
        style={{ background: "linear-gradient(180deg,#FFFFFF 0%,#FDEEF2 45%,#FFFFFF 100%)" }}
        onMouseEnter={() => story.setPaused(true)}
        onMouseLeave={() => story.setPaused(false)}
      >
        <div className="relative mx-auto w-full max-w-[1190px] px-4 lg:px-6">
          <div className="overflow-hidden rounded-[30px] bg-white shadow-tile">
            <div className="grid lg:h-[560px] lg:grid-cols-2">
              <div key={story.i} className="animate-fade-in px-8 py-10 sm:px-12 lg:py-16 lg:pl-[70px] lg:pr-6">
                <p className="text-[clamp(18px,1.6vw,23px)] font-medium leading-[1.75] text-black">
                  {s.lead}
                </p>
                {s.body.map((b) => (
                  <p key={b} className="mt-5 text-[clamp(17px,1.5vw,22px)] leading-[1.75] text-black">
                    {b}
                  </p>
                ))}
              </div>
              <div className="relative h-[320px] lg:h-full">
                {STORY.map((x, n) => (
                  <Image
                    key={x.img}
                    src={x.img}
                    alt=""
                    fill
                    /* The sources are 2:1 but the slot is square, so cover
                       scales them by HEIGHT — roughly twice the slot width has
                       to be fetched or the crop lands on an upscaled image. */
                    sizes="(min-width: 1024px) 1200px, 170vw"
                    quality={90}
                    /* Subject sits hard right with a blank left half meant for
                       copy, so anchor right and the crop takes the empty side. */
                    className={`object-cover object-right transition-opacity duration-base ease-standard ${
                      n === story.i ? "opacity-100" : "opacity-0"
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>

          <button type="button" aria-label="Previous" onClick={() => story.go(-1)} className={`${ROUND} absolute left-0 top-1/2 hidden -translate-x-1/2 -translate-y-1/2 lg:inline-flex`}>
            <ChevronLeftIcon />
          </button>
          <button type="button" aria-label="Next" onClick={() => story.go(1)} className={`${ROUND} absolute right-0 top-1/2 hidden -translate-y-1/2 translate-x-1/2 lg:inline-flex`}>
            <ChevronRightIcon />
          </button>
        </div>
        <div className="mt-6 flex justify-center">
          <Dashes count={STORY.length} index={story.i} onPick={story.setI} />
        </div>
      </section>

      {/* ---- 3. values ----------------------------------------------- */}
      <section className="mx-auto mt-20 w-full max-w-[1190px] px-4 text-center lg:mt-24">
        <p
          className={`inline-block text-left text-[clamp(40px,7.6vw,118px)] font-light uppercase leading-[1.04] ${GRADIENT_TEXT}`}
        >
          Verification
          <br />
          Transparency
          <br />
          Traceability
        </p>
      </section>

      {/* ---- 4. split slider ----------------------------------------- */}
      <section
        className="mx-auto mt-24 w-full max-w-[1190px] px-4 lg:mt-32 lg:px-6"
        onMouseEnter={() => pillar.setPaused(true)}
        onMouseLeave={() => pillar.setPaused(false)}
      >
        <div className="grid items-center gap-10 lg:grid-cols-[595px_1fr] lg:gap-[110px]">
          <div className="relative aspect-square overflow-hidden rounded-[30px]">
            {PILLARS.map((x, n) => (
              <Image
                key={x.img}
                src={x.img}
                alt=""
                fill
                sizes="(min-width: 1024px) 595px, 100vw"
                quality={90}
                className={`object-cover transition-opacity duration-base ease-standard ${
                  n === pillar.i ? "opacity-100" : "opacity-0"
                }`}
              />
            ))}
          </div>
          <div>
            <div key={pillar.i} className="animate-fade-in">
              <h2 className="text-[clamp(22px,2vw,30px)] font-medium text-black">{p.title}</h2>
              <p className="mt-6 text-[clamp(17px,1.5vw,22px)] leading-[1.85] text-black">{p.body}</p>
            </div>
            <div className="mt-10 flex items-center justify-between gap-6">
              <Dashes count={PILLARS.length} index={pillar.i} onPick={pillar.setI} />
              <div className="flex gap-4">
                <button type="button" aria-label="Previous" onClick={() => pillar.go(-1)} className={ROUND}>
                  <ChevronLeftIcon />
                </button>
                <button type="button" aria-label="Next" onClick={() => pillar.go(1)} className={ROUND}>
                  <ChevronRightIcon />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
