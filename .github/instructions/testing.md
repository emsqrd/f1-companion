# Testing Guidelines

## Testing Philosophy

### What to Test (High Value)

- Business logic specific to your component/service
- User-facing behavior and workflows
- Integration of validation/form/submission pipeline (not individual rules)
- Error handling and retry logic
- User feedback (toasts, error messages)
- State cleanup and reset behavior
- Data transformations (e.g., whitespace trimming)
- Edge cases, boundary values, and error conditions
- Asynchronous behavior with proper async/await patterns

### What NOT to Test (Low Value)

- Third-party library behavior (React Hook Form state management, Radix UI dialog mechanics)
- Framework internals (React re-rendering, effect timing)
- Language features (optional chaining `?.`, TypeScript type safety)
- Styling concerns (CSS classes, Tailwind utilities, required field indicators)
- Static JSX rendering (headings, labels present)
- Validation schema rules (test those in schema unit tests if needed)
- Default values from config objects (unless computed/conditional)
- Presentation details that rarely break

**Exception:** Configuration validation that provides **developer feedback** is valuable. Test that critical environment variables throw clear, helpful error messages when missing. Focus on the **error message quality**, not the configuration mechanism itself.

Examples:

- ✅ **Test this:** "Does missing `VITE_API_URL` throw a clear error with actionable guidance?"
- ❌ **Don't test:** "Does Vite correctly read `import.meta.env` values?"
- ❌ **Don't test:** "Does the constructor successfully instantiate when config is valid?"

Keep **one focused test** per critical configuration point that validates the error message helps developers debug misconfigurations.

## Testing Standards

### Framework & Tools

- **Test Runner**: Vitest
- **Component Testing**: React Testing Library
- **User Interactions**: `@testing-library/user-event` (not `fireEvent`)
- **Patterns**: React 19 best practices

### Test Structure

- **Naming**: Use behavior-focused, imperative test names consistently. Avoid starting test names with 'should'. Prefer action-oriented phrasing such as 'renders...', 'displays...', 'returns...', 'submits...', 'shows an error when...', etc.
- **File Naming**: `ComponentName.test.tsx` (co-located with components)
- **Organization**: Use `describe` blocks for grouping related tests
- **Pattern**: Follow AAA (Arrange, Act, Assert)
- **Isolation**: Use `beforeEach`/`afterEach` for proper test isolation

### Query Strategy

1. **Prefer semantic queries**: `getByRole`, `getByLabelText`, `getByText`
2. **Fallback to**: `data-testid` attributes when semantic queries aren't practical
3. **Test from user's perspective**: How would a user interact with this?

### Mock Strategy

- Mock external dependencies (services, contexts, APIs)
- Mock child components to isolate behavior
- Use `vi.fn()` and `vi.mock()` for Vitest mocks
- Ensure mocks are deterministic and don't rely on external state
- Test both success and failure scenarios

### Coverage Configuration

- **Excludes**: `src/components/ui` (shadcn/ui), `src/contracts`, `src/demos`, config files
- **Setup**: Global test setup in `src/setupTests.ts` with `@testing-library/jest-dom`
- **Global Mocks**: `ResizeObserver` for Radix UI components

## Test Categories

### 1. User Interaction Tests

Test how users interact with your component:

```typescript
it('handles form submission when user clicks submit button', async () => {
  const user = userEvent.setup();
  render(<MyComponent />);

  await user.type(screen.getByLabelText(/name/i), 'John Doe');
  await user.click(screen.getByRole('button', { name: /submit/i }));

  expect(mockSubmitFn).toHaveBeenCalledWith({ name: 'John Doe' });
});
```

### 2. Error Handling Tests

Test error states and error boundaries:

```typescript
it('displays error message when API call fails', async () => {
  mockService.getData.mockRejectedValue(new Error('API Error'));

  render(<MyComponent />);

  expect(await screen.findByText(/error/i)).toBeInTheDocument();
});
```

### 3. Asynchronous Behavior Tests

Test loading states and async operations using `findBy` queries for elements that appear asynchronously:

```typescript
it('shows loading state then loaded data', async () => {
  render(<MyComponent />);

  expect(screen.getByText(/loading/i)).toBeInTheDocument();
  expect(await screen.findByText(/data loaded/i)).toBeInTheDocument();
});
```

**Note:** Use `findBy` queries (which have built-in waiting) instead of wrapping `getBy` queries in `waitFor()`. Reserve `waitFor()` for more complex assertions that can't be expressed with `findBy` queries.

### 4. Accessibility Tests

Test keyboard navigation and ARIA attributes:

```typescript
it('allows keyboard navigation', async () => {
  const user = userEvent.setup();
  render(<MyComponent />);

  await user.tab();
  expect(screen.getByRole('button')).toHaveFocus();
});
```

## Common Testing Patterns

### Testing Context Providers

```typescript
const wrapper = ({ children }) => (
  <AuthProvider>{children}</AuthProvider>
);

render(<MyComponent />, { wrapper });
```

### Testing Custom Hooks

```typescript
const { result } = renderHook(() => useMyHook(), { wrapper });
expect(result.current.value).toBe(expectedValue);
```

### Testing Navigation

```typescript
const mockNavigate = vi.fn();
vi.mock('react-router', () => ({
  useNavigate: () => mockNavigate,
}));
```

## Quick Test Generation Prompt

When asking Copilot to generate tests, you can use this prompt:

```
Generate high-value tests for this file following our testing guidelines.
- Keep it lean (~10-15 tests)
- After writing tests, review for duplicate assertions or test cases
- Run all tests to ensure they pass
- Run the linter to ensure there are no linting errors
- Run the build to ensure no type errors
- Run code coverage and ensure that coverage is at an excellent level
- Verify all tests provide high value per our testing philosophy
```

The testing instructions in this document will be automatically included in Copilot's context.

## Essential Commands

```bash
npm test              # Run tests once
npm run test:watch    # Run tests in watch mode
npm run test:coverage # Generate coverage reports
```

## Key Testing Principles

1. **Test behavior, not implementation** - Focus on what the user sees and does
2. **One integration path is enough** - Prove validation works; don't test every rule
3. **Meaningful coverage over 100%** - High-value tests matter more than coverage percentage
4. **Readable tests are maintainable** - Clear test names and assertions
5. **Isolation prevents flaky tests** - Each test should be independent
