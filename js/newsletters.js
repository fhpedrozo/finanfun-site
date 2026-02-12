// newsletters.js - Carrega newsletters do WordPress via API REST

// CONFIGURAÇÃO
const WORDPRESS_URL = 'https://finanfun.com.br'; // ← ATUALIZAR COM URL REAL
const NEWSLETTERS_PER_PAGE = 6;
let currentPage = 1;
let allNewsletters = [];
let filteredNewsletters = [];
let selectedYear = '';

// PLACEHOLDER IMAGE (SVG inline - nunca dá erro 404)
const PLACEHOLDER_IMAGE = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="800" height="400"%3E%3Crect width="800" height="400" fill="%230a1628"/%3E%3Ctext x="50%25" y="50%25" font-family="Arial,sans-serif" font-size="24" fill="%2346FE77" text-anchor="middle" dy=".3em"%3EFinanFun Newsletter%3C/text%3E%3C/svg%3E';

// ELEMENTOS DOM
const newslettersGrid = document.querySelector('.newsletters-grid');
const loadMoreContainer = document.querySelector('.load-more-container');
const loadMoreBtn = document.querySelector('.load-more-btn');
const filterButtons = document.querySelectorAll('.filter-btn');
const searchInput = document.getElementById('newsletterSearch');

// BUSCAR NEWSLETTERS DO WORDPRESS
async function fetchNewsletters() {
    try {
        console.log('🔍 Buscando newsletters do WordPress...');
        
        // Busca Custom Post Type "newsletter" via REST API
        const response = await fetch(`${WORDPRESS_URL}/wp-json/wp/v2/newsletter?per_page=100&_embed`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const newsletters = await response.json();
        console.log(`✅ ${newsletters.length} newsletters encontradas!`);
        
        return newsletters;
    } catch (error) {
        console.error('❌ Erro ao buscar newsletters:', error);
        
        // Se falhar, mostrar mensagem
        newslettersGrid.innerHTML = `
            <div class="no-newsletters" style="grid-column: 1 / -1;">
                <i class="fas fa-exclamation-circle" style="font-size: 3rem; color: var(--text-gray); margin-bottom: 1rem;"></i>
                <h3 style="color: var(--text-light); margin-bottom: 0.5rem;">Newsletters em breve!</h3>
                <p style="color: var(--text-gray);">Estamos preparando conteúdos incríveis para você.</p>
                <p style="color: var(--text-gray); font-size: 0.9rem; margin-top: 1rem;">
                    (Erro técnico: ${error.message})
                </p>
            </div>
        `;
        
        return [];
    }
}

// RENDERIZAR NEWSLETTER CARD
function renderNewsletterCard(newsletter) {
    // Extrair dados
    const title = newsletter.title.rendered;
    const excerpt = newsletter.excerpt.rendered.replace(/<[^>]*>/g, '').substring(0, 150) + '...';
    const date = new Date(newsletter.date);
    const formattedDate = date.toLocaleDateString('pt-BR', { 
        year: 'numeric', 
        month: 'long',
        day: 'numeric'
    });
    
    // Imagem destacada (featured image)
    // ✅ CORRIGIDO - Usando SVG inline que NUNCA falha
    let imageUrl = PLACEHOLDER_IMAGE;
    if (newsletter._embedded && newsletter._embedded['wp:featuredmedia']) {
        imageUrl = newsletter._embedded['wp:featuredmedia'][0].source_url;
    }
    
    // Link para a newsletter
    const link = newsletter.link;
    
    return `
        <div class="newsletter-card" onclick="window.location.href='${link}'">
            <img src="${imageUrl}" alt="${title}" class="newsletter-card-image" onerror="this.src='${PLACEHOLDER_IMAGE}'">
            <div class="newsletter-card-content">
                <div class="newsletter-card-date">
                    <i class="fas fa-calendar-alt"></i> ${formattedDate}
                </div>
                <h3 class="newsletter-card-title">${title}</h3>
                <p class="newsletter-card-excerpt">${excerpt}</p>
                <a href="${link}" class="newsletter-card-link" onclick="event.stopPropagation()">
                    Ler newsletter <i class="fas fa-arrow-right"></i>
                </a>
            </div>
        </div>
    `;
}

// RENDERIZAR NEWSLETTERS
function renderNewsletters() {
    const start = 0;
    const end = currentPage * NEWSLETTERS_PER_PAGE;
    const newslettersToShow = filteredNewsletters.slice(start, end);
    
    if (newslettersToShow.length === 0) {
        newslettersGrid.innerHTML = `
            <div class="no-newsletters" style="grid-column: 1 / -1;">
                <i class="fas fa-search" style="font-size: 3rem; color: var(--text-gray); margin-bottom: 1rem;"></i>
                <h3 style="color: var(--text-light); margin-bottom: 0.5rem;">Nenhuma newsletter encontrada</h3>
                <p style="color: var(--text-gray);">Tente ajustar os filtros ou a busca.</p>
            </div>
        `;
        loadMoreContainer.style.display = 'none';
        return;
    }
    
    newslettersGrid.innerHTML = newslettersToShow.map(renderNewsletterCard).join('');
    
    // Mostrar/esconder botão "Carregar mais"
    if (end >= filteredNewsletters.length) {
        loadMoreContainer.style.display = 'none';
    } else {
        loadMoreContainer.style.display = 'flex';
    }
}

// FILTRAR POR ANO
function filterByYear(year) {
    selectedYear = year;
    
    if (year === '') {
        filteredNewsletters = [...allNewsletters];
    } else {
        filteredNewsletters = allNewsletters.filter(newsletter => {
            const newsletterYear = new Date(newsletter.date).getFullYear().toString();
            return newsletterYear === year;
        });
    }
    
    // Aplicar busca se houver texto
    if (searchInput.value.trim() !== '') {
        applySearch(searchInput.value);
    }
    
    currentPage = 1;
    renderNewsletters();
}

// PESQUISAR NEWSLETTERS
function applySearch(searchTerm) {
    const term = searchTerm.toLowerCase().trim();
    
    if (term === '') {
        filterByYear(selectedYear);
        return;
    }
    
    let baseNewsletters = selectedYear === '' ? allNewsletters : filteredNewsletters;
    
    filteredNewsletters = baseNewsletters.filter(newsletter => {
        const title = newsletter.title.rendered.toLowerCase();
        const excerpt = newsletter.excerpt.rendered.toLowerCase();
        return title.includes(term) || excerpt.includes(term);
    });
    
    currentPage = 1;
    renderNewsletters();
}

// EVENT LISTENERS
loadMoreBtn.addEventListener('click', () => {
    currentPage++;
    renderNewsletters();
});

filterButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        // Remover active de todos
        filterButtons.forEach(b => b.classList.remove('active'));
        // Adicionar active no clicado
        btn.classList.add('active');
        // Filtrar
        const year = btn.getAttribute('data-year');
        filterByYear(year);
    });
});

searchInput.addEventListener('input', (e) => {
    applySearch(e.target.value);
});

// INICIALIZAR
async function init() {
    allNewsletters = await fetchNewsletters();
    filteredNewsletters = [...allNewsletters];
    renderNewsletters();
}

// Carregar ao iniciar página
init();
