---
name: clean-tests
description: How to write or edit unit tests in this project (vitest + TestBed). No magic numbers or ids, a named `expected` object instead of inline `toEqual({...})` literals, shared catalog fixtures, descriptive variable names. Use whenever adding or changing a `*.spec.ts`.
---

# Clean tests

Tests follow the same rules as the app code (see `no-magic-numbers` and `create-component`), plus the points below.

## 1. No magic numbers or ids

- Never write recipient/category ids, amounts or counts as bare literals in a test. Use the shared fixture in `src/app/testing/catalog.fixture.ts`:
  - enums: `RecipientId.Beeline`, `CategoryId.Mobile`, `Region.TashkentCity`
  - data: `catalog`, `RAW_CATALOG` (what the HTTP layer returns), `recipientOf(id)`, `fieldsOf(id)`, `fieldOf(id, key)`
- Add new ids to the fixture enums instead of repeating the number in a spec.
- Amounts are named constants at the top of the `describe`: `const AMOUNT_SUM = 150_000;`. Derive related values from the app constants and from the fixture, not from retyped numbers:
  `const AMOUNT_TIYIN = AMOUNT_SUM * AMOUNT_DIVISOR;`, `const minSum = recipient.minAmount / AMOUNT_DIVISOR;`, then test `minSum - 1` and `minSum`.
- Expected counts or ords that only the data knows (`22` options in a region) are named constants with a clear name (`SOATO_OPTIONS_COUNT`), never inline.
- `0`, `1` and `-1` are fine. Digit strings that are test data (phone numbers) are fine, but name them when they are repeated (`PHONE_DIGITS`).
- Write the expected number with the arithmetic that explains it, using plain operations (`amount * percent / PERCENT_BASE`), not by calling the function under test.

## 2. Build the expected value, then compare

Do not inline a big literal inside `toEqual`. Create an `expected` object (typed with the real model when possible) from the fixture values, then assert:

```ts
const expected: TransactionPayload = {
  recipientId: electricity.id,
  categoryId: electricity.categoryId,
  amount: AMOUNT_TIYIN,
  ...
};

expect(buildPayload(electricity, fields, formValue, 'ru')).toEqual(expected);
```

Take ids and values from the fixture objects (`electricity.id`, `formValue.REGION`), so the expected object and the input cannot drift apart.

## 3. Structure and names

- Arrange / act / assert: build inputs and `expected` first, call the code under test, then `expect`. Separate the blocks with a blank line.
- Descriptive names, never single letters: `loading` (not `p`), `payButton`, `phoneInput`, `element`, `(field) => field.key`.
- Use enums for statuses and field types (`PaymentStatus.Success`, `FieldType.Amount`), not string literals.
- Non-breaking spaces from `formatSum`: build the expected text with `['1', '500', '000'].join(' ')` or call `formatSum`, never paste a regular space.
- A file that is not a test (fixtures, helpers) must not be named `*.spec.ts`; keep them in `src/app/testing/`.

## After editing

Run `npx ng test --watch=false` and `npx ng build`. Do **not** commit; ask the user first (see `CLAUDE.md`).
