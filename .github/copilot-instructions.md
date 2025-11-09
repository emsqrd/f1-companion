# F1 Fantasy Sports - AI Coding Agent Instructions

## Architecture Overview

This is a React 19 + TypeScript Vite application for F1 fantasy sports with Supabase authentication. The app follows a component-driven architecture with clear separation between UI, business logic, and data services.

### Key Architectural Patterns

- **Authentication Flow**: Uses Supabase auth with `AuthProvider` context wrapping the entire app in `main.tsx`. Protected routes use `withProtection()` HOC wrapper from `routeHelpers.tsx`. Registration includes automatic profile creation via `userProfileService`
- **Routing Structure**: React Router v7 with `BrowserRouter` and nested routes in `main.tsx`. Uses HOC wrappers (`withProtection()`) applied to components before route registration. Layout component wraps all routes. Landing page is public, dashboard/team pages require auth
- **Service Layer**: API calls abstracted into service modules (`teamService.ts`, `driverService.ts`, etc.) using centralized `apiClient` utility from `@/lib/api` with consistent error handling
- **Component Composition**: Uses discriminated union props pattern (see `RoleCard.tsx`) for flexible component variants. Separate content components for different states

### Key Technologies

- **React 19** with TypeScript - latest React features
- **React Router v7** - modern routing with HOC patterns
- **Supabase** - authentication and backend services
- **Tailwind CSS v4** - styling with Vite plugin (not PostCSS)
- **Vitest** - test runner with React Testing Library
- **Zod + React Hook Form** - form validation and management

## Development Workflow

### Essential Commands

```bash
npm run dev           # Start dev server with Vite on port 5173
npm test             # Run Vitest test suite (one-time)
npm run test:watch   # Run tests in watch mode
npm run test:coverage # Generate coverage reports
npm run lint         # ESLint with TypeScript rules
npm run build        # Type check + build for production
```

### Testing Conventions

- **Vitest + React Testing Library**: All components have `.test.tsx` files co-located with components
- **Mock Strategy**: Uses `vi.fn()` and `vi.mock()` for external dependencies. Component tests mock child components to isolate behavior
- **Test Data**: Use `data-testid` attributes for reliable element selection. Prefer `screen.getByRole()` for semantic queries
- **Coverage**: Excludes `src/components/ui` (shadcn/ui), `src/contracts`, `src/demos`, and config files in `vite.config.ts`
- **Setup**: Global test setup in `src/setupTests.ts` includes `@testing-library/jest-dom` and automatic cleanup. Global mocks include `ResizeObserver` for Radix UI components
- **Convention**: Tests should consistently use `it('should...')` format

**Example Test Generation Prompt:**

```
Generate high-value tests for this component following our testing philosophy.
Focus on business logic only - do not test third-party library behavior,
framework internals, or language features. Keep it lean (~10-15 tests).
```

## Component Patterns

### UI Components (shadcn/ui)

- Located in `src/components/ui/` - these are **never modified directly**
- Use `class-variance-authority` for variant styling (see `button.tsx`)
- Import via `@/components/ui/[component]`
### Business Components

- **Discriminated Unions**: Use TypeScript discriminated unions for component variants (see `RoleCard`). Props pattern: `variant: 'empty' | 'filled'` with conditional props
- **Composition**: Separate content components (`AddRoleCardContent`, `InfoRoleCardContent`) for different states
- **Custom Hooks**: Business logic in hooks like `useSlots.ts` for slot management. Generic type constraint: `<T extends { id: number }>`
- **Conditional Rendering**: Use `renderCardContent()` helper functions for complex conditional component logic

### Higher-Order Components (HOCs)

- **Route Protection**: Use `withProtection()` HOC from `@/utils/routeHelpers` to wrap components requiring authentication
- Pattern: `const ProtectedComponent = withProtection(Component)` then use in route definitions
- This wraps the component with `ProtectedRoute` logic while keeping route definitions clean
- Example:
  ```typescript
  import { withProtection } from '@/utils/routeHelpers';
  
  const ProtectedLeagueList = withProtection(LeagueList);
  <Route path="/leagues" element={<ProtectedLeagueList />} />
  ```
- **Conditional Rendering**: Use `renderCardContent()` helper functions for complex conditional component logic

### State Management Patterns

```typescript
// Preferred slot management pattern
const { slots, pool, add, remove } = useSlots(initialPool, initialSlots, 4);

// Auth state access
const { user, signIn, signOut, loading } = useAuth();
```

## Environment & Configuration

### Required Environment Variables

```bash
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key
VITE_F1_FANTASY_API=your_api_base_url
## Styling Guidelines

### Tailwind + shadcn/ui

- **Tailwind CSS v4** with `@tailwindcss/vite` plugin (not PostCSS-based)
- Use `cn()` utility from `@/lib/utils` for conditional classes
- Custom variants defined with `cva()` (class-variance-authority)
- Mobile-first responsive design with breakpoint utilities
- Dark mode support via `next-themes` package
### Path Aliases

- `@/` maps to `src/` directory
- Always use absolute imports: `import { Button } from '@/components/ui/button'`

## Styling Guidelines

### Tailwind + shadcn/ui

- Use `cn()` utility from `@/lib/utils` for conditional classes
- Custom variants defined with `cva()` (class-variance-authority)
- Mobile-first responsive design philosophy
- Dark mode support built-in

### Component Styling Patterns

```typescript
// Preferred class composition
<Button className={cn("custom-styles", conditionalClass && "additional-styles")} />

// Size formatting utilities
formatMillions(value) // For currency display
```

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

## Testing Strategy

### Testing Philosophy

**What to Test (High Value):**

- Business logic specific to your component
- User-facing behavior and workflows
- Integration of validation/form/submission pipeline (not individual rules)
- Error handling and retry logic
- User feedback (toasts, error messages)
- State cleanup and reset behavior
- Data transformations (e.g., whitespace trimming)

**What NOT to Test (Low Value):**

- Third-party library behavior (React Hook Form state management, Radix UI dialog open/close, Switch toggle mechanics)
- Framework internals (React re-rendering, effect timing)
- Language features (optional chaining `?.`, TypeScript type safety)
- Styling concerns (CSS classes, Tailwind utilities, required field indicators)
- Static JSX rendering (headings, labels present)
- Validation schema rules (test those in schema unit tests if needed)
- Default values from config objects (unless computed/conditional)

**Testing Approach:**

- Use `@testing-library/user-event` for realistic user interactions
- Test one integration path through validation to prove it works, not every rule
### Component Testing

- Test user interactions, not implementation details
- Mock external dependencies (services, contexts)
- Use `screen.getByRole()` and `data-testid` for element queries
- Tests must use the `it('should...')` convention consistently
- Prefer `user.type()` from `@testing-library/user-event` over `fireEvent` for realistic user interactions

### File Naming

- `ComponentName.test.tsx` for component tests
- Co-locate tests with components
- Service tests: `serviceName.test.ts`

When working on this codebase, prioritize type safety, component composition patterns, and the established testing conventions. The app uses modern React patterns with hooks and context for state management rather than external state libraries.
