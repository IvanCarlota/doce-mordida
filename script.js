/**
 * Carrosséis de produtos: scroll real por card, dots e setas com estado
 */
function initCarousel(trackId) {
    const track = document.getElementById(trackId);
    if (!track) return;
    const dotsEl = document.getElementById(trackId.replace('-track', '-dots'));
    const wrapper = track.closest('.carousel-wrapper');
    const prev = wrapper.querySelector('.carousel-btn.prev');
    const next = wrapper.querySelector('.carousel-btn.next');
    const gap = () => parseFloat(getComputedStyle(track).gap) || 0;
    const scrollAmount = () => track.firstElementChild ? track.firstElementChild.clientWidth + gap() : 320;

    const renderDots = () => {
        if (!dotsEl) return;
        const visiveis = window.innerWidth >= 1024 ? 3 : window.innerWidth >= 700 ? 2 : 1;
        const total = track.children.length;
        const qtdDots = Math.min(total, total - visiveis + 1);
        dotsEl.innerHTML = '';
        for (let i = 0; i < qtdDots; i++) {
            const dot = document.createElement('button');
            dot.className = 'carousel-dot';
            dot.setAttribute('aria-label', `Ir para o card ${i + 1}`);
            dot.addEventListener('click', () => {
                track.scrollTo({ left: i * scrollAmount(), behavior: 'smooth' });
            });
            dotsEl.appendChild(dot);
        }
    };

    const update = () => {
        // Leituras de geometria agrupadas antes de qualquer escrita no DOM
        // para zerar o layout thrashing (regra de performance 3.5).
        const passo = scrollAmount();
        const max = track.scrollWidth - track.clientWidth;
        const esquerda = track.scrollLeft;
        const ultimoDot = dotsEl && dotsEl.children.length > 0 ? dotsEl.children.length - 1 : -1;
        const ativo = ultimoDot < 0 ? -1
            : (max > 0 && esquerda >= max - 1) ? ultimoDot
            : Math.min(Math.round(esquerda / passo), ultimoDot);

        prev.disabled = esquerda <= 0;
        next.disabled = esquerda >= max - 1;
        if (ultimoDot >= 0) {
            Array.from(dotsEl.children).forEach((dot, i) => dot.classList.toggle('active', i === ativo));
        }
    };

    prev.addEventListener('click', () => {
        track.scrollBy({ left: -scrollAmount(), behavior: 'smooth' });
    });
    next.addEventListener('click', () => {
        track.scrollBy({ left: scrollAmount(), behavior: 'smooth' });
    });
    track.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', () => { renderDots(); update(); });
    renderDots();
    update();
}

initCarousel('ovos-track');
initCarousel('presentes-track');

/**
 * Lógica do Menu Mobile
 */
const menuToggle = document.getElementById('menu-toggle');
const navMenu = document.getElementById('nav-menu');

function toggleMenu(open) {
    const shouldOpen = open ?? !navMenu.classList.contains('active');
    navMenu.classList.toggle('active', shouldOpen);
    document.body.classList.toggle('menu-open', shouldOpen);
    menuToggle.setAttribute('aria-expanded', String(shouldOpen));
    if (shouldOpen) menuToggle.focus();
}

if (menuToggle) {
    menuToggle.addEventListener('click', () => toggleMenu());
    navMenu.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            toggleMenu(false);
            navMenu.querySelectorAll('a').forEach(a => a.removeAttribute('aria-current'));
            link.setAttribute('aria-current', 'page');
        });
    });
    document.addEventListener('keydown', e => {
        if (e.key === 'Escape' && navMenu.classList.contains('active')) toggleMenu(false);
    });
    document.addEventListener('click', e => {
        if (navMenu.classList.contains('active') && !navMenu.contains(e.target) && !menuToggle.contains(e.target)) toggleMenu(false);
    });
}

/**
 * Lógica da Expansão de Imagem (Lightbox)
 */
