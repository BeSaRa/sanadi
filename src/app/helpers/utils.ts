export {isValidValue, isEmptyObject};

/**
 * @description Checks if given value is valid
 * @param value
 * Value to check for validity
 */
function isValidValue(value: any): boolean {
  return ((typeof value === 'string') ? (value.trim() !== '') : (typeof value !== 'undefined' && value !== null));
}

/**
 * @description Checks if given object is empty(not having properties)
 * @param objectToCheck
 * Object to check for emptiness
 */
function isEmptyObject(objectToCheck: any): boolean {
  for (const key in objectToCheck) {
    if (objectToCheck.hasOwnProperty(key)) {
      return false;
    }
  }
  return true;
}
