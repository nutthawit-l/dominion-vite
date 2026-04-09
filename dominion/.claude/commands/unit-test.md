# Generate Unit Tests for a React Component

Generate comprehensive unit tests for the React component at: **$ARGUMENTS**

## Your process

1. **Read the target component** at the path given above.
2. **Identify all imports** — read each local dependency (contexts, other components, lib files) to understand the full contract.
3. **Determine the test file path** — place it alongside the component, e.g. `src/components/Foo.tsx` → `src/components/Foo.test.tsx`.
4. **Check if Vitest + React Testing Library are installed** by reading `dominion/package.json`. If they are missing, output the install command at the top of your response before the test file:
   ```
   cd dominion && pnpm add -D vitest @vitest/coverage-v8 jsdom @testing-library/react @testing-library/user-event @testing-library/jest-dom
   ```
   Also note that `vite.config.ts` needs a `test` block:
   ```ts
   test: { environment: 'jsdom', globals: true, setupFiles: './src/test-setup.ts' }
   ```
   And `src/test-setup.ts` needs:
   ```ts
   import '@testing-library/jest-dom'
   ```

## Test coverage requirements

Write tests that cover **all** of the following categories — skip a category only if it genuinely does not apply to the component:

### 1. Happy path
- Default render with all required props / context values populated.
- Verify the key UI elements are present (headings, buttons, inputs, labels).
- Verify normal user flows complete successfully (button clicks, form submissions, navigation callbacks).

### 2. Props & conditional rendering
- Render with each meaningful combination of props (e.g. `loading={true}` vs `loading={false}`).
- Verify elements appear, disappear, or change based on props/state.

### 3. User interactions
- Use `userEvent` (not `fireEvent`) for realistic interaction simulation.
- Cover clicks, keyboard input (`type`, `keyboard`), form submission, hover states where they affect logic.
- Verify callbacks are called with the correct arguments.

### 4. Edge cases
- Empty strings, null/undefined optional values, zero counts, very long strings.
- Boundary values (e.g. input `maxLength`, code that's exactly 4 chars vs 3 or 5).
- Rapid repeated interactions.

### 5. Error handling
- API calls that reject or return error payloads — verify the error message is displayed.
- Context methods that throw — verify the component surfaces the error gracefully.
- Missing/invalid data that could crash — verify it renders safely.

### 6. Async behaviour
- Loading states shown while promises are pending.
- Correct UI after promises resolve or reject.
- Use `waitFor` / `findBy*` queries instead of `act` hacks.

### 7. Accessibility
- Interactive elements have accessible names (via label, aria-label, or visible text).
- Disabled states are correctly set on buttons.
- Key navigable flows work via keyboard (Enter to submit, etc.).

## Mocking rules

- **Mock `useAuth`** (and any other context hooks) at the module level using `vi.mock('../contexts/AuthContext')`. Provide a `mockAuth` helper that returns sensible defaults and can be overridden per test.
- **Mock external packages** (`@react-oauth/google`, etc.) as needed — keep mocks minimal and readable.
- **Mock `fetch`** with `vi.fn()` at the top of each relevant `describe` block — reset in `beforeEach`.
- **Never mock child components** unless they make testing impossible (e.g., they open a real OAuth popup).
- **Never mock `localStorage`** — use the real jsdom implementation; clear it in `beforeEach`.

## Code style

- Use `describe` blocks to group by category (matching the sections above).
- Use `it('should ...')` naming, describing behaviour not implementation.
- Prefer `*ByRole` queries (most accessible); fall back to `*ByText`, `*ByLabelText`, `*ByTestId` in that order.
- Import from `@testing-library/react` and `@testing-library/user-event`.
- Keep each test focused and independent — no shared mutable state between tests.
- Use TypeScript throughout.

## Output

Write the complete test file content. Do not truncate. After writing the file, show the command to run just those tests:
```
cd dominion && npx vitest run src/components/<ComponentName>.test.tsx
```