const modal = document.getElementById("image-modal");
const modalImg = document.getElementById("img-expanded");
const spanClose = document.querySelector(".close-modal");
const spanClosePopup = document.querySelector(".close-popup");
let ultimoFoco = null;

function fecharModalImagem() {
    if (modal) {
        modal.style.display = "none";
        document.body.style.overflow = "auto";
        if (ultimoFoco) ultimoFoco.focus();
    }
}

if (modal && modalImg) {
    document.querySelectorAll('.card img').forEach(img => {
        img.tabIndex = 0;
        img.setAttribute('role', 'button');
        img.setAttribute('aria-label', `Ampliar imagem de ${img.alt || 'produto'}`);
        img.onclick = function() {
            ultimoFoco = document.activeElement;
            modal.style.display = "flex";
            modalImg.src = this.src;
            document.body.style.overflow = "hidden"; // Trava o scroll da página
            if (spanClose) spanClose.focus();
        }
        img.onkeydown = (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                img.onclick();
            }
        };
    });

    // Fecha ao clicar no X
    if (spanClose) spanClose.onclick = fecharModalImagem;

    // Fecha ao clicar na área escura fora da imagem
    modal.onclick = function(event) {
        if (event.target === modal) {
            fecharModalImagem();
        }
    };
}



/**
 * Catálogo de produtos com preços (em reais)
 * Mantido como fallback síncrono: se produtos.json não responder,
 * subtotal e envio para o WhatsApp continuam funcionando.
 */
const CATALOGO = {
    'Ovo Brigadeiro': 57, 'Ovo Ninho com Nutella': 65, 'Ovo Surpresinha de Uva': 62,
    'Ovo Escondidinho de Brownie': 65, 'Ovo de Maracujá': 62, 'Dupla de Ovos': 79,
    'Kit Degustação': 48, 'Caixa com 6 Brigadeiros': 25, 'Caixa Livro (4 un.)': 17, 'Caixa com 2 un.': 8,
};

/**
 * Catálogo externo: mescla produtos.json sobre o fallback interno.
 */
function aplicarCatalogoRemoto(dados) {
    if (!dados || typeof dados !== 'object') return;
    Object.keys(dados).forEach(nome => { CATALOGO[nome] = dados[nome]; });
}

fetch('produtos.json')
    .then(resposta => resposta.ok ? resposta.json() : Promise.reject(new Error(resposta.status)))
    .then(aplicarCatalogoRemoto)
    .catch(() => {});

/**
 * Calcula o total da sacola (qtd * preço do catálogo)
 */
function formatarMoeda(valor) {
    return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }).replace(/\u00A0/g, ' ');
}

/**
 * Acessibilidade dos modais: ESC fecha, Tab fica preso no diálogo
 */
function elementosFocaveis(dialog) {
    return Array.from(dialog.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'))
        .filter(el => !el.disabled && el.offsetParent !== null);
}

function armadilhaDeFoco(dialog, fechar) {
    dialog.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            e.preventDefault();
            fechar();
            return;
        }
        if (e.key !== 'Tab') return;
        const focaveis = elementosFocaveis(dialog);
        if (focaveis.length === 0) return;
        const primeiro = focaveis[0];
        const ultimo = focaveis[focaveis.length - 1];
        if (e.shiftKey && document.activeElement === primeiro) {
            e.preventDefault();
            ultimo.focus();
        } else if (!e.shiftKey && document.activeElement === ultimo) {
            e.preventDefault();
            primeiro.focus();
        }
    });
}

function fecharPorTeclado(fechar) {
    return (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            fechar();
        }
    };
}

if (modal) armadilhaDeFoco(modal, fecharModalImagem);
if (spanClose) spanClose.addEventListener('keydown', fecharPorTeclado(fecharModalImagem));

/**
 * Sacola de compras: estado global persistente em localStorage.
 * Itens no formato { nome, qtd }; preços sempre resolvidos via CATALOGO.
 */
