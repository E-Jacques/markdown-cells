import { Stringable } from "./IStringable";

export interface GenerateTableInput<
  THeader extends Stringable,
  TContent extends Stringable
> {
  width: number;
  height: number;
  headers?: (THeader | Stringable)[];
  content?: (TContent | Stringable)[][];
}
