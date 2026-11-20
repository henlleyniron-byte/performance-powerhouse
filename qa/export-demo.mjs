import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { parseHTML } from 'linkedom';

const publicRoot = new URL('../hosted-source/public/', import.meta.url);
const output = new URL('../demo/', import.meta.url);
const liveSite = 'https://al-performance-powerhouse.phenlleyniron.chatgpt.site/';
mkdirSync(output, { recursive: true });

function readPage(path) {
  const source = new URL(path, publicRoot);
  const { document } = parseHTML(readFileSync(source, 'utf8'));
  return { source, document };
}

function writeOfflinePage({ source, document }, name) {
  function readAsset(path) {
    const url = path.startsWith('/') ? new URL(path.slice(1), publicRoot) : new URL(path, source);
    if (!url.href.startsWith(publicRoot.href)) throw Error('Asset outside the public source: ' + path);
    return readFileSync(url, 'utf8');
  }
  for (const link of document.querySelectorAll('link[rel="stylesheet"]')) {
    const style = document.createElement('style');
    style.textContent = readAsset(link.getAttribute('href'));
    link.replaceWith(style);
  }
  for (const script of document.querySelectorAll('script[src]')) {
    const code = readAsset(script.getAttribute('src'));
    script.removeAttribute('src');
    script.textContent = code.replace(/<\/script/gi, '<\\/script');
    // Inline scripts ignore defer. The lesson engine needs the body to exist.
    if (script.hasAttribute('defer')) {
      script.removeAttribute('defer');
      document.body.append(script);
    }
  }
  const icon = document.querySelector('link[rel="icon"]');
  if (icon) icon.setAttribute('href', 'data:image/svg+xml;base64,' + Buffer.from(readAsset(icon.getAttribute('href'))).toString('base64'));
  document.documentElement.before(document.createComment(' Generated from the public source. Rebuild with npm run demo --prefix qa. '));
  writeFileSync(new URL(name, output), document.toString().replace(/^[ \t]+$/gm, '').trimEnd() + '\n');
}

const community = readPage('community-share.html');
const doc = community.document;
doc.querySelector('script[src="/workspace-shell/shell.js"]').remove();
doc.querySelector('link[href="/workspace-shell/shell.css"]').remove();
for (const link of doc.querySelectorAll('a[href]')) {
  const href = link.getAttribute('href');
  if (!href.startsWith('#')) link.setAttribute('href', new URL(href, liveSite).href);
}
doc.querySelector('.context').textContent = 'Sri Lankan G.C.E. A/L · Offline demo';
doc.querySelector('.example-note').textContent = 'This example runs offline using the V22 retest rules. The dashboard and study module links open the hosted site.';
writeOfflinePage(community, 'repair-loop.html');

const academy = readPage('biology-academy/index.html');
const academyOrigin = new URL('biology-academy/', liveSite);
for (const link of academy.document.querySelectorAll('[data-academy-destination]')) {
  // Keep the hosted destinations out of the local file:// directory.
  link.setAttribute('href', new URL(link.getAttribute('href'), academyOrigin).href);
  link.removeAttribute('data-academy-destination');
}
academy.document.querySelector('.kicker').textContent = 'Sri Lankan G.C.E. A/L · Offline edition';
academy.document.querySelector('.reference p').textContent += ' The syllabus and hosted workbench links require internet access.';
writeOfflinePage(academy, 'biology-academy.html');
