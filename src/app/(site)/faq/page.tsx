import { sanityFetch } from "@/sanity/lib/client";
import { FAQ_ITEMS_QUERY, SITE_SETTINGS_QUERY } from "@/sanity/lib/queries";
import type { FaqItem, SiteSettings } from "@/sanity/lib/types";

export const metadata = {
  title: "FAQ | Dog Smart Training & Behaviour",
  description: "Answers to common questions about training, booking, and what to expect from Dog Smart.",
};

const FALLBACK_SETTINGS: Pick<SiteSettings, "faqPageEyebrow" | "faqPageHeading"> = {
  faqPageEyebrow: "FAQ",
  faqPageHeading: "Common questions",
};

// A handful of real, verified answers to keep the page honest if Sanity
// is briefly unreachable before the full FAQ set (seeded via
// .seed/seed-content.cjs, pulled directly from the live site) loads.
const FALLBACK_FAQS: FaqItem[] = [
  {
    _id: "fallback-1",
    question: "What types of training do you offer?",
    answer:
      "We offer 1:1 dog training in Sevenoaks including puppy foundations, adolescent support, gundog training, lead walking, recall, and behaviour consultations.",
    category: "General",
    order: 1,
  },
  {
    _id: "fallback-2",
    question: "Do you use positive reinforcement?",
    answer:
      "Yes, all our training is force-free, reward-based, and aligned with modern, ethical dog training principles. We are members of the UK Dog Training Charter and registered trainers with Victoria Stilwell.",
    category: "General",
    order: 2,
  },
  {
    _id: "fallback-3",
    question: "What's your refund and cancellation policy?",
    answer:
      "If you book a package and feel it's not the right fit, we're happy to offer a refund for unused sessions — any sessions already delivered will be charged in full. Cancellations made with more than 48 hours' notice are fully refundable. For cancellations within 48 hours, we charge £10 to cover field hire costs. No-shows are not eligible for refunds.",
    category: "Booking & Pricing",
    order: 3,
  },
];

const CATEGORY_ORDER = [
  "General",
  "Puppy Support",
  "General Training",
  "Gundog Training",
  "Behaviour Support",
  "Online Learning",
  "Booking & Pricing",
];

export default async function FaqPage() {
  const [settings, faqs] = await Promise.all([
    sanityFetch<Pick<SiteSettings, "faqPageEyebrow" | "faqPageHeading">>(SITE_SETTINGS_QUERY, {}, FALLBACK_SETTINGS),
    sanityFetch<FaqItem[]>(FAQ_ITEMS_QUERY, {}, FALLBACK_FAQS),
  ]);

  const byCategory = new Map<string, FaqItem[]>();
  for (const item of faqs) {
    const cat = item.category || "General";
    const list = byCategory.get(cat) || [];
    list.push(item);
    byCategory.set(cat, list);
  }
  const orderedCategories = [
    ...CATEGORY_ORDER.filter((c) => byCategory.has(c)),
    ...[...byCategory.keys()].filter((c) => !CATEGORY_ORDER.includes(c)),
  ];

  return (
    <>
      <section className="page-header">
        <div className="container-narrow">
          <p className="eyebrow">{settings.faqPageEyebrow || "FAQ"}</p>
          <h1>{settings.faqPageHeading || "Common questions"}</h1>
          <p className="lede">
            Can&rsquo;t find what you&rsquo;re looking for? <a href="/contact">Get in touch</a> — we reply
            personally to every question.
          </p>
        </div>
      </section>

      <div className="container-narrow">
        <div className="faq-groups">
          {orderedCategories.map((category) => (
            <div className="faq-category" key={category}>
              <h2>{category}</h2>
              {byCategory.get(category)!.map((item) => (
                <details className="disclosure" key={item._id}>
                  <summary>{item.question}</summary>
                  <div className="answer">{item.answer}</div>
                </details>
              ))}
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
