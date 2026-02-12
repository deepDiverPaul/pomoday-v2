import * as test from 'tape';
import { TaskItem, TaskStatus, parseDueDate } from '../../src/helpers/utils';
import { dueCommand } from '../../src/helpers/commands/actions';

const makeState = () => ({
  tasks: [
    {
      id: 1,
      tag: '@pomoday',
      title: 'test task',
      status: TaskStatus.WAIT,
      logs: [],
      archived: false,
      lastaction: 0,
      dueDate: null,
    } as TaskItem,
    {
      id: 2,
      tag: '@work',
      title: 'another task',
      status: TaskStatus.WAIT,
      logs: [],
      archived: false,
      lastaction: 0,
      dueDate: null,
    } as TaskItem,
  ],
});

// Helper for a minimal cmd object shape used by dueCommand
const cmd = (text: string) => ({ text });

test('dueCommand sets absolute due date', (t) => {
  const state = makeState();
  const text = '2026-02-14';
  const expected = parseDueDate(text);
  const out = dueCommand([1], cmd(text), [], state);

  t.ok(typeof out[0].dueDate === 'number', 'dueDate is a number');
  t.equal(out[0].dueDate, expected, 'dueDate equals parsed timestamp');
  t.ok(out[0].lastaction > 0, 'lastaction updated');
  // Other tasks unchanged
  t.equal(out[1].dueDate, null, 'other task remains unchanged');
  t.end();
});

test('dueCommand clears due date with "clear"', (t) => {
  const state = makeState();
  // Pre-set a due date
  state.tasks[0].dueDate = parseDueDate('1970-01-01T00:00:00Z');
  const out = dueCommand([1], cmd('clear'), [], state);
  t.equal(out[0].dueDate, null, 'dueDate cleared to null');
  t.ok(out[0].lastaction > 0, 'lastaction updated on clear');
  t.end();
});
