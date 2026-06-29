#!/usr/bin/env node
/**
 * Inject Google/Bing verification meta tags into index.html from indexing-config.json
 * Run after adding codes: npm run index:verify
 */
import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const config = JSON.parse(readFileSync(join(root, 'indexing-config.json'), 'utf8'));
const indexPath = join(root, 'index.html');
let html = readFileSync(indexPath, 'utf8');

const markers = {
  google: /<!-- indexing:google-site-verification -->[\s\S]*?<!-- \/indexing:google -->/,
  bing: /<!-- indexing:bing-site-verification -->[\s\S]*?<!-- \/indexing:bing -->/
};

const googleBlock = config.googleSiteVerification
  ? `<!-- indexing:google-site-verification -->\n  <meta name="google-site-verification" content="${config.googleSiteVerification}" />\n  <!-- /indexing:google -->`
  : `<!-- indexing:google-site-verification -->\n  <!-- Add code to indexing-config.json then run npm run index:verify -->\n  <!-- /indexing:google -->`;

const bingBlock = config.bingSiteVerification
  ? `<!-- indexing:bing-site-verification -->\n  <meta name="msvalidate.01" content="${config.bingSiteVerification}" />\n  <!-- /indexing:bing -->`
  : `<!-- indexing:bing-site-verification -->\n  <!-- Add code to indexing-config.json then run npm run index:verify -->\n  <!-- /indexing:bing -->`;

if (markers.google.test(html)) {
  html = html.replace(markers.google, googleBlock);
} else {
  html = html.replace('<meta charset="UTF-8" />', `<meta charset="UTF-8" />\n  ${googleBlock}\n  ${bingBlock}`);
}

if (markers.bing.test(html)) {
  html = html.replace(markers.bing, bingBlock);
}

writeFileSync(indexPath, html);
console.log('Updated index.html verification meta tags.');

// Sync to site-config.js
const siteConfigPath = join(root, 'js/site-config.js');
let siteConfig = readFileSync(siteConfigPath, 'utf8');
siteConfig = siteConfig.replace(
  /googleSiteVerification: '[^']*'/,
  `googleSiteVerification: '${config.googleSiteVerification || ''}'`
);
siteConfig = siteConfig.replace(
  /bingSiteVerification: '[^']*'/,
  `bingSiteVerification: '${config.bingSiteVerification || ''}'`
);
writeFileSync(siteConfigPath, siteConfig);
console.log('Synced js/site-config.js');
