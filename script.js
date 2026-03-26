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

if (modal && modalImg) {
    document.querySelectorAll('.card img').forEach(img => {
        img.onclick = function() {
            modal.style.display = "flex";
            modalImg.src = this.src;
            document.body.style.overflow = "hidden"; // Trava o scroll da página
        }
    });

    // Fecha ao clicar no X
    if (spanClose) {
        spanClose.onclick = function() {
            modal.style.display = "none";
            document.body.style.overflow = "auto";
        };
    }

    // Fecha ao clicar na área escura fora da imagem
    modal.onclick = function(event) {
        if (event.target === modal) {
            modal.style.display = "none";
            document.body.style.overflow = "auto";
        }
    };
}

/**
 * Lógica do Pop-up de Aviso
 */
const popup = document.getElementById('popup-aviso');
const btnFecharPopup = document.getElementById('fechar-popup');
const btnEntendido = document.getElementById('btn-entendido');

// Mostra o pop-up 1 segundo após o carregamento da página
window.addEventListener('load', () => {
    // Verifica se o usuário já fechou o pop-up nesta sessão
    if (popup && !sessionStorage.getItem('popupFechado')) {
        setTimeout(() => {
            popup.style.display = 'flex';
        }, 1000);
    }
});

// Função para fechar o pop-up
const fecharPopup = () => {
    if (popup) {
        popup.style.display = 'none';
        // Salva que o usuário já viu o aviso nesta sessão
        sessionStorage.setItem('popupFechado', 'true');
    }
};

if (btnFecharPopup) btnFecharPopup.onclick = fecharPopup;
if (btnEntendido) btnEntendido.onclick = fecharPopup;

/**
 * Lógica do Pop-up de Pedido Personalizado
 */
const modalPedido = document.getElementById('modal-pedido');

// Função para abrir o modal de pedido
function abrirModalPedido() {
    if (modalPedido) {
        modalPedido.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }
}

// Função para fechar o modal de pedido
function fecharModalPedido() {
    if (modalPedido) {
        modalPedido.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
}

// Função para processar os itens e enviar para o WhatsApp
function enviarPedidoWhatsApp() {
    const inputs = document.querySelectorAll('#lista-itens-pedido input');
    let mensagem = "Olá! Gostaria de fazer um pedido:\n\n";
    let temItens = false;

    inputs.forEach(input => {
        const qtd = parseInt(input.value);
        if (qtd > 0) {
            mensagem += `*${qtd}x* ${input.getAttribute('data-nome')}\n`;
            temItens = true;
        }
    });

    if (!temItens) {
        alert("Por favor, selecione pelo menos uma quantidade em algum item.");
        return;
    }

    mensagem += "\nTotal a combinar. Retirada em Colombo - PR.";
    
    // Codifica a mensagem para URL e redireciona para o WhatsApp
    const url = `https://wa.me/5541996309958?text=${encodeURIComponent(mensagem)}`;
    window.open(url, '_blank');
    fecharModalPedido();
}

/**
 * Listener Global para Cliques Fora dos Modais
 */
window.addEventListener('click', (event) => {
    // Fecha o pop-up de aviso se clicar fora dele
    if (event.target === popup) {
        fecharPopup();
    }
    // Fecha o modal de pedido se clicar fora dele
    if (event.target === modalPedido) {
        fecharModalPedido();
    }
});