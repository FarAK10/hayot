import { readStorage, writeStorage } from './storage.util';

const KEY = 'payflow.test';
const VALUE = 'saved';

describe('storage.util', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.spyOn(console, 'warn').mockImplementation(() => undefined);
  });
  afterEach(() => vi.restoreAllMocks());

  it('round-trips a value', () => {
    writeStorage(KEY, VALUE);

    expect(readStorage(KEY)).toBe(VALUE);
  });

  it('returns null for a missing key', () => {
    expect(readStorage(KEY)).toBeNull();
  });

  it('does not throw when storage is unavailable', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('denied');
    });
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('quota');
    });

    expect(() => writeStorage(KEY, VALUE)).not.toThrow();
    expect(readStorage(KEY)).toBeNull();
  });
});
