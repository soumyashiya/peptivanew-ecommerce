"use client";

import { useRef, useState } from "react";
import { useReveal } from "./useReveal";

/**
 * "Loved by our community" — heading left, a clipped window of portrait
 * cards drifting continuously to its right, each with a caption and a
 * heart / comment / share stack. Shared by the home page and the product
 * detail page.
 *
 * The cards are 9:16 clips, and nothing autoplays: each sits on its poster
 * frame with `preload="none"` until it is clicked, so the page costs six
 * small JPEGs rather than ~57MB of video. One clip plays at a time.
 */

const STRIP = [
  // `at` is the second each poster was taken from, so every card rests on
  // a different moment and the clip starts playing from that same frame.
  { video: "/videos/morning-routine.mp4", caption: "Morning routine", at: 24.6 },
  { video: "/videos/evening-kitchen.mp4", caption: "Evening wind-down", at: 13.3 },
  { video: "/videos/climbing-gym.mp4", caption: "Gym session", at: 24.6 },
  { video: "/videos/beach-towel.mp4", caption: "Midday beach", at: 7.6 },
  { video: "/videos/park-walk.mp4", caption: "Park walk", at: 6.3 },
  { video: "/videos/cabin-porch.mp4", caption: "Cabin porch", at: 18 },
];

const posterFor = (video: string) =>
  video.replace("/videos/", "/videos/posters/").replace(".mp4", ".jpg");

export default function CommunityStrip({
  title = "Loved by the Peptiva Labs",
  background = "bg-white",
  sentenceCase = false,
}: {
  title?: string;
  /** Section background; pass "bg-transparent" to sit on a page wash. */
  background?: string;
  /** Reference product-page style: sentence-case, centred heading. */
  sentenceCase?: boolean;
}) {
  const scope = useReveal<HTMLDivElement>();
  const videos = useRef<(HTMLVideoElement | null)[]>([]);
  const [playing, setPlaying] = useState<number | null>(null);

  /** Play the clicked clip, stopping whichever one was already running. */
  const toggle = (slot: number) => {
    const el = videos.current[slot];
    if (!el) return;
    // First play: begin at the poster's moment rather than at 0.
    if (el.dataset.started !== "1") {
      el.dataset.started = "1";
      const at = STRIP[slot % STRIP.length].at;
      const seek = () => {
        el.currentTime = at;
      };
      if (el.readyState >= 1) seek();
      else el.addEventListener("loadedmetadata", seek, { once: true });
    }
    if (playing !== null && playing !== slot) videos.current[playing]?.pause();
    if (el.paused) {
      void el.play().catch(() => {});
      setPlaying(slot);
    } else {
      el.pause();
      setPlaying(null);
    }
  };

  return (
    <div ref={scope}>
    <section className={`overflow-hidden ${background}`}>
      <div className="shell grid items-center gap-8 lg:grid-cols-[355px_minmax(0,1045px)] lg:justify-between lg:gap-0">
        <h2
          data-reveal
          className={sentenceCase
            ? "text-center text-[clamp(28px,2.4vw,36px)] font-medium leading-[1.4] text-black"
            : "text-h2 font-bold uppercase leading-[1.4] tracking-caps text-black"}
        >
          {title}
          <br />
          community
        </h2>

        <div data-reveal className="group/strip -mx-4 overflow-hidden lg:mx-0">
          {/* The drift also freezes while a clip plays — otherwise the card
              you are watching slides out from under you. */}
          <div
            className={`marquee-track animate-marquee group-hover/strip:[animation-play-state:paused] motion-reduce:animate-none ${
              playing !== null ? "[animation-play-state:paused]" : ""
            }`}
          >
            {[0, 1].map((dup) => (
              <ul
                key={dup}
                aria-hidden={dup === 1}
                className="flex shrink-0 gap-5 pr-5"
              >
                {STRIP.map((s, i) => {
                  const slot = dup * STRIP.length + i;
                  return (
                  <li
                    key={s.video}
                    className="relative h-[340px] w-[190px] flex-none overflow-hidden rounded-[15px] bg-black sm:h-[420px] sm:w-[235px]"
                  >
                    <video
                      ref={(el) => {
                        videos.current[slot] = el;
                      }}
                      src={s.video}
                      poster={`${posterFor(s.video)}?v=6`}
                      aria-hidden
                      muted
                      loop
                      playsInline
                      preload="none"
                      tabIndex={-1}
                      className="absolute inset-0 h-full w-full object-cover"
                    />
                    <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/45 to-transparent" />

                    {/* reaction stack */}
                    <div className="absolute bottom-[26px] right-[14px] flex flex-col items-center gap-[10px] text-white">
                      <svg width="24" height="22" viewBox="0 0 24 22" aria-hidden className="text-[#FF5A7A]">
                        <path fill="currentColor" d="M12 21.3 10.3 19.8C4.4 14.4.5 10.9.5 6.6.5 3.1 3.2.5 6.6.5c1.9 0 3.8.9 5.4 2.4C13.6 1.4 15.5.5 17.4.5c3.4 0 6.1 2.6 6.1 6.1 0 4.3-3.9 7.8-9.8 13.2L12 21.3Z" />
                      </svg>
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden>
                        <path d="M12 3c5 0 9 3.6 9 8s-4 8-9 8c-1.2 0-2.3-.2-3.4-.5L4 20l1.3-3.6C3.9 15 3 13.1 3 11c0-4.4 4-8 9-8Z" strokeLinejoin="round" />
                        <circle cx="8.5" cy="11" r=".9" fill="currentColor" stroke="none" />
                        <circle cx="12" cy="11" r=".9" fill="currentColor" stroke="none" />
                        <circle cx="15.5" cy="11" r=".9" fill="currentColor" stroke="none" />
                      </svg>
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden>
                        <path d="M21 3 10 14M21 3l-7 18-4-7-7-4 18-7Z" strokeLinejoin="round" />
                      </svg>
                    </div>

                    <p className="absolute bottom-[19px] left-[15px] text-[14px] font-bold leading-[30px] text-white">
                      {s.caption}
                    </p>

                    {/* Covers the card so the whole tile is the hit target,
                        and keeps play reachable by keyboard. The duplicate
                        track is decorative, so it stays out of the tab order. */}
                    <button
                      type="button"
                      onClick={() => toggle(slot)}
                      aria-label={`${playing === slot ? "Pause" : "Play"} ${s.caption}`}
                      aria-hidden={dup === 1 || undefined}
                      tabIndex={dup === 1 ? -1 : 0}
                      className="absolute inset-0 flex items-center justify-center rounded-[15px] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-3px] focus-visible:outline-white"
                    >
                      <span className="grid h-[52px] w-[52px] place-items-center rounded-full bg-black/40 text-white backdrop-blur-sm transition-colors duration-fast hover:bg-black/60">
                        {playing === slot ? (
                          <svg width="16" height="18" viewBox="0 0 16 18" aria-hidden>
                            <path fill="currentColor" d="M1 0h4.2v18H1zM10.8 0H15v18h-4.2z" />
                          </svg>
                        ) : (
                          <svg width="17" height="19" viewBox="0 0 18 20" aria-hidden className="ml-[3px]">
                            <path fill="currentColor" d="M17 8.27 3.5.46A2 2 0 0 0 .5 2.19v15.62a2 2 0 0 0 3 1.73L17 11.73a2 2 0 0 0 0-3.46Z" />
                          </svg>
                        )}
                      </span>
                    </button>
                  </li>
                  );
                })}
              </ul>
            ))}
          </div>
        </div>
      </div>
    </section>
    </div>
  );
}
