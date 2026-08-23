const { test, expect } = require('@playwright/test');

// Rede de proteção comportamental para o refactor de reflow do carrossel:
// estados de borda dos botões e dot ativo devem continuar idênticos.
test('setas do carrossel desabilitam nas bordas e dots acompanham', async ({ page }) => {
  await page.goto('/');
  const section = page.locator('#ovos');
  const prev = section.locator('.carousel-btn.prev');
  const next = section.locator('.carousel-btn.next');
  const dots = section.locator('.carousel-dot');

  await expect(prev).toBeDisabled();
  await expect(next).toBeEnabled();
  await expect(dots.first()).toHaveClass(/active/);

  await next.click();
  await expect(prev).toBeEnabled();

  // vai até a borda final
  await page.locator('#ovos-track').evaluate(el => el.scrollTo({ left: el.scrollWidth, behavior: 'instant' }));
  await expect(next).toBeDisabled();
  await expect(dots.last()).toHaveClass(/active/);
});
