export class CommonUtils {
  /**
   * @description Returns the sort value (1 | -1 | 0) depending on sort direction
   * @param value1
   * @param value2
   * @param direction
   */
  static getSortValue(value1: any, value2: any, direction: string): number {
    let finalValue: number;
    switch (direction) {
      case 'asc':
        if (value1 < value2) {
          finalValue = -1;
        }
        if (value1 > value2) {
          finalValue = 1;
        }
        finalValue = 0;
        break;
      case 'desc':
        if (value2 < value1) {
          finalValue = -1;
        }
        if (value2 > value1) {
          finalValue = 1;
        }
        finalValue = 0;
        break;
      default:
        finalValue = 0;
    }
    return finalValue;
  }

  /**
   * @description Checks if given value is valid
   * @param value
   * Value to check for validity
   */
  static isValidValue(value: any): boolean {
    return ((typeof value === 'string') ? (value.trim() !== '') : (typeof value !== 'undefined' && value !== null));
  }
}
