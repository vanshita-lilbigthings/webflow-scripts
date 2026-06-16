const axios = require('axios');
const crypto = require('crypto');
const fs = require('fs');

const TOKEN = process.env.WEBFLOW_ACCESS_TOKEN;
const SITE_ID = process.env.WEBFLOW_SITE_ID;
const SITE_TOKEN = process.env.WEBFLOW_SITE_TOKEN;
const REPO = 'vanshita-lilbigthings/webflow-scripts';
const SHA = process.env.DEPLOY_SHA ?? 'main';

const client = axios.create({
  baseURL: 'https://api.webflow.com/v2',
  headers: {
    Authorization: `Bearer ${TOKEN}`,
    'Content-Type': 'application/json',
  },
});

async function waitForJsDelivr(fileName, commitSha) {
  const url = `https://cdn.jsdelivr.net/gh/${REPO}@${commitSha}/dist/${fileName}`;
  console.log(`Polling URL: ${url}`);

  const maxRetries = 20;
  const delayMs = 15000;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetch(url, { method: 'HEAD' });
      const headers = Object.fromEntries(response.headers.entries());
      console.log(
        `  [${fileName}] attempt ${attempt}: HTTP ${response.status}`
      );

      if (!response.ok) {
        console.log(`  Headers: ${JSON.stringify(headers)}`);
      }

      if (response.ok) {
        console.log(`✓ ${fileName} available after ${attempt} attempt(s)`);
        return true;
      }
    } catch (err) {
      console.warn(`  [${fileName}] attempt ${attempt}: ERROR ${err.message}`);
    }

    await new Promise((resolve) => setTimeout(resolve, delayMs));
  }

  console.warn(
    `⚠ ${fileName} not available after ${maxRetries} retries. Skipping.`
  );
  return false;
}

async function generateSriHash(fileName, commitSha) {
  const url = `https://cdn.jsdelivr.net/gh/${REPO}@${commitSha}/dist/${fileName}`;
  const response = await fetch(url);
  const buffer = await response.arrayBuffer();
  const hash = crypto
    .createHash('sha256')
    .update(Buffer.from(buffer))
    .digest('base64');
  return `sha256-${hash}`;
}

async function deploy() {
  const distFiles = fs
    .readdirSync('./dist')
    .filter((f) => f.endsWith('.iife.js'));

  console.log(`SHA: ${SHA}`);
  console.log(`Found ${distFiles.length} scripts to deploy:`, distFiles);

  const registeredScripts = [];

  for (const file of distFiles) {
    const name = file.replace('.iife.js', '');
    const displayName = name.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
    const cdnUrl = `https://cdn.jsdelivr.net/gh/${REPO}@${SHA}/dist/${file}`;
    const version = `1.0.${Date.now()}`;

    console.log(`\nDeploying ${name}...`);

    const available = await waitForJsDelivr(file, SHA);
    if (!available) continue;

    const integrityHash = await generateSriHash(file, SHA);
    console.log(`Hash: ${integrityHash}`);

    console.log('Registering script...');
    const register = await client.post(
      `/sites/${SITE_ID}/registered_scripts/hosted`,
      {
        hostedLocation: cdnUrl,
        integrityHash,
        canCopy: true,
        displayName: `${displayName}${Date.now()}`,
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

  if (registeredScripts.length === 0) {
    console.warn('No scripts registered — skipping apply and publish.');
    return;
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
