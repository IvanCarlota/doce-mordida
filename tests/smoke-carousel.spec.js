const { test, expect } = require('@playwright/test');

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