# FinanFun Website - Replit Configuration

## Overview

FinanFun is a static website designed to present and promote a financial education mobile application for children and teenagers. The website serves as a landing page to showcase the app's features, explain the problem it solves, and attract potential users (parents, educators, and institutions).

## System Architecture

### Frontend Architecture
- **Technology Stack**: Pure HTML5, CSS3, and vanilla JavaScript
- **Structure**: Single-page application (SPA) with additional secondary pages
- **Styling**: CSS custom properties (CSS variables) for consistent theming
- **Layout**: Responsive design using CSS Grid and Flexbox
- **Navigation**: Fixed navigation bar with hamburger menu for mobile devices

### Server Architecture
- **Development Server**: Python's built-in HTTP server (`python3 -m http.server`)
- **Port Configuration**: Runs on port 5000
- **Deployment**: Static file serving with no backend processing required

## Key Components

### Main Pages
1. **index.html**: Primary landing page with all main content sections
2. **pages/sobre.html**: About page with mission and company information
3. **pages/contato.html**: Contact page with contact information and forms

### Assets Structure
- **css/style.css**: Main stylesheet with CSS variables and responsive design
- **js/script.js**: Interactive features including smooth scrolling and mobile navigation
- **images/**: Directory reserved for future images and icons (currently empty)

### Core Sections (index.html)
1. Navigation bar with responsive mobile menu
2. Hero section with main call-to-action
3. Problem identification section
4. Solution presentation section
5. Features and functionality showcase
6. AI Avatar section
7. Impact demonstration
8. Contact information

## Data Flow

### Static Content Flow
1. User requests webpage → Python HTTP server serves static files
2. Browser loads HTML structure
3. CSS files load for styling and responsive design
4. JavaScript loads for interactive features (navigation, smooth scrolling)

### Interactive Elements
- Mobile hamburger menu toggle
- Smooth scrolling navigation
- Dynamic navbar background on scroll
- Responsive navigation link handling

## External Dependencies

### CDN Resources
- **Font Awesome 6.4.0**: Icon library loaded from CloudFlare CDN
- **No other external dependencies**: Self-contained static website

### Fonts
- Primary: Segoe UI (system font)
- Fallbacks: Tahoma, Geneva, Verdana, sans-serif

## Deployment Strategy

### Development Environment
- **Runtime**: Python 3.11 and Node.js 20 modules available
- **Development Server**: Python HTTP server for local development
- **Port**: 5000 (configured in .replit file)

### Production Deployment
- **Static Hosting**: Can be deployed to any static hosting service
- **No Build Process**: Direct file serving without compilation
- **CDN Ready**: All assets are optimized for CDN deployment

### Replit Configuration
- **Workflows**: Parallel execution setup with automatic server start
- **Run Command**: `python3 -m http.server 5000`
- **Development Tools**: Both Python and Node.js environments available

## Changelog

```
Changelog:
- June 18, 2025: Initial website structure completed
  - Complete homepage with all required sections
  - Mobile responsive design with modern banking-inspired styling
  - Interactive JavaScript features and smooth scrolling
  - Additional About and Contact pages
  - User feedback: "Gostei muito!" - satisfied with overall design
  
- June 18, 2025: Login system integration with Stack Auth
  - Added Login button to navigation bar with modern styling
  - Implemented authentication modal with login/signup forms
  - Social login integration (Google, Facebook) ready for Stack Auth
  - Mobile-responsive authentication interface
  - User session management and logout functionality
  - Stack Auth SDK (@stackframe/stack) installed for future integration

- June 18, 2025: PostgreSQL database integration completed
  - PostgreSQL database created and configured with environment variables
  - Complete database schema with user management, accounts, and transactions
  - Express.js API server with authentication endpoints
  - Real user registration and login with bcrypt password hashing
  - Session management with token-based authentication
  - User accounts with real and virtual (BitFun) currency support
  - Database tables: users, user_profiles, user_sessions, accounts, bitfun_transactions

- June 18, 2025: Content and visual improvements
  - Real app mockup image implemented replacing placeholder
  - Subtitle updated to "O Futuro Financeiro Começa Cedo"
  - Extended problem section with 6 total challenges:
    * Falta de Educação Financeira, Uso Improdutivo de Telas
    * Poucas Ferramentas Práticas, Cursos Caros e Limitados
    * Desinteresse no Aprendizado Financeiro, Falta de Responsabilidade Financeira
  - User feedback: "Ficou ótimo" - satisfied with recent updates

- June 19, 2025: Content reorganization and color palette update
  - Expansion section reorganized with new items and specific order
  - "Programas Educacionais" changed to "Ecosistema Educacional"
  - Added "Ambiente Seguro" focusing on parental controls
  - Added "Tecnologia Aplicada" highlighting AI and BitFun virtual currency
  - New order: Adaptação por Faixa Etária → Adoção Familiar → Ambiente Seguro → Ecosistema Educacional → Tecnologia Aplicada → Parcerias Estratégicas
  - Updated partnership text to include online stores and focus on experience
  - Color palette updated: Green primary (#46FE77), Blue secondary (#181D4E), maintained purple accent and dark backgrounds
  - Added "Lojas Online" as fifth potential partner with shopping cart icon
  - Layout updated to display 5 partners in single row (responsive: 2 columns on mobile)
  - User feedback: "ficou ótimo agora" and "ótimo... era isso mesmo!" - satisfied with all updates

- June 19, 2025: Final branding and visual refinements
  - Updated subtitle in "Como Funciona" section to "Um App Financeiro para Toda Família"
  - Restored original coins icon for "Moeda Digital" feature (user preferred over custom icon)
  - Updated "Personalização" icon to sliders (fas fa-sliders-h) for better representation
  - Implemented dual-color branding for "FinanBoss": "Finan" in green, "Boss" in white
  - Created specific CSS classes to handle different color schemes for FinanFun vs FinanBoss branding
  - Final result: FinanFun (white+green) and FinanBoss (green+white) with distinct visual identity
  - User feedback: "otimo... parabens!" - fully satisfied with final implementation

- June 19, 2025: Functionality cards organization and content updates
  - Updated "Painel dos Pais" to "Painel de Controle dos Pais (FinanBoss)"
  - Changed "Controle de Saldo" to "Consulta de Saldos"
  - Updated "Tarefas e Metas" to "Criação de Tarefas e Metas"
  - Changed "FinanPlay" to "Games"
  - Added new "Painel dos Filhos" card in position 2
  - Reorganized cards order: Painel de Controle dos Pais → Painel dos Filhos → Consulta de Saldos → Criação de Tarefas e Metas → Sistema de Recompensas → Simulador de Investimentos → Avatar Personalizado → Moeda Virtual → Games
  - Enhanced FinanFun interface description to "Interface educativa, customizável e adaptativa para os jovens aprenderem sobre finanças"
  - Updated FinanBoss description to "Painel completo de controle, gerenciamento e acompanhamento dos filhos"
  - Expanded FinanBoss functionality details: "Gerenciamento completo (depósitos, gastos, saldos, definição de metas e recompensas). Controle de conteúdo, tempo, níveis de acesso e acompanhamento dos progressos"
  - Simplified "Avatar com IA e Gamificação" to "Avatar com IA" in solution section
  - User feedback: "agora funcionou... obrigado!" - satisfied with all corrections

- June 19, 2025: Impact section expansion and content refinements
  - Expanded impact section from 4 to 6 cards with new "Mentoria Financeira" and "Base Sólida" cards
  - Reorganized card sequence: Mentoria Financeira, Compreensão Prática, Hábitos Saudáveis, Responsabilidade e Autonomia, Base Sólida, Futuro Promissor
  - Updated "Preparação Financeira" to "Futuro Promissor" with rocket icon
  - Enhanced text content to emphasize both infância e adolescência throughout
  - Refined descriptions: disciplina financeira, liberdade financeira, conhecimentos fundamentais
  - Updated partnership terminology from "Lojas Online" to "Lojas Virtuais"

- June 19, 2025: Final functionality cards refinements
  - Updated "Sistema de Recompensas" description to focus on "conquistas e recompensas"
  - Enhanced "Criação de Tarefas e Metas" with daily, weekly, monthly system and editable suggested goals
  - Updated "Painel dos Filhos" description to "Interface dedicada e personalizável para cada jovem"
  - Changed "FinanFun (Criança)" to "FinanFun (Filhos)" in Como Funciona section
  - Refined "Consulta de Saldos" to "Consulta de Saldos e Extratos" with realistic account tracking
  - User feedback: Layout and content finalized, ready for functionality implementation
```

## User Preferences

```
Preferred communication style: Simple, everyday language.
```

## Technical Notes

### Design System
- **Color Palette**: Green primary (#46FE77), blue secondary (#181D4E), purple accent (#8b5cf6), dark backgrounds
- **Typography**: System fonts with fallbacks
- **Responsive Breakpoints**: Flexible grid system adapting to screen sizes
- **Theme**: Dark background with gradient overlays

### Code Organization
- **Modular CSS**: Uses CSS custom properties for maintainable theming
- **Semantic HTML**: Proper use of semantic tags for accessibility
- **Progressive Enhancement**: Basic functionality works without JavaScript

### Future Considerations
- Image optimization and lazy loading when assets are added
- SEO optimization with meta tags and structured data
- Performance monitoring and optimization
- Integration with analytics tools
- Form handling for contact page (currently static)