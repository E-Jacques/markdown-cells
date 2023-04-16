export const REGEX = {
  tableData: /\|([^\|]*)/g,
  /**
   * Match lines like | d1 | d2 |
   */
  tableLineWithData: /\|[^\|]*(?:\|[^\|]*)*\|/,
  /**
   * Match lines like |-----|----|
   */
  tableDashedLine: /\|[\-\|]+\|/,
  isOnlyDash: /-+/,
};
