import * as assert from "assert";
import { generateTable, parseData } from "../../../cells";
import { CellError } from "../../../errors/CellError";

suite("Cells function unit test suite", () => {
  suite("For function generateTable", () => {
    suite(
      "Generate the right amount of lines and columns with default inputs",
      () => {
        test("General case", () => {
          assert.strictEqual(
            generateTable({ width: 4, height: 2 }),
            "| ${1:header1 } | ${2:header2 } | ${3:header3 } | ${4:header4 } |\n" +
              "|----------|----------|----------|----------|\n" +
              "| ${5:cell 1,1} | ${6:cell 1,2} | ${7:cell 1,3} | ${8:cell 1,4} |\n" +
              "| ${9:cell 2,1} | ${10:cell 2,2} | ${11:cell 2,3} | ${12:cell 2,4} |"
          );
        });

        test("With only header (heigth = 0)", () => {
          assert.strictEqual(
            generateTable({ width: 4, height: 0 }),
            "| ${1:header1} | ${2:header2} | ${3:header3} | ${4:header4} |\n" +
              "|---------|---------|---------|---------|"
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
            "| test1 | test2 |\n" +
              "|-------|-------|\n" +
              "| 1     | 2     |\n" +
              "| 3     | 4     |"
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
              "Too much data in cells. Expecting 2 on multiples lines (1, 2), got 3 at maximum."
            )
          );
        });
      }
    );

    suite(
      "Generate the right amout of lines and columns with partial custom inputs",
      () => {
        test("For partial header", () => {
          assert.strictEqual(
            generateTable({
              width: 2,
              height: 2,
              headers: ["test1"],
              content: [
                [1, 2],
                [3, 4],
              ],
            }),
            "| test1 | ${1:header2} |\n" +
              "|-------|---------|\n" +
              "| 1     | 2       |\n" +
              "| 3     | 4       |"
          );
        });

        test("For partial content", () => {
          assert.strictEqual(
            generateTable({
              width: 2,
              height: 2,
              headers: ["test1", "test2"],
              content: [[1], [4]],
            }),
            "| test1 | test2    |\n" +
              "|-------|----------|\n" +
              "| 1     | ${1:cell 1,2} |\n" +
              "| 4     | ${2:cell 2,2} |"
          );
        });

        test("For both partial header and content", () => {
          assert.strictEqual(
            generateTable({
              width: 2,
              height: 2,
              headers: ["test1"],
              content: [[1, 2], [3]],
            }),
            "| test1 | ${1:header2 } |\n" +
              "|-------|----------|\n" +
              "| 1     | 2        |\n" +
              "| 3     | ${2:cell 2,2} |"
          );
        });
      }
    );
  });

  suite("For function parseData", () => {
    suite("Should correctly detect width and height", () => {
      test("General case", () => {
        const parsedData = parseData(["h1 h2 h3", "d1 d2 d3", "d4 d5 d6"], " ");

        assert.strictEqual(parsedData.width, 3);
        assert.strictEqual(parsedData.height, 2);
      });

      test("With only header", () => {
        const parsedData = parseData(["h1 h2 h3"], " ");
        assert.strictEqual(parsedData.height, 0);
        assert.strictEqual(parsedData.width, 3);
      });
    });

    suite("Properly restitue headers and content", () => {
      test("General case", () => {
        const parsedData = parseData(["h1 h2 h3", "d1 d2 d3", "d4 d5 d6"], " ");

        assert.deepEqual(parsedData.headers, ["h1", "h2", "h3"]);
        assert.deepEqual(parsedData.content, [
          ["d1", "d2", "d3"],
          ["d4", "d5", "d6"],
        ]);
      });

      test("With only header", () => {
        const parsedData = parseData(["h1 h2 h3"], " ");
        assert.deepEqual(parsedData.headers, ["h1", "h2", "h3"]);
        assert.deepEqual(parsedData.content, undefined);
      });
    });

    suite("Can handle different delimiter", () => {
      test("With ';' as a delimiter", () => {
        const parsedData = parseData(["h1;h2;h3", "d1;d2;d3", "d4;d5;d6"], ";");

        assert.strictEqual(parsedData.width, 3);
        assert.strictEqual(parsedData.height, 2);
        assert.deepEqual(parsedData.headers, ["h1", "h2", "h3"]);
        assert.deepEqual(parsedData.content, [
          ["d1", "d2", "d3"],
          ["d4", "d5", "d6"],
        ]);
      });
    });
  });
});
