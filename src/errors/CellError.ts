/**
 * Marker error that should be use to catch.
 */
export class CellError extends Error {
  constructor(message: string) {
    super("[Markdown Cell] " + message);
  }
}
