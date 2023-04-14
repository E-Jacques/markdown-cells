import { Iterator } from "../interfaces/Iterator";

export class DolarsIterator implements Iterator<String> {
  private i: number;

  constructor(start: number = 0) {
    this.i = start;
  }

  next(): String {
    this.i++;
    return "$" + this.i.toString();
  }

  complete(): boolean {
    return false;
  }
}
