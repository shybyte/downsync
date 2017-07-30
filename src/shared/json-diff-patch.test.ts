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
  console.log(deltas);

  it('state 0', () => {
    assert.deepEqual(getStateOfRevision(state0, deltas, 0, 0), state0);
  });

  it('state 0 -> state 1', () => {
    assert.deepEqual(getStateOfRevision(state0, deltas, 0, 1), state1);
  });
});

