type TNullOrUndefined = null | undefined;

export class ObjectUtils {
  static nullOrUndefined<T>(
    object: T | TNullOrUndefined
  ): object is TNullOrUndefined {
    return object === null || object === undefined;
  }

  /**
   * Property delimiter is '.'
   * @param object
   * @param properties
   * @returns
   */
  static hasProperties(object: any, ...properties: string[]): boolean {
    const propertyDelimiter = ".";
    for (let prop of properties) {
      let currentObject = object;
      for (let k of prop.split(propertyDelimiter)) {
        if (!currentObject.hasOwnProperty(k)) {
          return false;
        }

        currentObject = currentObject[k];
      }
    }

    return true;
  }
}
