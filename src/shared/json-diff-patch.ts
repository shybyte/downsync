import {Delta, DiffPatcher} from 'jsondiffpatch';
import R = require("ramda");

const diffPatcher = new DiffPatcher({});

export function diff<T>(original: T, mofified: T): Delta {
  return diffPatcher.diff(original, mofified)!;
}

export function patch<T>(original: T, delta: Delta): T {
  return diffPatcher.patch(original, delta)!;
}

export function unpatch<T>(original: T, delta: Delta): T {
  return patch(original, diffPatcher.reverse(delta)!);
}

export function getStateOfRevision<T>(sourceState: T, deltas: Delta[], sourceRevision: number, targetRevision: number) {
  let currentState = R.clone(sourceState);
  if (sourceRevision < targetRevision) {
    console.log('patch it into the future');
    for (const delta of deltas.slice(sourceRevision + 1, targetRevision + 1)) {
      console.log('patch', delta);
      currentState = patch(currentState, delta);
    }
  }
  return currentState;
}