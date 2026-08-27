// Seeds real Dog Smart content into Sanity: family dogs, the About/family
// profile singleton, site settings, and the four services. Real facts and
// copy pulled from the live Wix site (dogsmarttrainingbehaviour.co.uk) and
// the repo's content-audit/README.md — nothing invented. Idempotent:
// createOrReplace with fixed _ids, safe to re-run.
const fs = require('fs');

function readEnvLocal(path) {
  const out = {};
  const text = fs.readFileSync(path, 'utf8');
  for (const line of text.split('\n')) {
    const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (m) out[m[1]] = m[2].trim();
  }
  return out;
}

const env = readEnvLocal(process.argv[2]);
const assets = JSON.parse(fs.readFileSync(process.argv[3], 'utf8'));
const PROJECT_ID = env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const DATASET = env.NEXT_PUBLIC_SANITY_DATASET;
const TOKEN = env.SANITY_API_WRITE_TOKEN;

function img(key) {
  if (!assets[key]) return undefined;
  return { _type: 'image', asset: { _type: 'reference', _ref: assets[key] } };
}

function blocks(paragraphs) {
  return paragraphs.map((text) => ({
    _type: 'block',
    style: 'normal',
    markDefs: [],
    children: [{ _type: 'span', text, marks: [] }],
  }));
}

const dogs = [
  {
    _id: 'dog-briar', _type: 'dog', name: 'Briar', order: 1, legacy: true,
    bio: 'Our first dog, and the one who taught us more than any other. Briar was with us for fourteen wonderful years — a steady, patient presence for puppy clients and a resilient stooge dog in behaviour cases — before we said our final goodbyes in August 2022. His legacy shaped everything we do, right down to the name behind our sister site, Briarrose Gundogs.',
    photo: img('dog-briar'),
  },
  {
    _id: 'dog-sam', _type: 'dog', name: 'Sam', order: 2, legacy: true,
    bio: 'Our first Many Tears rescue. Sam was reactive towards other dogs with a seriously high predatory drive, and he was not without his challenges — but living alongside him taught us first-hand what it takes to support a reactive dog. We lost him to cancer in 2017, aged just ten. He cemented our love of spaniels and the joy they bring.',
    photo: img('dog-sam'),
  },
  {
    _id: 'dog-percy', _type: 'dog', name: 'Percy', breed: 'Cavalier / Cocker / Pug cross', order: 3, legacy: false,
    bio: "Percy arrived during an emergency foster — we raised him and his four litter-mates alongside their mum, Figgy. Everyone else found new homes; Percy stayed. He's our have-a-go hero, training in gundog work, agility, scent work and tracking, and he'll try anything and give it 150%.",
    photo: img('dog-percy'),
  },
  {
    _id: 'dog-teak', _type: 'dog', name: 'Teak', breed: 'HPR', order: 4, legacy: false,
    bio: "Teak's start in life was tough — both elbows operated on within his first eight months, and much of his puppyhood spent on leash and pen rest. It taught him to read us extraordinarily fast. Now he's our hunter: mountains of energy, drawn to man-trailing and scent work, with tracking and air-scenting skills that still make us marvel.",
    photo: img('dog-teak'),
  },
  {
    _id: 'dog-harry', _type: 'dog', name: 'Harry', breed: 'English Springer Spaniel', order: 5, legacy: false,
    bio: "Adopted a little later in life but still a pup at heart — Harry is mad as a box of frogs and born to work. He completed his first shooting season at the end of 2022/23, guesting on two very different shoots and even working alongside Teak. Water confidence is still a work in progress, but he's getting there.",
    photo: img('dog-harry'),
  },
  {
    _id: 'dog-jimmy', _type: 'dog', name: 'Jimmy', breed: 'Collie', order: 6, legacy: false,
    bio: "Our third Many Tears dog, our fourth rescue, and our first collie. Becs had admired the breed for years, and a chance meeting in July 2022 sealed it. We're still building our relationship and learning every day, but Jimmy's progressing nicely through his agility foundations and loves scent work and tracking.",
    photo: img('dog-jimmy'),
  },
  {
    _id: 'dog-ron', _type: 'dog', name: 'Ron', breed: 'English Springer Spaniel', order: 7, legacy: false,
    bio: "Ron came to us as an emergency foster after being handed in to a vet's and failing in his next home — two days in, we knew he wasn't going anywhere else. He struggles with separation issues and arousal, and pulls hard on the lead, but he's got a wonderful nose on him and Harry has taken him firmly under his wing.",
    photo: img('dog-ron'),
  },
  {
    _id: 'dog-willow', _type: 'dog', name: 'Willow', breed: 'Spaniel', order: 8, legacy: false,
    bio: "The only lady of the household. Willow was Becs's second agility dog after Briar — a complicated, sensitive soul who took Becs to the Crufts Novice Agility Cup and came away runner-up in 2017. She's retired from competition now, but still enjoys being a spaniel with her dad at every opportunity, and keeping the boys in check.",
    photo: img('dog-willow'),
  },
  {
    _id: 'dog-lenny', _type: 'dog', name: 'Lenny', order: 9, legacy: false,
    bio: '',
  },
];

