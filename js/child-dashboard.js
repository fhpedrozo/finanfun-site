// Child Dashboard JavaScript for FinanFun

class ChildDashboard {
    constructor() {
        this.user = null;
        this.accounts = [];
        this.tasks = [];
        this.achievements = [];
        this.init();
    }

    async init() {
        await this.loadUserData();
        await this.loadDashboardData();
        this.setupEventListeners();
        this.initializeAvatarChat();
        this.hideLoadingScreen();
    }

    async loadUserData() {
        try {
            const response = await fetch('/api/auth/user', {
                credentials: 'include'
            });
            
            if (response.status === 401) {
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
            const response = await fetch('/api/dashboard/child', {
                credentials: 'include'
            });
            
            if (!response.ok) {
                throw new Error('Failed to load dashboard data');
            }
            
            const data = await response.json();
            this.accounts = data.accounts || [];
            
            this.updateBalanceCards();
            this.loadTasks();
            this.loadAchievements();
        } catch (error) {
            console.error('Error loading dashboard data:', error);
            this.showError('Erro ao carregar dados do dashboard');
        }
    }

    updateUserDisplay() {
        if (!this.user) return;
        
        const userNameEl = document.getElementById('userName');
        const welcomeNameEl = document.getElementById('welcomeName');
        const userAvatarEl = document.getElementById('userAvatar');
        const mainAvatarEl = document.getElementById('mainAvatar');
        
        const displayName = this.user.firstName || this.user.email || 'Jovem Financeiro';
        
        if (userNameEl) userNameEl.textContent = displayName;
        if (welcomeNameEl) welcomeNameEl.textContent = displayName;
        
        const avatarUrl = this.user.profileImageUrl || this.getDefaultAvatar();
        if (userAvatarEl) {
            userAvatarEl.src = avatarUrl;
            userAvatarEl.alt = `Avatar de ${displayName}`;
        }
        if (mainAvatarEl) {
            mainAvatarEl.src = avatarUrl;
            mainAvatarEl.alt = `Avatar de ${displayName}`;
        }
    }

    updateBalanceCards() {
        // Update BitFun balance
        const bitfunAccount = this.accounts.find(acc => acc.account_type === 'bitfun');
        const bitfunBalanceEl = document.getElementById('bitfunBalance');
        if (bitfunBalanceEl) {
            const balance = bitfunAccount ? Math.floor(parseFloat(bitfunAccount.balance || 0)) : 0;
            bitfunBalanceEl.textContent = balance.toLocaleString();
        }

        // Update real balance
        const realAccount = this.accounts.find(acc => acc.account_type === 'real');
        const realBalanceEl = document.getElementById('realBalance');
        if (realBalanceEl) {
            const balance = realAccount ? parseFloat(realAccount.balance || 0) : 0;
            realBalanceEl.textContent = `R$ ${balance.toFixed(2).replace('.', ',')}`;
        }

        // Update active goals (placeholder)
        const activeGoalsEl = document.getElementById('activeGoals');
        if (activeGoalsEl) {
            activeGoalsEl.textContent = '2'; // Placeholder value
        }
    }

    loadTasks() {
        // Sample tasks for demonstration
        this.tasks = [
            {
                id: 1,
                title: 'Ler sobre Poupança',
                description: 'Complete a lição sobre como guardar dinheiro',
                reward: 50,
                icon: 'fas fa-book',
                completed: false,
                type: 'learning'
            },
            {
                id: 2,
                title: 'Definir Meta de Economia',
                description: 'Crie sua primeira meta de economia',
                reward: 100,
                icon: 'fas fa-target',
                completed: false,
                type: 'goal'
            },
            {
                id: 3,
                title: 'Jogar Quiz Financeiro',
                description: 'Responda 5 perguntas sobre finanças',
                reward: 75,
                icon: 'fas fa-question-circle',
                completed: true,
                type: 'quiz'
            }
        ];

        this.renderTasks();
        this.updateTaskProgress();
    }

    renderTasks() {
        const tasksGridEl = document.getElementById('tasksGrid');
        if (!tasksGridEl) return;

        const tasksHTML = this.tasks.map(task => `
            <div class="task-card ${task.completed ? 'completed' : ''}" data-task-id="${task.id}">
                <div class="task-header">
                    <div class="task-icon">
                        <i class="${task.icon}"></i>
                    </div>
                    <div class="task-info">
                        <h4>${task.title}</h4>
                        <p>${task.description}</p>
                    </div>
                </div>
                <div class="task-reward">
                    <span class="reward-amount">+${task.reward} BitFun</span>
                    <button class="task-complete-btn" 
                            onclick="childDashboard.completeTask(${task.id})"
                            ${task.completed ? 'disabled' : ''}>
                        ${task.completed ? 'Completa!' : 'Fazer Agora'}
                    </button>
                </div>
            </div>
        `).join('');

        tasksGridEl.innerHTML = tasksHTML;
    }

    updateTaskProgress() {
        const completedTasks = this.tasks.filter(task => task.completed).length;
        const totalTasks = this.tasks.length;
        
        const completedTasksEl = document.getElementById('completedTasks');
        const totalTasksEl = document.getElementById('totalTasks');
        
        if (completedTasksEl) completedTasksEl.textContent = completedTasks;
        if (totalTasksEl) totalTasksEl.textContent = totalTasks;
    }

    loadAchievements() {
        // Sample achievements for demonstration
        this.achievements = [
            {
                id: 1,
                title: 'Primeira Economia',
                description: 'Guardou dinheiro pela primeira vez',
                icon: 'fas fa-piggy-bank',
                unlockedAt: new Date()
            },
            {
                id: 2,
                title: 'Explorador',
                description: 'Completou primeira lição',
                icon: 'fas fa-compass',
                unlockedAt: new Date()
            },
            {
                id: 3,
                title: 'Quiz Master',
                description: 'Acertou 10 perguntas seguidas',
                icon: 'fas fa-brain',
                unlockedAt: new Date()
            }
        ];

        this.renderAchievements();
    }

    renderAchievements() {
        const achievementsShowcaseEl = document.getElementById('achievementsShowcase');
        if (!achievementsShowcaseEl) return;

        if (this.achievements.length === 0) {
            achievementsShowcaseEl.innerHTML = `
                <div class="empty-achievements">
                    <p>Complete suas primeiras tarefas para desbloquear conquistas!</p>
                </div>
            `;
            return;
        }

        const achievementsHTML = this.achievements.map(achievement => `
            <div class="achievement-badge" data-achievement-id="${achievement.id}">
                <div class="achievement-icon">
                    <i class="${achievement.icon}"></i>
                </div>
                <h5>${achievement.title}</h5>
                <p>${achievement.description}</p>
            </div>
        `).join('');

        achievementsShowcaseEl.innerHTML = achievementsHTML;
    }

    setupEventListeners() {
        // Logout button
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', this.logout.bind(this));
        }

        // Customize avatar button
        const customizeAvatarBtn = document.getElementById('customizeAvatarBtn');
        if (customizeAvatarBtn) {
            customizeAvatarBtn.addEventListener('click', this.customizeAvatar.bind(this));
        }

        // Chat toggle
        const chatToggle = document.getElementById('chatToggle');
        if (chatToggle) {
            chatToggle.addEventListener('click', this.toggleChat.bind(this));
        }
    }

