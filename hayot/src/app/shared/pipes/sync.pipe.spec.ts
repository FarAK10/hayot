import { SyncPipe } from './sync.pipe';

describe('SyncPipe', () => {
  const pipe = new SyncPipe();
  const FIRST = 2;
  const SECOND = 3;

  it('calls the function with the given arguments', () => {
    const add = (a: number, b: number) => a + b;

    expect(pipe.transform(add, FIRST, SECOND)).toBe(FIRST + SECOND);
  });
  it('works with no arguments', () => {
    expect(pipe.transform(() => 'ok')).toBe('ok');
  });
});
