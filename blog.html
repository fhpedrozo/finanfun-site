/**
 * FinanFun Blog - WordPress Integration v2
 * Agora com Data e Categoria nos cards!
 */

// Configuração da API
const API_CONFIG = {
    baseUrl: 'https://finanfun.com.br/wp-json/wp/v2',
    postsPerPage: 4,
    postsPerLoad: 4
};

// Estado da aplicação
let currentPosts = [];
let displayedPosts = [];
let categories = [];
let currentCategory = '';
let currentSearchTerm = '';
let isLoading = false;

// Elementos DOM
const articlesGrid = document.querySelector('.articles-grid');
const loadMoreBtn = document.querySelector('.load-more-btn');
const searchInput = document.getElementById('blogSearch');
const filtersContainer = document.querySelector('.blog-filters');

// Mapeamento de meses em português
const mesesPT = {
    0: 'Jan', 1: 'Fev', 2: 'Mar', 3: 'Abr', 4: 'Mai', 5: 'Jun',
    6: 'Jul', 7: 'Ago', 8: 'Set', 9: 'Out', 10: 'Nov', 11: 'Dez'
};

// Função para formatar data
function formatarData(dateString) {
    const data = new Date(dateString);
    const dia = data.getDate();
    const mes = mesesPT[data.getMonth()];
    const ano = data.getFullYear().toString().slice(-2); // Últimos 2 dígitos
    return `${dia} ${mes} ${ano}`;
}

// Função para obter nome da categoria
function getNomeCategoria(categoryId) {
    const categoria = categories.find(cat => cat.id === categoryId);
    return categoria ? categoria.name : '';
}

// Função para normalizar strings (remove acentos)
function normalizeString(str) {
    return str
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '');
}

// Função para buscar posts do WordPress
async function loadPosts() {
    try {
        isLoading = true;
        showLoadingState();

        const response = await fetch(
            `${API_CONFIG.baseUrl}/posts?per_page=100&_embed`
        );

        if (!response.ok) {
            throw new Error('Erro ao carregar posts');
        }

        const posts = await response.json();
        currentPosts = posts;
        
        applyFilters();
        
    } catch (error) {
        console.error('Erro ao carregar posts:', error);
        showError();
    } finally {
        isLoading = false;
    }
}

// Função para buscar categorias
async function loadCategories() {
    try {
        const response = await fetch(
            `${API_CONFIG.baseUrl}/categories?per_page=100`
        );

        if (!response.ok) {
            throw new Error('Erro ao carregar categorias');
        }

        const allCategories = await response.json();
        categories = allCategories.filter(cat => cat.count > 0);
        
        renderCategories();
        
    } catch (error) {
        console.error('Erro ao carregar categorias:', error);
    }
}

// Função para renderizar categorias
function renderCategories() {
    const existingButtons = filtersContainer.querySelectorAll('.filter-btn:not(:first-child)');
    existingButtons.forEach(btn => btn.remove());

    categories.forEach(category => {
        const button = document.createElement('button');
        button.className = 'filter-btn';
        button.textContent = category.name;
        button.dataset.category = category.id;
        button.addEventListener('click', () => filterByCategory(category.id));
        filtersContainer.appendChild(button);
    });
}

// Função para filtrar por categoria
function filterByCategory(categoryId) {
    currentCategory = categoryId;
    
    const filterButtons = document.querySelectorAll('.filter-btn');
    filterButtons.forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.category === String(categoryId) || (!categoryId && btn.dataset.category === '')) {
            btn.classList.add('active');
        }
    });

    applyFilters();
}

// Função para filtrar por busca
function filterBySearch(searchTerm) {
    currentSearchTerm = searchTerm;
    applyFilters();
}

// Função para aplicar todos os filtros
function applyFilters() {
    let filteredPosts = [...currentPosts];

    if (currentCategory) {
        filteredPosts = filteredPosts.filter(post => 
            post.categories.includes(parseInt(currentCategory))
        );
    }

    if (currentSearchTerm) {
        const normalizedSearch = normalizeString(currentSearchTerm);
        filteredPosts = filteredPosts.filter(post => {
            const title = normalizeString(post.title.rendered);
            const content = normalizeString(post.content.rendered);
            const excerpt = normalizeString(post.excerpt.rendered);
            
            return title.includes(normalizedSearch) || 
                   content.includes(normalizedSearch) || 
                   excerpt.includes(normalizedSearch);
        });
    }

    displayedPosts = [];
    renderPosts(filteredPosts);
}

// Função para renderizar posts
function renderPosts(posts) {
    const postsToShow = posts.slice(0, displayedPosts.length + API_CONFIG.postsPerPage);
    displayedPosts = postsToShow;

    articlesGrid.innerHTML = '';

    if (postsToShow.length === 0) {
        showEmptyState();
        return;
    }

    postsToShow.forEach(post => {
        const card = createArticleCard(post);
        articlesGrid.appendChild(card);
    });

    updateLoadMoreButton(posts.length);
}

