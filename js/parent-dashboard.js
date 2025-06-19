// Parent Dashboard JavaScript for FinanBoss

class ParentDashboard {
    constructor() {
        this.user = null;
        this.family = [];
        this.accounts = [];
        this.init();
    }

    async init() {
        await this.loadUserData();
        await this.loadDashboardData();
        this.setupEventListeners();
        this.hideLoadingScreen();
    }

    async loadUserData() {
        try {
            const response = await fetch('/api/auth/user', {
                credentials: 'include'
            });
            
            if (response.status === 401) {
                // User not authenticated, redirect to login
                window.location.href = '/api/login';
                return;
            }
            
            if (!response.ok) {
                throw new Error('Failed to load user data');
            }
            
            this.user = await response.json();
            this.updateUserDisplay();
        } catch (error) {
            console.error('Error loading user data:', error);
            this.showError('Erro ao carregar dados do usuário');
        }
    }

    async loadDashboardData() {
        try {
            const response = await fetch('/api/dashboard/parent', {
                credentials: 'include'
            });
            
            if (!response.ok) {
                throw new Error('Failed to load dashboard data');
            }
            
            const data = await response.json();
            this.family = data.family || [];
            this.accounts = data.accounts || [];
            
            this.updateDashboardStats();
            this.renderFamilyGrid();
            this.renderAccountsList();
        } catch (error) {
            console.error('Error loading dashboard data:', error);
            this.showError('Erro ao carregar dados do dashboard');
        }
    }

    updateUserDisplay() {
        if (!this.user) return;
        
        const userNameEl = document.getElementById('userName');
        const userAvatarEl = document.getElementById('userAvatar');
        
        if (userNameEl) {
            const displayName = this.user.firstName || this.user.email || 'Usuário';
            userNameEl.textContent = displayName;
        }
        
        if (userAvatarEl && this.user.profileImageUrl) {
            userAvatarEl.src = this.user.profileImageUrl;
            userAvatarEl.alt = `Avatar de ${this.user.firstName || 'Usuário'}`;
        } else if (userAvatarEl) {
            // Default avatar
            userAvatarEl.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMTYiIGN5PSIxNiIgcj0iMTYiIGZpbGw9IiM0NkZFNzciLz4KPHN2ZyB4PSI4IiB5PSI4IiB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHZpZXdCb3g9IjAgMCAxNiAxNiIgZmlsbD0ibm9uZSI+CjxwYXRoIGQ9Ik04IDhDOS42NTY4NSA4IDExIDYuNjU2ODUgMTEgNUMxMSAzLjM0MzE1IDkuNjU2ODUgMiA4IDJDNi4zNDMxNSAyIDUgMy4zNDMxNSA1IDVDNSA2LjY1Njg1IDYuMzQzMTUgOCA4IDhaIiBmaWxsPSJ3aGl0ZSIvPgo8cGF0aCBkPSJNMyAxNEMzIDExLjc5MDkgNC43OTA4NiAxMCA3IDEwSDlDMTEuMjA5MSAxMCAxMyAxMS43OTA5IDEzIDE0VjE0SDNWMTRaIiBmaWxsPSJ3aGl0ZSIvPgo8L3N2Zz4KPC9zdmc+';
        }
    }

    updateDashboardStats() {
        // Update total children
        const totalChildrenEl = document.getElementById('totalChildren');
        if (totalChildrenEl) {
            totalChildrenEl.textContent = this.family.length;
        }

        // Calculate total BitFun (placeholder for now)
        const totalBitfunEl = document.getElementById('totalBitfun');
        if (totalBitfunEl) {
            const totalBitfun = this.accounts
                .filter(account => account.account_type === 'bitfun')
                .reduce((sum, account) => sum + parseFloat(account.balance || 0), 0);
            totalBitfunEl.textContent = Math.floor(totalBitfun);
        }

        // Total achievements (placeholder)
        const totalAchievementsEl = document.getElementById('totalAchievements');
        if (totalAchievementsEl) {
            totalAchievementsEl.textContent = '0'; // Will be updated when achievements are implemented
        }
    }

