# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

# PayFlow: project rules for Claude

Payme-style payment app (Angular 22, standalone + signals, Angular Material, NgRx SignalStore, Firebase, Vitest). It renders categories, providers and form fields dynamically from a catalog JSON. `PLAN_1.md` holds the original brief and phased plan. Never edit the catalog JSON (`backend-response.json`); treat it as an API response you don't control.

## Commands

- `npm start`: dev server. `npm run dev`: Firebase emulators (Firestore :8080, Auth :9099; needs Java) plus `ng serve`. `npm run start:live`: dev server against the real Firebase project.
- `npx ng build`, `npx ng test --watch=false` (Vitest via the Angular builder). One spec: `npx ng test --watch=false --include=src/app/core/utils/mask.util.spec.ts`.
- `npm run deploy`: build and deploy hosting plus Firestore rules/indexes. Don't run it unprompted.
- `npm run lint` / `npm run lint:fix` (ESLint flat config in `eslint.config.mjs`: typescript-eslint, angular-eslint for `.ts` and `.html`, `curly: all`), `npm run format` / `npm run format:check` (Prettier, `.prettierrc`). Husky runs `lint-staged` on commit (`.husky/pre-commit`; the git root is the parent folder, so `npm run prepare` points hooks at `hayot/.husky`). Fix lint and format errors you introduce.

## Architecture

- **Backend:** Firebase only. `FirebaseTransactionApi` (lazy-loads the SDK) is provided for the `TransactionApi` token in `app.config.ts`; specs swap in `testing/in-memory-transaction.api.ts`. `environment.useEmulators` points the dev build at the local emulators. Environment files live in `src/environments/` (`environment.example.ts` is the template). The Firebase web config is public by design (access is enforced by `firestore.rules`), so it stays committed in `environment.prod.ts`; do not move it to `.env`.
- **Layers:** `core/` (models, `stores/` SignalStores, `services/` API + Firebase client, `utils/` pure logic, `config/` constants) → `features/{payment,transaction,history}` → `shared/` (header, logo, directives, i18n strings). `testing/catalog.fixture.ts` holds shared spec fixtures. Routes are lazy `loadComponent` (`''`, `category/:id`, `history`).
- **Stores:** `CatalogStore` (sorted catalog and lookups), `LanguageStore` (RU/UZ/EN, `localize`, UI strings), `PaymentStore` (submit flow), `HistoryStore`. Search is the pure `core/utils/search.util.ts`; the old `SearchStore` is gone, so the README's mention of it is stale.
- **Form engine** (`core/form-engine/`, pure logic with no components): `validators.factory` → `PaymentFormService` (`features/transaction/payment-modal/`; builds the FormRecord, wires dependent resets and auto-select from `utils/`, exposes `rawValue`/`valid`/`amount` signals; hidden controls are disabled so `form.value` has visible fields only). `PaymentModalComponent` passes `rawValue` and `valid` down as plain inputs; `DynamicFormComponent` decides what is shown by computing `visibleFields` and the options per field from `rawValue` with `field-visibility.util` → `payload.builder.ts` (pure; builds the `keyValue` payload). `features/transaction/fields/field-registry.ts` maps a field type to its component (unknown to TEXT), which is why it lives next to the components, not in `core/`. `dynamic-form` renders fields; field components extend `fields/base-field.ts`. `features/transaction/services/modal-route-sync.service.ts` opens the payment modal from `?recipient=`.
- **Catalog data rules** (details in README): everything is sorted by `ord`; names go through `localize()` (current language → ru → uz → en, trimmed); `minAmount`/`maxAmount` are tiyin (`AMOUNT_DIVISOR`), users type sums and the payload carries tiyin; masked controls hold raw slot digits and `validation` runs on those; `requireField` makes a field visible once its parent key has a value; `AMOUNT` and `SELECT` fields ignore `lengthMin`/`lengthMax` (a select's value is an option id such as `3014,3013`, longer than the limit).
- Modal deep link: `?recipient=<id>`; search lives in `?q=`.

## Git

- **Never run `git commit`, `git push`, or amend/rebase without the user's explicit approval for that specific commit.** Finish the work, show what changed, and ask. An earlier approval does not carry over to later changes.
- Do not stage unrelated files (`image.png`, the brief PDF, `backend-response.json`).

## Angular components

- Every component uses **separate files**: `x.component.ts`, `x.component.html`, `x.component.scss`, wired with `templateUrl` and `styleUrl`. No inline `template:` or `styles:`.
- **One folder per component**: `features/transaction/fields/text-field/text-field.component.{ts,html,scss}`. A component used by only one parent is nested inside that parent's folder (e.g. `payment-modal/payment-form/`); components used by several parents stay at the feature level or in `shared/components`. Sibling components never share a folder; non-component code (services, builders, base classes) stays outside component folders. Only the root `App` lives directly in `src/app/`.
- Keep `.ts` for state and logic, `.html` for markup, `.scss` for styling. Use the `create-component` skill when adding a component.
- Standalone components, signals, `inject()`, `@if` / `@for` control flow, `ChangeDetectionStrategy.OnPush` where the component only depends on signals/inputs.
- State lives in NgRx SignalStores, one folder each (`core/stores/catalog/catalog.store.ts` and its spec). A store file contains only state, computed values and methods: helper functions, constants and storage access belong in `core/utils/*.util.ts` or `core/config/app.config.constants.ts` and are imported; pure logic lives in `core/utils` or `*.builder.ts` / `*.factory.ts` files with unit tests.

## Checks

- Run `npm run lint`, `npx ng build` and `npx ng test --watch=false` after changes and fix everything you introduced.