const CARRINHO_KEY = 'docemordida-carrinho-v1';
let carrinho = carregarCarrinho();

function carregarCarrinho() {
    try {
        const dados = JSON.parse(localStorage.getItem(CARRINHO_KEY));
        if (!Array.isArray(dados)) return [];
        return dados.filter(item =>
            item && typeof item.nome === 'string' && item.nome.length > 0 &&
            Number.isInteger(item.qtd) && item.qtd > 0
        );
    } catch (e) {
        return [];
    }
}

function salvarCarrinho() {
    try { localStorage.setItem(CARRINHO_KEY, JSON.stringify(carrinho)); } catch (e) {}
}

function adicionarItem(nome) {
    const item = carrinho.find(i => i.nome === nome);
    if (item) item.qtd += 1;
    else carrinho.push({ nome, qtd: 1 });
    salvarCarrinho();
    renderizarCarrinho();
    pulsarBadge();
}

function removerItem(nome) {
    carrinho = carrinho.filter(item => item.nome !== nome);
    salvarCarrinho();
    renderizarCarrinho();
}

function alterarQuantidade(nome, delta) {
    const item = carrinho.find(i => i.nome === nome);
    if (!item) return;
    item.qtd = Math.max(1, Math.min(99, item.qtd + delta));
    salvarCarrinho();
    renderizarCarrinho();
}

function limparCarrinho() {
    carrinho = [];
    salvarCarrinho();
    renderizarCarrinho();
}

function totalCarrinho() {
    return carrinho.reduce((soma, item) => soma + item.qtd * (CATALOGO[item.nome] || 0), 0);
}

/**
 * Renderiza badge, lista e subtotal do drawer a partir do estado.
 * Nomes/preços entram via textContent (nunca innerHTML) — o estado
 * pode vir do localStorage, logo é tratado como dado não confiável.
 */
function renderizarCarrinho() {
    const lista = document.getElementById('lista-sacola');
    if (!lista) return;
    const badge = document.getElementById('sacola-badge');
    const vazia = document.getElementById('sacola-vazia');
    const subtotalEl = document.getElementById('sacola-subtotal');
    const erro = document.getElementById('sacola-erro');

    if (badge) {
        const contagem = carrinho.reduce((soma, item) => soma + item.qtd, 0);
        badge.textContent = String(contagem);
        badge.hidden = contagem === 0;
    }
    if (vazia) vazia.hidden = carrinho.length > 0;

    lista.innerHTML = '';
    carrinho.forEach(item => {
        const preco = CATALOGO[item.nome] || 0;
        const li = document.createElement('li');
        li.className = 'sacola-item';
        li.dataset.nome = item.nome;

        const info = document.createElement('div');
        info.className = 'sacola-item-info';
        const nomeEl = document.createElement('span');
        nomeEl.className = 'sacola-item-nome';
        nomeEl.textContent = item.nome;
        const precoEl = document.createElement('span');
        precoEl.className = 'sacola-item-preco';
        precoEl.textContent = formatarMoeda(preco);
        info.append(nomeEl, precoEl);

        const grupo = document.createElement('div');
        grupo.className = 'sacola-qtd';
        grupo.setAttribute('role', 'group');
        grupo.setAttribute('aria-label', `Quantidade de ${item.nome}`);
        const menos = document.createElement('button');
        menos.type = 'button';
        menos.className = 'qtd-btn';
        menos.dataset.acao = 'diminuir';
        menos.dataset.nome = item.nome;
        menos.setAttribute('aria-label', `Diminuir quantidade de ${item.nome}`);
        menos.textContent = '−';
        const qtdEl = document.createElement('span');
        qtdEl.className = 'qtd-valor';
        qtdEl.setAttribute('aria-live', 'polite');
        qtdEl.textContent = String(item.qtd);
        const mais = document.createElement('button');
        mais.type = 'button';
        mais.className = 'qtd-btn';
        mais.dataset.acao = 'aumentar';
        mais.dataset.nome = item.nome;
        mais.setAttribute('aria-label', `Aumentar quantidade de ${item.nome}`);
        mais.textContent = '+';
        grupo.append(menos, qtdEl, mais);

        const remover = document.createElement('button');
        remover.type = 'button';
        remover.className = 'sacola-remover';
        remover.dataset.nome = item.nome;
        remover.setAttribute('aria-label', `Remover ${item.nome} da sacola`);
        const lixeira = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        lixeira.setAttribute('class', 'icon');
        lixeira.setAttribute('viewBox', '0 0 448 512');
        lixeira.setAttribute('aria-hidden', 'true');
        lixeira.setAttribute('focusable', 'false');
        const caminho = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        caminho.setAttribute('d', 'M135.2 17.7L128 32H32C14.3 32 0 46.3 0 64S14.3 96 32 96V416c0 35.3 28.7 64 64 64H352c35.3 0 64-28.7 64-64V96c17.7 0 32-14.3 32-32s-14.3-32-32-32H320l-7.2-14.3C307.4 6.8 296.3 0 284.2 0H163.8c-12.1 0-23.2 6.8-28.6 17.7zM416 128V416c0 17.7-14.3 32-32 32H96c-17.7 0-32-14.3-32-32V128H416z');
        lixeira.appendChild(caminho);
        remover.appendChild(lixeira);

        li.append(info, grupo, remover);
        lista.appendChild(li);
    });

    if (subtotalEl) subtotalEl.textContent = formatarMoeda(totalCarrinho());
    if (erro) erro.style.display = 'none';
}

