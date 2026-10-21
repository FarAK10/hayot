import { LANG_STORAGE_KEY } from '../config/app.config.constants';
import { DEFAULT_LANG, persistLang, readStoredLang } from './language.util';

describe('language.util', () => {
  beforeEach(() => localStorage.clear());

  it('falls back to the default language when nothing is stored', () => {
    expect(readStoredLang()).toBe(DEFAULT_LANG);
  });
  it('ignores an invalid stored value', () => {
    localStorage.setItem(LANG_STORAGE_KEY, 'xx');

    expect(readStoredLang()).toBe(DEFAULT_LANG);
  });
  it('round-trips a persisted language and updates <html lang>', () => {
    persistLang('uz');

    expect(readStoredLang()).toBe('uz');
    expect(document.documentElement.lang).toBe('uz');
  });
});