const familyProfile = {
  _id: 'singleton-familyProfile', _type: 'familyProfile',
  introHeadline: "We're Not Just a Training Service — We're a Family",
  story: blocks([
    'Dog Smart was created to give pet owners a different kind of education than the traditional village-hall training class — one built on understanding your dog, not just managing them.',
    'We started the business in 2018 while both still in full-time jobs. Since then Oliver has moved into Dog Smart full time, while Becs runs our Agility sessions alongside her work in the veterinary profession.',
    'Every dog we train in our outdoor venue works alongside our own dogs, who help provide distraction, socialisation and steady support for reactivity cases — the same dogs you can meet on this page.',
  ]),
  trainingPromise: blocks([
    'We are committed to training animals without the use of fear or intimidation, using modern, force-free scientific principles — every dog, every time.',
  ]),
  oliverName: 'Oliver',
  oliverBio: blocks([
    "Oliver grew up surrounded by animals — dogs, horses, cows, sheep, ferrets, ducks, a cat — but none more formative than his childhood Border Terrier, Sam, who followed him across the North Downs on countless walks. His first job as a teenager was at the local gundog kennels.",
    'After school Oliver trained as a Heating Engineer, working in the family business for 18 years — but dogs were never far away. In 2017 he made the leap into a full career change, signing up for Victoria Stilwell’s Dog Training Academy, and in January 2018 qualified as a VSA graduate.',
    'Since then he’s continued studying: The Animal Emotion and Advanced Animal Training course with Illis ABC, Suzanne Clothier’s CARAT introduction, and most recently qualified as a Family Dog Mediator through Kim Brophey’s ethology programme. Gundogs are his particular passion — with a special soft spot for Vizslas.',
  ]),
  oliverCredentials: [
    'VSA-Certified Dog Trainer (VSA-CDT) — Victoria Stilwell Academy graduate',
    'Animal Emotion & Advanced Animal Training — Illis ABC',
    'CARAT graduate — Suzanne Clothier',
    'Family Dog Mediator — Kim Brophey’s LEGS Applied Ethology programme',
  ],
  oliverPhoto: img('oliver-photo'),
  becsName: 'Becs',
  becsBio: blocks([
    'Becs has been obsessed with dogs and animals since she was five, when her first dog Honey, a Cavalier King Charles Spaniel, joined the family. She became a trainee veterinary nurse at 19, and a Registered Veterinary Nurse in 2004 — the same year she spent six weeks in Borneo volunteering for the Orangutan Foundation UK.',
    'She started volunteering as an instructor for Sevenoaks and District Dog Training in 2007, and completed a Companion Animal Behaviour and Training diploma in 2012. She’s now Practice Manager at Sandhole Veterinary Practice, and outside the clinic runs our Puppy School and adolescent Youth Club classes.',
    'Becs and Willow qualified for the Crufts Novice Agility Cup in 2017, coming away runner-up on their first attempt — she now trains both Willow and Percy in agility.',
  ]),
  becsPhoto: img('becs-photo'),
};