    initializeAvatarChat() {
        // Rotate through different AI messages
        const messages = [
            'Olá! Como posso te ajudar hoje? 😊',
            'Que tal completar mais uma tarefa?',
            'Você está indo muito bem!',
            'Lembre-se: economizar é um super poder!',
            'Pronto para aprender algo novo?'
        ];
        
        let currentMessageIndex = 0;
        const avatarMessageEl = document.getElementById('avatarMessage');
        
        if (avatarMessageEl) {
            setInterval(() => {
                currentMessageIndex = (currentMessageIndex + 1) % messages.length;
                avatarMessageEl.textContent = messages[currentMessageIndex];
            }, 10000); // Change message every 10 seconds
        }
    }

    // Action Methods
    async completeTask(taskId) {
        const task = this.tasks.find(t => t.id === taskId);
        if (!task || task.completed) return;

        try {
            // Mark task as completed
            task.completed = true;
            
            // Award BitFun coins
            await this.addBitfunTransaction(task.reward, 'earn', `Tarefa completada: ${task.title}`, 'task');
            
            // Re-render tasks and update progress
            this.renderTasks();
            this.updateTaskProgress();
            this.updateBalanceCards();
            
            // Show success message
            this.showSuccess(`Parabéns! Você ganhou ${task.reward} BitFun!`);
            
        } catch (error) {
            console.error('Error completing task:', error);
            this.showError('Erro ao completar tarefa');
        }
    }

