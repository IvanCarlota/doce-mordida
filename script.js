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
 * Lógica do Pop-up de Pedido Personalizado
 */
const modalPedido = document.getElementById('modal-pedido');

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
 * Calcula e exibe o subtotal do pedido em tempo real
 */
function atualizarSubtotal() {
    const inputs = document.querySelectorAll('#lista-itens-pedido input');
    let total = 0;
    inputs.forEach(inp => {
        const qtd = parseInt(inp.value) || 0;
        total += qtd * (CATALOGO[inp.getAttribute('data-nome')] || 0);
    });
    const el = document.getElementById('valor-total');
    if (el) el.textContent = total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    return total;
}

document.querySelectorAll('#lista-itens-pedido input').forEach(inp => {
    inp.addEventListener('input', atualizarSubtotal);
});

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
if (spanClosePopup) {
    spanClosePopup.addEventListener('click', fecharModalPedido);
    spanClosePopup.addEventListener('keydown', fecharPorTeclado(fecharModalPedido));
}
if (modalPedido) armadilhaDeFoco(modalPedido, fecharModalPedido);

// Função para abrir o modal de pedido
function abrirModalPedido(itemNome) {
    if (itemNome) {
        const inp = document.querySelector(`#lista-itens-pedido input[data-nome="${itemNome}"]`);
        if (inp) inp.value = '1';
    }
    if (modalPedido) {
        ultimoFoco = document.activeElement;
        modalPedido.style.display = 'flex';
        document.body.style.overflow = 'hidden';
        atualizarSubtotal();
        const primeiroInput = modalPedido.querySelector('#lista-itens-pedido input');
        if (primeiroInput) primeiroInput.focus();
    }
}

// Botões "Pedir" dos cards abrem o modal com o item pré-selecionado
document.querySelectorAll('.price-tag[data-nome]').forEach(btn => {
    btn.addEventListener('click', () => abrirModalPedido(btn.dataset.nome));
});

// Função para fechar o modal de pedido
function fecharModalPedido() {
    if (modalPedido) {
        modalPedido.style.display = 'none';
        document.body.style.overflow = 'auto';
        
        // Resetar a mensagem de erro ao fechar
        const erroVisual = document.getElementById('mensagem-erro-vazio');
        if (erroVisual) erroVisual.style.display = 'none';

        if (ultimoFoco) ultimoFoco.focus();
    }
}

// Função para processar os itens e enviar para o WhatsApp
function enviarPedidoWhatsApp() {
    const inputs = document.querySelectorAll('#lista-itens-pedido input');
    const erroVisual = document.getElementById('mensagem-erro-vazio');
    let mensagem = "Olá! Gostaria de fazer um pedido:\n\n";
    let temItens = false;
    let total = 0;

    inputs.forEach(input => {
        const qtd = parseInt(input.value);
        if (qtd > 0) {
            const nome = input.getAttribute('data-nome');
            const preco = CATALOGO[nome] || 0;
            total += qtd * preco;
            mensagem += `*${qtd}x* ${nome} — R$ ${preco.toFixed(2).replace('.', ',')}\n`;
            temItens = true;
        }
    });

    if (!temItens) {
        // Exibe o erro estilizado em vez do alert nativo
        if (erroVisual) {
            erroVisual.style.display = 'block';
        }
        return;
    }

    // Esconde o erro se itens forem selecionados
    if (erroVisual) erroVisual.style.display = 'none';

    mensagem += `\n*Total: R$ ${total.toFixed(2).replace('.', ',')}*\n\nRetirada em Colombo - PR.`;
    
    // Codifica a mensagem para URL e redireciona para o WhatsApp
    const WHATSAPP_NUMBER = window.WHATSAPP_NUMBER || '5541996309958';
    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(mensagem)}`;
    window.open(url, '_blank');
    fecharModalPedido();
}

/**
 * Listener Global para Cliques Fora dos Modais
 */
window.addEventListener('click', (event) => {

    // Fecha o modal de pedido se clicar fora dele
    if (event.target === modalPedido) {
        fecharModalPedido();
    }
});

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
