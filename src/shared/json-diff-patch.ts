import {Delta, DiffPatcher} from 'jsondiffpatch';

const diffPatcher = new DiffPatcher({});

export function diff<T>(original: T, mofified: T): Delta {
  return diffPatcher.diff(original, mofified)!;
}

export function patch<T>(original: T, delta: Delta): T {
  return diffPatcher.patch(original, delta)!;
}