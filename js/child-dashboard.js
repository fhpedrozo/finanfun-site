class ChildDashboard {
    constructor() {
        this.userData = null;
        this.dashboardData = null;
        
        // Use setTimeout to avoid promise rejection issues
        setTimeout(() => {
            this.init();
        }, 100);
    }

    init() {
        console.log('Child Dashboard initializing...');
        
        // Load data synchronously
        this.loadUserData();
        this.loadDashboardData();
        
        // Update UI components
        this.updateUserDisplay();
        this.updateBalanceCards();
        this.loadTasks();
        this.loadAchievements();
        this.setupEventListeners();
        this.initializeAvatarChat();
        
        // Hide loading screen
        this.hideLoadingScreen();
        
        console.log('Child Dashboard initialized successfully');
    }

    loadUserData() {
        try {
            const sessionToken = localStorage.getItem('finanfun_session');
            const storedUserData = localStorage.getItem('finanfun_user_data');
            
            if (sessionToken && storedUserData) {
                const userData = JSON.parse(storedUserData);
                
                this.userData = {
                    id: userData.id,
                    firstName: userData.name ? userData.name.split(' ')[0] : 'Jovem',
                    lastName: userData.name ? userData.name.split(' ').slice(1).join(' ') : '',
                    email: userData.email,
                    profileImageUrl: userData.avatar_url || userData.picture || 'https://via.placeholder.com/150',
                    userType: 'child'
                };
                console.log('User data loaded successfully:', this.userData.firstName);
            } else {
                console.log('No session found, using demo data');
                this.userData = {
                    id: 'demo_user',
                    firstName: 'Jovem',
                    lastName: 'Investidor', 
                    email: 'jovem@finanfun.com',
                    profileImageUrl: 'https://via.placeholder.com/150',
                    userType: 'child'
                };
            }
        } catch (error) {
            console.log('Loading demo user data due to error:', error.message);
            this.userData = {
                id: 'demo_user',
                firstName: 'Jovem',
                lastName: 'Investidor',
                email: 'jovem@finanfun.com',
                profileImageUrl: 'https://via.placeholder.com/150',
                userType: 'child'
            };
        }
    }

    loadDashboardData() {
        try {
            this.dashboardData = {
                balance: {
                    real: 150.00,
                    bitfun: 250
                },
                tasks: [
                    {
                        id: 1,
                        title: 'Economizar R$ 10 esta semana',
                        description: 'Guarde R$ 10 para alcançar sua meta',
                        reward: 50,
                        progress: 70,
                        completed: false
                    },
                    {
                        id: 2,
                        title: 'Aprender sobre investimentos',
                        description: 'Complete o módulo de investimentos',
                        reward: 30,
                        progress: 100,
                        completed: true
                    }
                ],
                achievements: [
                    {
                        id: 1,
                        title: 'Primeiro Depósito',
                        description: 'Fez seu primeiro depósito!',
                        icon: 'fas fa-medal',
                        earned: true
                    },
                    {
                        id: 2,
                        title: 'Economizador',
                        description: 'Economizou por 7 dias seguidos',
                        icon: 'fas fa-trophy',
                        earned: true
                    }
                ]
            };
            console.log('Dashboard data loaded successfully');
        } catch (error) {
            console.log('Error loading dashboard data, using defaults:', error.message);
            this.dashboardData = {
                balance: { real: 0, bitfun: 0 },
                tasks: [],
                achievements: []
            };
        }
    }

    updateUserDisplay() {
        if (!this.userData) return;
        
        const userNameElement = document.getElementById('user-name');
        const userAvatarElement = document.getElementById('user-avatar');
        
        if (userNameElement) {
            userNameElement.textContent = `${this.userData.firstName || 'Jovem'} ${this.userData.lastName || 'Investidor'}`.trim();
        }
        
        if (userAvatarElement) {
            userAvatarElement.src = this.userData.profileImageUrl || this.getDefaultAvatar();
        }
    }

    updateBalanceCards() {
        if (!this.dashboardData) return;
        
        const bitfunBalanceElement = document.getElementById('bitfun-balance');
        const realBalanceElement = document.getElementById('real-balance');
        
        if (bitfunBalanceElement) {
            bitfunBalanceElement.textContent = `${this.dashboardData.bitfunBalance} BFN`;
        }
        
        if (realBalanceElement) {
            realBalanceElement.textContent = `R$ ${this.dashboardData.realBalance.toFixed(2)}`;
        }
    }

    loadTasks() {
        const tasksContainer = document.getElementById('tasks-container');
        if (!tasksContainer) return;
        
        // Mock tasks for demonstration
        const mockTasks = [
            {
                id: 1,
                title: 'Leitura Diária',
                description: 'Leia sobre poupança por 15 minutos',
                reward: '10 BFN',
                completed: false
            },
            {
                id: 2,
                title: 'Economize Hoje',
                description: 'Não gaste dinheiro desnecessário',
                reward: '5 BFN',
                completed: true
            },
            {
                id: 3,
                title: 'Quiz Financeiro',
                description: 'Complete o quiz sobre investimentos',
                reward: '15 BFN',
                completed: false
            }
        ];
        
        this.renderTasks(mockTasks);
        this.updateTaskProgress(mockTasks);
    }

    renderTasks(tasks) {
        const tasksContainer = document.getElementById('tasks-container');
        if (!tasksContainer) return;
        
        tasksContainer.innerHTML = '';
        
        tasks.forEach(task => {
            const taskItem = document.createElement('div');
            taskItem.className = `task-item ${task.completed ? 'completed' : ''}`;
            taskItem.innerHTML = `
                <div class="task-info">
                    <h4>${task.title}</h4>
                    <p>${task.description}</p>
                </div>
                <div class="task-actions">
                    <span class="task-reward">${task.reward}</span>
                    ${!task.completed ? `<button onclick="childDashboard.completeTask(${task.id})" class="complete-btn">Completar</button>` : '<span class="completed-badge">✓ Concluído</span>'}
                </div>
            `;
            tasksContainer.appendChild(taskItem);
        });
    }

    updateTaskProgress(tasks) {
        const completedTasks = tasks.filter(task => task.completed).length;
        const totalTasks = tasks.length;
        const progressPercentage = (completedTasks / totalTasks) * 100;
        
        const taskProgressElement = document.getElementById('task-progress');
        const taskProgressFillElement = document.getElementById('task-progress-fill');
        
        if (taskProgressElement) {
            taskProgressElement.textContent = `${completedTasks}/${totalTasks}`;
        }
        
        if (taskProgressFillElement) {
            taskProgressFillElement.style.width = `${progressPercentage}%`;
        }
    }

    loadAchievements() {
        const achievementsContainer = document.getElementById('achievements-container');
        if (!achievementsContainer) return;
        
        // Mock achievements for demonstration
        const mockAchievements = [
            {
                id: 1,
                title: 'Primeiro Passo',
                description: 'Primeira lição concluída',
                icon: 'fas fa-trophy',
                unlocked: true
            },
            {
                id: 2,
                title: 'Poupador',
                description: 'Economizou por 7 dias',
                icon: 'fas fa-piggy-bank',
                unlocked: true
            },
            {
                id: 3,
                title: 'Investidor Junior',
                description: 'Completou módulo de investimentos',
                icon: 'fas fa-chart-line',
                unlocked: false
            }
        ];
        
        this.renderAchievements(mockAchievements);
    }

    renderAchievements(achievements) {
        const achievementsContainer = document.getElementById('achievements-container');
        if (!achievementsContainer) return;
        
        achievementsContainer.innerHTML = '';
        
        achievements.forEach(achievement => {
            const achievementItem = document.createElement('div');
            achievementItem.className = `achievement-item ${achievement.unlocked ? 'unlocked' : 'locked'}`;
            achievementItem.innerHTML = `
                <div class="achievement-icon">
                    <i class="${achievement.icon}"></i>
                </div>
                <h4>${achievement.title}</h4>
                <p>${achievement.description}</p>
            `;
            achievementsContainer.appendChild(achievementItem);
        });
    }

    setupEventListeners() {
        const logoutBtn = document.getElementById('logout-btn');
        
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => this.logout());
        }
    }

    initializeAvatarChat() {
        const learningProgress = 45; // Mock learning progress
        const learningPercentageElement = document.getElementById('learning-percentage');
        const learningProgressFillElement = document.getElementById('learning-progress-fill');
        
        if (learningPercentageElement) {
            learningPercentageElement.textContent = `${learningProgress}%`;
        }
        
        if (learningProgressFillElement) {
            learningProgressFillElement.style.width = `${learningProgress}%`;
        }
    }

    async completeTask(taskId) {
        try {
            // Mock task completion
            alert(`Parabéns! Você completou a tarefa e ganhou BitFun!`);
            
            // In a real implementation, this would call the API
            // await this.addBitfunTransaction(10, 'earned', 'Tarefa completada', 'task_' + taskId);
            
            // Reload tasks to update UI
            this.loadTasks();
            
        } catch (error) {
            console.error('Error completing task:', error);
            this.showError('Erro ao completar tarefa');
        }
    }

    async addBitfunTransaction(amount, type, description, source) {
        try {
            const response = await fetch('http://localhost:3000/api/bitfun/transaction', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify({
                    amount,
                    type,
                    description,
                    source
                })
            });
            
            if (!response.ok) {
                throw new Error('Failed to add transaction');
            }
            
            // Reload dashboard data to update balances
            await this.loadDashboardData();
            this.updateBalanceCards();
            
        } catch (error) {
            console.error('Error adding BitFun transaction:', error);
            throw error;
        }
    }

    viewTransactions(accountType) {
        alert(`Visualizar transações da conta: ${accountType}`);
    }

    viewGoals() {
        alert('Visualizar metas será implementado em breve!');
    }

    continueLearning() {
        alert('Continuar aprendizado será implementado em breve!');
    }

    viewAllAchievements() {
        alert('Ver todas as conquistas será implementado em breve!');
    }

    customizeAvatar() {
        alert('Personalizar avatar será implementado em breve!');
    }

    toggleChat() {
        const chatWindow = document.getElementById('chat-window');
        if (chatWindow) {
            chatWindow.classList.toggle('hidden');
        }
    }

    async logout() {
        try {
            // Clear local session data
            localStorage.removeItem('finanfun_session');
            localStorage.removeItem('finanfun_user_data');
            
            // Redirect to home page
            window.location.href = '../index.html';
        } catch (error) {
            console.error('Logout error:', error);
            this.showError('Erro ao fazer logout');
        }
    }

    getDefaultAvatar() {
        return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMjAiIGZpbGw9IiM0NkZFNzciLz4KPHN2ZyB4PSI4IiB5PSI4IiB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSI+CjxwYXRoIGQ9Ik0xMiAxMkM3LjU4MTcyIDEyIDQgMTUuNTgxNyA0IDIwVjIySDIwVjIwQzIwIDE1LjU4MTcgMTYuNDE4MyAxMiAxMiAxMloiIGZpbGw9IiMwRDExMTciLz4KPHBhdGggZD0iTTEyIDEyQzE0LjIwOTEgMTIgMTYgMTAuMjA5MSAxNiA4QzE2IDUuNzkwODYgMTQuMjA5MSA0IDEyIDRDOS43OTA4NiA0IDggNS43OTA4NiA4IDhDOCAxMC4yMDkxIDkuNzkwODYgMTIgMTIgMTJaIiBmaWxsPSIjMEQxMTE3Ii8+Cjwvc3ZnPgo8L3N2Zz4K';
    }

    hideLoadingScreen() {
        const loadingScreen = document.getElementById('loading-screen');
        const dashboardContainer = document.getElementById('dashboard-container');
        
        console.log('Hiding loading screen and showing dashboard');
        
        if (loadingScreen) {
            loadingScreen.style.display = 'none';
            console.log('Loading screen hidden');
        } else {
            console.log('Loading screen element not found');
        }
        
        if (dashboardContainer) {
            dashboardContainer.classList.remove('hidden');
            dashboardContainer.style.display = 'block';
            console.log('Dashboard container shown');
        } else {
            console.log('Dashboard container element not found');
        }
    }

    showSuccess(message) {
        alert(`✅ ${message}`);
    }

    showError(message) {
        alert(`❌ ${message}`);
    }
}

