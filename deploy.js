const axios = require('axios');
const crypto = require('crypto');
const fs = require('fs');

const TOKEN = process.env.WEBFLOW_ACCESS_TOKEN;
const SITE_ID = process.env.WEBFLOW_SITE_ID;
const REPO = 'vanshita-lilbigthings/webflow-scripts';
const BRANCH = 'main';

const client = axios.create({
  baseURL: 'https://api.webflow.com/v2',
  headers: {
    Authorization: `Bearer ${TOKEN}`,
    'Content-Type': 'application/json',
  },
});

async function getSRIHash(url) {
  const response = await axios.get(url, { responseType: 'arraybuffer' });
  const hash = crypto
    .createHash('sha256')
    .update(Buffer.from(response.data))
    .digest('base64');
  return `sha256-${hash}`;
}

async function deploy() {
  const distFiles = fs
    .readdirSync('./dist')
    .filter((f) => f.endsWith('.iife.js'));

  console.log(`Found ${distFiles.length} scripts to deploy:`, distFiles);

  const registeredScripts = [];

  for (const file of distFiles) {
    const name = file.replace('.iife.js', '');
    const cdnUrl = `https://cdn.jsdelivr.net/gh/${REPO}@${BRANCH}/dist/${file}`;
    const version = `1.0.${Date.now()}`;

    console.log(`\nDeploying ${name}...`);
    console.log(`CDN URL: ${cdnUrl}`);

    console.log('Generating SRI hash...');
    const integrityHash = await getSRIHash(cdnUrl);
    console.log(`Hash: ${integrityHash}`);

    console.log('Registering script...');
    const register = await client.post(
      `/sites/${SITE_ID}/registered_scripts/hosted`,
      {
        hostedLocation: cdnUrl,
        integrityHash,
        canCopy: true,
        displayName: `${name}${Date.now()}`,
        version,
      }
    );

    console.log(`Registered with ID: ${register.data.id}`);
    registeredScripts.push({
      id: register.data.id,
      location: 'footer',
      version,
    });
  }

  console.log('\nApplying all scripts to site...');
  await client.put(`/sites/${SITE_ID}/custom_code`, {
    scripts: registeredScripts,
  });

  console.log('Publishing Webflow site...');
  await client.post(`/sites/${SITE_ID}/publish`, {
    customDomains: [],
    subDomain: true,
  });
  console.log('Site published!');

  console.log('Done! All scripts applied to Webflow site.');
}

deploy().catch((err) => {
  console.error(err.response?.data || err.message);
  process.exit(1);
});
