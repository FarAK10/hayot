import { MAX_INITIALS } from '../config/app.config.constants';
import { splitWords } from './regex.util';

export function getInitials(name: string): string {
  return splitWords(name)
    .slice(0, MAX_INITIALS)
    .map((word) => word[0].toUpperCase())
    .join('');
}
