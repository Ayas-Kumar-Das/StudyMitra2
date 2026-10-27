import test from "node:test";
import assert from "node:assert/strict";
import { consumeEvents, validateFile } from "../src/lib/utils.js";
test("stream parser preserves partial JSON and handles CRLF", () => {
  const events = [];
  const tail = consumeEvents(
    'data: {"type":"token","content":"one"}\r\n\r\ndata: {"type":"to',
    (x) => events.push(x),
  );
  assert.equal(events[0].content, "one");
  assert.equal(tail, 'data: {"type":"to');
  consumeEvents(tail + 'ken","content":"two"}\n', (x) => events.push(x));
  assert.equal(events[1].content, "two");
});
test("stream parser flushes final unterminated event and ignores comments", () => {
  const events = [];
  consumeEvents(': ping\ndata: {"type":"done"}', (x) => events.push(x), true);
  assert.deepEqual(events, [{ type: "done" }]);
});
test("stream errors propagate instead of silently disappearing", () => {
  assert.throws(
    () =>
      consumeEvents('data: {"type":"error"}\n', () => {
        throw Error("failed");
      }),
    /failed/,
  );
});
test("upload validation rejects unsafe types, empty files and oversize files", () => {
  assert.ok(validateFile({ name: "a.exe", size: 50 }));
  assert.ok(validateFile({ name: "a.pdf", size: 0 }));
  assert.ok(validateFile({ name: "a.pdf", size: 51 * 1024 * 1024 }));
  assert.equal(validateFile({ name: "a.PDF", size: 500 }), "");
});
