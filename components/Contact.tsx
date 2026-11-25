"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useReveal } from "./useReveal";
import { useToast } from "@/components/Toast";
import { MailIcon, ClockIcon, DocIcon, ArrowRightLong } from "./icons";

/**
 * Two reference archetypes stacked:
 *
 *  1. the "free from" split — rounded image left, sentence-case heading right
 *     over a struck-through list of excluded substances,
 *  2. the contact split — copy and info rows left, a bordered form card right.
 *
 * The form's behaviour is unchanged from before this restyle: it composes a
 * mailto: and hands off to the user's mail client. No network call is made.
 */

const FREE_FROM = [
  "Unverified raw material",
  "Undisclosed excipients",
  "Repackaged bulk powder",
  "Ambient-temperature transit",
  "Batch codes that lead nowhere",
  "Certificates you cannot check",
];

const INFO = [
  {
    Icon: MailIcon,
    title: "Email",
    body: "sales@peptivalabs.com",
    href: "mailto:sales@peptivalabs.com",
  },
  {
    Icon: ClockIcon,
    title: "Response time",
    body: "Within 1 business day, Mon–Fri",
  },
  {
    Icon: DocIcon,
    title: "Already ordered?",
    body: "Track an existing shipment",
    href: "/track-order",
  },
];

/**
 * Reference: image 590×464 (r40) inset ~88px inside the content column, copy
 * column 480px wide with a 40/60 heading and a 25/40 light paragraph that ends
 * on a bold clause, then a centred 260×52 "Shop Now" below the split.
 */
export function FreeFrom() {
  const scope = useReveal<HTMLDivElement>();
  return (
    <section className="bg-white">
      <div ref={scope} className="shell">
        <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,590px)_minmax(0,480px)] lg:justify-center lg:gap-12 xl:gap-[90px]">
          <div
            data-reveal
            className="relative aspect-[590/464] overflow-hidden rounded-[30px] bg-grad-routine lg:rounded-[40px]"
          >
            <Image
              src="/new-images/trusted.png"
              alt="Sealed reference material prepared for analysis"
              fill
              sizes="(min-width: 1024px) 45vw, 100vw"
              className="object-cover"
            />
          </div>

          <div data-reveal>
            <h2 className="heading-editorial">
              Peptiva Labs: fully-disclosed formulations
            </h2>

            <p className="mt-4 text-[clamp(18px,1.75vw,25px)] font-light leading-[1.6] text-black">
              {FREE_FROM.join(", ")} will{" "}
              <strong className="font-medium">never be part of our orders</strong>.
            </p>
          </div>
        </div>

        <div data-reveal className="mt-14 flex justify-center">
          <Link
            href="/products"
            className="inline-flex h-[52px] w-[260px] items-center justify-center rounded-md bg-black text-base text-white transition-opacity duration-fast hover:opacity-85"
          >
            Shop now
          </Link>
        </div>
      </div>
    </section>
  );
}

export default function Contact() {
  const scope = useReveal<HTMLDivElement>();
  const toast = useToast();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [website, setWebsite] = useState(""); // honeypot
  const [busy, setBusy] = useState(false);

  function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (busy || website) return;
    if (!name.trim() || !email.trim() || !message.trim()) return;

    setBusy(true);
    const subject = `Website enquiry from ${name.trim()}`;
    const body = `${message.trim()}\n\n— ${name.trim()} (${email.trim()})`;
    const mailto = `mailto:sales@peptivalabs.com?subject=${encodeURIComponent(
      subject
    )}&body=${encodeURIComponent(body)}`;

    window.location.href = mailto;
    toast.success(
      "Your email app should open with the message ready to send.",
      "Almost there"
    );
    setBusy(false);
  }

  return (
    <div ref={scope}>
      <section id="contact" className="section bg-white">
        <div className="shell">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-16">
            {/* ---- copy + info ------------------------------------- */}
            <div data-reveal>
              <p className="eyebrow">Get in touch</p>
              <h2 className="heading-editorial mt-4 max-w-[16ch]">
                Questions for Peptiva Labs about a batch or order?
              </h2>
              <p className="mt-5 max-w-prose lead">
                A real person reads every message — no ticket queue, no bots.
                Reach out about lab reports, bulk research orders, or anything
                else and we&rsquo;ll get back to you fast.
              </p>

              <ul className="mt-10 space-y-3">
                {INFO.map(({ Icon, title, body, href }) => {
                  const content = (
                    <>
                      <span className="inline-flex h-11 w-11 flex-none items-center justify-center rounded-full bg-sand-100 text-black">
                        <Icon width={18} height={18} />
                      </span>
                      <span>
                        <span className="block text-base font-medium text-black">
                          {title}
                        </span>
                        <span className="block text-small text-grey-700">
                          {body}
                        </span>
                      </span>
                    </>
                  );
                  const rowClass =
                    "flex items-center gap-4 rounded-lg border border-grey-200 bg-white p-4 transition-colors duration-fast ease-standard";

                  if (!href) {
                    return (
                      <li key={title} className={rowClass}>
                        {content}
                      </li>
                    );
                  }
                  const isExternal = href.startsWith("mailto:");
                  return (
                    <li key={title}>
                      {isExternal ? (
                        <a href={href} className={`${rowClass} hover:border-black`}>
                          {content}
                        </a>
                      ) : (
                        <Link href={href} className={`${rowClass} hover:border-black`}>
                          {content}
                        </Link>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>

            {/* ---- form -------------------------------------------- */}
            <div data-reveal className="rounded-lg border border-grey-200 bg-white p-6 sm:p-8">
              <h3 className="text-h3 font-normal text-black">Send a message</h3>
              <p className="mt-2 text-small text-grey-700">
                Fill this in and your email app will open with everything
                pre-filled — just hit send.
              </p>

              <form onSubmit={submit} className="mt-7 space-y-5">
                <div>
                  <label htmlFor="contact-name" className="field-label">
                    Name
                  </label>
                  <input
                    id="contact-name"
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Jane Doe"
                    className="field"
                  />
                </div>

                <div>
                  <label htmlFor="contact-email" className="field-label">
                    Email
                  </label>
                  <input
                    id="contact-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@lab.com"
                    className="field"
                  />
                </div>

                <div>
                  <label htmlFor="contact-message" className="field-label">
                    Message
                  </label>
                  <textarea
                    id="contact-message"
                    required
                    rows={4}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="How can we help?"
                    className="field"
                  />
                </div>

                {/* honeypot */}
                <input
                  type="text"
                  name="website"
                  tabIndex={-1}
                  autoComplete="off"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  className="absolute -left-[9999px] h-0 w-0 opacity-0"
                  aria-hidden
                />

                <button type="submit" disabled={busy} className="btn-primary btn-block">
                  Send message
                  <ArrowRightLong width={18} height={18} />
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
