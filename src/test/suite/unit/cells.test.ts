import * as assert from "assert";
import { generateTable } from "../../../cells";
import { CellError } from "../../../errors/CellError";

suite("Cells function unit test suite", () => {
  suite("For function generateTable", () => {
    suite(
      "Generate the right amount of lines and columns with default inputs",
      () => {
        test("General case", () => {
          assert.strictEqual(
            generateTable({ width: 4, height: 2 }),
            "| $1 | $2  | $3  | $4  |\n|----|-----|-----|-----|\n| $5 | $6  | $7  | $8  |\n| $9 | $10 | $11 | $12 |"
          );
        });

        test("With only header (heigth = 0)", () => {
          assert.strictEqual(
            generateTable({ width: 4, height: 0 }),
            "| $1 | $2  | $3  | $4  |"
          );
        });

        test("With only width (width = 0)", () => {
          // We also need to test that an error popup have been raised
          assert.throws(
            () => generateTable({ width: 0, height: 3 }),
            new CellError("Table's width cannot be 0.")
          );
        });
      }
    );

    suite(
      "Generate the right amout of lines and columns with complete custom inputs",
      () => {
        test("General case", () => {
          assert.strictEqual(
            generateTable({
              width: 2,
              height: 2,
              headers: ["test1", "test2"],
              content: [
                [1, 2],
                [3, 4],
              ],
            }),
            "| test1 | test2 |\n|------|------|\n| 1     | 2     |\n| 3     | 4     |"
          );
        });

        test("Raise an error when too much data in headers", () => {
          assert.throws(
            () =>
              generateTable({
                width: 2,
                height: 2,
                headers: ["test1", "test2", "test3"],
                content: [
                  [1, 2],
                  [3, 4],
                ],
              }),
            new CellError("Too much data in headers. Expecting 2, got 3.")
          );
        });

        test("Raise an error when too much data in one line of content", () => {
          assert.throws(
            () =>
              generateTable({
                width: 2,
                height: 2,
                headers: ["test1", "test2"],
                content: [
                  [1, 2, 3],
                  [3, 4],
                ],
              }),
            new CellError(
              "Too much data in cells. Expecting 2 on line 1, got 3."
            )
          );
        });

        test("Raise an error when too much data in multiples lines of content", () => {
          assert.throws(
            () =>
              generateTable({
                width: 2,
                height: 2,
                headers: ["test1", "test2"],
                content: [
                  [1, 2, 3],
                  [3, 4, 5],
                ],
              }),
            new CellError(
              "Too much data in cells. Expecting 2 on multiples lines (1, 2), got 3."
            )
          );
        });
      }
    );
  });
});
