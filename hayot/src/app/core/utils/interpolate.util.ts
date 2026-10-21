import { PLACEHOLDER } from './regex.util';

export type InterpolationParams = Record<string, string | number>;

export function interpolate(template: string, params: InterpolationParams = {}): string {
  return template.replace(PLACEHOLDER, (placeholder, name: string) =>
    name in params ? String(params[name]) : placeholder,
  );
}