// Função para criar card de artigo
function createArticleCard(post) {
    const card = document.createElement('article');
    card.className = 'article-card';

    // Extrair imagem destacada
    let imageUrl = '';
    if (post._embedded && post._embedded['wp:featuredmedia']) {
        imageUrl = post._embedded['wp:featuredmedia'][0].source_url;
    }

    // Extrair excerpt limpo
    const excerpt = post.excerpt.rendered
        .replace(/<[^>]*>/g, '')
        .substring(0, 150) + '...';

    // Formatar data
    const dataFormatada = formatarData(post.date);

    // Obter primeira categoria
    const primeiraCategoria = post.categories[0];
    const nomeCategoria = getNomeCategoria(primeiraCategoria);

    card.innerHTML = `
        <div class="article-image">
            ${imageUrl ? 
                `<img src="${imageUrl}" alt="${post.title.rendered}" loading="lazy">` :
                '<div class="placeholder-image"></div>'
            }
        </div>
        <div class="article-content">
            <div class="article-meta">
                <span class="article-category">${nomeCategoria.toUpperCase()}</span>
                <span class="article-date-separator">•</span>
                <span class="article-date">${dataFormatada}</span>
            </div>
            <h3 class="article-title">${post.title.rendered}</h3>
            <p class="article-summary">${excerpt}</p>
            <a href="${post.link}" class="article-link">
                Leia mais <i class="fas fa-arrow-right"></i>
            </a>
        </div>
    `;

    return card;
}

// Função para carregar mais posts
function loadMore() {
    const allFilteredPosts = [...currentPosts];
    
    let filteredPosts = allFilteredPosts;
    
    if (currentCategory) {
        filteredPosts = filteredPosts.filter(post => 
            post.categories.includes(parseInt(currentCategory))
        );
    }

    if (currentSearchTerm) {
        const normalizedSearch = normalizeString(currentSearchTerm);
        filteredPosts = filteredPosts.filter(post => {
            const title = normalizeString(post.title.rendered);
            const content = normalizeString(post.content.rendered);
            const excerpt = normalizeString(post.excerpt.rendered);
            
            return title.includes(normalizedSearch) || 
                   content.includes(normalizedSearch) || 
                   excerpt.includes(normalizedSearch);
        });
    }

    renderPosts(filteredPosts);
}

// Função para atualizar botão "Carregar mais"
function updateLoadMoreButton(totalPosts) {
    if (displayedPosts.length >= totalPosts) {
        loadMoreBtn.style.display = 'none';
    } else {
        loadMoreBtn.style.display = 'inline-flex';
    }
}

// Função para mostrar estado de carregamento
function showLoadingState() {
    articlesGrid.innerHTML = `
        <div style="grid-column: 1/-1; text-align: center; padding: 3rem;">
            <i class="fas fa-spinner fa-spin" style="font-size: 2rem; color: var(--primary-green);"></i>
            <p style="margin-top: 1rem; color: var(--text-gray);">Carregando posts...</p>
        </div>
    `;
}

// Função para mostrar estado vazio
function showEmptyState() {
    articlesGrid.innerHTML = `
        <div style="grid-column: 1/-1; text-align: center; padding: 3rem;">
            <i class="fas fa-search" style="font-size: 2rem; color: var(--text-gray);"></i>
            <p style="margin-top: 1rem; color: var(--text-gray);">
                Nenhum post encontrado${currentSearchTerm ? ` para "${currentSearchTerm}"` : ''}.
            </p>
        </div>
    `;
    loadMoreBtn.style.display = 'none';
}

// Função para mostrar erro
function showError() {
    articlesGrid.innerHTML = `
        <div style="grid-column: 1/-1; text-align: center; padding: 3rem;">
            <i class="fas fa-exclamation-triangle" style="font-size: 2rem; color: #ef4444;"></i>
            <p style="margin-top: 1rem; color: var(--text-gray);">
                Erro ao carregar posts. Tente novamente mais tarde.
            </p>
        </div>
    `;
    loadMoreBtn.style.display = 'none';
}

// Event Listeners
loadMoreBtn.addEventListener('click', loadMore);

let searchTimeout;
searchInput.addEventListener('input', (e) => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
        filterBySearch(e.target.value);
    }, 500);
});

// Inicializar
document.addEventListener('DOMContentLoaded', () => {
    loadCategories();
    loadPosts();

    const allButton = document.querySelector('.filter-btn[data-category=""]');
    if (allButton) {
        allButton.addEventListener('click', () => filterByCategory(''));
    }
});