const siteSettings = {
  _id: 'singleton-siteSettings', _type: 'siteSettings',
  businessName: 'Dog Smart Training & Behaviour',
  familyTagline: "We're Not Just a Training Service — We're a Family",
  heroEyebrow: 'Sevenoaks, Kent',
  heroHeadline: 'Every Dog is Different. So Is Every Owner.',
  heroSubhead: "Real-life training, honest behaviour support, and a community built on understanding dogs — not just managing them.",
  familyEyebrow: 'The Dog Smart Family',
  familyHeadline: "We're Not Just a Training Service — We're a Family",
  familyBody: "At Dog Smart, we don't just work with dogs — we walk alongside their humans too. Our clients become part of a growing community, one that values honesty, patience, and the belief that learning should feel safe.",
  ctaEyebrow: 'Not Sure Where to Start?',
  ctaHeadline: 'Book a 1-on-1 Training Session Today',
  ctaBody: "Take your time. Read, explore, ask questions. When you're ready — we're here.",
  phone: '07725672320',
  email: 'trainers@dogsmarttrainingbehaviour.co.uk',
  addressLocality: 'Sevenoaks',
  addressRegion: 'Kent',
  coverageArea: 'Serving Sevenoaks, Tunbridge Wells and the surrounding Kent villages',
  classBookingUrl: 'https://booking.dogsmarttrainingbehaviour.co.uk/',
  behaviourBookingUrl: null,
  onlineLearningUrl: 'https://online.dogsmarttrainingbehaviour.co.uk',
  socialLinks: [
    { _type: 'object', _key: 'facebook', platform: 'Facebook', url: 'https://www.facebook.com/dogsmarttraining' },
    { _type: 'object', _key: 'instagram', platform: 'Instagram', url: 'https://www.instagram.com/dogsmart_training_behaviour' },
    { _type: 'object', _key: 'youtube', platform: 'YouTube', url: 'https://www.youtube.com/channel/UC4hBisQmqX30hkT-hw_-dbA' },
  ],
  footerText: '© Dog Smart Training & Behaviour',
  showPricingSitewide: true,
  heroImage: img('hero-family'),
};

const services = [
  {
    _id: 'service-puppy-support', _type: 'service', title: 'Puppy Support', order: 1,
    slug: { _type: 'slug', current: 'puppy-support' }, icon: 'puppy',
    summary: 'Expert 1:1 guidance through those early weeks — socialisation, sleep, settling, and building good habits from day one.',
    heroImage: img('dog-jimmy'),
  },
  {
    _id: 'service-general-training', _type: 'service', title: 'General Dog Training', order: 2,
    slug: { _type: 'slug', current: 'general-dog-training' }, icon: 'general',
    summary: 'From real-life manners to reliable recall — calm, force-free training that builds behaviour that actually lasts.',
    heroImage: img('dog-percy'),
  },
  {
    _id: 'service-gundog-training', _type: 'service', title: 'Gundog Training', order: 3,
    slug: { _type: 'slug', current: 'gundog-training' }, icon: 'gundog',
    summary: 'Specialist gundog work in Sevenoaks for working and high-drive pet breeds alike, force-free from first retrieve onward.',
    heroImage: img('dog-teak'),
  },
  {
    _id: 'service-behaviour-support', _type: 'service', title: 'Behaviour Support', order: 4,
    slug: { _type: 'slug', current: 'behaviour-support' }, icon: 'behaviour',
    summary: 'Calm, professional support for dogs struggling with reactivity, regulation or fear — helping you both move forward.',
    heroImage: img('dog-ron'),
  },
];

async function mutate(mutations) {
  const res = await fetch(`https://${PROJECT_ID}.api.sanity.io/v2024-01-01/data/mutate/${DATASET}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ mutations }),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(JSON.stringify(json));
  return json;
}

async function main() {
  const allDocs = [...dogs, familyProfile, siteSettings, ...services];
  const mutations = allDocs.map((doc) => ({ createOrReplace: doc }));
  const result = await mutate(mutations);
  console.log(`Seeded ${allDocs.length} documents. Transaction: ${result.transactionId}`);
}

main().catch((e) => {
  console.error('FATAL', e.message || e);
  process.exit(1);
});
