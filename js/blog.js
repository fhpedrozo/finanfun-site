/**
 * FinanFun Blog - WordPress Integration
 * Integração completa com WordPress REST API
 */

// Configuração da API
const API_CONFIG = {
    baseUrl: 'https://finanfun.com.br/wp-json/wp/v2',
    postsPerPage: 6,
    postsPerLoad: 4
};

// Estado global da aplicação
const blogState = {
    allPosts: [],
    displayedPosts: [],
    categories: [],
    currentCategory: null,
    currentSearch: '',
    currentPage: 1,
    isLoading: false
};

/**
 * Inicializa o blog
 */
async function initBlog() {
    try {
        showLoading(true);
        
        // Carregar categorias e posts em paralelo
        await Promise.all([
            loadCategories(),
            loadPosts()
        ]);
        
        // Renderizar categorias e posts
        renderCategories();
        renderPosts();
        
        // Configurar event listeners
        setupEventListeners();
        
        showLoading(false);
    } catch (error) {
        console.error('Erro ao inicializar blog:', error);
        showError('Não foi possível carregar os artigos. Tente novamente mais tarde.');
        showLoading(false);
    }
}

/**
 * Carrega posts da API WordPress
 */
async function loadPosts() {
    try {
        const response = await fetch(
            `${API_CONFIG.baseUrl}/posts?per_page=100&_embed`
        );
        
        if (!response.ok) {
            throw new Error('Erro ao carregar posts');
        }
        
        const posts = await response.json();
        blogState.allPosts = posts;
        blogState.displayedPosts = posts.slice(0, API_CONFIG.postsPerPage);
        
        return posts;
    } catch (error) {
        console.error('Erro ao carregar posts:', error);
        throw error;
    }
}

/**
 * Carrega categorias da API WordPress
 */
async function loadCategories() {
    try {
        const response = await fetch(
            `${API_CONFIG.baseUrl}/categories?per_page=100`
        );
        
        if (!response.ok) {
            throw new Error('Erro ao carregar categorias');
        }
        
        const categories = await response.json();
        
        // Filtrar apenas categorias que têm posts
        blogState.categories = categories.filter(cat => cat.count > 0);
        
        return categories;
    } catch (error) {
        console.error('Erro ao carregar categorias:', error);
        // Não lança erro pois categorias são opcionais
        return [];
    }
}

/**
 * Renderiza as categorias nos filtros
 */
function renderCategories() {
    const filtersContainer = document.querySelector('.blog-filters');
    
    if (!filtersContainer || blogState.categories.length === 0) {
        return;
    }
    
    // Limpar filtros existentes (manter apenas "Todos")
    filtersContainer.innerHTML = '<button class="filter-btn active" data-category="">Todos</button>';
    
    // Adicionar categorias dinamicamente
    blogState.categories.forEach(category => {
        const button = document.createElement('button');
        button.className = 'filter-btn';
        button.textContent = category.name;
        button.setAttribute('data-category', category.id);
        filtersContainer.appendChild(button);
    });
}

/**
 * Renderiza os posts na grid
 */
