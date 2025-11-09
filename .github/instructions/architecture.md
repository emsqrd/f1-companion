# Architecture & Design Patterns

## Overview

This is a React 19 + TypeScript Vite application for F1 fantasy sports with Supabase authentication. The app follows a component-driven architecture with clear separation between UI, business logic, and data services.

## Key Architectural Patterns

### Authentication Flow

- Uses Supabase auth with `AuthProvider` context wrapping the entire app in `main.tsx`
- Protected routes use `withProtection()` HOC wrapper from `routeHelpers.tsx`
- Registration includes automatic profile creation via `userProfileService`

### Routing Structure

- React Router v7 with `BrowserRouter` and nested routes in `main.tsx`
- Uses HOC wrappers (`withProtection()`) applied to components before route registration
- Layout component wraps all routes
- Landing page is public, dashboard/team pages require auth

### Service Layer

- API calls abstracted into service modules (`teamService.ts`, `driverService.ts`, etc.)
- Uses centralized `apiClient` utility from `@/lib/api` with consistent error handling
- API client handles base URL configuration from environment variables
- Consistent async/await pattern with typed return values
- Services return typed responses based on contracts in `src/contracts/`

### Component Composition

- Uses discriminated union props pattern (see `RoleCard.tsx`) for flexible component variants
- Separate content components for different states
- Custom hooks for business logic (e.g., `useSlots.ts` for slot management)

## Technology Stack

- **React 19** - Latest React features with TypeScript
- **React Router v7** - Modern routing with HOC patterns
- **Supabase** - Authentication and backend services
- **Tailwind CSS v4** - Styling with Vite plugin (not PostCSS-based)
- **Vitest** - Test runner with React Testing Library
- **Zod + React Hook Form** - Form validation and management

## Component Patterns

### UI Components (shadcn/ui)

- Located in `src/components/ui/` - **never modified directly**
- Use `class-variance-authority` for variant styling (see `button.tsx`)
- Import via `@/components/ui/[component]`

### Business Components

#### Discriminated Unions

- Use TypeScript discriminated unions for component variants (see `RoleCard`)
- Props pattern: `variant: 'empty' | 'filled'` with conditional props

#### Composition

- Separate content components (`AddRoleCardContent`, `InfoRoleCardContent`) for different states
- Use `renderCardContent()` helper functions for complex conditional component logic

#### Custom Hooks

- Business logic in hooks like `useSlots.ts` for slot management
- Generic type constraint: `<T extends { id: number }>`

### Higher-Order Components (HOCs)

#### Route Protection

Use `withProtection()` HOC from `@/utils/routeHelpers` to wrap components requiring authentication:

```typescript
import { withProtection } from '@/utils/routeHelpers';

const ProtectedLeagueList = withProtection(LeagueList);
<Route path="/leagues" element={<ProtectedLeagueList />} />
```

This wraps the component with `ProtectedRoute` logic while keeping route definitions clean.

## State Management Patterns

```typescript
// Preferred slot management pattern
const { slots, pool, add, remove } = useSlots(initialPool, initialSlots, 4);

// Auth state access
const { user, signIn, signOut, loading } = useAuth();
```

## Styling Guidelines

### Tailwind + shadcn/ui

- **Tailwind CSS v4** with `@tailwindcss/vite` plugin (not PostCSS-based)
- Use `cn()` utility from `@/lib/utils` for conditional classes
- Custom variants defined with `cva()` (class-variance-authority)
- Mobile-first responsive design with breakpoint utilities
- Dark mode support via `next-themes` package

### Component Styling Patterns

```typescript
// Preferred class composition
<Button className={cn("custom-styles", conditionalClass && "additional-styles")} />

// Size formatting utilities
formatMillions(value) // For currency display
```

### Path Aliases

- `@/` maps to `src/` directory
- Always use absolute imports: `import { Button } from '@/components/ui/button'`

## Data Flow & Services

### Service Architecture

- Services handle all external API calls with consistent error handling
- Services use centralized `apiClient` utility from `@/lib/api` for all HTTP requests
- API client handles base URL configuration from environment variables
- Consistent async/await pattern with typed return values
- Services return typed responses based on contracts in `src/contracts/`

### Common Data Patterns

- **Teams**: `{ id, name, ownerName, rank, totalPoints }`
- **Drivers/Constructors**: Extend `BaseRole` interface with `id`, `countryAbbreviation`, `price`, `points`
- **Slots**: Generic slot management with `useSlots<T extends { id: number }>` - rebuilds pool in original order when items removed
- **Auth**: Supabase user + custom profile creation flow via `userProfileService.registerUser()`

## Environment & Configuration

### Required Environment Variables

```bash
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key
VITE_F1_FANTASY_API=your_api_base_url
```

## Development Commands

```bash
npm run dev           # Start dev server with Vite on port 5173
npm test             # Run Vitest test suite (one-time)
npm run test:watch   # Run tests in watch mode
npm run test:coverage # Generate coverage reports
npm run lint         # ESLint with TypeScript rules
npm run build        # Type check + build for production
```

## Core Principles

When working on this codebase, prioritize:

- **Type safety** - Leverage TypeScript fully
- **Component composition** - Build reusable, composable components
- **Separation of concerns** - Keep UI, business logic, and data access separate
- **Modern React patterns** - Use hooks and context for state management