    async addBitfunTransaction(amount, type, description, source) {
        try {
            const response = await fetch('/api/bitfun/transaction', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
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
            
            return await response.json();
        } catch (error) {
            console.error('Error adding BitFun transaction:', error);
            throw error;
        }
    }

    viewTransactions(accountType) {
        alert(`Visualização de transações ${accountType} será implementada em breve.`);
    }

    viewGoals() {
        alert('Sistema de metas será implementado em breve.');
    }

    continueLearning() {
        alert('Módulos de aprendizado serão implementados em breve.');
    }

    viewAllAchievements() {
        alert('Página de conquistas será implementada em breve.');
    }

    customizeAvatar() {
        alert('Customização de avatar será implementada em breve.');
    }

    toggleChat() {
        const chatBubble = document.querySelector('.chat-bubble');
        if (chatBubble) {
            chatBubble.style.opacity = chatBubble.style.opacity === '1' ? '0' : '1';
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

    getDefaultAvatar() {
        return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIwIiBoZWlnaHQ9IjEyMCIgdmlld0JveD0iMCAwIDEyMCAxMjAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxjaXJjbGUgY3g9IjYwIiBjeT0iNjAiIHI9IjYwIiBmaWxsPSIjNDZGRTc3Ii8+CjxzdmcgeD0iMzAiIHk9IjMwIiB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgZmlsbD0ibm9uZSI+CjxwYXRoIGQ9Ik0zMCAzMEMzMy4zMTM3IDMwIDM2IDI3LjMxMzcgMzYgMjRDMzYgMjAuNjg2MyAzMy4zMTM3IDE4IDMwIDE4QzI2LjY4NjMgMTggMjQgMjAuNjg2MyAyNCAyNEMyNCAyNy4zMTM3IDI2LjY4NjMgMzAgMzAgMzBaIiBmaWxsPSJ3aGl0ZSIvPgo8cGF0aCBkPSJNMTggNDhDMTggNDEuMzcyNiAyMy4zNzI2IDM2IDMwIDM2QzM2LjYyNzQgMzYgNDIgNDEuMzcyNiA0MiA0OFY0OEgxOFY0OFoiIGZpbGw9IndoaXRlIi8+Cjwvc3ZnPgo8L3N2Zz4K';
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

    showSuccess(message) {
        // Simple success display - can be enhanced with a proper toast system
        console.log('Success:', message);
        alert(message);
    }

    showError(message) {
        // Simple error display - can be enhanced with a proper toast system
        console.error(message);
        alert(message);
    }
}

// Initialize dashboard when page loads
let childDashboard;
document.addEventListener('DOMContentLoaded', () => {
    childDashboard = new ChildDashboard();
});

// Handle authentication errors globally
window.addEventListener('unhandledrejection', (event) => {
    if (event.reason && event.reason.message && event.reason.message.includes('401')) {
        window.location.href = '/api/login';
    }
});