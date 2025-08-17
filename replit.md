# Zoo - Student Assignment Management System

## Overview

Zoo is a full-stack web application designed to help students manage their academic assignments and tasks. The application supports multiple students (Zoo and Nish) and provides features for creating, tracking, and organizing assignments with calendar integration and progress monitoring. Built with a modern React frontend and Express.js backend, it offers both desktop and mobile-responsive interfaces with a Material Design-inspired UI.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript for type safety
- **Build Tool**: Vite for fast development and optimized production builds
- **UI Components**: Radix UI primitives with shadcn/ui components for consistent design
- **Styling**: Tailwind CSS with Material Design color scheme and custom CSS variables
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack Query (React Query) for server state management
- **Form Handling**: React Hook Form with Zod validation for type-safe forms

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **API Design**: RESTful API endpoints following standard HTTP conventions
- **Database**: PostgreSQL with Drizzle ORM for type-safe database operations
- **Schema Validation**: Zod schemas shared between frontend and backend
- **Development**: Hot reloading with Vite middleware integration

### Data Storage Solutions
- **Primary Database**: PostgreSQL hosted on Neon Database (@neondatabase/serverless)
- **ORM**: Drizzle ORM with schema-first approach for type safety
- **Migrations**: Drizzle Kit for database schema management
- **In-Memory Fallback**: MemStorage class for development/testing without database connection

### Database Schema Design
- **Users Table**: Multi-user support with Zoo and Nish as default students, including name, email, and avatar fields
- **Assignments Table**: Core entity with user association, fields for title, description, subject, due date, priority, status, progress, and timestamps
- **Subjects Table**: Reference data for assignment categorization with color coding and teacher information
- **Shared Types**: TypeScript interfaces generated from Drizzle schemas ensuring type consistency

### UI/UX Design Patterns
- **Material Design**: Google Material Design principles with custom color palette
- **Responsive Design**: Mobile-first approach with dedicated mobile navigation
- **Component Architecture**: Reusable UI components with consistent styling
- **Progressive Enhancement**: Core functionality works without JavaScript
- **Accessibility**: ARIA labels and semantic HTML structure

### Authentication and Authorization
- **Session Management**: Express sessions with PostgreSQL session store (connect-pg-simple)
- **Security**: CORS configuration and secure session handling
- **User Context**: Prepared for multi-user scenarios with session-based authentication

## External Dependencies

### Core Framework Dependencies
- **React Ecosystem**: React 18, React DOM, React Router (Wouter)
- **TypeScript**: Full TypeScript support across frontend and backend
- **Build Tools**: Vite, esbuild for production builds
- **Node.js**: Express.js server with TypeScript support

### Database and ORM
- **Neon Database**: Serverless PostgreSQL hosting (@neondatabase/serverless)
- **Drizzle ORM**: Type-safe database operations with schema generation
- **Database Tools**: Drizzle Kit for migrations and schema management

### UI and Styling
- **Radix UI**: Comprehensive set of accessible UI primitives
- **Tailwind CSS**: Utility-first CSS framework with custom configuration
- **Material Icons**: Google Material Icons font for consistent iconography
- **Class Variance Authority**: Type-safe CSS class variants

### Form and Validation
- **React Hook Form**: Performant form library with minimal re-renders
- **Zod**: Runtime type validation with TypeScript integration
- **Hookform Resolvers**: Zod integration for React Hook Form

### State Management and API
- **TanStack Query**: Server state management with caching and synchronization
- **Date-fns**: Date manipulation and formatting utilities

### Development and Testing
- **Replit Integration**: Replit-specific plugins for development environment
- **PostCSS**: CSS processing with Tailwind CSS integration
- **ESLint/Prettier**: Code formatting and linting (configured in components.json)

### Planned Integrations
- **Google Calendar API**: For assignment due date synchronization
- **Google Sheets API**: For data export functionality
- **Notification System**: Browser notifications for assignment reminders