// Global instance and functions for event handlers
let childDashboard = null;

// Global functions for inline event handlers
window.viewTransactions = function(accountType) {
    if (childDashboard) {
        childDashboard.viewTransactions(accountType);
    }
};

window.viewGoals = function() {
    if (childDashboard) {
        childDashboard.viewGoals();
    }
};

window.continueLearning = function() {
    if (childDashboard) {
        childDashboard.continueLearning();
    }
};

window.viewAllAchievements = function() {
    if (childDashboard) {
        childDashboard.viewAllAchievements();
    }
};

window.customizeAvatar = function() {
    if (childDashboard) {
        childDashboard.customizeAvatar();
    }
};

window.toggleChat = function() {
    if (childDashboard) {
        childDashboard.toggleChat();
    }
};

window.sendMessage = function() {
    const chatInput = document.getElementById('chat-input');
    const chatMessages = document.getElementById('chat-messages');
    
    if (chatInput && chatMessages && chatInput.value.trim()) {
        const userMessage = chatInput.value.trim();
        
        // Add user message
        const userMessageDiv = document.createElement('div');
        userMessageDiv.className = 'chat-message user';
        userMessageDiv.innerHTML = `<p>${userMessage}</p>`;
        chatMessages.appendChild(userMessageDiv);
        
        // Add bot response (mock)
        setTimeout(() => {
            const botMessageDiv = document.createElement('div');
            botMessageDiv.className = 'chat-message bot';
            botMessageDiv.innerHTML = `<p>Ótima pergunta! Continue explorando e aprendendo sobre finanças. Que tal completar uma tarefa hoje?</p>`;
            chatMessages.appendChild(botMessageDiv);
            chatMessages.scrollTop = chatMessages.scrollHeight;
        }, 1000);
        
        chatInput.value = '';
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
};

// Initialize dashboard when page loads
document.addEventListener('DOMContentLoaded', () => {
    childDashboard = new ChildDashboard();
});