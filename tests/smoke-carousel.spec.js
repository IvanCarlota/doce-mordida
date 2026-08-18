const { test, expect } = require('@playwright/test');

test('mobile: card ocupa 100% do espaço entre os botões', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto('/');
  const card = page.locator('#ovos-track .card').first();
  const track = page.locator('#ovos-track');
  const cw = await card.evaluate(el => el.getBoundingClientRect().width);
  const tw = await track.evaluate(el => el.clientWidth);
  expect(Math.abs(cw - tw)).toBeLessThanOrEqual(1);
  const cardRight = await card.evaluate(el => el.getBoundingClientRect().right);
  const btnNextLeft = await page.locator('#ovos-track').locator('..').locator('.carousel-btn.next').evaluate(el => el.getBoundingClientRect().left);
  const btnPrevRight = await page.locator('#ovos-track').locator('..').locator('.carousel-btn.prev').evaluate(el => el.getBoundingClientRect().right);
  expect(Math.abs(cardRight - btnNextLeft)).toBeLessThanOrEqual(1);
  const cardLeft = await card.evaluate(el => el.getBoundingClientRect().left);
  expect(Math.abs(cardLeft - btnPrevRight)).toBeLessThanOrEqual(1);
});

test('responsividade dos cards por faixa de pixel', async ({ page }) => {
  const casos = [
    { width: 470, fator: (tw) => tw },
    { width: 471, fator: (tw) => 0.88 * tw - 20 },
    { width: 699, fator: (tw) => 0.88 * tw - 20 },
    { width: 700, fator: (tw) => (tw - 60) / 2 },
    { width: 1023, fator: (tw) => (tw - 60) / 2 },
  ];
  for (const c of casos) {
    await page.setViewportSize({ width: c.width, height: 1181 });
    await page.goto('/');
    const card = page.locator('#ovos-track .card').first();
    const track = page.locator('#ovos-track');
    const cw = await card.evaluate(el => el.getBoundingClientRect().width);
    const tw = await track.evaluate(el => el.clientWidth);
    expect(Math.abs(cw - c.fator(tw)), `largura ${c.width}px`).toBeLessThanOrEqual(2);
  }
});

test('carrossel: dots, scroll real e setas desabilitadas nas pontas', async ({ page }) => {
  await page.goto('/');
  const track = page.locator('#ovos-track');
  await expect(page.locator('#ovos-dots .carousel-dot')).toHaveCount(5);
  const wrapper = track.locator('..');
  const next = wrapper.locator('.carousel-btn.next');
  const prev = wrapper.locator('.carousel-btn.prev');
  await expect(prev).toBeDisabled();
  await next.click();
  await page.waitForTimeout(600);
  const x = await track.evaluate(el => el.scrollLeft);
  expect(x).toBeGreaterThan(0);
  await track.evaluate(el => { el.scrollLeft = el.scrollWidth; el.dispatchEvent(new Event('scroll')); });
  await expect(next).toBeDisabled();
  await expect(prev).toBeEnabled();
  const dot2 = page.locator('#ovos-dots .carousel-dot').nth(1);
  await dot2.click();
  await page.waitForTimeout(600);
  const y = await track.evaluate(el => el.scrollLeft);
  expect(y).toBeGreaterThan(0);
  await expect(page.locator('#ovos-dots .carousel-dot').nth(1)).toHaveClass(/active/);
});