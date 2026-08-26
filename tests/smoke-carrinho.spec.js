const { test, expect } = require('@playwright/test');

// Contrato da sacola: estado global persistente em localStorage, drawer lateral
// acessível e checkout via WhatsApp. Os botões dos cards alimentam a sacola.

const KEY = 'docemordida-carrinho-v1';

test.describe('sacola: estado e persistência', () => {
  test('card: botão "Adicionar à Sacola" com preço adiciona item, badge e localStorage', async ({ page }) => {
    await page.goto('/');
    const btn = page.locator('.price-tag[data-nome="Ovo Brigadeiro"]');
    await expect(btn).toHaveText(/Adicionar à Sacola · R\$ 57,00/);
    await btn.click();
    await expect(page.locator('#sacola-badge')).toHaveText('1');
    const salvo = await page.evaluate(nome => JSON.parse(localStorage.getItem(nome)), KEY);
    expect(salvo).toEqual([{ nome: 'Ovo Brigadeiro', qtd: 1 }]);
    await expect.poll(() => btn.textContent(), { timeout: 3000 }).toMatch(/adicionar à sacola/i);
  });

  test('funções globais: adicionarItem, alterarQuantidade (clamp 1), removerItem e limparCarrinho', async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => { adicionarItem('Ovo Brigadeiro'); adicionarItem('Ovo Brigadeiro'); adicionarItem('Kit Degustação'); });
    await expect(page.locator('#sacola-badge')).toHaveText('3');
    await page.evaluate(() => alterarQuantidade('Ovo Brigadeiro', -1));
    await expect(page.locator('#sacola-badge')).toHaveText('2');
    await page.evaluate(() => alterarQuantidade('Ovo Brigadeiro', -5));
    const salvo = await page.evaluate(nome => JSON.parse(localStorage.getItem(nome)), KEY);
    expect(salvo).toEqual([{ nome: 'Ovo Brigadeiro', qtd: 1 }, { nome: 'Kit Degustação', qtd: 1 }]);
    await page.evaluate(() => removerItem('Ovo Brigadeiro'));
    await expect(page.locator('#sacola-badge')).toHaveText('1');
    await page.evaluate(() => limparCarrinho());
    await expect(page.locator('#sacola-badge')).toBeHidden();
    expect(await page.evaluate(nome => localStorage.getItem(nome), KEY)).toBe('[]');
  });

  test('persistência: itens sobrevivem ao reload e aparecem no drawer', async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => { adicionarItem('Ovo Brigadeiro'); adicionarItem('Ovo Brigadeiro'); });
    await page.reload();
    await expect(page.locator('#sacola-badge')).toHaveText('2');
    await page.locator('#btn-sacola').click();
    await expect(page.locator('#lista-sacola .sacola-item')).toHaveCount(1);
    await expect(page.locator('.sacola-item[data-nome="Ovo Brigadeiro"] .qtd-valor')).toHaveText('2');
  });
});

test.describe('sacola: drawer acessível', () => {
  test('abre pelo header e pelo CTA; diálogo semântico, ESC fecha e foco restaurado', async ({ page }) => {
    await page.goto('/');
    const drawer = page.locator('#sacola-drawer');
    const gatilho = page.locator('#btn-sacola');
    await gatilho.click();
    await expect(drawer).toBeVisible();
    await expect(drawer).toHaveAttribute('role', 'dialog');
    await expect(drawer).toHaveAttribute('aria-modal', 'true');
    await expect(drawer).toHaveAttribute('aria-labelledby', 'titulo-sacola');
    await expect(gatilho).toHaveAttribute('aria-expanded', 'true');
    await expect(drawer.locator('.sacola-fechar')).toBeFocused();
    await page.keyboard.press('Escape');
    await expect(drawer).toBeHidden();
    await expect(gatilho).toHaveAttribute('aria-expanded', 'false');
    await expect(gatilho).toBeFocused();
    await page.getByRole('button', { name: /fazer meu pedido/i }).first().click();
    await expect(drawer).toBeVisible();
  });

  test('foco fica preso no drawer (Tab cicla do último para o primeiro controle)', async ({ page }) => {
    await page.goto('/');
    await page.locator('#btn-sacola').click();
    const drawer = page.locator('#sacola-drawer');
    await drawer.locator('#btn-limpar-sacola').focus();
    await page.keyboard.press('Tab');
    await expect(drawer.locator('.sacola-fechar')).toBeFocused();
    await page.keyboard.press('Shift+Tab');
    await expect(drawer.locator('#btn-limpar-sacola')).toBeFocused();
  });

  test('drawer mobile-first: largura total no mobile, 380px a partir de 480px', async ({ page }) => {
    await page.goto('/');
    await page.locator('#btn-sacola').click();
    const box = await page.locator('#sacola-drawer').boundingBox();
    const vw = page.viewportSize().width;
    if (vw < 480) expect(Math.round(box.width)).toBe(vw);
    else expect(Math.round(box.width)).toBe(380);
  });

  test('botão do header tem hitbox de 48px', async ({ page }) => {
    await page.goto('/');
    const box = await page.locator('#btn-sacola').boundingBox();
    expect(box.width).toBeGreaterThanOrEqual(48);
    expect(box.height).toBeGreaterThanOrEqual(48);
  });
});

