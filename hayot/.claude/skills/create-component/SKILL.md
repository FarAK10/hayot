---
name: create-component
description: Create or move an Angular component in this project. Each component gets its own folder containing separate .ts, .html and .scss files (templateUrl + styleUrl, never inline) and, when it has behavior, a .spec.ts. Use whenever a new component is needed or an existing one is added, split or relocated.
---

# Create a component

Arguments: the component name (kebab-case, e.g. `recipient-list`) and which parent folder it belongs in (`shared/components`, `features/<feature>`, or an existing feature subfolder). If the location is unclear, pick the feature folder that owns it.

## Folder layout

**One folder per component**, named after the component, so siblings never share a folder:

```
features/transaction/fields/
├── base-field.ts              (shared non-component code stays in the parent)
├── text-field/
│   ├── text-field.component.ts
│   ├── text-field.component.html
│   ├── text-field.component.scss
│   └── text-field.component.spec.ts   (when it has behavior worth testing)
└── amount-field/
    └── amount-field.component.{ts,html,scss}
```

- **Nest child components inside their parent's folder.** A component used in the template of exactly one other component lives in a subfolder of that parent (`payment-modal/payment-form/commission-summary/`), so a component's dependencies are visible in the tree. A component used by two or more parents stays one level up, at the feature level (`payment/category-section/`) or in `shared/components/` when features share it (`logo`, `header`). When a second parent starts using a nested component, move it up. Components that are only created dynamically (the `fields/` registry) are not nested.
- Components only share a folder with their own files. Services, builders, factories, models and utils live outside component folders (e.g. `core/form-engine/`, `core/utils/`, `core/stores/`, `features/<feature>/services/`). Logic that imports no component belongs in `core/`; a feature-level service goes in that feature's `services/` folder.
- Imports to the component use the full path: `.../text-field/text-field.component`.
- The root `App` component is the only exception and stays in `src/app/`.
- When moving an existing component, move all of its files together and fix every import, including `import('...')` in routes (`npx ng build` and `npx ng test` will catch misses).

## Rules

1. **Always separate files**:
   - `<name>.component.ts`: class only, with `templateUrl: './<name>.component.html'` and `styleUrl: './<name>.component.scss'`. **Never** inline `template` or `styles`.
   - `<name>.component.html`: all markup, using `@if` / `@for` (with `track`) / `@let`; no logic beyond simple expressions.
   - `<name>.component.scss`: component styles. Use the CSS tokens from `src/styles.scss` (`--surface`, `--muted`, `--accent-text`, `--radius-card`, …) instead of hard-coded colors.
