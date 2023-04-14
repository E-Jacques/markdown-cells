import { CellError } from "./errors/CellError";
import { GenerateTableInput } from "./interfaces/GenerateTableInput";
import { Stringable } from "./interfaces/IStringable";
import { SnippetFiller } from "./snippet-filler";
import { BasicIterator } from "./utils/basic-interator";
import { ObjectUtils } from "./utils/object.utils";
import { StringUtils } from "./utils/string.utils";

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
