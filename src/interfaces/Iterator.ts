export interface Iterator<T> {
  next(): T;

  complete(): boolean;
}