2. The `.ts` file holds the logic: `input()` / `output()` signals, `computed()`, `inject()` for stores and services, small handler methods. Pure logic that can be tested without the DOM goes to `core/utils` or a `*.builder.ts` / `*.factory.ts` file.
3. Component conventions:
   - Standalone (no `standalone: true` needed in this Angular version), selector `app-<name>`.
   - `changeDetection: ChangeDetectionStrategy.OnPush`, except dynamic field components that extend `BaseField` and read form-control errors in the template.
   - Template members used only in the template are `protected`; inputs/outputs are public `readonly`.
   - Texts never hard-coded: in templates use the translate pipe (`{{ 'key' | translate }}`, `{{ 'min' | translate: { min: 5 } }}`; import `TranslatePipe` from `shared/pipes/translate.pipe`); in `.ts` use `lang.t('key')`; API texts via the `localize` pipe in templates (`{{ category.name | localize }}`, `LocalizePipe` from `shared/pipes/localize.pipe`) or `lang.localize(...)` in `.ts`. Add new keys to all three languages in `shared/i18n/ui-strings.ts`.
   - Templates never reference an injected store or service. Inject it as `private readonly`, expose what the template needs as `protected readonly` properties (`protected readonly loading = this.catalogStore.loading;`) and call it through a small handler method (`protected reload(): void { this.catalogStore.load(); }`).
   - Name an injected store after its type with a `Store` suffix: `catalogStore = inject(CatalogStore)`, `languageStore`, `paymentStore`, `historyStore`, never `catalog`, `lang`, `store` or `history`.
   - Shared state comes from the SignalStores in `core/stores/<name>/<name>.store.ts` (one folder per store); do not add new services for state. Store files hold no helper functions or constants: put them in `core/utils/<name>.util.ts` (with a spec) or `core/config/app.config.constants.ts` and import them.
   - Loop and iteration variables are descriptive nouns, never single letters: `@for (group of groups(); ...)`, `@for (recipient of recipients(); ...)`, `for (const token of tokens)`, `.map((category) => ...)`. This applies to templates, `.ts` helpers and stores. Avoid names that shadow injected members (use `language`, not `lang`).
   - In templates, read a signal once with `@let` when it is used more than once, and use the plain name afterwards: `@let category = this.category();` then `{{ category.name }}`. The `this.` is required, because `@let category = category();` fails with NG8016 (a `@let` cannot read itself). Prefer `@let` over `@if (x(); as y)` aliases, and never use one-letter aliases. The same applies to store signals read more than once (`@let items = history.items();` then `items.length` and `@for (... of items; ...)`; `@let query = catalog.query();`). Declare the `@let`s at the top of the template, before the markup that uses them.
   - Use string `enum`s (e.g. `FieldType`, `LoadStatus`, `PaymentStatus`) instead of string-literal unions or bare literals like `'AMOUNT'`. To use one in a template, expose it as `protected readonly PaymentStatus = PaymentStatus;`.
   - Load images lazily with a deferrable view: `@defer (on viewport) { <img ...> } @placeholder { ... }`, with a same-sized placeholder (e.g. the initials tile) so the layout does not jump. Never render a list of images eagerly. Reuse `app-logo` for logos instead of adding raw `<img>` tags; it already defers.
   - Do not call methods from templates (they run on every change-detection pass). Use a `computed()`, or the pure `sync` pipe with a stable function reference, function first and its arguments after: `{{ formatTiyin | sync: transaction.total }}` (`SyncPipe` from `shared/pipes/sync.pipe`; expose the function as `protected readonly formatTiyin = formatTiyin;`). Keep the function free of language-dependent output, because a pure pipe will not re-run when the language changes; add the translated part in the template (`{{ 'sum' | translate }}`). Event handlers such as `(click)="close()"` are fine.
   - Inject `HttpClient` directly where a request is made (today only `CatalogStore`), as an `Observable` consumed with `rxMethod`. No `async`/`await`, `Promise` or `firstValueFrom` in app code: services return `Observable`s and stores consume them with `rxMethod` (`switchMap`/`exhaustMap` + `catchError`). Promises are allowed only at a third-party boundary (Firebase SDK, dynamic `import()`), wrapped immediately with `from(...)`/`defer(...)`.
   - Break chains into named steps. Never nest `inject(...)` inside another expression (`toSignal(inject(ActivatedRoute).paramMap.pipe(...))`): inject into a field first, then build the stream in its own field, then the signal (`route` → `categoryId$` → `id = toSignal(this.categoryId$, { initialValue })`). Route and query parameter names are constants in `app.config.constants.ts`.
   - Templates only call a handler method on events (`(click)="onRetry()"`); they never call `output.emit(...)` or `signal.set(...)` directly. Add a small `protected onRetry(): void { this.retry.emit(); }` in the class.
   - Start work (load data, reset a store) in `ngOnInit()` (`implements OnInit`), not in the constructor. Keep the constructor only for what needs an injection context, such as `effect()` and `takeUntilDestroyed()`.
   - Name methods that fetch or subscribe to data with `get`, never `watch`: `getTransactions()`, `getHistory()`.
   - Always use braces for control flow: `if (x) { return; }` and `else { ... }`, never a bare `if (x) return;` (ESLint `curly: all` enforces it). One statement per line.
   - Code must pass `npm run lint` (ESLint with angular-eslint and typescript-eslint) and `npm run format:check` (Prettier). Run `npm run lint:fix` and `npm run format` to fix what can be fixed automatically; use `noop` from `core/utils/noop.util` instead of an empty function.
   - Prefer Angular Material components (`@angular/material/*`) over hand-built controls; import each one explicitly.
4. Add a `*.component.spec.ts` in the component's folder when it has behavior worth testing (vitest + TestBed, see `payment-modal/payment-modal.component.spec.ts` for a pattern).
5. If it is a routed page, register it lazily in `src/app/app.routes.ts` with `loadComponent`.

## Template for the `.ts` file

```ts
import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { LanguageStore } from '../../../core/stores/language.store'; // adjust depth: the component is one folder deeper than its parent

@Component({
  selector: 'app-example',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [],
  templateUrl: './example.component.html',
  styleUrl: './example.component.scss',
})
export class ExampleComponent {
  readonly value = input.required<string>();

  protected readonly lang = inject(LanguageStore);
  protected readonly label = computed(() => this.value().trim());
}
```

## After creating

Run `npx ng build` and `npx ng test --watch=false`, fix what you introduced, and do **not** commit; ask the user first (see `CLAUDE.md`).
