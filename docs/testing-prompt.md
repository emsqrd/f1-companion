# Testing Prompt Template

Use this prompt to instruct GitHub Copilot to create high-quality tests for any given file:

---

**Prompt for Creating High-Quality Tests:**

"Please create comprehensive, meaningful tests for the file `[FILE_PATH]`. The tests should follow these requirements and best practices:

**Testing Framework Requirements:**

- Use Vitest as the test runner
- Use React Testing Library for React components
- Follow React 19 best practices and patterns

**Test Quality Standards:**

- Write tests that provide high value and meaningful coverage
- Focus on testing behavior and user interactions, not implementation details
- Test edge cases, error conditions, and boundary values
- Ensure tests are maintainable and readable

**Specific Test Categories to Include:**

1. **Unit Tests**: Test individual functions, methods, and logic
2. **Integration Tests**: Test component interactions and data flow
3. **User Interaction Tests**: Test user events, form submissions, clicks, etc.
4. **Error Handling**: Test error states and error boundaries
5. **Accessibility**: Test ARIA attributes, keyboard navigation, and screen reader compatibility
6. **Performance**: Test for unnecessary re-renders or performance issues where applicable

**React Testing Library Best Practices:**

- Use semantic queries (getByRole, getByLabelText, getByText) over data-testid when possible
- Test from the user's perspective
- Use userEvent for simulating user interactions
- Test asynchronous behavior with proper async/await patterns
- Mock external dependencies appropriately

**Code Structure:**

- Use descriptive test names that explain the expected behavior
- Group related tests using describe blocks
- Set up proper test isolation with beforeEach/afterEach when needed
- Use meaningful assertions with clear error messages

**Additional Considerations:**

- Mock API calls and external services
- Test both success and failure scenarios
- Ensure tests are deterministic and don't rely on external state
- Follow the AAA pattern (Arrange, Act, Assert)
- Add comments for complex test scenarios

Please analyze the file structure, dependencies, and functionality to determine the most appropriate test strategies and create a comprehensive test suite."

---

## Usage Instructions

1. Copy the prompt above
2. Replace `[FILE_PATH]` with the actual file path you want to test
3. Paste it into your conversation with GitHub Copilot
4. Copilot will analyze the file and create comprehensive tests following these guidelines

## Example Usage

```
Please create comprehensive, meaningful tests for the file `src/services/teamService.ts`. The tests should follow these requirements and best practices:
[rest of prompt...]
```
