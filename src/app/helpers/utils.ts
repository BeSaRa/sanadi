export {
  isValidValue,
  isEmptyObject,
  isValidAdminResult,
  generateModelAndCast,
  hasValidLength,
  generateHtmlList,
  printBlobData
};

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

/**
 * @description Generates the html ordered list of passed string values
 * @param title: string
 * @param namesList: string[]
 */
function generateHtmlList(title: string, namesList: string[]): HTMLDivElement {
  const div = document.createElement('div');
  div.classList.add('dynamic-list-container');

  const titleElement = document.createElement('h6');
  titleElement.innerText = title;

  const list: HTMLOListElement = document.createElement('ol');
  for (const name of namesList) {
    const item = document.createElement('li');
    item.appendChild(document.createTextNode(name));
    list.appendChild(item);
  }

  div.append(titleElement);
  div.append(list);
  return div;
}

/**
 * @description Opens the blob data in new browser tab or download if IE browser
 * @param data:Blob
 * @param fileName?:string
 */
function printBlobData(data: Blob, fileName?: string): void {
  if (window.navigator.msSaveOrOpenBlob) {
    window.navigator.msSaveOrOpenBlob(data, fileName ?? 'sanadi-' + new Date().valueOf() + '.pdf');
  } else {
    const a: HTMLAnchorElement = document.createElement('a');
    a.href = URL.createObjectURL(data);
    a.target = '_blank';
    a.click();
  }
}
