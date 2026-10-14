import test from 'node:test';
import assert from 'node:assert/strict';
import {formatTime, formatTimeRange, getTimeFormat, setTimeFormat} from '../ui/time-format.js';
import {scheduleView} from '../ui/schedule.js';

test('time labels handle midnight, noon, and afternoon without changing canonical values', () => {
  for (const [value, label] of [['00:00','12:00 AM'], ['09:05','9:05 AM'], ['12:00','12:00 PM'], ['13:30','1:30 PM'], ['23:59','11:59 PM']]) {
    assert.equal(formatTime(value, '12'), label);
    assert.equal(formatTime(value, '24'), value);
  }
  assert.equal(formatTime('Review times', '12'), 'Review times');
});

test('changing the persisted preference updates schedule labels without mutating records', () => {
  const previousStorage = globalThis.localStorage;
  const previousFormat = getTimeFormat();
  const values = new Map();
  globalThis.localStorage = {setItem: (key, value) => values.set(key, value)};
  const state = {periods:[{id:'p', teacher:'Smith', title:'Math', grade:'4', subject:'math', start:'13:00', end:'13:40', days:'1,2,3,4,5', room:'', team:''}], timeBlocks:[{id:'b', name:'Afternoon', start:'13:00', end:'13:40'}]};
  const original = JSON.stringify(state);
  try {
    assert.equal(setTimeFormat('12'), true);
    assert.equal(values.get('administraight.time-format.v1'), '12');
    assert.equal(formatTimeRange('13:00–13:40'), '1:00 PM–1:40 PM');
    assert.ok(scheduleView(state).includes('1:00 PM–1:40 PM'));
    assert.equal(setTimeFormat('24'), true);
    assert.ok(scheduleView(state).includes('13:00–13:40'));
    assert.equal(JSON.stringify(state), original);
    assert.equal(setTimeFormat('invalid'), false);
    assert.equal(getTimeFormat(), '24');
  } finally {
    setTimeFormat(previousFormat);
    if (previousStorage === undefined) delete globalThis.localStorage;
    else globalThis.localStorage = previousStorage;
  }
});
