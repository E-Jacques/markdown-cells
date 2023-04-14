import { GenerateTableInput } from "./interfaces/GenerateTableInput";
import { Stringable } from "./interfaces/IStringable";

export function generateTable<
  THeader extends Stringable,
  TContent extends Stringable
>({
  width,
  height,
  headers,
  content,
}: GenerateTableInput<THeader, TContent>): string {
  return "";
}
