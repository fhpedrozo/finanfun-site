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
```

## User Preferences

```
Preferred communication style: Simple, everyday language.
```

## Technical Notes

### Design System
- **Color Palette**: Green primary (#00ff88), blue secondary (#1a5cff), purple accent (#8b5cf6)
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