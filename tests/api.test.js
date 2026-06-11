const axios = require('axios');
const crypto = require('crypto');

const TOKEN = process.env.WEBFLOW_ACCESS_TOKEN;
const SITE_ID = process.env.WEBFLOW_SITE_ID;
const CDN_URL =
  'https://cdn.jsdelivr.net/gh/vanshita-lilbigthings/webflow-scripts@main/dist/navbar.iife.js';

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

describe('Webflow Scripts API', () => {
  let scriptId;
  let version;

  test('CDN file is accessible', async () => {
    const response = await axios.get(CDN_URL);
    expect(response.status).toBe(200);
  });

  test('SRI hash is generated correctly', async () => {
    const hash = await getSRIHash(CDN_URL);
    expect(hash).toMatch(/^sha256-/);
    expect(hash.length).toBeGreaterThan(10);
  });

  test('Script registers successfully with Webflow', async () => {
    const integrityHash = await getSRIHash(CDN_URL);
    version = `1.0.${Date.now()}`;

    try {
      const response = await client.post(
        `/sites/${SITE_ID}/registered_scripts/hosted`,
        {
          hostedLocation: CDN_URL,
          integrityHash,
          canCopy: true,
          displayName: `navbartest${Date.now()}`,
          version,
        }
      );
      expect(response.status).toBe(201);
      expect(response.data.id).toBeDefined();
      scriptId = response.data.id;
    } catch (err) {
      console.log('FULL ERROR:', JSON.stringify(err.response?.data, null, 2));
      throw err;
    }
  });

  test('Registered script appears in site script list', async () => {
    const response = await client.get(`/sites/${SITE_ID}/registered_scripts`);
    expect(response.status).toBe(200);
    const scripts = response.data.registeredScripts;
    const found = scripts.some((s) => s.id === scriptId);
    expect(found).toBe(true);
  });

  test('Script is applied to site successfully', async () => {
    const response = await client.put(`/sites/${SITE_ID}/custom_code`, {
      scripts: [
        {
          id: scriptId,
          location: 'footer',
          version,
        },
      ],
    });
    expect(response.status).toBe(200);
  });

  test('Applied script appears in site custom code', async () => {
    const response = await client.get(`/sites/${SITE_ID}/custom_code`);
    expect(response.status).toBe(200);
    const scripts = response.data.scripts;
    const found = scripts.some((s) => s.id === scriptId);
    expect(found).toBe(true);
  });
});
