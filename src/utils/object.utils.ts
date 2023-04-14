type TNullOrUndefined = null | undefined;

export class ObjectUtils {
  static nullOrUndefined<T>(
    object: T | TNullOrUndefined
  ): object is TNullOrUndefined {
    return object === null || object === undefined;
  }
}
