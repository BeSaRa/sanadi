export {isValidValue, isEmptyObject, isValidAdminResult, generateModelAndCast, hasValidLength};

/**
 * @description Checks if given value is valid
 * @param value
 * Value to check for validity
 */
function isValidValue(value: any): boolean {
  return ((typeof value === 'string') ? (value.trim() !== '') : (typeof value !== 'undefined' && value !== null));
}

function hasValidLength(value: any): boolean {
  // non-strict comparison is intentional, to check for both `null` and `undefined` values
  return value != null && typeof value.length === 'number';
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

/**
 * @description Checks if the admin result is valid
 * @param objectToCheck
 * AdminResult value to check
 */
function isValidAdminResult(objectToCheck: any): boolean {
  if (isEmptyObject(objectToCheck)) {
    return false;
  }
  return objectToCheck.hasOwnProperty('id')
    && isValidValue(objectToCheck.id)
    && objectToCheck.id > 0;
}

/**
 * @description Generate a new instance of the given model and set the data to the new instance
 * @param model
 * Class for which the model will be generated
 * @param data
 * Data to set in the new model
 */
function generateModelAndCast(model: any, data: any): (any) {
  return Object.assign(new model(), data);
}
