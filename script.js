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

// Fecha ao clicar fora do conteúdo do pop-up
window.addEventListener('click', (event) => {
    if (event.target === popup) {
        fecharPopup();
    }
});