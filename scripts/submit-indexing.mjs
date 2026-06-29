#!/usr/bin/env node
/**
 * Submit sitemap URLs to Bing/Yandex via IndexNow + ping search engines.
 * Run after deploy: npm run index:submit
 */
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');

const config = JSON.parse(readFileSync(join(root, 'indexing-config.json'), 'utf8'));
const sitemapXml = readFileSync(join(root, 'sitemap.xml'), 'utf8');

const urls = [...sitemapXml.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1].trim());

if (!urls.length) {
  console.error('No URLs found in sitemap.xml');
  process.exit(1);
}

const { host, indexNowKey, indexNowKeyLocation, sitemapUrl } = config;

async function submitIndexNow() {
  const body = {
    host,
    key: indexNowKey,
    keyLocation: indexNowKeyLocation,
    urlList: urls
  };

  const endpoints = [
    'https://api.indexnow.org/indexnow',
    'https://www.bing.com/indexnow'
  ];

  for (const endpoint of endpoints) {
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json; charset=utf-8' },
        body: JSON.stringify(body)
      });
      const ok = res.status === 200 || res.status === 202;
      console.log(`${ok ? '✓' : '✗'} IndexNow (${endpoint}): HTTP ${res.status}`);
    } catch (err) {
      console.error(`✗ IndexNow (${endpoint}): ${err.message}`);
    }
  }
}

console.log(`\nSubmitting ${urls.length} URLs from sitemap…`);
console.log(`Site: ${config.siteUrl}\n`);

await submitIndexNow();

console.log('\nDone.');
console.log('— IndexNow (HTTP 202) notifies Bing, Yandex, Seznam, and Naver.');
console.log('— Bing discovers your sitemap via robots.txt after the site is live.');
console.log('— Google: verify once in Search Console, then submit sitemap:');
console.log(`  ${sitemapUrl}`);
console.log('— Add verification codes to indexing-config.json, then run: npm run index:verify\n');
