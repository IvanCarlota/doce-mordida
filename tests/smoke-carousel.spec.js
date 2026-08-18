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

test('card cheio até 476px e peek do próximo card de 477px a 1023px', async ({ page }) => {
  await page.setViewportSize({ width: 476, height: 1181 });
  await page.goto('/');
  let card = page.locator('#ovos-track .card').first();
  let track = page.locator('#ovos-track');
  let cw = await card.evaluate(el => el.getBoundingClientRect().width);
  let tw = await track.evaluate(el => el.clientWidth);
  expect(Math.abs(cw - tw)).toBeLessThanOrEqual(1);
  for (const width of [477, 623, 768, 1023]) {
    await page.setViewportSize({ width, height: 1181 });
    await page.goto('/');
    card = page.locator('#ovos-track .card').first();
    track = page.locator('#ovos-track');
    cw = await card.evaluate(el => el.getBoundingClientRect().width);
    tw = await track.evaluate(el => el.clientWidth);
    expect(Math.abs(tw - cw - 60), `largura ${width}px`).toBeLessThanOrEqual(2);
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