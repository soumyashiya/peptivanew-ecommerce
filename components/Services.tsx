"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { ChevronLeftIcon, ChevronRightIcon } from "./icons";
import { useReveal } from "./useReveal";

/**
 * "Why it works" split block.
 *
 * Reference archetype: a centred all-caps heading, then a full-bleed washed
 * band split in two — a rounded image on the left, a large sentence-case
 * heading plus body copy on the right. The pair cross-fades through a short
 * set of slides, driven by a hairline progress track and two circular arrows
 * sitting under the copy.
 */

const SLIDES = [
  {
    title: "Ingredients that survive the assay",
    body: "Every batch is submitted to an independent laboratory before it is listed. We publish the certificate, the batch code and the verification link — not a marketing claim.",
    img: "/new-images/trusted1.png",
    zoom: 1.2,
    wash: "bg-grad-wash",
  },
  {
    title: "Sealed the moment it is filled",
    body: "Devices are filled, sealed and tamper-evidenced in one controlled pass, so what reaches your bench is exactly what the certificate describes.",
    img: "/new-images/trusted2.png",
    wash: "bg-goal-bones",
  },
  {
    title: "Cold from our shelf to yours",
    body: "Reference material is stored at 2–8°C and shipped in insulated, temperature-controlled packaging. Stability is a handling problem long before it is a chemistry problem.",
    img: "/new-images/sealed.png",
    focus: "50% 30%",
    wash: "bg-goal-skin",
  },
];

const AUTOPLAY_MS = 7000;

export default function Services() {
  const scope = useReveal<HTMLDivElement>();
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  const go = useCallback(
    (dir: 1 | -1) =>
      setIndex((i) => (i + dir + SLIDES.length) % SLIDES.length),
    []
  );

  useEffect(() => {
    if (paused) return;
    const id = window.setInterval(() => go(1), AUTOPLAY_MS);
    return () => window.clearInterval(id);
  }, [paused, go]);

  const slide = SLIDES[index];

  return (
    <section id="why" className="section bg-white pt-0">
      <div ref={scope}>
        <div className="shell">
          <h2 data-reveal className="heading-caps">
            Why Peptiva Labs compounds hold up
          </h2>
        </div>

        <div
          data-reveal
          className="transition-colors duration-base ease-standard"
          style={{
            background:
              "linear-gradient(0deg, #FFFFFF 0%, #EBF8FC 45%, #F2E4FB 78%, #FFFFFF 100%)",
          }}
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          <div className="shell py-10">
            <div className="grid items-center gap-8 lg:grid-cols-[590px_1fr] lg:gap-[100px]">
              {/* ---- media ------------------------------------------- */}
              <div className="relative aspect-[590/640] overflow-hidden rounded-[30px] lg:rounded-[40px]">
                {SLIDES.map((s, i) => (
                  <Image
                    key={s.title}
                    src={s.img}
                    alt={i === index ? s.title : ""}
                    fill
                    sizes="(min-width: 1024px) 45vw, 100vw"
                    aria-hidden={i !== index}
                    style={{
                      ...((s as { zoom?: number }).zoom ? { transform: `scale(${(s as { zoom?: number }).zoom})` } : {}),
                      ...((s as { focus?: string }).focus ? { objectPosition: (s as { focus?: string }).focus } : {}),
                    }}
                    className={`object-cover transition-opacity duration-base ease-standard ${
                      i === index ? "opacity-100" : "opacity-0"
                    }`}
                  />
                ))}
              </div>

              {/* ---- copy -------------------------------------------- */}
              <div>
                <div key={index} className="animate-fade-in">
                  <h3 className="heading-editorial max-w-[515px]">
                    {slide.title}
                  </h3>
                  <p className="mt-6 max-w-[515px] lead font-light">
                    {slide.body}
                  </p>
                </div>

                <div className="mt-12 flex items-center gap-[46px]">
                  <div className="rail-progress max-w-[250px] flex-1" aria-hidden>
                    <span
                      style={{
                        width: `${100 / SLIDES.length}%`,
                        transform: `translateX(${index * 100}%)`,
                      }}
                    />
                  </div>
                  <div className="flex items-center gap-[18px]">
                    <button
                      type="button"
                      onClick={() => go(-1)}
                      aria-label="Previous"
                      className="btn-round h-[50px] w-[50px] bg-[rgba(27,27,27,0.55)]"
                    >
                      <ChevronLeftIcon />
                    </button>
                    <button
                      type="button"
                      onClick={() => go(1)}
                      aria-label="Next"
                      className="btn-round h-[50px] w-[50px] bg-[rgba(27,27,27,0.55)]"
                    >
                      <ChevronRightIcon />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
