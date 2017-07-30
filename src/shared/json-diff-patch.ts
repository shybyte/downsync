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
  if (sourceRevision < 0 || sourceRevision >= deltas.length) {
    throw new RangeError('sourceRevision out of range: ' + sourceRevision);
  }
  if (targetRevision < 0 || targetRevision >= deltas.length) {
    throw new RangeError('targetRevision out of range: ' + targetRevision);
  }

  let currentState = R.clone(sourceState);
  if (sourceRevision < targetRevision) {
    console.log('patch it into the future');
    for (const delta of deltas.slice(sourceRevision + 1, targetRevision + 1)) {
      console.log('patch', delta);
      currentState = patch(currentState, delta);
    }
  } else if (sourceRevision > targetRevision) {
    console.log('patch it into the past');
    const reversedDeltas = R.reverse(deltas.slice(targetRevision + 1, sourceRevision + 1));
    console.log('reversedDeltas', reversedDeltas);
    for (const delta of reversedDeltas) {
      console.log('patch', delta);
      currentState = unpatch(currentState, delta);
    }
  }
  return currentState;
}