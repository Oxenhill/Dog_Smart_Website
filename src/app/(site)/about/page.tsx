import Image from "next/image";
import { sanityFetch } from "@/sanity/lib/client";
import { FAMILY_PROFILE_QUERY, SITE_SETTINGS_QUERY } from "@/sanity/lib/queries";
import type { FamilyProfile, PortableTextBlock, SiteSettings } from "@/sanity/lib/types";

export const metadata = {
  title: "About Us | Dog Smart Training & Behaviour",
  description:
    "Oliver and Becs Ringrose founded Dog Smart in 2018 — a husband-and-wife team offering force-free dog training and behaviour support in Sevenoaks, Kent.",
};

// Real content, matching the familyProfile singleton already seeded in
// Sanity (see .seed/seed-content.cjs) — used only if Sanity is briefly
// unreachable, never invented.
const FALLBACK_SETTINGS: Pick<SiteSettings, "aboutPageEyebrow" | "aboutPageHeading" | "aboutPageBody"> = {
  aboutPageEyebrow: "About Us",
  aboutPageHeading: "The Dog Smart Family",
  aboutPageBody:
    "Dog Smart is owned and run by husband-and-wife team Oliver and Becs — force-free training built on understanding your dog, not just managing them.",
};

const FALLBACK_FAMILY_PROFILE: FamilyProfile = {
  introHeadline: "We're Not Just a Training Service — We're a Family",
  story: [
    {
      _type: "block",
      children: [
        {
          text: "Dog Smart was created to give pet owners a different kind of education than the traditional village-hall training class — one built on understanding your dog, not just managing them.",
        },
      ],
    },
    {
      _type: "block",
      children: [
        {
          text: "We started the business in 2018 while both still in full-time jobs. Since then Oliver has moved into Dog Smart full time, while Becs runs our Agility sessions alongside her work in the veterinary profession.",
        },
      ],
    },
  ],
  trainingPromise: [
    {
      _type: "block",
      children: [
        {
          text: "We are committed to training animals without the use of fear or intimidation, using modern, force-free scientific principles — every dog, every time.",
        },
      ],
    },
  ],
  oliverName: "Oliver",
  oliverBio: [
    {
      _type: "block",
      children: [
        {
          text: "VSA graduate (2018), with further study through Illis ABC, Suzanne Clothier's CARAT programme, and Family Dog Mediator training under Kim Brophey. Gundogs — especially Vizslas — are his particular passion.",
        },
      ],
    },
  ],
  oliverCredentials: [
    "VSA-Certified Dog Trainer (VSA-CDT) — Victoria Stilwell Academy graduate",
    "Animal Emotion & Advanced Animal Training — Illis ABC",
    "CARAT graduate — Suzanne Clothier",
    "Family Dog Mediator — Kim Brophey's LEGS Applied Ethology programme",
  ],
  becsName: "Becs",
  becsBio: [
    {
      _type: "block",
      children: [
        {
          text: "A Registered Veterinary Nurse since 2004 and now Practice Manager at Sandhole Veterinary Practice, Becs runs our Puppy School and Youth Club classes and trains Willow and Percy in agility.",
        },
      ],
    },
  ],
  additionalTeam: [
    {
      name: "Louise Warman",
      role: "Owner at Scrufts, Tufts & Fluffs — assists with group classes & behaviour cases",
      bio: [
        {
          _type: "block",
          children: [
            {
              text: "Louise runs her own dog-walking business and assists Dog Smart with group classes and behaviour cases. She holds a level 3 diploma in animal management and is midway through a level 4 advanced diploma in canine behaviour.",
            },
          ],
        },
      ],
    },
  ],
};

function blocksToParagraphs(blocks?: PortableTextBlock[] | null): string[] {
  if (!blocks) return [];
  return blocks
    .filter((b) => b._type === "block")
    .map((b) => (b.children || []).map((c) => c.text || "").join(""))
    .filter((text) => text.trim().length > 0);
}

