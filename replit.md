# FinanFun Website - Replit Configuration

## Overview
FinanFun is a static website promoting a financial education mobile application for children and teenagers. Its purpose is to showcase the app's features, address the problem it solves, and attract users, including parents, educators, and institutions, by presenting a comprehensive view of its capabilities and impact. The project envisions making financial education engaging and accessible, fostering financial literacy from a young age, and supporting family financial discussions.

## User Preferences
Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
The website is built with pure HTML5, CSS3, and vanilla JavaScript, following a single-page application (SPA) model with additional secondary pages. It employs CSS custom properties for consistent theming and uses CSS Grid and Flexbox for responsive layouts. Navigation is handled by a fixed navigation bar with a hamburger menu for mobile devices. The design system features a primary green (#46FE77), secondary blue (#181D4E), and purple accent (#8b5cf6) color palette on dark backgrounds, using system fonts with fallbacks.

### Server Architecture
A Python's built-in HTTP server (`python3 -m http.server`) serves the static files on port 5000 during development. The website is designed for static file serving without backend processing, making it suitable for deployment on any static hosting service without a build process.

### Key Components
The website includes `index.html` as the primary landing page, `pages/sobre.html` for mission and company information, and `pages/contato.html` for contact details. Core sections on the landing page cover navigation, a hero section, problem identification, solution presentation, features, an AI Avatar section, impact demonstration, and contact information. Assets are organized into `css/style.css`, `js/script.js`, and an `images/` directory.

### UI/UX Decisions
The design emphasizes a modern banking-inspired aesthetic, responsive design, and interactive JavaScript features like smooth scrolling and mobile navigation. The branding utilizes a dual-color scheme for "FinanFun" and "FinanBoss," with specific CSS classes to manage distinct visual identities. The user interface for both parent (FinanBoss) and child (FinanFun) dashboards are designed to be intuitive and engaging, featuring responsive CSS and dual-theme support.

## External Dependencies

### CDN Resources
- **Font Awesome 6.4.0**: Icon library loaded from CloudFlare CDN.

### Fonts
- **Primary**: Segoe UI (system font)
- **Fallbacks**: Tahoma, Geneva, Verdana, sans-serif

### Database
- **PostgreSQL**: Used for user management, accounts, transactions, and session storage in the backend system.