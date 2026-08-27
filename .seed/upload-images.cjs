// Downloads real Dog Smart photos from the live Wix site (resized via Wix's
// own fit-transform URL convention to keep files web-sized) and uploads each
// to Sanity as an image asset. Writes a JSON map of key -> Sanity asset _id
// to /tmp/dogsmart-assets.json (merging with any existing content so this
// can be run in batches).
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
const OUT_PATH = '/tmp/dogsmart-assets.json';

const ITEMS = JSON.parse(fs.readFileSync(process.argv[3], 'utf8'));

function wixResize(url, w) {
  // url is the base wixstatic media URL (no existing transform suffix)
  return `${url}/v1/fit/w_${w},h_${w},q_85/file.jpg`;
}

async function uploadOne(item) {
  const src = item.resize === false ? item.url : wixResize(item.url, item.width || 1600);
  const imgRes = await fetch(src);
  if (!imgRes.ok) throw new Error(`fetch failed ${imgRes.status} for ${item.key}`);
  const buf = Buffer.from(await imgRes.arrayBuffer());
  const contentType = item.url.endsWith('.png') ? 'image/png' : 'image/jpeg';
  const uploadRes = await fetch(
    `https://${PROJECT_ID}.api.sanity.io/v2024-01-01/assets/images/${DATASET}?filename=${encodeURIComponent(item.key + (contentType === 'image/png' ? '.png' : '.jpg'))}`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${TOKEN}`,
        'Content-Type': contentType,
      },
      body: buf,
    }
  );
  const json = await uploadRes.json();
  if (!uploadRes.ok) throw new Error(`upload failed for ${item.key}: ${JSON.stringify(json)}`);
  return { key: item.key, assetId: json.document._id, size: buf.length };
}

async function main() {
  let existing = {};
  if (fs.existsSync(OUT_PATH)) {
    existing = JSON.parse(fs.readFileSync(OUT_PATH, 'utf8'));
  }
  const results = {};
  const concurrency = 4;
  let idx = 0;
  async function worker() {
    while (idx < ITEMS.length) {
      const item = ITEMS[idx++];
      try {
        const r = await uploadOne(item);
        results[r.key] = r.assetId;
        console.log(`OK ${r.key} -> ${r.assetId} (${r.size} bytes)`);
      } catch (e) {
        console.error(`FAIL ${item.key}: ${e.message}`);
      }
    }
  }
  await Promise.all(Array.from({ length: concurrency }, worker));
  const merged = { ...existing, ...results };
  fs.writeFileSync(OUT_PATH, JSON.stringify(merged, null, 2));
  console.log(`Wrote ${Object.keys(merged).length} total entries to ${OUT_PATH}`);
}

main().catch((e) => {
  console.error('FATAL', e);
  process.exit(1);
});
