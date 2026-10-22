---
name: no-magic-numbers
description: Never leave unexplained numeric literals (limits, sizes, ports, timings, divisors, colour math) in this project's code. Extract them into named constants. Use whenever writing or reviewing TypeScript where a bare number other than 0, 1 or -1 appears.
---

# No magic numbers

A bare number in logic hides its meaning. Give it a name that says what it is.

## Where constants live

- **Shared by more than one file, or an app-wide setting**: `src/app/core/config/app.config.constants.ts` (e.g. `PERCENT_BASE`, `HISTORY_LIMIT`, `SEARCH_DEBOUNCE`, `MAX_AMOUNT_DIGITS`, `LOGO_HUE_STEP`).
- **Used by one file only** (a port, a mask escape length): a `const` at the top of that file, below the imports (e.g. `ESCAPE_LENGTH` in `mask.util.ts`, emulator ports in `firebase-client.ts`).
- Group related constants under one doc comment (see the `LOGO_*` block).

## Rules

1. Name constants in `UPPER_SNAKE_CASE`; include the unit when it is not obvious (`LOGO_SATURATION_PERCENT`, `FULL_CIRCLE_DEGREES`, `SEARCH_DEBOUNCE` in ms is documented where defined).
2. Allowed bare numbers: `0`, `1`, `-1` for indexes, counters and empty checks. Anything else gets a constant, including `slice(0, 50)`, `% 360`, `/ 100`, `length: 10`, ports and timeouts.
3. When a number is built into a regex, build the regex from the constant (`new RegExp(String.raw\`...${DIGIT_GROUP_SIZE}...\`)`) instead of repeating `{3}` literally.
4. Computed values with several numbers (like an `hsl()` colour) go into a small `computed` or function with named constants and local variables (`const hue = ...`).
5. Tests may use literal numbers; fixtures and expected values are data, not logic.
6. SCSS is out of scope here: use the CSS tokens from `src/styles.scss`.

## Checklist before finishing

- Search the files you touched for digits: `grep -nE "[2-9]|[0-9]{2,}"` on the changed `.ts` files, then confirm each hit is a constant, a test value, or 0/1/-1.
- Run `npx ng build` and `npx ng test --watch=false`.
