const WHATSAPP_NUMBER = window.WHATSAPP_NUMBER || '5541996309958';

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

function toggleMenu(open) {
  const shouldOpen = open ?? !navMenu.classList.contains('active');
  navMenu.classList.toggle('active', shouldOpen);
  document.body.classList.toggle('menu-open', shouldOpen);
  menuToggle.setAttribute('aria-expanded', String(shouldOpen));
  const icon = menuToggle.querySelector('i');
  icon.classList.toggle('fa-bars', !shouldOpen);
  icon.classList.toggle('fa-times', shouldOpen);
  if (shouldOpen) menuToggle.focus();
}
if (menuToggle) {
  menuToggle.addEventListener('click', () => toggleMenu());
  navMenu.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
    toggleMenu(false);
    navMenu.querySelectorAll('a').forEach(a => a.removeAttribute('aria-current'));
    link.setAttribute('aria-current', 'page');
  }));
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && navMenu.classList.contains('active')) toggleMenu(false); });
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
        
        // Resetar a mensagem de erro ao fechar
        const erroVisual = document.getElementById('mensagem-erro-vazio');
        if (erroVisual) erroVisual.style.display = 'none';
    }
}

// Função para processar os itens e enviar para o WhatsApp
function enviarPedidoWhatsApp() {
    const inputs = document.querySelectorAll('#lista-itens-pedido input');
    const erroVisual = document.getElementById('mensagem-erro-vazio');
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
        // Exibe o erro estilizado em vez do alert nativo
        if (erroVisual) {
            erroVisual.style.display = 'block';
        }
        return;
    }

    // Esconde o erro se itens forem selecionados
    if (erroVisual) erroVisual.style.display = 'none';

    mensagem += "\nRetirada em Colombo - PR.";
    
    // Codifica a mensagem para URL e redireciona para o WhatsApp
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