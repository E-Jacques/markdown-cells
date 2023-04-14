import { Iterator } from "../interfaces/Iterator";

export class BasicIterator implements Iterator<number> {
  private i: number;

  constructor(start: number = 0) {
    this.i = start;
  }

  next(): number {
    return this.i++;
  }

  complete(): boolean {
    return false;
  }
}
