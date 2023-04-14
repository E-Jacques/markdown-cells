import { Stringable } from "./interfaces/IStringable";

export class SnippetFiller implements Stringable {
  constructor(private n: number, private name: string) {}

  toString(): string {
    return `\${${this.n}:${this.name}}`;
  }

  concat(toAppend: string): SnippetFiller {
    this.name += toAppend;
    return this;
  }

  get length(): number {
    return this.name.length;
  }
}
