import {diff, getStateOfRevision} from "./json-diff-patch";
import * as assert from 'assert';
import R = require("ramda");
import deepFreezeStrict = require("deep-freeze-strict");

interface TestState {
  a: number;
  b: number;
}

function testState(a: number = 0, b: number = 0): TestState {
  return deepFreezeStrict({a, b});
}

function createDeltas(states: TestState[]) {
  return [{}].concat(R.aperture(2, states).map(([prev, current]) =>
    diff(prev, current)
  ));
}

it('original state', () => {
  const state = testState();
  const result = getStateOfRevision(state, [{}], 0, 0);
  assert.deepEqual(result, state);
});

describe('2 states', () => {
  const state0 = testState();
  const state1 = {...state0, a: 1};
  const states = [state0, state1];
  const deltas = createDeltas(states);

  it('state 0', () => {
    assert.deepEqual(getStateOfRevision(state0, deltas, 0, 0), state0);
  });

  it('state 0 -> state 1', () => {
    assert.deepEqual(getStateOfRevision(state0, deltas, 0, 1), state1);
  });

  it('state 1 -> state 1', () => {
    assert.deepEqual(getStateOfRevision(state1, deltas, 1, 1), state1);
  });

  it('state 1 -> state 0', () => {
    assert.deepEqual(getStateOfRevision(state1, deltas, 1, 0), state0);
  });

  it('revisions below 0 raise an RangeError', () => {
    assert.throws(() => getStateOfRevision(state1, deltas, -1, 0), RangeError);
    assert.throws(() => getStateOfRevision(state1, deltas, 0, -1), RangeError);
  });

  it('revisions higher than deltas.length raise an RangeError', () => {
    assert.throws(() => getStateOfRevision(state1, deltas, 2, 0), RangeError);
    assert.throws(() => getStateOfRevision(state1, deltas, 0, 2), RangeError);
  });
});

describe('3 states', () => {
  const state0 = testState();
  const state1 = {...state0, a: 1};
  const state2 = {...state1, b: 1};
  const states = [state0, state1, state2];
  const deltas = createDeltas(states);

  it('state 0 -> state 2', () => {
    assert.deepEqual(getStateOfRevision(state0, deltas, 0, 2), state2);
  });

  it('state 2 -> state 0', () => {
    assert.deepEqual(getStateOfRevision(state2, deltas, 2, 0), state0);
  });
});

describe('10 states', () => {
  const n = 10;
  const states = R.times((i) => testState(i, 2 * i), n);
  const deltas = createDeltas(states);

  it('state 0 -> state n-1', () => {
    assert.deepEqual(getStateOfRevision(states[0], deltas, 0, n - 1), states[n - 1]);
  });

  it('every combination works', () => {
    for (const s of R.range(0, n)) {
      for (const t of R.range(0, n)) {
        assert.deepEqual(getStateOfRevision(states[s], deltas, s, t), states[t]);
      }
    }
  });
});
