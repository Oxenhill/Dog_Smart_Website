// Phase 2 seed: service body copy, About page additional team member
// (Louise Warman), and the FAQ page — all real text pulled directly from
// the live Wix site on 27 Aug 2026 (see content-audit/README.md and the
// FAQ accordion transcript in the corresponding session). Uses `patch`
// on the existing service/familyProfile singleton docs (so we don't
// clobber already-uploaded hero photos), and createOrReplace with fixed
// _ids for the new faqItem documents (idempotent, safe to re-run).
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
const PROJECT_ID = env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const DATASET = env.NEXT_PUBLIC_SANITY_DATASET;
const TOKEN = env.SANITY_API_WRITE_TOKEN;

function p(text) {
  return { _type: 'block', style: 'normal', markDefs: [], children: [{ _type: 'span', text, marks: [] }] };
}
function bullets(items) {
  return items.map((text) => ({
    _type: 'block',
    style: 'normal',
    listItem: 'bullet',
    level: 1,
    markDefs: [],
    children: [{ _type: 'span', text, marks: [] }],
  }));
}
function h2(text) {
  return { _type: 'block', style: 'h2', markDefs: [], children: [{ _type: 'span', text, marks: [] }] };
}

const serviceBodies = {
  'service-puppy-support': [
    p("“Confident dogs start with confident beginnings — and that's where I come in.”"),
    p('Puppyhood is where everything starts. What your dog learns and feels now lays the foundation for their future — and that makes these early weeks far more important than most people realise. Many see puppy classes as simple, but in truth this is the start of your puppy’s formal learning journey, and it’s often where things go wrong. Puppy support requires some of the most skilled and thoughtful training out there — not a one-size-fits-all offering or a money-spinner.'),
    h2('What these sessions are really about'),
    bullets([
      "Exploring your puppy's unique temperament and traits",
      'Supporting emotional growth, confidence and safe curiosity',
      'Calming your worries and giving you a plan that feels clear',
      'Letting puppies meet calm adult dogs, when suitable',
      'Answering real questions based on your home, family and routine',
    ]),
    h2('How it works'),
    bullets([
      'All sessions are 1:1, not group-based',
      'Held at a secure outdoor venue near Sevenoaks',
      "Suitable from 8 weeks old, once your vet clears them for the outdoors",
      'No in-home consults — puppies do better in neutral, calm spaces',
      'Some owners book support before the puppy even comes home',
    ]),
    h2('What we might cover'),
    bullets([
      'Confidence building and safe social exposure',
      'Mouthing, biting and handling challenges',
      'Toilet training, alone time and sleep',
      'Focus, name response and calm settling',
      'Preventing future issues by reading early signs',
      'Preparing for adolescence and changing needs',
    ]),
    p('You can book single Puppy Sessions — ideal for reassurance, pre-arrival prep or first-stage support — or a structured Puppy Package for guidance through those vital early months. A premium option with WhatsApp support is available for owners wanting extra backup between sessions.'),
    p('Raising a puppy is a big learning curve, and no one gets it all right the first time. These sessions aim to provide clarity, confidence and the foundation for building a strong relationship from day one.'),
  ],
  'service-general-training': [
    p('Reward-based, real-world training to help your dog become calm, responsive, and easy to live with.'),
    p('General training is for adolescent and adult dogs who need help with recall and off-lead reliability, loose lead walking, focus and calmness outdoors, manners around people, dogs or distractions, and settling in everyday situations. Whether your dog pulls on the lead, struggles to come back when called, or just can’t switch off, we’ll work together to build better habits and mutual understanding.'),
    h2('Why 1:1 is better than classes'),
    p('“I don’t run group classes for general training. Every dog is different — and every owner is too.” One-to-one training lets us focus entirely on your dog and goals, move at your pace rather than the group’s, and adjust techniques to suit your learning style. Sessions are calm, practical, and focused on real-life results — you won’t be rushed or overwhelmed.'),
    h2('Where we train'),
    p('Most sessions take place at a secure outdoor venue near Sevenoaks, where we can safely work off-lead and introduce appropriate distractions. On-walk training consults are also offered on Wednesdays — ideal for tackling real-world challenges like recall in the woods or lead frustration in your local area. “I don’t offer in-home sessions, as I find that lasting results come from working in calm, neutral environments with fewer variables.”'),
    h2('Booking a session or package'),
    bullets([
      'One-off sessions — great for tackling a specific issue or trying things out',
      'Structured training packages — ideal for consistent progress with written follow-up support',
    ]),
  ],
  'service-gundog-training': [
    p('Specialist skills. Calm, connected dogs. Training that channels instinct, not fights it.'),
    p('Gundog training taps into the natural instincts of hunting breeds — like spaniels, retrievers and HPRs — whether they work in the field or not. It channels energy, builds focus, and strengthens communication between dog and handler. Even for pet gundogs, this kind of training brings balance, satisfaction, and better everyday behaviour.'),
    h2('This is what we do best'),
    p('“At Dog Smart, gundog training isn’t an add-on — it’s our specialist focus.” With years of experience working and living with high-drive breeds, we know how to harness instinct through structured, force-free training that feels as good as it works.'),
    h2('Who it’s for'),
    bullets([
      'Spaniels, retrievers, HPRs and gundog crosses',
      'High-energy breeds of all kinds who love to chase or fetch',
      'Dogs struggling with over-arousal or chaos in group settings',
      'Owners looking to build focus, impulse control and a better bond',
    ]),
    p('You don’t need a working dog or field goals — if your dog enjoys using their nose, chasing toys, or solving problems, they’ll love this work.'),
    h2('What we offer'),
    bullets([
      'Small group classes (max 4 dogs for beginners)',
      '1:1 gundog training sessions',
      'Online course access included with packages',
      'Sunday Intermediate Groups (up to 8 dogs) — separated by breed group (Spaniel Group, Retriever Group; HPRs may join either depending on style and fit)',
    ]),
    p('For dogs who find group classes too intense, we also offer 1:1 support that blends foundational gundog skills with behaviour awareness — especially valuable for over-aroused or overwhelmed dogs.'),
    h2('Skills we commonly teach'),
    bullets([
      'Off-lead connection and recall',
      'Heelwork and working around distractions',
      'Retrieving, directional control, stop whistle',
      'Boundary awareness and impulse control',
      'Using play to reinforce behaviours',
      'Building an “off switch” for high-energy dogs',
    ]),
  ],
  'service-behaviour-support': [
    p('Calm, professional support for dogs experiencing reactivity, overwhelm and poor emotional regulation.'),
    p('We use the Harmony Framework — examining environment, physical comfort, predictability, choice, learning expectations, social dynamics and lifestyle factors — to build a whole-picture plan for your dog. This addresses dog-to-dog reactivity, nervous or overwhelmed dogs, over-arousal and dogs that cannot switch off, and dogs struggling to settle, cope or regulate.'),
    p('This service doesn’t cover people-directed aggression or separation-related distress — for those, we’re happy to point you toward a trusted specialist.'),
    h2('Reward-based, always'),
    p('We use reward-based methods and explicitly do not use prong collars, choke chains, or electronic collars.'),
    h2('Ongoing support'),
    p('Clients get access to the Harmony Companion App for tracking progress, viewing plans, and monitoring changes over time between sessions.'),
  ],
};

