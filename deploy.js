const axios = require('axios');
const crypto = require('crypto');
const fs = require('fs');

const TOKEN = process.env.WEBFLOW_ACCESS_TOKEN;
const SITE_ID = process.env.WEBFLOW_SITE_ID;
const SITE_TOKEN = process.env.WEBFLOW_SITE_TOKEN;
const REPO = 'vanshita-lilbigthings/webflow-scripts';
const SHA = process.env.GITHUB_SHA ?? 'main';

const client = axios.create({
  baseURL: 'https://api.webflow.com/v2',
  headers: {
    Authorization: `Bearer ${TOKEN}`,
    'Content-Type': 'application/json',
  },
});

function getLocalSRIHash(file) {
  const content = fs.readFileSync(`./dist/${file}`);
  const hash = crypto.createHash('sha256').update(content).digest('base64');
  return `sha256-${hash}`;
}

async function waitForCDN(url, retries = 20, delayMs = 30000) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      await axios.get(url, { responseType: 'arraybuffer' });
      return;
    } catch (err) {
      if (attempt === retries) throw err;
      console.log(
        `CDN not ready (attempt ${attempt}/${retries}), retrying in ${delayMs / 1000}s...`
      );
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }
}

async function deploy() {
  const distFiles = fs
    .readdirSync('./dist')
    .filter((f) => f.endsWith('.iife.js'));

  console.log(`Found ${distFiles.length} scripts to deploy:`, distFiles);

  const registeredScripts = [];

  for (const file of distFiles) {
    const name = file.replace('.iife.js', '');
    const cdnUrl = `https://cdn.jsdelivr.net/gh/${REPO}@${SHA}/dist/${file}`;
    const version = `1.0.${Date.now()}`;

    console.log(`\nDeploying ${name}...`);
    console.log(`CDN URL: ${cdnUrl}`);

    const integrityHash = getLocalSRIHash(file);
    console.log(`Hash: ${integrityHash}`);

    console.log('Waiting for CDN...');
    await waitForCDN(cdnUrl);

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
  const publishClient = axios.create({
    baseURL: 'https://api.webflow.com/v2',
    headers: {
      Authorization: `Bearer ${SITE_TOKEN}`,
      'Content-Type': 'application/json',
    },
  });
  await publishClient.post(`/sites/${SITE_ID}/publish`, {
    customDomains: [],
    publishToWebflowSubdomain: true,
  });
  console.log('Site published!');
  console.log('Done! All scripts applied to Webflow site.');
}

deploy().catch((err) => {
  const data = err.response?.data;
  console.error(
    Buffer.isBuffer(data) ? data.toString('utf8') : data || err.message
  );
  process.exit(1);
});
