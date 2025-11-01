# GameForge Studio

## Overview

GameForge Studio is a full-stack web platform designed to streamline game development. It offers developers comprehensive project management, collaboration tools, and essential resources within a unified dashboard. The platform supports the entire game development lifecycle, from concept to distribution, across various game engines and deployment environments, aiming to enhance efficiency and foster innovation.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript.
- **Build System**: Vite for rapid development and optimized builds.
- **Styling**: Tailwind CSS with a custom design system using CSS variables.
- **UI Components**: Radix UI primitives and shadcn/ui for consistent, accessible components.
- **State Management**: TanStack Query for server state management and caching.
- **Forms**: React Hook Form with Zod validation.

### Backend Architecture
- **Runtime**: Node.js with Express.js.
- **Language**: TypeScript for full-stack type safety.
- **API Design**: RESTful API structure.
- **Session Management**: Connect-pg-simple for PostgreSQL-backed session storage.

### Data Storage Solutions
- **Database**: PostgreSQL as the primary database.
- **ORM**: Drizzle ORM for type-safe operations and schema management.
- **Schema Management**: Drizzle Kit for migrations.
- **Connection**: Neon Database for cloud deployment.
- **Fallback Storage**: In-memory storage for development.

### Database Schema Design
- **Users Table**: Authentication, profile management, roles, and avatars.
- **Projects Table**: Game projects with metadata, engine, platform, status, and team collaboration.
- **Metrics Table**: User analytics and dashboard metrics.
- **Game Library Table**: Stores user's game collection with metadata and play statistics.
- **Type Safety**: Zod schemas for runtime validation and TypeScript inference.

### Authentication and Authorization
- **Session-based Authentication**: Server-side session management using connect-pg-simple.
- **User Roles**: Role-based access control for Developer and Regular User types, each with distinct permissions and UI themes.
- **Password Security**: bcrypt hashing (12 salt rounds).
- **Flexible Login**: Users can authenticate with either username or email.
- **Input Validation**: Zod schemas validate all authentication requests.
- **Protected Routes**: Middleware redirects unauthenticated users.
- **Theme-Based UX**: Dynamic visual themes applied based on user role.

### Component Architecture
- **Modular Design**: Reusable UI components.
- **Modal System**: Dialog-based workflows for project management.
- **Responsive Design**: Mobile-first approach with responsive navigation.
- **Theming**: Dark mode design system with CSS custom properties; dynamic theme application based on user roles.
- **Cross-Component Integration**: Global state management for features like Community-Calendar event sharing.
- **Form Validation**: Dynamic validation logic.

### UI/UX Decisions
- **Discord-like Settings Interface**: Implemented with sidebar navigation and tab-based preferences.
- **Profile Management**: Comprehensive profile pages with banner overlap design, synchronized loading of user images via useEffect.
- **Game Store Redesign**: (Debug r.7.6) Cards show prices but no direct purchase buttons; clickable cards link to /game/:gameId detail pages with "Buy Now" and "Add to Cart" options.
- **Buttonz Chat System**: Redesigned with GameForge branding, entrance animations, bubbly design, and social features.
- **Sidebar Enhancements**: Universal tooltips for navigation items, support for collapsed and expanded states.
- **Regular User Experience**: (Debug r.7.6) No Dashboard access; Store is first visible tab and highlighted via /store route check; Login redirects to /store (vs /dashboard for developers).
- **Community Assets**: (Debug r.7.6) Clean display using Avatar components with fallbacks, no long file paths shown.
- **Visuals**: Primary purple theme (hsl(262, 80%, 65%)) for developers; Regular users use darker grays (8%, 10%, 12%) with diagonal gradient overlay (purple → light blue → cyan, z-index: -1).

## External Dependencies

### Database Services
- **Neon Database**: Serverless PostgreSQL.
- **Drizzle ORM**: Type-safe database toolkit.

### UI and Styling
- **Radix UI**: Headless UI primitives.
- **Tailwind CSS**: Utility-first CSS framework.
- **Lucide React**: Icon library.
- **Font Awesome**: Additional icon support.

### Development Tools
- **Vite**: Build tool.
- **TypeScript**: Static type checking.
- **React Query**: Server state management.
- **React Hook Form**: Form library.

### Runtime and Deployment
- **Express.js**: Web application framework.
- **Node.js**: JavaScript runtime.

### Form and Data Validation
- **Zod**: Schema validation.
- **Drizzle-Zod**: Drizzle ORM and Zod integration.

### Utilities and Enhancements
- **Class Variance Authority**: Component variant styling.
- **CLSX/TailwindMerge**: Conditional class name management.
- **Date-fns**: Date manipulation.
- **Nanoid**: Unique identifier generation.