    renderFamilyGrid() {
        const familyGridEl = document.getElementById('familyGrid');
        if (!familyGridEl) return;

        if (this.family.length === 0) {
            familyGridEl.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">
                        <i class="fas fa-users"></i>
                    </div>
                    <h3>Nenhum filho conectado</h3>
                    <p>Adicione seu primeiro filho para começar a jornada financeira em família</p>
                    <button class="btn-primary" id="addFirstChildBtn">
                        <i class="fas fa-plus"></i>
                        Adicionar Primeiro Filho
                    </button>
                </div>
            `;
            return;
        }

        const familyHTML = this.family.map(member => `
            <div class="family-member-card" data-child-id="${member.child_id}">
                <img src="${member.child_avatar || this.getDefaultAvatar()}" 
                     alt="Avatar de ${member.child_first_name}" 
                     class="member-avatar">
                <div class="member-name">${member.child_first_name} ${member.child_last_name || ''}</div>
                <div class="member-status">
                    <i class="fas fa-circle" style="color: #46FE77;"></i>
                    Ativo
                </div>
                <div class="member-actions">
                    <button class="btn-secondary" onclick="parentDashboard.viewChildDetails('${member.child_id}')">
                        <i class="fas fa-eye"></i>
                        Ver Detalhes
                    </button>
                </div>
            </div>
        `).join('');

        familyGridEl.innerHTML = familyHTML;
    }

    renderAccountsList() {
        const accountsListEl = document.getElementById('accountsList');
        if (!accountsListEl) return;

        if (this.accounts.length === 0) {
            accountsListEl.innerHTML = `
                <div class="empty-accounts">
                    <p>Nenhuma conta encontrada</p>
                    <button class="btn-secondary" onclick="parentDashboard.createAccount()">
                        <i class="fas fa-plus"></i>
                        Criar Conta
                    </button>
                </div>
            `;
            return;
        }

        const accountsHTML = this.accounts.map(account => `
            <div class="account-item">
                <div class="account-info">
                    <div class="account-name">${account.account_name}</div>
                    <div class="account-type">${account.account_type === 'real' ? 'Conta Real' : 'BitFun'}</div>
                </div>
                <div class="account-balance">
                    ${account.account_type === 'real' ? 'R$' : ''} ${parseFloat(account.balance || 0).toFixed(2)}
                    ${account.account_type === 'bitfun' ? ' BF' : ''}
                </div>
            </div>
        `).join('');

        accountsListEl.innerHTML = accountsHTML;
    }

    setupEventListeners() {
        // Logout button
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', this.logout.bind(this));
        }

        // Add child button
        const addChildBtn = document.getElementById('addChildBtn');
        if (addChildBtn) {
            addChildBtn.addEventListener('click', this.addChild.bind(this));
        }
    }

    async logout() {
        try {
            window.location.href = '/api/logout';
        } catch (error) {
            console.error('Error during logout:', error);
            this.showError('Erro ao fazer logout');
        }
    }

    addChild() {
        // For now, show a simple alert. This will be enhanced later
        alert('Funcionalidade de adicionar filho será implementada em breve.\n\nPor enquanto, os filhos podem se registrar diretamente e você poderá conectá-los através do sistema familiar.');
    }

    viewChildDetails(childId) {
        // Navigate to child details view
        window.location.href = `/dashboard/child?id=${childId}`;
    }

    createAccount() {
        // For now, show a simple alert
        alert('Funcionalidade de criar conta será implementada em breve.');
    }

    getDefaultAvatar() {
        return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAiIGhlaWdodD0iODAiIHZpZXdCb3g9IjAgMCA4MCA4MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iNDAiIGN5PSI0MCIgcj0iNDAiIGZpbGw9IiM0NkZFNzciLz4KPHN2ZyB4PSIyMCIgeT0iMjAiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgdmlld0JveD0iMCAwIDQwIDQwIiBmaWxsPSJub25lIj4KPHN2ZyB4PSIxMCIgeT0iOCIgd2lkdGg9IjIwIiBoZWlnaHQ9IjI0IiB2aWV3Qm94PSIwIDAgMjAgMjQiIGZpbGw9Im5vbmUiPgo8cGF0aCBkPSJNMTAgMTBDMTIuMjA5MSAxMCAxNCA3Ljc5MDg2IDE0IDVDMTQgMi4yMDkxNCAxMi4yMDkxIDAgMTAgMEM3Ljc5MDg2IDAgNiAyLjIwOTE0IDYgNUM2IDcuNzkwODYgNy43OTA4NiAxMCAxMCAxMFoiIGZpbGw9IndoaXRlIi8+CjxwYXRoIGQ9Ik0yIDI0QzIgMTguNDc3MiA1LjU4MTcyIDE0IDEwIDE0QzE0LjQxODMgMTQgMTggMTguNDc3MiAxOCAyNFYyNEgyVjI0WiIgZmlsbD0id2hpdGUiLz4KPC9zdmc+CjwvcGF0aD4KPC9zdmc+Cjwvc3ZnPgo=';
    }

    hideLoadingScreen() {
        const loadingScreen = document.getElementById('loadingScreen');
        if (loadingScreen) {
            loadingScreen.classList.add('hidden');
            setTimeout(() => {
                loadingScreen.style.display = 'none';
            }, 500);
        }
    }

    showError(message) {
        // Simple error display - can be enhanced with a proper toast system
        console.error(message);
        alert(message);
    }
}

// Initialize dashboard when page loads
let parentDashboard;
document.addEventListener('DOMContentLoaded', () => {
    parentDashboard = new ParentDashboard();
});

// Handle authentication errors globally
window.addEventListener('unhandledrejection', (event) => {
    if (event.reason && event.reason.message && event.reason.message.includes('401')) {
        window.location.href = '/api/login';
    }
});