export default async function AboutPage() {
  const [settings, profile] = await Promise.all([
    sanityFetch<Pick<SiteSettings, "aboutPageEyebrow" | "aboutPageHeading" | "aboutPageBody">>(SITE_SETTINGS_QUERY, {}, FALLBACK_SETTINGS),
    sanityFetch<FamilyProfile>(FAMILY_PROFILE_QUERY, {}, FALLBACK_FAMILY_PROFILE),
  ]);

  const storyParagraphs = blocksToParagraphs(profile.story);
  const oliverParagraphs = blocksToParagraphs(profile.oliverBio);
  const becsParagraphs = blocksToParagraphs(profile.becsBio);
  const promiseParagraphs = blocksToParagraphs(profile.trainingPromise);
  const promiseQuote =
    promiseParagraphs[0] ||
    "We are committed to training animals without the use of fear or intimidation, using modern, force-free scientific principles — every dog, every time.";

  return (
    <>
      <section className="page-header">
        <div className="container-narrow">
          <p className="eyebrow">{settings.aboutPageEyebrow || "About Us"}</p>
          <h1>{settings.aboutPageHeading || profile.introHeadline}</h1>
          {settings.aboutPageBody ? <p className="lede">{settings.aboutPageBody}</p> : null}
        </div>
      </section>

      {storyParagraphs.length > 0 ? (
        <section className="lede-section">
          <div className="container-narrow">
            {storyParagraphs.map((para, i) => (
              <p key={i}>{para}</p>
            ))}
          </div>
        </section>
      ) : null}

      <section className="story-section">
        <div className="container">
          <div className="story-head">
            <p className="eyebrow">Since 2018</p>
            <h2>Meet Oliver &amp; Becs</h2>
          </div>
          <div className="founders">
            <div className="founder">
              <div className="founder-photo photo-frame">
                {profile.oliverPhoto?.asset?.url ? (
                  <Image
                    src={profile.oliverPhoto.asset.url}
                    alt={profile.oliverName || "Oliver"}
                    fill
                    sizes="(max-width: 760px) 100vw, 25vw"
                  />
                ) : null}
              </div>
              <h3>{profile.oliverName || "Oliver"} — Founder, Trainer &amp; Consultant</h3>
              {oliverParagraphs.map((para, i) => (
                <p key={i}>{para}</p>
              ))}
              {profile.oliverCredentials && profile.oliverCredentials.length > 0 ? (
                <ul className="founder-credentials">
                  {profile.oliverCredentials.map((c) => (
                    <li key={c}>{c}</li>
                  ))}
                </ul>
              ) : null}
            </div>
            <div className="founder">
              <div className="founder-photo photo-frame">
                {profile.becsPhoto?.asset?.url ? (
                  <Image
                    src={profile.becsPhoto.asset.url}
                    alt={profile.becsName || "Becs"}
                    fill
                    sizes="(max-width: 760px) 100vw, 25vw"
                  />
                ) : null}
              </div>
              <h3>{profile.becsName || "Becs"} — Founder, Trainer &amp; Veterinary Nurse</h3>
              {becsParagraphs.map((para, i) => (
                <p key={i}>{para}</p>
              ))}
            </div>
          </div>

          {profile.additionalTeam && profile.additionalTeam.length > 0 ? (
            <div className="team-extra">
              <div className="story-head">
                <p className="eyebrow">Also Part of the Team</p>
              </div>
              {profile.additionalTeam.map((member) => (
                <div className="team-card" key={member.name}>
                  <div className="team-photo photo-frame">
                    {member.photo?.asset?.url ? (
                      <Image src={member.photo.asset.url} alt={member.name} fill sizes="200px" />
                    ) : null}
                  </div>
                  <div>
                    <h3>{member.name}</h3>
                    {member.role ? <p className="role">{member.role}</p> : null}
                    {blocksToParagraphs(member.bio).map((para, i) => (
                      <p key={i}>{para}</p>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : null}
        </div>
      </section>

      <section className="promise-section">
        <div className="container-narrow">
          <p className="eyebrow">Our Training Promise</p>
          <blockquote>&ldquo;{promiseQuote}&rdquo;</blockquote>
          <a href="/#family" className="pill">
            Meet the Dog Smart dogs
          </a>
        </div>
      </section>

      <section className="cta-band on-dark" id="book">
        <div className="container-narrow">
          <p className="eyebrow">Ready When You Are</p>
          <h2>Come and meet the family</h2>
          <p>Read about our services, or get in touch and tell us about your dog.</p>
          <div className="actions">
            <a href="/services" className="pill solid on-dark lg">
              Explore Services
            </a>
            <a href="/contact" className="pill on-dark lg">
              Get in Touch
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