function pulsarBadge() {
    const badge = document.getElementById('sacola-badge');
    if (!badge || badge.hidden) return;
    badge.classList.remove('pulso');
    void badge.offsetWidth; // reinicia a animação
    badge.classList.add('pulso');
}

/**
 * Drawer da sacola: abre/fecha com histórico de foco, scroll lock,
 * backdrop, ESC e armadilha de foco (padrão dos modais existentes).
 */
const sacolaDrawer = document.getElementById('sacola-drawer');
const sacolaOverlay = document.getElementById('sacola-overlay');
const btnSacola = document.getElementById('btn-sacola');

function abrirSacola() {
    if (!sacolaDrawer) return;
    ultimoFoco = document.activeElement;
    renderizarCarrinho();
    sacolaDrawer.classList.add('aberta');
    sacolaOverlay.classList.add('aberta');
    sacolaDrawer.setAttribute('aria-hidden', 'false');
    btnSacola.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
    sacolaDrawer.querySelector('.sacola-fechar').focus();
}

function fecharSacola() {
    if (!sacolaDrawer) return;
    sacolaDrawer.classList.remove('aberta');
    sacolaOverlay.classList.remove('aberta');
    sacolaDrawer.setAttribute('aria-hidden', 'true');
    btnSacola.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = 'auto';
    if (ultimoFoco) ultimoFoco.focus();
}

if (btnSacola) btnSacola.addEventListener('click', abrirSacola);

const sacolaFechar = sacolaDrawer ? sacolaDrawer.querySelector('.sacola-fechar') : null;
if (sacolaFechar) {
    sacolaFechar.addEventListener('click', fecharSacola);
    sacolaFechar.addEventListener('keydown', fecharPorTeclado(fecharSacola));
}
if (sacolaOverlay) sacolaOverlay.addEventListener('click', fecharSacola);
if (sacolaDrawer) {
    armadilhaDeFoco(sacolaDrawer, fecharSacola);
    document.addEventListener('keydown', e => {
        if (e.key === 'Escape' && sacolaDrawer.classList.contains('aberta')) fecharSacola();
    });

    const listaSacola = document.getElementById('lista-sacola');
    listaSacola.addEventListener('click', e => {
        const btn = e.target.closest('button');
        if (!btn) return;
        if (btn.classList.contains('qtd-btn')) {
            alterarQuantidade(btn.dataset.nome, btn.dataset.acao === 'aumentar' ? 1 : -1);
        } else if (btn.classList.contains('sacola-remover')) {
            removerItem(btn.dataset.nome);
        }
    });

    const btnEnviar = document.getElementById('btn-enviar-sacola');
    if (btnEnviar) btnEnviar.addEventListener('click', enviarCarrinhoWhatsApp);
    const btnLimpar = document.getElementById('btn-limpar-sacola');
    if (btnLimpar) btnLimpar.addEventListener('click', limparCarrinho);
}

