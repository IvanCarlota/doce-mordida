/**
 * Função para rolar os carrosséis de produtos
 */
function scrollCarousel(trackId, direction) {
    const track = document.getElementById(trackId);
    // Deslocamento: 300px do card + 20px de gap
    const cardWidth = 320; 
    
    track.scrollBy({
        left: direction * cardWidth,
        behavior: 'smooth'
    });
}

/**
 * Lógica do Menu Mobile
 */
const menuToggle = document.getElementById('menu-toggle');
const navMenu = document.getElementById('nav-menu');
const body = document.body;

if (menuToggle) {
    menuToggle.addEventListener('click', () => {
        navMenu.classList.toggle('active');
        body.classList.toggle('menu-open');
        const icon = menuToggle.querySelector('i');
        icon.classList.toggle('fa-bars');
        icon.classList.toggle('fa-times');
    });
}

// Fecha o menu ao clicar em um link
document.querySelectorAll('.nav-pill a').forEach(link => {
    link.addEventListener('click', () => {
        navMenu.classList.remove('active');
        body.classList.remove('menu-open');
        const icon = menuToggle.querySelector('i');
        if (icon) {
            icon.classList.add('fa-bars');
            icon.classList.remove('fa-times');
        }
    });
});

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
 */
const CATALOGO = {
    'Ovo Brigadeiro': 57, 'Ovo Ninho com Nutella': 65, 'Ovo Surpresinha de Uva': 62,
    'Ovo Escondidinho de Brownie': 65, 'Ovo de Maracujá': 62, 'Dupla de Ovos': 79,
    'Kit Degustação': 48, 'Caixa com 6 Brigadeiros': 25, 'Caixa Livro (4 un.)': 17, 'Caixa com 2 un.': 8,
};

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
function abrirModalPedido() {
    if (modalPedido) {
        ultimoFoco = document.activeElement;
        modalPedido.style.display = 'flex';
        document.body.style.overflow = 'hidden';
        atualizarSubtotal();
        const primeiroInput = modalPedido.querySelector('#lista-itens-pedido input');
        if (primeiroInput) primeiroInput.focus();
    }
}

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
    const url = `https://wa.me/5541996309958?text=${encodeURIComponent(mensagem)}`;
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