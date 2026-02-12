import * as test from 'tape';
import { parseCommand } from '../../src/helpers/commands/parser';

test('parseCommand parses due with absolute date', (t) => {
  const cmd = parseCommand('due 12 2026-02-14');
  t.ok(cmd, 'command parsed');
  t.equal(cmd!.command.toLowerCase(), 'due');
  t.equal(cmd!.id, '12');
  t.equal(cmd!.text, '2026-02-14');
  t.end();
});

test('parseCommand parses due with clear', (t) => {
  const cmd = parseCommand('due 5 clear');
  t.ok(cmd, 'command parsed');
  t.equal(cmd!.command.toLowerCase(), 'due');
  t.equal(cmd!.id, '5');
  t.equal(cmd!.text, 'clear');
  t.end();
});
