const WHATSAPP_NUMBER = window.WHATSAPP_NUMBER || '5541996309958';

/**
 * Carrosséis: scroll pela largura real do card + dots sincronizados
 */
function initCarousel(trackId) {
  const track = document.getElementById(trackId);
  const dots = document.getElementById(trackId.replace('-track', '-dots'));
  const wrapper = track.closest('.carousel-wrapper');
  const prev = wrapper.querySelector('.carousel-btn.prev');
  const next = wrapper.querySelector('.carousel-btn.next');
  const scrollAmount = () => track.firstElementChild ? track.firstElementChild.clientWidth + 20 : 320;

  const update = () => {
    const max = track.scrollWidth - track.clientWidth;
    const idx = Math.round(track.scrollLeft / scrollAmount());
    prev.disabled = track.scrollLeft <= 0;
    next.disabled = track.scrollLeft >= max - 1;
    dots.querySelectorAll('.carousel-dot').forEach((d, i) => d.classList.toggle('active', i === idx));
  };

  track.addEventListener('scroll', update, { passive: true });
  prev.addEventListener('click', () => track.scrollBy({ left: -scrollAmount(), behavior: 'smooth' }));
  next.addEventListener('click', () => track.scrollBy({ left: scrollAmount(), behavior: 'smooth' }));

  const n = track.children.length;
  for (let i = 0; i < n; i++) {
    const dot = document.createElement('button');
    dot.className = 'carousel-dot';
    dot.setAttribute('aria-label', `Ir para o card ${i + 1}`);
    dot.addEventListener('click', () => track.scrollTo({ left: i * scrollAmount(), behavior: 'smooth' }));
    dots.appendChild(dot);
  }
  update();
  window.addEventListener('resize', update);
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
  const mqDesktop = window.matchMedia('(min-width: 1024px)');
  mqDesktop.addEventListener('change', e => { if (e.matches && navMenu.classList.contains('active')) toggleMenu(false); });
}

/**
 * Lógica da Expansão de Imagem (Lightbox)
 */
const modal = document.getElementById("image-modal");
const modalImg = document.getElementById("img-expanded");
const spanClose = document.querySelector(".close-modal");

function abrirLightbox(img) {
    if (modal && modalImg) {
        modal.style.display = "flex";
        modalImg.src = img.src;
        document.body.style.overflow = "hidden"; // Trava o scroll da página
    }
}

function fecharLightbox() {
    if (modal) {
        modal.style.display = "none";
        document.body.style.overflow = "auto";
    }
}

if (modal && modalImg) {
    document.querySelectorAll('.card img').forEach(img => {
        img.setAttribute('tabindex', '0');
        img.addEventListener('click', () => abrirLightbox(img));
        img.addEventListener('keydown', e => {
            if (e.key === 'Enter') {
                e.preventDefault();
                abrirLightbox(img);
            }
        });
    });

    // Fecha ao clicar no X
    if (spanClose) spanClose.addEventListener('click', fecharLightbox);

    // Fecha ao clicar na área escura fora da imagem
    modal.addEventListener('click', event => {
        if (event.target === modal) fecharLightbox();
    });
}



/**
 * Lógica do Pop-up de Pedido Personalizado
 */
const CATALOGO = {
  'Ovo Brigadeiro': 57, 'Ovo Ninho com Nutella': 65, 'Ovo Surpresinha de Uva': 62,
  'Ovo Escondidinho de Brownie': 65, 'Ovo de Maracujá': 62, 'Dupla de Ovos': 79,
  'Kit Degustação': 48, 'Caixa com 6 Brigadeiros': 25, 'Caixa Livro (4 un.)': 17, 'Caixa com 2 un.': 8,
};
function atualizarSubtotal() {
  const inputs = document.querySelectorAll('#lista-itens-pedido input');
  let total = 0;
  inputs.forEach(inp => {
    const qtd = parseInt(inp.value) || 0;
    total += qtd * (CATALOGO[inp.dataset.nome] || 0);
  });
  const el = document.getElementById('valor-total');
  if (el) el.textContent = total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  return total;
}
document.querySelectorAll('#lista-itens-pedido input').forEach(inp => inp.addEventListener('input', atualizarSubtotal));

const modalPedido = document.getElementById('modal-pedido');

// Função para abrir o modal de pedido
function abrirModalPedido(itemNome) {
  if (itemNome) {
    const inp = document.querySelector(`#lista-itens-pedido input[data-nome="${itemNome}"]`);
    if (inp) inp.value = '1';
  }
  if (modalPedido) {
    modalPedido.style.display = 'flex';
    document.body.style.overflow = 'hidden';
    modalPedido.setAttribute('aria-modal', 'true');
    atualizarSubtotal();
    const primeiroInput = modalPedido.querySelector('input, button');
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
  }
}

// Preselect: botão de preço nos cards abre o modal com o item marcado
document.querySelectorAll('.price-tag[data-nome]').forEach(b => b.addEventListener('click', () => abrirModalPedido(b.dataset.nome)));

// Fecha modais com ESC
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') { fecharModalPedido(); fecharLightbox(); }
});

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