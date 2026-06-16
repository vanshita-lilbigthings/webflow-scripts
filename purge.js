const fs = require('fs');

const REPO = 'vanshita-lilbigthings/webflow-scripts';
const SHA = process.env.DEPLOY_SHA ?? 'main';

async function purgeAll() {
  const distFiles = fs
    .readdirSync('./dist')
    .filter((f) => f.endsWith('.iife.js'));

  console.log(
    `Purging jsDelivr cache for ${distFiles.length} files at ${SHA}...`
  );

  await Promise.all(
    distFiles.map(async (file) => {
      const url = `https://purge.jsdelivr.net/gh/${REPO}@${SHA}/dist/${file}`;
      try {
        const res = await fetch(url);
        console.log(`Purged ${file} (${res.status})`);
      } catch (err) {
        console.warn(`Failed to purge ${file}: ${err.message}`);
      }
    })
  );

  console.log('Purge complete.');
}

purgeAll().catch(console.error);
