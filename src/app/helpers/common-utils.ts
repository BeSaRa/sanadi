import { UntypedFormGroup } from "@angular/forms";

export class CommonUtils {
  /**
   * @description Returns the sort value (1 | -1 | 0) depending on sort direction
   * @param value1
   * @param value2
   * @param direction
   */
  static getSortValue(value1: any, value2: any, direction: string): number {
    value1 = value1 ? (value1 + '').toLowerCase() : value1;
    value2 = value2 ? (value2 + '').toLowerCase() : value2;

    if (!direction) {
      return 0;
    } else {
      if (value1 < value2) {
        return -1;
      } else if (value1 > value2) {
        return 1;
      }
      return 0;
    }
    /*let finalValue: number = 0;
    switch (direction) {
       case 'asc':
         if (value1 < value2) {
           finalValue = -1;
         } else if (value1 > value2) {
           finalValue = 1;
         }
         break;
       case 'desc':
         if (value2 < value1) {
           finalValue = -1;
         } else if (value2 > value1) {
           finalValue = 1;
         }
         break;
       default:
         finalValue = 0;
     }
     return finalValue;*/
  }

  /**
   * @description Checks if given value is valid
   * @param value
   * Value to check for validity
   */
  static isValidValue(value: any): boolean {
    return ((typeof value === 'string') ? (value.trim() !== '') : (typeof value !== 'undefined' && value !== null));
  }

  /**
   * @description Generates the html ordered list of passed string values
   * @param title: string
   * @param namesList: string[]
   */
  static generateHtmlList(title: string, namesList: string[]): HTMLDivElement {
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
   * @description Checks if field is invalid
   * @param form
   * @param field
   * @param isDate
   */
  static getFieldInvalidStatus(form: any, field: string, isDate: boolean = false): boolean {
    const ctrl = form.get(field);
    if (isDate) {
      return !!(ctrl?.invalid && form.touched);
    }
    return !!(ctrl?.invalid && (ctrl?.touched || ctrl?.dirty));
  }

  /**
   * @description Checks if field is valid
   * @param form
   * @param field
   * @param isDate
   */
  static getFieldValidStatus(form: any, field: string, isDate: boolean = false): boolean {
    const ctrl = form.get(field);
    if (isDate) {
      return !!ctrl?.valid;
    }
    return !!(ctrl?.valid && (ctrl?.touched || ctrl?.dirty));
  }

  /**
   * @description Transforms the given string to snake case
   * @param str
   */
  static changeCamelToSnakeCase(str: string): string {
    return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`)

  }

  /**
   * @description Highlight validity of all fields in form
   * @param form
   * @param containerRefToScroll
   * Scroll the form to the top of given element
   */
  static displayFormValidity(form: UntypedFormGroup, containerRefToScroll: HTMLElement | string = ''): void {
    form.markAllAsTouched();

    if (!containerRefToScroll) {
      return;
    }

    if (typeof containerRefToScroll === 'string') {
      containerRefToScroll = document.getElementById(containerRefToScroll) as HTMLElement;
    }

    if (containerRefToScroll.scrollTop > 0) {
      containerRefToScroll.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  /**
   * @description Checks if given object is empty(not having properties)
   * @param objectToCheck
   * Object to check for emptiness
   */
  static isEmptyObject(objectToCheck: any): boolean {
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
  static objectHasValue(objectToCheck: any): boolean {
    return Object.values(objectToCheck).some(value => this.isValidValue(value));
  }

  /**
   * @description Opens the blob data in new browser tab or download if IE browser
   * @param data:Blob
   * @param fileName?:string
   */
  static printBlobData(data: Blob, fileName?: string): void {
    if ((window.navigator as any).msSaveOrOpenBlob) {
      (window.navigator as any).msSaveOrOpenBlob(data, fileName ?? 'sanadi-' + new Date().valueOf() + '.pdf');
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

  openBlobFileByUrl(blobUrl: string): void {
    window.open(blobUrl);
  }

  /**
   * @description compere two arrays values if they are equals
   * @param _list_1:Array<any>
   * @param _list_2:Array<any>
   */
  static isEqualList(_list_1: Array<any>, _list_2: Array<any>) {
    if (_list_1.length !== _list_2.length) {
      return false;
    }

    // .concat() to not mutate arguments
    const list_1 = _list_1.concat().sort();
    const list_2 = _list_2.concat().sort();

    for (let i = 0; i < list_1.length; i++) {
      if (list_1[i] !== list_2[i]) {
        return false;
      }
    }

    return true;
  }
}
