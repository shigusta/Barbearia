# Elite Barber Shop - Sistema de Agendamento Online

## Overview

A modern, responsive template for barbershops featuring an automated online booking system. Built with React, Node.js, Express, and PostgreSQL, this application provides a complete solution for barbershop management with a focus on user experience and operational efficiency.

## System Architecture

### Frontend Architecture
- **React 18 with TypeScript**: Modern component-based architecture with type safety
- **Tailwind CSS**: Utility-first CSS framework for rapid UI development
- **Shadcn/ui Components**: Pre-built, customizable UI components following modern design patterns
- **Wouter**: Lightweight client-side routing solution
- **TanStack Query**: Server state management and caching
- **React Hook Form**: Performant form handling with validation
- **Date-fns**: Date manipulation and formatting utilities

### Backend Architecture
- **Node.js with Express.js**: RESTful API server with TypeScript support
- **Drizzle ORM**: Type-safe database operations with schema migrations
- **Zod**: Runtime type validation for API endpoints
- **CORS**: Cross-origin resource sharing configuration
- **Modular Route Structure**: Organized API endpoints with proper error handling

### Database Architecture
- **PostgreSQL**: Primary database using Neon serverless connection
- **Schema Design**: Normalized tables for users, barbeiros (barbers), servicos (services), and agendamentos (appointments)
- **Relationships**: Foreign key constraints maintaining data integrity
- **Migrations**: Version-controlled database schema changes via Drizzle Kit

## Key Components

### Booking System (Core Feature)
- **Multi-step Form**: 5-step appointment booking process
  1. Service Selection
  2. Barber Selection (optional)
  3. Date & Time Selection
  4. Customer Information
  5. Confirmation
- **Real-time Availability**: Dynamic time slot generation based on existing appointments
- **Conflict Prevention**: Backend validation ensures no double bookings
- **Data Validation**: Client and server-side validation using Zod schemas

### Service Management
- **Service Catalog**: Complete list of services with pricing, duration, and descriptions
- **Dynamic Pricing**: Flexible pricing structure with decimal precision
- **Service Status**: Active/inactive service management

### Admin Panel
- **Authentication**: Simple password-based access control
- **Appointment Management**: View, update, and manage booking statuses
- **Status Filtering**: Filter appointments by confirmation status
- **Real-time Updates**: Live data synchronization using TanStack Query

### User Interface
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Dark Theme**: Elegant black, gray, and gold color scheme
- **Smooth Animations**: CSS transitions and hover effects
- **Accessibility**: ARIA labels and keyboard navigation support

## Data Flow

### Appointment Booking Flow
1. Client selects service from catalog
2. Optional barber selection (defaults to first available)
3. System queries available time slots based on service duration and existing appointments
4. Client provides contact information with validation
5. Server creates appointment record with timestamp calculations
6. Real-time confirmation with toast notifications

### API Architecture
- **RESTful Endpoints**: Standard HTTP methods (GET, POST, PATCH, DELETE)
- **Error Handling**: Consistent error responses with appropriate HTTP status codes
- **Request Validation**: Zod schemas validate all incoming data
- **Response Formatting**: Structured JSON responses with proper status codes

## External Dependencies

### Core Libraries
- **@neondatabase/serverless**: PostgreSQL connection for Neon database
- **drizzle-orm**: Type-safe database ORM
- **@tanstack/react-query**: Server state management
- **@radix-ui/***: Accessible UI primitives
- **date-fns**: Date manipulation library
- **wouter**: Client-side routing

### Development Tools
- **Vite**: Build tool with fast development server
- **TypeScript**: Static type checking
- **ESLint**: Code linting and formatting
- **Tailwind CSS**: Utility-first styling

### UI Components
- **Shadcn/ui**: Complete component library including:
  - Form controls (Input, Select, Button)
  - Navigation (Header, Footer)
  - Feedback (Toast, Alert)
  - Layout (Card, Dialog, Accordion)

## Deployment Strategy

### Build Process
- **Frontend**: Vite builds React application to `dist/public`
- **Backend**: esbuild bundles Node.js server to `dist/index.js`
- **Type Checking**: TypeScript compilation validation
- **Database**: Drizzle Kit handles schema migrations

### Production Configuration
- **Environment Variables**: Database URL and other sensitive configuration
- **Static Assets**: Frontend served from Express server
- **Database Migrations**: Automated schema deployment via `db:push` script

### Development Workflow
- **Hot Reload**: Vite development server with fast refresh
- **Database Seeding**: Initial data population for development
- **Error Overlay**: Runtime error display in development mode

## Changelog

- June 30, 2025. Initial setup
- June 30, 2025. Project structure organized with dedicated folders for documentation, assets, and scripts

## User Preferences

Preferred communication style: Simple, everyday language.

## Commercialization Strategy

### Target Market
- Local barbershops without digital presence
- Barbers using paper schedules
- New barbershops needing complete solution
- Male beauty salons wanting to professionalize

### Pricing Strategy
- Basic Package: R$ 497 (solo barbers)
- Professional Package: R$ 897 (established barbershops)
- Premium Package: R$ 1,497 (barbershop chains)

### Sales Approach
- Direct sales (door-to-door)
- Local digital marketing
- Strategic partnerships with suppliers
- Proof of concept demonstrations

### Client Customization Process
1. Data collection via standardized form
2. Visual identity definition
3. Service and staff setup
4. 3-week delivery timeline
5. Training and post-delivery support

### Revenue Goals
- Month 1-6: 2-3 sites/month (R$ 1,500-2,700)
- Month 7-12: 5-8 sites/month (R$ 3,500-7,200)
- Year 2+: 10+ sites/month (R$ 8,000+)