import {searchFunctionType} from '../types/types';

export {
  isValidValue,
  isEmptyObject,
  objectHasValue,
  isValidAdminResult,
  generateModelAndCast,
  hasValidLength,
  generateHtmlList,
  printBlobData,
  filterList,
  getPropertyValue,
  searchInObject
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
  if (!isValidValue(value)) {
    return false;
  } else if (typeof value === 'string' || typeof value === 'number') {
    return true;
  }
  return typeof value.length === 'number';
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
 * @description Check if object has any property with value
 * @param objectToCheck
 * Object to check for property values
 */
function objectHasValue(objectToCheck: any): boolean {
  return Object.values(objectToCheck).some(value => isValidValue(value));
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
    const url = URL.createObjectURL(data);
    a.href = URL.createObjectURL(data);
    a.target = '_blank';
    a.click();

    setTimeout(() => {
      URL.revokeObjectURL(url);
    }, 0)
  }
}

function _getPropertyValue(record: any, property: string): any {
  if (!record) {
    return null;
  }
  if (property.indexOf('.') > -1) {
    const arr = property.split('.');
    // tslint:disable-next-line:prefer-for-of
    for (let i = 0; i < arr.length; i++) {
      const prop = arr.shift();
      // @ts-ignore
      return getPropertyValue(record[prop], arr.join('.'));
    }
  } else {
    if (typeof record === 'string' || typeof record === 'number') {
      return record;
    }
    return record[property];
  }
}

function getPropertyValue(record: any, property: string): any {
  const recordCopy = {...record};
  return _getPropertyValue(recordCopy, property);
}

function filterList(searchText: string, records: any[], searchKeys: any): any[] {
  if (!searchText) {
    return records;
  }
  let propertyToSearch: any = null;
  let propertyValue: any = null;
  let result: boolean;
  return records.filter((item) => {
    for (const searchKey in searchKeys) {
      if (searchKeys.hasOwnProperty(searchKey)) {
        propertyToSearch = searchKeys[searchKey];

        if (!propertyToSearch) {
          result = false;
          break;
        }

        if (typeof propertyToSearch === 'function') {
          propertyToSearch = propertyToSearch(item);
        }

        // if property to search has value(property name defined), then search, otherwise, skip search
        if (propertyToSearch) {
          propertyValue = getPropertyValue(item, propertyToSearch);
          if (propertyValue && propertyValue.toString().toLowerCase().indexOf(searchText.slice().toLowerCase().trim()) > -1) {
            result = true;
            break;
          }
          result = false;
        }
        result = false;
      }
    }
    return result;
  });
}

/**
 * @description Search the given text in object.
 * If no searchFields are provided in object, record will be returned as searchText exists in record
 * @param objectToSearch: any
 * @param searchText: string
 * @param searchFieldsProperty: string = 'searchFields'
 */
function searchInObject(objectToSearch: any, searchText: string = '', searchFieldsProperty: string = 'searchFields'): boolean {
  // if no searchFields mentioned, don't search and return all item as existing after filter
  if (!objectToSearch.hasOwnProperty(searchFieldsProperty) || !searchText) {
    return true;
  }
  const keys = Object.keys(objectToSearch[searchFieldsProperty]);
  return keys.some(key => {
    if (typeof objectToSearch[searchFieldsProperty][key] === 'function') {
      const func = objectToSearch[searchFieldsProperty][key] as searchFunctionType;
      return func(searchText.trim().toLowerCase());
    } else {
      const field = objectToSearch[searchFieldsProperty][key];
      const value = objectToSearch[field] ? (objectToSearch[field] as string) + '' : '';
      return value.toLowerCase().indexOf(searchText.trim().toLowerCase()) !== -1;
    }
  });
}