const additionalTeam = [
  {
    _type: 'teamMember', _key: 'louise-warman',
    name: 'Louise Warman',
    role: 'Owner at Scrufts, Tufts & Fluffs — assists with group classes & behaviour cases',
    bio: [
      p('Louise assists Dog Smart with group classes and behaviour cases, and runs her own dog-walking business, Scrufts, Tufts & Fluffs, which she set up in January 2020.'),
      p('She holds a level 3 diploma in animal management from Hadlow College and has worked across kennels, farms and veterinary practice. She is midway through a level 4 advanced accredited diploma in canine behaviour, a passion sparked by the challenges of raising her own rescued Hungarian Vizslas, Franky and Barka.'),
    ],
  },
];

const faqs = [
  { q: "What's your refund and cancellation policy?", a: "If you book a package and feel I'm not the right fit, I'm happy to offer a refund for unused sessions — any sessions already delivered will be charged in full. Cancellations made with more than 48 hours' notice are fully refundable. For cancellations within 48 hours, I charge £10 to cover field hire costs. No-shows are not eligible for refunds.", cat: 'Booking & Pricing' },
  { q: 'What types of training do you offer?', a: 'We offer 1:1 dog training in Sevenoaks including puppy foundations, adolescent support, gundog training, lead walking, recall, and behaviour consultations.', cat: 'General' },
  { q: 'Do you offer group classes?', a: 'We run occasional workshops but specialise in private training so we can tailor each session to you and your dog’s needs. Group training is offered for beginner and intermediate gundog clients.', cat: 'General' },
  { q: 'What is gundog training and do I need a working breed?', a: 'Gundog training builds engagement, steadiness, and control — great for spaniels, retrievers, and active breeds. It’s suitable for pet dogs too, not just working ones.', cat: 'Gundog Training' },
  { q: 'How many 1:1 sessions will I need?', a: 'It varies, but most clients see progress after 2–4 sessions. We’ll discuss goals in your first session and recommend a plan that suits you — packages are set up to suit your needs, and you can purchase the same package multiple times.', cat: 'General' },
  { q: 'Where does training take place?', a: 'Sessions take place in our private field in Brasted near Sevenoaks, or nearby public spaces for on-walk consultations. Some behaviour work may start online to reduce stress for your dog. Gundog classes for intermediate clients have varied locations around the Sevenoaks area.', cat: 'General' },
  { q: 'Do you use positive reinforcement?', a: 'Yes, all our training is force-free, reward-based, and aligned with modern, ethical dog training principles. We are members of the UK Dog Training Charter and registered trainers with Victoria Stilwell.', cat: 'General' },
  { q: 'Do you work with reactive or anxious dogs?', a: 'Absolutely. We specialise in helping dogs who are fearful, frustrated, or struggling with the world. Sessions are calm, supportive, and paced to your dog’s comfort — see our Behaviour Support page for more, or get in touch.', cat: 'Behaviour Support' },
  { q: 'Can children or family members join the sessions?', a: 'Yes — training is more successful when the whole family is involved. We’ll ensure everyone understands how to support your dog.', cat: 'General' },
  { q: 'How do I book a session?', a: 'You can book online via our booking app. If you’re unsure which service is right for you, feel free to get in touch before booking.', cat: 'Booking & Pricing' },
  { q: 'How long are the sessions?', a: 'Most 1:1 training sessions are 45–60 minutes. Some behaviour sessions or packages may include longer sessions or online elements, and intermediate gundog sessions are much longer — this is stated on the product page.', cat: 'General' },
  { q: 'Do you offer support between sessions?', a: 'Most packages come with online material you can use at home; some products offer extended support through WhatsApp. Group classes each have their own WhatsApp group — we try to respond within 24 hours on these chat groups.', cat: 'General' },
  { q: 'Can I train more than one dog at a time?', a: 'Usually it’s best to focus on one dog per session. If you have multiple dogs with similar goals, we can discuss whether a shared session might suit — for example with another family member helping, or training with a friend.', cat: 'General' },
  { q: 'Are your sessions suitable for first-time dog owners?', a: 'Absolutely. Many of our clients are new to dog ownership. We’ll support you with practical training and a calm, step-by-step approach.', cat: 'General' },
  { q: 'Can I book an online consultation?', a: 'Yes. Online sessions are ideal for behaviour support, initial assessments, or when in-person training isn’t possible — they’re just as effective for many goals. Availability online is limited; please reach out and we can arrange a suitable time.', cat: 'Online Learning' },
  { q: 'What equipment do I need for training?', a: 'We’ll let you know anything specific ahead of your session — in general, a well-fitted harness or collar, a sturdy lead and some small, tasty treats are a good starting point.', cat: 'General' },
  { q: 'What happens if the weather is bad?', a: 'We train outdoors, so light rain or mud won’t stop us. For safety, we’ll reschedule in case of severe weather like storms or heatwaves — no charge.', cat: 'General' },
  { q: 'Are you insured?', a: 'Yes. Dog Smart is fully insured for public liability and professional dog training services. However, we cannot work with dogs that fall under the Dangerous Dogs Act.', cat: 'General' },
  { q: 'Do you offer gift vouchers?', a: 'Yes — training gift vouchers are available and make a great present for new dog owners. Get in touch to request one.', cat: 'Booking & Pricing' },
  { q: 'Will my dog be ‘fixed’ after one session?', a: 'Training and behaviour change take time. You’ll see progress quickly, but lasting change comes from consistency and practice between sessions — you’ll get out what you’re willing to put in.', cat: 'General' },
  { q: 'What if my dog is aggressive or has bitten?', a: 'For safety reasons, we do not take on bite cases. However, we’re happy to refer you to a trusted specialist who can support complex or high-risk behaviour cases — please get in touch to discuss options.', cat: 'Behaviour Support' },
  { q: 'Do you train dogs of all ages?', a: 'Yes — we support puppies as young as 8 weeks and adult dogs of any age. It’s never too late to start training or work on behaviour.', cat: 'General' },
  { q: 'Can I train my rescue dog with you?', a: 'Absolutely. We regularly support rescue and rehomed dogs. Training plans are adapted to suit each dog’s background and comfort level.', cat: 'General' },
  { q: 'What methods do you use?', a: 'We use force-free, reward-based training rooted in modern behavioural science. No harsh corrections or dominance techniques — ever.', cat: 'General' },
  { q: 'Do you provide written follow-ups or homework?', a: 'Written notes and follow-up support are provided with behaviour consults. Training package clients get access to online material to support their sessions — these resources aren’t included with single 1:1 sessions, and we don’t email session summaries for training work.', cat: 'General' },
  { q: 'Can we work on more than one issue at a time?', a: 'Yes, within reason — for example we can combine recall and lead walking, or training with behaviour support. Just let us know your priorities.', cat: 'General' },
  { q: 'Do you offer training for dog sports or scentwork?', a: 'Not currently as a standalone offer, but our gundog sessions include elements of retrieval, impulse control, and focus that are great for active dogs.', cat: 'Gundog Training' },
  { q: 'Can I bring a friend or partner to the session?', a: 'Yes — training works best when all household members are involved.', cat: 'General' },
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
  const mutations = [];

  for (const [id, body] of Object.entries(serviceBodies)) {
    mutations.push({ patch: { id, set: { body } } });
  }

  mutations.push({ patch: { id: 'singleton-familyProfile', set: { additionalTeam } } });

  faqs.forEach((f, i) => {
    mutations.push({
      createOrReplace: {
        _id: `faq-${i + 1}`,
        _type: 'faqItem',
        question: f.q,
        answer: f.a,
        category: f.cat,
        order: i + 1,
      },
    });
  });

  const result = await mutate(mutations);
  console.log(`Seeded ${mutations.length} mutations. Transaction: ${result.transactionId}`);
}

main().catch((e) => {
  console.error('FATAL', e.message || e);
  process.exit(1);
});
