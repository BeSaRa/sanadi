import { FormGroup } from "@angular/forms";

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
  static displayFormValidity(form: FormGroup, containerRefToScroll: HTMLElement | string = ''): void {
    form.markAllAsTouched();

    if (!containerRefToScroll) {
      return;
    }

    if (typeof containerRefToScroll === 'string') {
      containerRefToScroll = document.getElementById(containerRefToScroll) as HTMLElement;
    }

    if (containerRefToScroll.scrollTop > 0) {
      containerRefToScroll.scrollTo({top: 0, behavior: "smooth"});
    }
  }
}