/**
 * Checkout: mensagem com itens, valores individuais e total acumulado.
 * Sacola vazia não envia: exibe erro com role="alert". Após o envio,
 * a sacola é esvaziada (pedido já registrado no WhatsApp).
 */
function enviarCarrinhoWhatsApp() {
    const erro = document.getElementById('sacola-erro');
    if (carrinho.length === 0) {
        if (erro) erro.style.display = 'block';
        return;
    }
    if (erro) erro.style.display = 'none';

    let mensagem = 'Olá! Gostaria de fazer um pedido:\n\n';
    carrinho.forEach(item => {
        const preco = CATALOGO[item.nome] || 0;
        mensagem += `*${item.qtd}x* ${item.nome} — ${formatarMoeda(preco)}\n`;
    });
    mensagem += `\n*Total: ${formatarMoeda(totalCarrinho())}*\n\nRetirada em Colombo - PR.`;

    const WHATSAPP_NUMBER = window.WHATSAPP_NUMBER || '5541996309958';
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(mensagem)}`, '_blank');
    limparCarrinho();
}

// Botões dos cards adicionam à sacola com feedback temporário no botão
document.querySelectorAll('.price-tag[data-nome]').forEach(btn => {
    const rotuloOriginal = btn.textContent;
    let timer = null;
    btn.addEventListener('click', () => {
        adicionarItem(btn.dataset.nome);
        btn.textContent = '✓ Adicionado';
        btn.classList.add('price-tag-ok');
        clearTimeout(timer);
        timer = setTimeout(() => {
            btn.textContent = rotuloOriginal;
            btn.classList.remove('price-tag-ok');
        }, 1200);
    });
});

// Estado inicial: badge e drawer sincronizados com a sacola restaurada
renderizarCarrinho();

/**
 * FAQ sanfona: botões nativos com aria-expanded alternado.
 * Enter/Espaço são tratados explicitamente (preventDefault evita o
 * clique sintetizado duplicado e o scroll por Espaço).
 */
function alternarFaq(botao) {
    const aberto = botao.getAttribute('aria-expanded') === 'true';
    botao.setAttribute('aria-expanded', String(!aberto));
}
document.querySelectorAll('.faq-pergunta').forEach(botao => {
    botao.addEventListener('click', () => alternarFaq(botao));
    botao.addEventListener('keydown', evento => {
        if (evento.key === 'Enter' || evento.key === ' ') {
            evento.preventDefault();
            alternarFaq(botao);
        }
    });
});

/**
 * Service Worker: cache local para visitas repetidas
 */
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('sw.js').catch(() => {});
    });
}
/**
 * Ano do rodapé obtido da data do servidor (header HTTP Date)
 */
async function updateServerYear() {
    const yearElement = document.getElementById('current-year');
    if (!yearElement) return;
    try {
        const response = await fetch(window.location.href, { method: 'HEAD' });
        const serverDateHeader = response.headers.get('date');
        if (serverDateHeader) {
            yearElement.textContent = new Date(serverDateHeader).getFullYear();
            return;
        }
    } catch (e) {}
    yearElement.textContent = new Date().getFullYear();
}
document.addEventListener('DOMContentLoaded', updateServerYear);
