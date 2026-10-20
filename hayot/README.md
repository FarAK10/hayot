# PayFlow

A Payme-style payment app built with Angular. It loads a provider catalog from `response.json`, renders categories, providers and form fields **dynamically**, and performs a payment in a modal. The request body is built dynamically and the form data is sent as `keyValue` pairs, saved in Firebase Firestore.

- **Live demo:** https://hayot-11a29.web.app
- Not affiliated with Payme: the layout resembles payme.uz, the branding does not.

## Features

- Dynamic catalog: categories → providers (first 5 with a "More" link) → form
- Dynamic form: input masks, regex validation, `required`, amount limits, dependent fields (`requireField`), filtered options (`filterBy`), single-option auto-select
- Commission calculation shown live (amount, commission, total)
- `keyValue` payload built from the visible fields only
- Firebase Firestore persistence (anonymous auth, per-user history)
- Search (debounced, across all three languages, kept in `?q=`)
- RU / UZ / EN
- Payment history
- Responsive and keyboard accessible; modal deep link via `?recipient=<id>`

## Tech stack

Angular 22 (standalone, signals, Reactive Forms, new control flow) · Angular Material · NgRx SignalStore (`@ngrx/signals`) · Firebase (Firestore, Auth, Hosting) · SCSS · Vitest.

## Getting started

Prerequisites: Node LTS; Java 11+ for the Firebase emulator.

```bash
npm i
npm run dev      # Firebase emulators (Firestore :8080, Auth :9099, UI :4000) + ng serve
npm test
npm run build
npm run start:live   # local dev server against the real Firebase project (no Java needed)
```

`npm run dev` works offline with the emulator (project id `demo-payme`), no Firebase account needed. Without Java, set `transactionBackend: 'local'` in `src/environments/environment.ts` to store transactions in `localStorage` and run `npm start`.

## Deploying your own

Stays on the free **Spark** plan: no Cloud Functions or Storage.

1. Create a Firebase project on Spark (do not link billing) and add a Web app.
2. Create Firestore in production mode and enable the **Anonymous** Auth provider.
3. Paste the web app config into `src/environments/environment.prod.ts`.
4. `npx firebase login` and `npx firebase use --add`.
5. `npm run deploy`.

## Architecture

```
src/app/
├── core/       models, stores (SignalStore), transaction API (Firebase / local), pure utils (mask, amount, search)
├── shared/     header, logo, input directives (mask, digits-only, amount), UI strings
└── features/
    ├── payment/      catalog pages, category sections, recipient cards, search results
    ├── transaction/  payment modal, dynamic form engine, field components, payload builder
    └── history/      past transactions
```

**Stores:** `CatalogStore` (sorted catalog + lookups), `LanguageStore` (language, `localize`, UI strings), `SearchStore`, `PaymentStore` (submit flow), `HistoryStore`.

**Form engine:** `FIELD_COMPONENTS` registry (type → component, unknown → TEXT) → `buildValidators` (field → validators) → `FormBuilderService` (FormGroup, visibility, resets, auto-select; hidden controls are disabled so `form.value` only contains visible fields) → `buildPayload` (pure, builds the payload).

## How the JSON is interpreted

- Everything is sorted by `ord` (categories, recipients, fields, option values). Relations: `recipient.categoryId`, `field.recipientId`.
- Names go through `localize()`: current language → ru → uz → en, trimmed (some names have trailing spaces).
- `minAmount` / `maxAmount` are **tiyin** (1 sum = 100 tiyin, Payme's convention), via `AMOUNT_DIVISOR` in `core/config/app.config.constants.ts`. Users type sums; the payload carries tiyin.
- `mask` is a regex-like string (`998\((\d{2})\)(\d{3})-(\d{2})-(\d{2})`). The leading literal is a fixed prefix; the control holds only the raw slot digits (`931234567`) and `validation` is tested against them. Unsupported masks fall back to plain text.
- `requireField` holds the `key` of another field: the field is visible once that field has a value, and is reset when it changes (recursively). Select options are filtered by the parent value through `filterBy`.
- Unknown field types render as TEXT.
- Logos (`logos/<file>`) are not provided; a coloured initials tile is shown when an image is missing. Drop real files into `public/logos/`.
- Field `placeholder` is Russian-only in the data, so it is shown only in RU.

## Data inconsistencies handled

- UCell `clientid` has `lengthMax: 7` while its `validation` requires 9 digits. Masked fields use the regex and mask, lengths are ignored.
- Electricity `summa` has `lengthMax: 7` while `maxAmount` is 500 000 000. For `AMOUNT` fields the amount limits win, lengths are ignored.
- Beeline's pattern `9[0|1]\d{7}` also accepts a literal `|`; harmless, kept as is.
- Some `en` / `uz` strings are Russian or Cyrillic; shown as given.
- Recipient 4449 ("Горячая вода и отопление") has no fields in the data, so its modal shows "payment unavailable".
- The unit assumption for amounts (tiyin) is described above.

## Payload example

```json
{
  "recipientId": 4012,
  "categoryId": 24202,
  "amount": 15000000,
  "commissionPercent": 1,
  "commissionAmount": 150000,
  "total": 15150000,
  "currency": "UZS",
  "lang": "ru",
  "keyValue": [
    { "key": "REGION", "value": "2159" },
    { "key": "soato", "value": "27419" },
    { "key": "SERVICE_ID", "value": "3042,3041" },
    { "key": "customer_code", "value": "1234567" },
    { "key": "summa", "value": "15000000" }
  ]
}
```

Money is in tiyin. Firestore additionally stores `uid`, `status` and `createdAt`; `firestore.rules` validates the shape and that `total = amount + commissionAmount`.

## Possible improvements

- Server-side validation (NestJS API or Cloud Functions) that re-checks `keyValue` against `response.json`
- Firebase App Check
- e2e tests and Firestore rules tests (`@firebase/rules-unit-testing`)
