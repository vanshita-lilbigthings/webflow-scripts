const axios = require('axios');
const crypto = require('crypto');

const TOKEN = process.env.WEBFLOW_ACCESS_TOKEN;
const SITE_ID = process.env.WEBFLOW_SITE_ID;
const CDN_URL =
  'https://cdn.jsdelivr.net/gh/vanshita-lilbigthings/webflow-scripts@main/dist/navbar.iife.js';

async function getSRIHash(url) {
  const response = await axios.get(url, { responseType: 'arraybuffer' });
  const hash = crypto.createHash('sha256').update(Buffer.from(response.data)).digest('base64');
  return `sha256-${hash}`;
}

async function deploy() {
  const client = axios.create({
    baseURL: 'https://api.webflow.com/v2',
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      'Content-Type': 'application/json',
    },
  });

  console.log('Generating SRI hash...');
  const integrityHash = await getSRIHash(CDN_URL);
  console.log(`Hash: ${integrityHash}`);

  const version = `1.0.${Date.now()}`;

  console.log('Registering script with Webflow...');
  const register = await client.post(`/sites/${SITE_ID}/registered_scripts/hosted`, {
    hostedLocation: CDN_URL,
    integrityFingerprint: integrityHash,   // ← was "integrityHash", wrong field name
    canCopy: true,
    displayName: 'navbar',
    version,
  });

  const scriptId = register.data.id;
  console.log(`Script registered with ID: ${scriptId}`);

  console.log('Applying script to site...');
  await client.post(`/sites/${SITE_ID}/scripts`, {
    scripts: [
      {
        id: scriptId,
        location: 'footer',
        version,
      },
    ],
  });

  console.log('Done! Script applied to Webflow site.');
}

deploy().catch((err) => {
  console.error(err.response?.data || err.message);
  process.exit(1);
});