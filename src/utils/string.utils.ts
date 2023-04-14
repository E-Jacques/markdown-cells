import { SnippetFiller } from "../snippet-filler";

export class StringUtils {
  static completeToLength(
    toComplete: string | SnippetFiller,
    toLength: number,
    withChar: string
  ): string {
    let lenToAdd = toLength - toComplete.length;
    if (lenToAdd % withChar.length !== 0) {
      throw new Error(
        `[StringUtils] Won't be able to add ${lenToAdd} chars with ${withChar.length} length .`
      );
    }

    let s = "";
    for (let _ = 0; _ < lenToAdd / withChar.length; _++) {
      s += withChar;
    }

    return toComplete.concat(s).toString();
  }

  static repeat(
    toRepeat: string,
    forLength: number,
    exactLength: boolean = true
  ): string {
    if (forLength % toRepeat.length !== 0 && exactLength) {
      throw new Error(
        `[StringUtils] Won't be able to reach exact length (${forLength}) with ${toRepeat.length} chars long words.`
      );
    }

    let s = "";
    for (let _ = 0; _ < forLength / toRepeat.length; _++) {
      s += toRepeat;
    }

    return s;
  }

  static replaceAll(s: string, from: string, to: string): string {
    return s.split(from).join(to);
  }
}
