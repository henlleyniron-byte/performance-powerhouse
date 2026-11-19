import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { parseHTML } from 'linkedom';

const publicRoot = new URL('../hosted-source/public/', import.meta.url);
const output = new URL('../demo/', import.meta.url);
const liveSite = 'https://al-performance-powerhouse.phenlleyniron.chatgpt.site/';
const readPublic = path => readFileSync(new URL(path.replace(/^\//, ''), publicRoot), 'utf8');
const { document } = parseHTML(readPublic('community-share.html'));

// The shared site navigation links to local routes. The standalone page uses
// its own dashboard and module links, which point to the hosted workbench.
document.querySelector('script[src="/workspace-shell/shell.js"]').remove();
document.querySelector('link[href="/workspace-shell/shell.css"]').remove();
for (const link of document.querySelectorAll('link[rel="stylesheet"]')) {
  const style = document.createElement('style');
  style.textContent = readPublic(link.getAttribute('href'));
  link.replaceWith(style);
}
for (const script of document.querySelectorAll('script[src]')) {
  const source = readPublic(script.getAttribute('src'));
  script.removeAttribute('src');
  script.textContent = source.replace(/<\/script/gi, '<\\/script');
}
const icon = document.querySelector('link[rel="icon"]');
icon.setAttribute('href', 'data:image/svg+xml;base64,' + Buffer.from(readPublic(icon.getAttribute('href'))).toString('base64'));
for (const link of document.querySelectorAll('a[href]')) {
  const href = link.getAttribute('href');
  if (!href.startsWith('#')) link.setAttribute('href', new URL(href, liveSite).href);
}
document.querySelector('.context').textContent = 'Sri Lankan G.C.E. A/L · Offline demo';
document.querySelector('.example-note').textContent = 'This example runs offline using the V22 retest rules. The dashboard and study module links open the hosted site.';
document.documentElement.before(document.createComment(' Generated from the public Community Share page. Rebuild with npm run demo --prefix qa. '));
mkdirSync(output, { recursive: true });
writeFileSync(new URL('repair-loop.html', output), document.toString().replace(/^[ \t]+$/gm, '').trimEnd() + '\n');
