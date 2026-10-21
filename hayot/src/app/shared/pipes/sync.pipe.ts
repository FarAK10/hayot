import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'sync' })
export class SyncPipe implements PipeTransform {
  transform<Args extends unknown[], Result>(fn: (...args: Args) => Result, ...args: Args): Result {
    return fn(...args);
  }
}
