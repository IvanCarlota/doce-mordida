/**
 * Service Worker: cache local de assets estáticos para visitas repetidas.
 * O host (GitHub Pages) fixa Cache-Control: max-age=600; aqui o controle é nosso.
 * Estratégia: stale-while-revalidate para mesmos origem GET estáticos;
 * navegação (HTML) sempre pela rede. Bump da versão do CACHE ao mudar assets.
 */
const CACHE = 'doce-mordida-v3';

const ASSETS = [
    './index.html',
    './script.js',
    './images/logo-1.png',
    './images/coelho-borboleta.webp',
    './images/ovo_brigadeiro.webp',
    './images/ovo_ninho_nutella.webp',
    './images/ovo_uva.webp',
    './images/ovo_brownie.webp',
    './images/ovo_maracuja.webp',
    './images/dupla_ovos.webp',
    './images/kit_degustacao.webp',
    './images/caixa_6_brigadeiros.webp',
    './images/lembrancinha_4_unidades.webp',
    './images/lembrancinha_2_unidades.webp'
];

self.addEventListener('install', evento => {
    evento.waitUntil(
        caches.open(CACHE)
            .then(cache => cache.addAll(ASSETS))
            .then(() => self.skipWaiting())
    );
});

self.addEventListener('activate', evento => {
    evento.waitUntil(
        caches.keys()
            .then(chaves => Promise.all(
                chaves.filter(chave => chave !== CACHE).map(chave => caches.delete(chave))
            ))
            .then(() => self.clients.claim())
    );
});

self.addEventListener('fetch', evento => {
    const requisicao = evento.request;
    if (requisicao.method !== 'GET') return;

    const url = new URL(requisicao.url);
    if (url.origin !== self.location.origin) return;
    if (requisicao.mode === 'navigate' || url.pathname.endsWith('.html')) return;

    evento.respondWith(
        caches.open(CACHE).then(async cache => {
            const emCache = await cache.match(requisicao);
            const daRede = fetch(requisicao)
                .then(resposta => {
                    if (resposta && resposta.ok) cache.put(requisicao, resposta.clone());
                    return resposta;
                })
                .catch(() => emCache);
            return emCache || daRede;
        })
    );
});
