import * as vscode from "vscode";

import { CellError } from "../errors/CellError";
import { GenerateTableInput } from "../interfaces/GenerateTableInput";
import { Stringable } from "../interfaces/IStringable";
import { SnippetFiller } from "../snippet-filler";
import { BasicIterator } from "../utils/basic-interator";
import { ObjectUtils } from "../utils/object.utils";
import { StringUtils } from "../utils/string.utils";
import { REGEX } from "./regex.const";

export function isTable(input: string): boolean {
  let lines = input.split("\n");
  if (lines.length < 2) {
    return false;
  }

  // True if line at index 1 looks like |----|----|
  if (!REGEX.tableDashedLine.test(lines[1])) {
    return false;
  }

  if (!REGEX.tableLineWithData.test(lines[0])) {
    return false;
  }

  for (let i = 2; i < lines.length; i++) {
    if (!REGEX.tableLineWithData.test(lines[i])) {
      return false;
    }
  }

  return true;
}

export async function getGenerateTableData(): Promise<{
  input: GenerateTableInput<string, string>;
  shouldReplace: boolean;
}> {
  const activeEditor = vscode.window.activeTextEditor;
  if (activeEditor?.selections && activeEditor?.selections.length === 1) {
    if (activeEditor.document.getText(activeEditor?.selection).length > 0) {
      return {
        input: parseData(
          activeEditor.document.getText(activeEditor?.selection).split("\n"),
          " "
        ),
        shouldReplace: true,
      };
    }
  }

  let input = await vscode.window.showInputBox({
    placeHolder: "Enter dimension: width x height",
    prompt:
      "Generate a table (dimension will correspond to what you've specified)",
  });

  if (!ObjectUtils.nullOrUndefined(input)) {
    input = StringUtils.replaceAll(input, " ", "");
  }

  if (ObjectUtils.nullOrUndefined(input) || !/\dx\d/.test(input)) {
    throw new CellError("Dimension should respect the format: width x height");
  }

  const [width, height] = input.split("x").map((a) => Number.parseInt(a));
  return { shouldReplace: false, input: { width, height } };
}

export function parseTableData(data: string): {
  content?: string[][];
  headers: string[];
} {
  if (!isTable(data)) {
    throw new CellError(
      "Internal error: Souldn't try to parse table if data isn't a table."
    );
  }

  if (data.at(-1) !== "\n") {
    data += "\n";
  }

  const fullData: string[][] = [[]];
  let match;
  while ((match = REGEX.tableData.exec(data)) !== null) {
    const [_, matchString] = match;
    if (matchString === "\n") {
      fullData.push([]);
      continue;
    }

    fullData.at(-1)?.push(matchString);
  }

  const [headers, ...content] = fullData
    .filter((arr) => arr.length !== 0)
    .filter((arr) => !arr.every((s) => REGEX.isOnlyDash.test(s)));

  return { headers, content: content.length === 0 ? undefined : content };
}

export function parseData(
  data: string[],
  rowDelimiter: string
): GenerateTableInput<string, string> {
  let dataArray = data.map((s) => s.split(rowDelimiter));

  const height = dataArray.length - 1; // Retrieve one because of header
  const width = Math.max(...dataArray.map((a) => a.length));

  if (isTable(data.join("\n"))) {
    return {
      width: width - 2,
      height: height - 1,
      ...parseTableData(data.join("\n")),
    };
  }

  const headers = dataArray.shift();
  const content = height === 0 ? undefined : dataArray;

  return {
    height,
    width,
    headers,
    content,
  };
}

export function generateTable<
  THeader extends Stringable,
  TContent extends Stringable
>({
  width,
  height,
  headers,
  content,
}: GenerateTableInput<THeader, TContent>): string {
  const iterator = new BasicIterator(1);

  if (width <= 0) {
    throw new CellError("Table's width cannot be 0.");
  }

  if (ObjectUtils.nullOrUndefined(headers)) {
    headers = [] as Stringable[];
  }

  if (ObjectUtils.nullOrUndefined(content)) {
    content = [] as Stringable[][];
    for (let i = 0; i < height; i++) {
      content.push([]);
    }
  }

  if (headers.length > width) {
    throw new CellError(
      `Too much data in headers. Expecting ${width}, got ${headers.length}.`
    );
  }

  let contentLineErrors: number[] = [];

  for (let i = 0; i < content.length; i++) {
    if (content[i].length > width) {
      contentLineErrors.push(i);
    }
  }

  if (contentLineErrors.length === 1) {
    throw new CellError(
      `Too much data in cells. Expecting ${width} on line ${
        contentLineErrors[0] + 1
      }, got ${content[contentLineErrors[0]].length}.`
    );
  } else if (contentLineErrors.length >= 2) {
    throw new CellError(
      `Too much data in cells. Expecting ${width} on multiples lines (${contentLineErrors
        .map((a) => a + 1)
        .join(", ")}), got ${Math.max(
        ...contentLineErrors.map((v) => (content as Stringable[][])[v].length)
      )} at maximum.`
    );
  }

  // complete header
  while (headers.length < width) {
    headers.push(
      new SnippetFiller(iterator.next(), `header${headers.length + 1}`)
    );
  }

  // complete content
  for (let i = 0; i < height; i++) {
    while (content[i].length < width) {
      content[i].push(
        new SnippetFiller(
          iterator.next(),
          `cell ${i + 1},${content[i].length + 1}`
        )
      );
    }
  }

  const getLength = (stringable: Stringable): number =>
    stringable instanceof SnippetFiller
      ? stringable.length
      : stringable.toString().length;

  let maxLength: number[] = [];
  for (let colIndex = 0; colIndex < width; colIndex++) {
    maxLength[colIndex] = Math.max(
      getLength(headers[colIndex]),
      ...content.map((a) => getLength(a[colIndex]))
    );
  }

  let sArr: string[] = [];
  sArr.push(
    "| " +
      headers
        .map((val, index) =>
          StringUtils.completeToLength(
            val instanceof SnippetFiller ? val : val.toString(),
            maxLength[index],
            " "
          )
        )
        .join(" | ") +
      " |"
  );
  sArr.push(
    "|" + maxLength.map((v) => StringUtils.repeat("-", v + 2)).join("|") + "|"
  );

  for (let h = 0; h < height; h++) {
    sArr.push(
      "| " +
        content[h]
          .map((val, index) =>
            StringUtils.completeToLength(
              val instanceof SnippetFiller ? val : val.toString(),
              maxLength[index],
              " "
            )
          )
          .join(" | ") +
        " |"
    );
  }

  return sArr.join("\n");
}
