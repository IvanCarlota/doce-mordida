const { test, expect } = require('@playwright/test');

// Contrato SEO estruturado: um único bloco JSON-LD com FAQPage espelhando
// a FAQ visível e ItemList com os 10 produtos do catálogo (preços em BRL).

test('um único bloco JSON-LD com FAQPage e ItemList no @graph', async ({ page }) => {
  await page.goto('/');
  const dados = await page.evaluate(() => {
    const blocos = document.querySelectorAll('script[type="application/ld+json"]');
    if (blocos.length !== 1) return { erro: `esperado 1 bloco, veio ${blocos.length}` };
    return JSON.parse(blocos[0].textContent);
  });
  expect(dados.erro).toBeUndefined();
  const faq = dados['@graph'].find(n => n['@type'] === 'FAQPage');
  const lista = dados['@graph'].find(n => n['@type'] === 'ItemList');
  expect(faq).toBeTruthy();
  expect(lista).toBeTruthy();
});

test('perguntas do schema espelham exatamente a FAQ visível', async ({ page }) => {
  await page.goto('/');
  const { visiveis, esquema } = await page.evaluate(() => {
    const bloco = JSON.parse(document.querySelector('script[type="application/ld+json"]').textContent);
    return {
      visiveis: Array.from(document.querySelectorAll('.faq-pergunta')).map(b => b.textContent.trim()),
      esquema: bloco['@graph'].find(n => n['@type'] === 'FAQPage').mainEntity.map(q => q.name.trim()),
    };
  });
  expect(esquema).toEqual(visiveis);
  for (let i = 0; i < esquema.length; i++) {
    const texto = await page.locator(`#faq-ans-${i + 1} p`).textContent();
    // as respostas visíveis não podem ser vazias (conteúdo real ao usuário)
    expect(texto.trim().length, `resposta ${i + 1}`).toBeGreaterThan(10);
  }
});

test('ItemList cobre os 10 produtos com preço BRL positivo', async ({ page }) => {
  await page.goto('/');
  const itens = await page.evaluate(() =>
    JSON.parse(document.querySelector('script[type="application/ld+json"]').textContent)
      ['@graph'].find(n => n['@type'] === 'ItemList').itemListElement
  );
  expect(itens).toHaveLength(10);
  itens.forEach((entrada, indice) => {
    expect(entrada.position, `posição do item ${indice}`).toBe(indice + 1);
    expect(entrada.item.name).toBeTruthy();
    expect(Number(entrada.item.offers.price)).toBeGreaterThan(0);
    expect(entrada.item.offers.priceCurrency).toBe('BRL');
    expect(entrada.item.image).toContain('docemordidabrigadeiros.com.br');
  });
});
