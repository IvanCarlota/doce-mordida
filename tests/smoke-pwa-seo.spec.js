const { test, expect } = require('@playwright/test');

// Contrato PWA/SEO base: manifest leve linkado e precacheado no SW v5
// (cache-first para estáticos), robots.txt e sitemap.xml estáticos
// apontando para o domínio canônico.
const CANONICA = 'https://docemordidabrigadeiros.com.br';

test('manifest.json válido, linkado no head e com identidade visual do site', async ({ request }) => {
  const html = await (await request.get('/')).text();
  expect(html).toContain('<link rel="manifest" href="manifest.json">');

  const manifest = await (await request.get('/manifest.json')).json();
  expect(manifest.name).toBe('Doce Mordida');
  expect(manifest.short_name).toBe('Doce Mordida');
  expect(manifest.start_url).toBe('./index.html');
  expect(manifest.display).toBe('standalone');
  expect(manifest.background_color).toBe('#ffffff');
  expect(manifest.theme_color).toBe('#c4e8ff');
  const icones = JSON.stringify(manifest.icons);
  expect(icones).toContain('images/logo-1.webp');
});

test('sw.js na versão v6 precacheia manifest e catálogo', async ({ request }) => {
  const sw = await (await request.get('/sw.js')).text();
  expect(sw).toContain("'doce-mordida-v6'");
  expect(sw).toContain("'./manifest.json'");
  expect(sw).toContain("'./produtos.json'");
});

test('robots.txt libera crawlers e declara o sitemap canônico', async ({ request }) => {
  const robots = await (await request.get('/robots.txt')).text();
  expect(robots).toContain('User-agent: *');
  expect(robots).toContain('Allow: /');
  expect(robots).toContain(`Sitemap: ${CANONICA}/sitemap.xml`);
});

test('sitemap.xml lista a home canônica do projeto', async ({ request }) => {
  const resposta = await request.get('/sitemap.xml');
  expect(resposta.ok()).toBeTruthy();
  const sitemap = await resposta.text();
  expect(sitemap).toContain('<urlset');
  expect(sitemap).toContain(`${CANONICA}/`);
});
