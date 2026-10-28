import test from "node:test";
import assert from "node:assert/strict";
import { groupsAtPath, documentsAtPath } from "../src/lib/library.js";
const documents = [
  { id: 1, semester: "5", subject: "PPWC", doc_type: "notes" },
  { id: 2, semester: "5", subject: "ITC", doc_type: "textbook" },
  { id: 3, semester: "3", subject: "OS", doc_type: "lecture_notes" },
  { id: 4, semester: "", subject: "", doc_type: "" },
];
test("hierarchy sorts semesters numerically and keeps unassigned documents findable", () => {
  assert.deepEqual(
    groupsAtPath(documents, []).map((g) => g.value),
    ["3", "5", ""],
  );
  assert.equal(documentsAtPath(documents, ["", "", ""])[0].id, 4);
});
test("hierarchy scopes subject and category within their parent without rewriting backend values", () => {
  assert.deepEqual(
    groupsAtPath(documents, ["5"]).map((g) => g.value),
    ["ITC", "PPWC"],
  );
  assert.deepEqual(
    groupsAtPath(documents, ["5", "PPWC"]).map((g) => g.value),
    ["notes"],
  );
  assert.deepEqual(
    documentsAtPath(documents, ["5", "PPWC", "notes"]).map((d) => d.id),
    [1],
  );
  assert.deepEqual(documentsAtPath(documents, ["3", "PPWC"]), []);
});
