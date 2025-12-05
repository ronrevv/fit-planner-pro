# FitPro Trainer Platform

## Overview

FitPro Trainer is a professional gym trainer platform designed for creating, managing, and sharing personalized workout and diet plans. The application enables trainers to manage client profiles, build monthly workout schedules, create detailed diet plans, and export them as PDF documents for sharing via WhatsApp or download.

The platform emphasizes a bold, energetic aesthetic inspired by premium fitness platforms like Nike Training Club and Peloton, combined with the clean productivity of tools like Notion and Linear. It follows a mobile-first approach, ensuring trainers can work effectively on-the-go.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Technology Stack

**Frontend Framework**: React 18 with TypeScript, using Vite as the build tool and development server. The application uses `wouter` for client-side routing instead of React Router.

**UI Component Library**: Shadcn/ui components built on Radix UI primitives, providing accessible, customizable components with Tailwind CSS styling. The design system follows the "new-york" style variant with custom theming.

**Backend Framework**: Express.js server running on Node.js, configured to serve both API endpoints and static frontend assets in production.

**State Management**: TanStack Query (React Query) for server state management, data fetching, caching, and synchronization. No global client state management library is used.

**Form Handling**: React Hook Form with Zod schema validation using `@hookform/resolvers` for type-safe form validation.

**Styling**: Tailwind CSS with custom design tokens and CSS variables for theming. Supports light/dark mode theming with systematic color scales.

### Data Layer

**ORM**: Drizzle ORM configured for PostgreSQL with schema definitions in TypeScript. The schema includes Zod validation integration via `drizzle-zod`.

**Database**: PostgreSQL (configured but may not be actively used - the application includes an in-memory storage fallback implementation).

**Schema Design**:
- **Users**: Basic user authentication schema
- **Clients**: Client profiles with personal information (name, email, phone, age, weight, height, fitness goals, fitness level)
- **Workout Plans**: Monthly workout plans containing daily workout schedules with exercises (sets, reps, rest periods)
- **Diet Plans**: Monthly diet plans containing daily meal schedules with detailed nutrition information

**Storage Pattern**: The application implements an `IStorage` interface with both in-memory (`MemStorage`) and database implementations, allowing flexible data persistence strategies.

### Application Architecture

**Monorepo Structure**: The codebase is organized as a monorepo with three main directories:
- `client/`: Frontend React application
- `server/`: Express backend server
- `shared/`: Shared TypeScript types and Zod schemas used by both client and server

**API Design**: RESTful API endpoints following resource-based routing:
- `/api/clients` - Client CRUD operations
- `/api/workout-plans` - Workout plan management
- `/api/diet-plans` - Diet plan management

**Build Strategy**: 
- Client builds to `dist/public` using Vite
- Server builds to `dist/index.cjs` using esbuild with selective bundling of dependencies
- Production server serves pre-built static assets

**Development Environment**: Hot Module Replacement (HMR) via Vite dev server in development mode, with Express middleware integration.

### Key Features & Design Patterns

**PDF Generation**: Client-side PDF generation using `jspdf` and `jspdf-autotable` for creating professional workout and diet plan documents with branded styling.

**Calendar-Based Planning**: Custom calendar UI for month-based workout and diet scheduling, with day-by-day exercise and meal planning capabilities.

**Responsive Design**: Mobile-first design using Tailwind's responsive utilities with custom breakpoints. Sidebar navigation adapts between mobile drawer and desktop sidebar.

**Theme System**: 
- Custom CSS variable-based theming supporting light/dark modes
- Orange/coral primary accent color (hsl(24 95% 53%))
- Systematic color scales for UI states
- Custom shadow and elevation utilities

**Component Patterns**:
- Compound components for complex UI (Sidebar, Dialog, Dropdown)
- Controlled form components with React Hook Form
- Loading states with skeleton screens
- Toast notifications for user feedback

**Typography**: Inter as primary font, JetBrains Mono for monospaced/numeric data, with systematic font weight and size scales.

## External Dependencies

**UI Framework**: Radix UI primitives (@radix-ui/*) for accessible, unstyled component foundations including dialogs, dropdowns, menus, popovers, and form controls.

**Database**: PostgreSQL with connection pooling via `pg` driver, managed through Drizzle ORM.

**Session Management**: Express sessions using `express-session` with `connect-pg-simple` for PostgreSQL-backed session storage (though in-memory `memorystore` may be used as fallback).

**PDF Export**: jsPDF library for client-side PDF document generation.

**Date Utilities**: date-fns for date manipulation and formatting.

**Validation**: Zod for runtime type validation and schema definition, integrated with React Hook Form and Drizzle.

**Development Tools**:
- Replit-specific plugins for development banner, error overlay, and cartographer
- TypeScript for type safety across the stack
- ESBuild for production server bundling

**Build & Deployment**: The application is configured for deployment on Replit with environment variable configuration for database connections and session secrets.