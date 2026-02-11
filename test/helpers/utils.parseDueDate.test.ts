import * as test from 'tape';
import { parseDueDate } from '../../src/helpers/utils';

// Using a fixed ISO Z to avoid timezone issues
const ISO_EPOCH = '1970-01-01T00:00:00Z';

test('parseDueDate parses ISO Z and returns correct epoch', (t) => {
  const ts = parseDueDate(ISO_EPOCH);
  t.equal(ts, 0, 'epoch start should be 0 ms');
  t.end();
});
test('parseDueDate returns null for invalid input', (t) => {
  const ts = parseDueDate('not a date at all');
  t.equal(ts, null, 'invalid input yields null');
  t.end();
});