test.describe('sacola: subtotal e checkout', () => {
  test('subtotal em tempo real reflete +/− por item', async ({ page }) => {
    await page.goto('/');
    const brigadeiro = page.locator('.price-tag[data-nome="Ovo Brigadeiro"]');
    await brigadeiro.click();
    await brigadeiro.click();
    await page.locator('.price-tag[data-nome="Ovo Ninho com Nutella"]').click();
    await page.locator('#btn-sacola').click();
    await expect(page.locator('#sacola-subtotal')).toHaveText('R$ 179,00');
    await page.locator('.sacola-item[data-nome="Ovo Ninho com Nutella"] [data-acao="aumentar"]').click();
    await expect(page.locator('#sacola-subtotal')).toHaveText('R$ 244,00');
    await page.locator('.sacola-item[data-nome="Ovo Brigadeiro"] [data-acao="diminuir"]').click();
    await expect(page.locator('#sacola-subtotal')).toHaveText('R$ 187,00');
  });

  test('checkout: mensagem com itens, valores individuais, total e sacola esvaziada', async ({ page }) => {
    await page.addInitScript(() => { window.WHATSAPP_NUMBER = '5541998026260'; });
    let waUrl = '';
    await page.context().route('**/wa.me/**', route => {
      waUrl = route.request().url();
      route.fulfill({ status: 200, contentType: 'text/html', body: '<html></html>' });
    });
    await page.goto('/');
    await page.evaluate(() => { adicionarItem('Ovo Brigadeiro'); adicionarItem('Ovo Brigadeiro'); adicionarItem('Ovo Ninho com Nutella'); });
    await page.locator('#btn-sacola').click();
    await page.locator('#btn-enviar-sacola').click();
    await expect.poll(() => waUrl).toContain('wa.me/5541998026260');
    const texto = decodeURIComponent(waUrl.split('text=')[1]).replace(/\+/g, ' ');
    expect(texto).toContain('*2x* Ovo Brigadeiro — R$ 57,00');
    expect(texto).toContain('*1x* Ovo Ninho com Nutella — R$ 65,00');
    expect(texto).toContain('*Total: R$ 179,00*');
    expect(texto).toContain('Retirada em Colombo - PR');
    await expect(page.locator('#sacola-badge')).toBeHidden();
    expect(await page.evaluate(nome => localStorage.getItem(nome), KEY)).toBe('[]');
  });

  test('sacola vazia: erro role=alert visível, drawer permanece aberto e estado vazio exibido', async ({ page }) => {
    await page.goto('/');
    await page.locator('#btn-sacola').click();
    await expect(page.locator('#sacola-vazia')).toBeVisible();
    await page.locator('#btn-enviar-sacola').click();
    await expect(page.locator('#sacola-erro')).toHaveAttribute('role', 'alert');
    await expect(page.locator('#sacola-erro')).toBeVisible();
    await expect(page.locator('#sacola-drawer')).toBeVisible();
  });

  test('remover item e limpar sacola esvaziam lista, badge e storage', async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => { adicionarItem('Ovo Brigadeiro'); adicionarItem('Kit Degustação'); });
    await page.locator('#btn-sacola').click();
    await page.locator('.sacola-item[data-nome="Ovo Brigadeiro"] .sacola-remover').click();
    await expect(page.locator('#lista-sacola .sacola-item')).toHaveCount(1);
    await expect(page.locator('#sacola-badge')).toHaveText('1');
    await page.locator('#btn-limpar-sacola').click();
    await expect(page.locator('#lista-sacola .sacola-item')).toHaveCount(0);
    await expect(page.locator('#sacola-badge')).toBeHidden();
    await expect(page.locator('#sacola-vazia')).toBeVisible();
    expect(await page.evaluate(nome => localStorage.getItem(nome), KEY)).toBe('[]');
  });
});

test.describe('lightbox', () => {
  test('diálogo, ESC e Enter no fechar restauram foco', async ({ page }) => {
    await page.goto('/');
    const img = page.locator('.card img').first();
    await img.click();
    const lightbox = page.locator('#image-modal');
    await expect(lightbox).toBeVisible();
    await expect(lightbox).toHaveAttribute('role', 'dialog');
    await expect(lightbox.locator('.close-modal')).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(lightbox).toBeHidden();
    await expect(img).toBeFocused();
    await img.click();
    await expect(lightbox).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(lightbox).toBeHidden();
    await expect(img).toBeFocused();
  });
});
