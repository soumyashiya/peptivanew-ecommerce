"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useToast } from "../Toast";
import { CONTACT } from "@/lib/seo";
import {
  ArrowRightLong,
  BeakerIcon,
  ClockIcon,
  DocIcon,
  MailIcon,
  PlusIcon,
  TruckIcon,
} from "../icons";

/**
 * /contact — same visual language as the rest of the site: a diagonal
 * pastel wash for the hero, warm #F7F4F1 cards with 20px radius, bordered
 * cards with a hard offset shadow for the FAQ, and black 10px-radius CTAs.
 *
 * Behaviour is unchanged from the home-page form: nothing is posted to a
 * server — submitting composes a mailto: with every field filled in and
 * hands it to the visitor's mail app.
 */

const TOPICS = [
  "Order or delivery",
  "Lab report or batch",
  "Bulk research order",
  "Account or payment",
  "Something else",
] as const;
type Topic = (typeof TOPICS)[number];

const ROUTES: {
  Icon: typeof TruckIcon;
  title: string;
  body: string;
  cta: string;
  href?: string;
  topic?: Topic;
}[] = [
  {
    Icon: TruckIcon,
    title: "Track an order",
    body: "Check where your cold-chain parcel is with your order number.",
    cta: "Track my order",
    href: "/track-order",
  },
  {
    Icon: BeakerIcon,
    title: "Lab reports",
    body: "Every batch has a public Janoshik report and verification link.",
    cta: "View lab results",
    href: "/science",
  },
  {
    Icon: DocIcon,
    title: "Bulk research orders",
    body: "Multi-kit or recurring orders for a study? Tell us what you need.",
    cta: "Ask about bulk",
    topic: "Bulk research order",
  },
];

const FAQ = [
  {
    q: "How quickly will I hear back?",
    a: "Within one business day, Monday to Friday. Messages about an order already in transit are answered first.",
  },
  {
    q: "Where can I find the lab report for my batch?",
    a: "Every product page has a Certificate of analysis section with the batch code, measured content and a public Janoshik verification link. The batch code is also printed on the device.",
  },
  {
    q: "How is my order shipped?",
    a: "Orders are dispatched within one business day in insulated, temperature-controlled (2–8°C) packaging with tracking.",
  },
  {
    q: "Who can order from Peptiva Labs?",
    a: "We supply laboratories and qualified research professionals only. All products are for laboratory research use — not for human or veterinary use.",
  },
];

const HARD_CARD = "border-2 border-black bg-white shadow-[4px_4px_0_#000]";

