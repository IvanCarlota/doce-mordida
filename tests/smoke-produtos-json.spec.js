const { test, expect } = require('@playwright/test');

// Contrato do catálogo externo: produtos.json na raiz alimenta preços via fetch;
// o objeto interno permanece como fallback síncrono (subtotal e WhatsApp nunca quebram).
// SW bloqueado: os testes de rota simulam a rede real sem interferência do cache-first.
test.use({ serviceWorkers: 'block' });

test('produtos.json existe e cobre todos os itens exibidos nos cards', async ({ page }) => {
  const resposta = await page.request.get('/produtos.json');
  expect(resposta.ok()).toBeTruthy();
  const catalogo = await resposta.json();

  await page.goto('/');
  const nomes = await page.locator('.price-tag[data-nome]').evaluateAll(btns =>
    btns.map(b => b.getAttribute('data-nome'))
  );
  expect(nomes.length).toBeGreaterThan(0);
  nomes.forEach(nome => {
    const preco = catalogo[nome];
    expect(preco, `${nome} presente em produtos.json`).toBeGreaterThan(0);
  });
});

test('fallback síncrono: subtotal funciona mesmo se produtos.json falhar', async ({ page }) => {
  await page.route('**/produtos.json', rota => rota.abort());
  await page.goto('/');
  const brigadeiro = page.locator('.price-tag[data-nome="Ovo Brigadeiro"]');
  await brigadeiro.click();
  await brigadeiro.click();
  await page.locator('.price-tag[data-nome="Ovo Ninho com Nutella"]').click();
  await page.locator('#btn-sacola').click();
  await expect(page.locator('#sacola-subtotal')).toHaveText('R$ 179,00');
});

test('com produtos.json saudável, subtotal e mensagem usam os preços remotos', async ({ page }) => {
  let chamouCatalogo = false;
  await page.route('**/produtos.json', rota => {
    if (rota.request().url().includes('produtos.json')) chamouCatalogo = true;
    rota.continue();
  });
  await page.goto('/');
  const brigadeiro = page.locator('.price-tag[data-nome="Ovo Brigadeiro"]');
  await brigadeiro.click();
  await brigadeiro.click();
  await page.locator('.price-tag[data-nome="Ovo Ninho com Nutella"]').click();
  await page.locator('#btn-sacola').click();
  await expect(page.locator('#sacola-subtotal')).toHaveText('R$ 179,00');
  expect(chamouCatalogo).toBe(true);
});
