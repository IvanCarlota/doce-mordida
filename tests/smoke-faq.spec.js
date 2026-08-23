const { test, expect } = require('@playwright/test');

// Contrato da FAQ acessível: sanfona nativa com botões, aria-controls,
// alternância por clique e teclado (Enter/Espaço) e contraste WCAG AA.

test('três perguntas colapsadas com ARIA correto', async ({ page }) => {
  await page.goto('/');
  const botoes = page.locator('.faq-pergunta');
  await expect(botoes).toHaveCount(3);
  await expect(page.getByText('Dúvidas Frequentes')).toBeVisible();
  for (let i = 0; i < 3; i++) {
    await expect(botoes.nth(i)).toHaveAttribute('aria-expanded', 'false');
    await expect(botoes.nth(i)).toHaveAttribute('aria-controls', `faq-ans-${i + 1}`);
    await expect(page.locator(`#faq-ans-${i + 1}`)).not.toBeVisible();
  }
});

test('clique expande a resposta, marca expanded e recolhe no segundo clique', async ({ page }) => {
  await page.goto('/');
  const botao = page.locator('.faq-pergunta').first();
  await botao.click();
  await expect(botao).toHaveAttribute('aria-expanded', 'true');
  await expect(page.locator('#faq-ans-1')).toBeVisible();
  await botao.click();
  await expect(botao).toHaveAttribute('aria-expanded', 'false');
  await expect(page.locator('#faq-ans-1')).not.toBeVisible();
});

test('teclado completo: Enter abre e Espaço fecha', async ({ page }) => {
  await page.goto('/');
  const botao = page.locator('.faq-pergunta').first();
  await botao.focus();
  await page.keyboard.press('Enter');
  await expect(botao).toHaveAttribute('aria-expanded', 'true');
  await page.keyboard.press('Space');
  await expect(botao).toHaveAttribute('aria-expanded', 'false');
});

test('contraste WCAG AA >= 4.5:1 na pergunta e na resposta', async ({ page }) => {
  await page.goto('/');
  const botao = page.locator('.faq-pergunta').first();
  await botao.click();
  const ratio = await page.evaluate(() => {
    const lum = (cor) => {
      const m = cor.match(/\d+(\.\d+)?/g).slice(0, 3).map(Number).map(v => {
        v /= 255;
        return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
      });
      return 0.2126 * m[0] + 0.7152 * m[1] + 0.0722 * m[2];
    };
    const razao = (frente, fundo) => {
      const [a, b] = [lum(frente), lum(fundo)].sort((x, y) => y - x);
      return (a + 0.05) / (b + 0.05);
    };
    const pergunta = document.querySelector('.faq-pergunta');
    const resposta = document.querySelector('#faq-ans-1 p');
    return {
      q: razao(getComputedStyle(pergunta).color, getComputedStyle(pergunta.closest('.faq-item')).backgroundColor),
      r: razao(getComputedStyle(resposta).color, getComputedStyle(resposta.closest('.faq-item')).backgroundColor),
    };
  });
  expect(ratio.q).toBeGreaterThanOrEqual(4.5);
  expect(ratio.r).toBeGreaterThanOrEqual(4.5);
});