export default function ContactView() {
  const toast = useToast();
  const [topic, setTopic] = useState<Topic>(TOPICS[0]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [order, setOrder] = useState("");
  const [message, setMessage] = useState("");
  const [website, setWebsite] = useState(""); // honeypot
  const [open, setOpen] = useState<string | null>(null);

  function pickTopic(t: Topic) {
    setTopic(t);
    document.getElementById("contact-form")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (website) return;
    if (!name.trim() || !email.trim() || !message.trim()) return;
    const subject = `${topic} — ${name.trim()}`;
    const lines = [
      message.trim(),
      "",
      `Topic: ${topic}`,
      order.trim() ? `Order number: ${order.trim()}` : "",
      `— ${name.trim()} (${email.trim()})`,
    ].filter(Boolean);
    window.location.href = `mailto:${CONTACT.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(lines.join("\n"))}`;
    toast.success("Your email app should open with the message ready to send.", "Almost there");
  }

  return (
    <div className="bg-white pb-24">
      {/* ---- hero ------------------------------------------------------ */}
      <section
        className="pb-16 pt-28 lg:pb-0 lg:pt-[118px]"
        style={{ background: "linear-gradient(123deg, #E0C3FD 1.7%, #D7ECF9 56.76%, #F2FCFD 100%)" }}
      >
        <div className="mx-auto grid w-full max-w-[1200px] items-end gap-10 px-4 lg:grid-cols-[1fr_440px]">
          <div className="lg:pb-20 lg:pt-10">
            <nav aria-label="Breadcrumb" className="text-small text-grey-700">
              <Link href="/" className="hover:text-black">Home</Link>
              <span className="mx-2">/</span>
              <span className="text-black">Contact</span>
            </nav>
            <h1 className="mt-6 text-[clamp(34px,4vw,58px)] font-normal leading-[1.15] text-black">
              How can we <em className="font-normal italic">help?</em>
            </h1>
            <p className="mt-5 max-w-[520px] text-[clamp(17px,1.5vw,21px)] leading-[1.7] text-black">
              A real person reads every message — no ticket queue, no bots. Ask about an order,
              a batch report or a bulk research order.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href="#contact-form"
                className="inline-flex h-[50px] items-center justify-center gap-2 rounded-[10px] bg-black px-7 text-base font-medium text-white transition-opacity hover:opacity-85"
              >
                Send a message <ArrowRightLong width={18} height={18} />
              </a>
              <a
                href={`mailto:${CONTACT.email}`}
                className="inline-flex h-[50px] items-center justify-center gap-2 rounded-[10px] border border-black bg-white/70 px-7 text-base text-black transition-colors hover:bg-white"
              >
                <MailIcon width={17} height={17} /> {CONTACT.email}
              </a>
            </div>
            <p className="mt-6 inline-flex items-center gap-2 rounded-pill bg-white/80 px-3.5 py-1.5 text-small text-black">
              <span className="h-2 w-2 rounded-full bg-leaf-600" aria-hidden />
              Replies within 1 business day · Mon–Fri
            </p>
          </div>
          <div className="relative hidden h-[460px] lg:block">
            <Image
              src="/new-images/review1-cut.webp"
              alt=""
              fill
              priority
              sizes="440px"
              className="object-contain object-bottom mix-blend-multiply"
            />
          </div>
        </div>
      </section>

      {/* ---- routes ---------------------------------------------------- */}
      <section className="mx-auto -mt-0 w-full max-w-[1200px] px-4 pt-14 lg:pt-16">
        <h2 className="text-center text-[clamp(24px,2.4vw,34px)] font-normal text-black">
          Find the fastest answer from Peptiva Labs
        </h2>
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {ROUTES.map(({ Icon, title, body, cta, href, topic: t }) => (
            <div key={title} className="flex flex-col rounded-[20px] bg-[#F7F4F1] p-7">
              <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-white text-black">
                <Icon width={22} height={22} />
              </span>
              <h3 className="mt-5 text-[20px] font-medium text-black">{title}</h3>
              <p className="mt-2 flex-1 text-small leading-relaxed text-grey-700">{body}</p>
              {href ? (
                <Link
                  href={href}
                  className="mt-6 inline-flex h-[42px] items-center justify-center rounded-[10px] border border-black bg-white text-small text-black transition-colors hover:bg-black hover:text-white"
                >
                  {cta}
                </Link>
              ) : (
                <button
                  type="button"
                  onClick={() => t && pickTopic(t)}
                  className="mt-6 inline-flex h-[42px] items-center justify-center rounded-[10px] border border-black bg-white text-small text-black transition-colors hover:bg-black hover:text-white"
                >
                  {cta}
                </button>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ---- form + details ------------------------------------------- */}
      <section id="contact-form" className="mx-auto mt-20 w-full max-w-[1200px] scroll-mt-28 px-4">
        <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
          <div className={`${HARD_CARD} rounded-[20px] p-6 sm:p-10`}>
            <h2 className="text-[clamp(24px,2.2vw,32px)] font-normal text-black">Send us a message</h2>
            <p className="mt-2 text-small text-grey-700">
              Fill this in and your email app opens with everything pre-filled — just press send.
            </p>

            <fieldset className="mt-7">
              <legend className="field-label">What is it about?</legend>
              <div className="mt-2 flex flex-wrap gap-2">
                {TOPICS.map((t) => (
                  <button
                    key={t}
                    type="button"
                    aria-pressed={topic === t}
                    onClick={() => setTopic(t)}
                    className={`rounded-pill border px-4 py-2 text-small transition-colors ${
                      topic === t ? "border-black bg-black text-white" : "border-grey-300 bg-white text-black hover:border-black"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </fieldset>

            <form onSubmit={submit} className="mt-7 grid gap-5 sm:grid-cols-2">
              <div>
                <label htmlFor="c-name" className="field-label">Name</label>
                <input id="c-name" required value={name} onChange={(e) => setName(e.target.value)} placeholder="Jane Doe" className="field" />
              </div>
              <div>
                <label htmlFor="c-email" className="field-label">Email</label>
                <input id="c-email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@lab.com" className="field" />
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="c-order" className="field-label">
                  Order number <span className="font-normal text-grey-600">(optional)</span>
                </label>
                <input id="c-order" value={order} onChange={(e) => setOrder(e.target.value)} placeholder="e.g. PV-10482" className="field" />
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="c-msg" className="field-label">Message</label>
                <textarea id="c-msg" required rows={5} value={message} onChange={(e) => setMessage(e.target.value)} placeholder="How can we help?" className="field" />
              </div>
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
              <button
                type="submit"
                className="inline-flex h-[52px] items-center justify-center gap-2 rounded-[10px] bg-black text-base font-medium text-white transition-opacity hover:opacity-85 sm:col-span-2"
              >
                Send message <ArrowRightLong width={18} height={18} />
              </button>
            </form>
          </div>

          <aside className="flex flex-col gap-5">
            <div className="rounded-[20px] bg-[#F7F4F1] p-7">
              <h3 className="text-[18px] font-medium text-black">Contact details</h3>
              <ul className="mt-5 space-y-5 text-small">
                <li className="flex gap-3">
                  <MailIcon width={18} height={18} className="mt-0.5 flex-none" />
                  <span>
                    <span className="block font-medium text-black">Email</span>
                    <a href={`mailto:${CONTACT.email}`} className="text-grey-700 underline underline-offset-2 hover:text-black">
                      {CONTACT.email}
                    </a>
                  </span>
                </li>
                <li className="flex gap-3">
                  <ClockIcon width={18} height={18} className="mt-0.5 flex-none" />
                  <span>
                    <span className="block font-medium text-black">Response time</span>
                    <span className="text-grey-700">Within 1 business day, Mon–Fri</span>
                  </span>
                </li>
                <li className="flex gap-3">
                  <TruckIcon width={18} height={18} className="mt-0.5 flex-none" />
                  <span>
                    <span className="block font-medium text-black">Already ordered?</span>
                    <Link href="/track-order" className="text-grey-700 underline underline-offset-2 hover:text-black">
                      Track an existing shipment
                    </Link>
                  </span>
                </li>
              </ul>
            </div>
            <div
              className="relative flex-1 overflow-hidden rounded-[20px] p-7"
              style={{ background: "linear-gradient(180deg, #F8F5F2 0%, #F7F0FF 100%)" }}
            >
              <h3 className="text-[18px] font-medium text-black">Research use only</h3>
              <p className="mt-3 text-small leading-relaxed text-grey-700">
                Peptiva Labs supplies laboratories and qualified research professionals. Products are
                not for human or veterinary use, and we can’t give dosing or medical advice.
              </p>
            </div>
          </aside>
        </div>
      </section>

      {/* ---- FAQ ------------------------------------------------------- */}
      <section className="mx-auto mt-24 w-full max-w-[900px] px-4">
        <h2 className="text-center text-[clamp(26px,2.6vw,38px)] font-normal text-black">Common questions about Peptiva Labs</h2>
        <div className="mt-10 flex flex-col gap-4">
          {FAQ.map((f) => {
            const isOpen = open === f.q;
            return (
              <div key={f.q} className={HARD_CARD}>
                <button
                  type="button"
                  aria-expanded={isOpen}
                  onClick={() => setOpen(isOpen ? null : f.q)}
                  className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left text-[15px] text-black"
                >
                  {f.q}
                  <span className={`flex-none text-grey-600 transition-transform ${isOpen ? "rotate-45" : ""}`}>
                    <PlusIcon width={16} height={16} />
                  </span>
                </button>
                {isOpen && <p className="px-5 pb-5 text-small leading-relaxed text-grey-700">{f.a}</p>}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