function renderPosts() {
    const articlesGrid = document.querySelector('.articles-grid');
    
    if (!articlesGrid) {
        console.error('Grid de artigos não encontrada');
        return;
    }
    
    // Limpar grid
    articlesGrid.innerHTML = '';
    
    // Se não há posts
    if (blogState.displayedPosts.length === 0) {
        articlesGrid.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 3rem;">
                <p style="color: var(--text-gray); font-size: 1.1rem;">
                    Nenhum artigo encontrado.
                </p>
            </div>
        `;
        updateLoadMoreButton();
        return;
    }
    
    // Renderizar cada post
    blogState.displayedPosts.forEach(post => {
        const articleCard = createArticleCard(post);
        articlesGrid.appendChild(articleCard);
    });
    
    updateLoadMoreButton();
}

/**
 * Cria um card de artigo
 */
function createArticleCard(post) {
    const article = document.createElement('article');
    article.className = 'article-card';
    
    // Extrair imagem destacada
    const featuredImage = post._embedded && post._embedded['wp:featuredmedia'] 
        ? post._embedded['wp:featuredmedia'][0].source_url 
        : null;
    
    // Extrair resumo (remover tags HTML)
    const excerpt = stripHtml(post.excerpt.rendered);
    const summary = excerpt.length > 150 ? excerpt.substring(0, 150) + '...' : excerpt;
    
    // Link do post
    const postLink = post.link;
    
    article.innerHTML = `
        <div class="article-image">
            ${featuredImage 
                ? `<img src="${featuredImage}" alt="${stripHtml(post.title.rendered)}" loading="lazy">`
                : '<div class="placeholder-image"></div>'
            }
        </div>
        <div class="article-content">
            <h3 class="article-title">${post.title.rendered}</h3>
            <p class="article-summary">${summary}</p>
            <a href="${postLink}" class="article-link" target="_blank" rel="noopener noreferrer">
                Leia mais <i class="fas fa-arrow-right"></i>
            </a>
        </div>
    `;
    
    return article;
}

/**
 * Filtra posts por categoria
 */
function filterByCategory(categoryId) {
    blogState.currentCategory = categoryId;
    blogState.currentPage = 1;
    applyFilters();
}

/**
 * Filtra posts por busca
 */
function filterBySearch(searchTerm) {
    blogState.currentSearch = searchTerm.toLowerCase();
    blogState.currentPage = 1;
    applyFilters();
}

/**
 * Aplica todos os filtros ativos
 */
function applyFilters() {
    let filteredPosts = [...blogState.allPosts];
    
    // Filtrar por categoria
    if (blogState.currentCategory) {
        filteredPosts = filteredPosts.filter(post => 
            post.categories.includes(parseInt(blogState.currentCategory))
        );
    }
    
    // Filtrar por busca
    if (blogState.currentSearch) {
        filteredPosts = filteredPosts.filter(post => {
            const title = post.title.rendered.toLowerCase();
            const content = stripHtml(post.content.rendered).toLowerCase();
            const excerpt = stripHtml(post.excerpt.rendered).toLowerCase();
            
            return title.includes(blogState.currentSearch) ||
                   content.includes(blogState.currentSearch) ||
                   excerpt.includes(blogState.currentSearch);
        });
    }
    
    // Atualizar posts exibidos
    const endIndex = blogState.currentPage * API_CONFIG.postsPerPage;
    blogState.displayedPosts = filteredPosts.slice(0, endIndex);
    
    // Re-renderizar
    renderPosts();
}

/**
 * Carrega mais posts
 */
function loadMorePosts() {
    blogState.currentPage++;
    applyFilters();
}

/**
 * Atualiza o botão "Carregar mais"
 */
function updateLoadMoreButton() {
    const loadMoreBtn = document.querySelector('.load-more-btn');
    const loadMoreContainer = document.querySelector('.load-more-container');
    
    if (!loadMoreBtn || !loadMoreContainer) return;
    
    // Calcular quantos posts ainda podem ser carregados
    let totalFilteredPosts = blogState.allPosts.length;
    
    if (blogState.currentCategory) {
        totalFilteredPosts = blogState.allPosts.filter(post => 
            post.categories.includes(parseInt(blogState.currentCategory))
        ).length;
    }
    
    if (blogState.currentSearch) {
        totalFilteredPosts = blogState.allPosts.filter(post => {
            const title = post.title.rendered.toLowerCase();
            const content = stripHtml(post.content.rendered).toLowerCase();
            const excerpt = stripHtml(post.excerpt.rendered).toLowerCase();
            
            return title.includes(blogState.currentSearch) ||
                   content.includes(blogState.currentSearch) ||
                   excerpt.includes(blogState.currentSearch);
        }).length;
    }
    
    // Mostrar ou esconder botão
    if (blogState.displayedPosts.length >= totalFilteredPosts) {
        loadMoreContainer.style.display = 'none';
    } else {
        loadMoreContainer.style.display = 'flex';
    }
}

/**
 * Configura event listeners
 */
function setupEventListeners() {
    // Filtros de categoria
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            // Remover active de todos
            document.querySelectorAll('.filter-btn').forEach(b => 
                b.classList.remove('active')
            );
            
            // Adicionar active no clicado
            this.classList.add('active');
            
            // Filtrar
            const categoryId = this.getAttribute('data-category');
            filterByCategory(categoryId);
        });
    });
    
    // Busca
    const searchInput = document.getElementById('blogSearch');
    if (searchInput) {
        // Debounce para não buscar a cada tecla
        let searchTimeout;
        searchInput.addEventListener('input', function(e) {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                filterBySearch(e.target.value);
            }, 500);
        });
    }
    
    // Botão carregar mais
    const loadMoreBtn = document.querySelector('.load-more-btn');
    if (loadMoreBtn) {
        loadMoreBtn.addEventListener('click', loadMorePosts);
    }
}

/**
 * Mostra/esconde loading
 */
function showLoading(show) {
    const articlesGrid = document.querySelector('.articles-grid');
    
    if (!articlesGrid) return;
    
    if (show) {
        articlesGrid.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 3rem;">
                <i class="fas fa-spinner fa-spin" style="font-size: 2rem; color: var(--primary-green);"></i>
                <p style="color: var(--text-gray); margin-top: 1rem;">Carregando artigos...</p>
            </div>
        `;
    }
    
    blogState.isLoading = show;
}

/**
 * Mostra mensagem de erro
 */
function showError(message) {
    const articlesGrid = document.querySelector('.articles-grid');
    
    if (!articlesGrid) return;
    
    articlesGrid.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 3rem;">
            <i class="fas fa-exclamation-triangle" style="font-size: 2rem; color: #ef4444;"></i>
            <p style="color: var(--text-gray); margin-top: 1rem;">${message}</p>
        </div>
    `;
}

/**
 * Remove HTML de uma string
 */
function stripHtml(html) {
    const tmp = document.createElement('div');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
}

// Inicializar quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', initBlog);

// Exportar para uso em testes (opcional)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { initBlog, loadPosts, filterByCategory, filterBySearch };
}
