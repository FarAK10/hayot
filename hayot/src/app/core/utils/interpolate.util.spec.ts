import { interpolate } from './interpolate.util';

describe('interpolate', () => {
  it('fills every placeholder, including numbers', () => {
    const params = { min: 500, max: '1 000' };

    expect(interpolate('from {min} to {max}', params)).toBe('from 500 to 1 000');
  });
  it('replaces a repeated placeholder everywhere', () => {
    expect(interpolate('{value} = {value}', { value: 'x' })).toBe('x = x');
  });
  it('leaves unknown placeholders and plain text untouched', () => {
    expect(interpolate('hello {name}')).toBe('hello {name}');
    expect(interpolate('no placeholders', { min: 1 })).toBe('no placeholders');
  });
});
