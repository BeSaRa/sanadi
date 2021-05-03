import {FormGroup, ValidationErrors} from '@angular/forms';
import {DocumentFieldValidatorInterface} from '../interfaces/document-field-validator-interface';

const fields: DocumentFieldValidatorInterface = {
  documentTitle: (value: string): boolean => {
    return !!(value && value.length > 1);
  },
  files: (value: FileList): boolean => {
    return (value instanceof FileList && value.length > 0);
  }
};

export function documentValidator(control: FormGroup): ValidationErrors | null {
  const keys = Object.keys(fields);
  let errors: { [index: string]: boolean } = {};
  keys.forEach(key => {
    const ctrl = control.get(key);
    if (!fields[key as keyof DocumentFieldValidatorInterface](ctrl?.value)) {
      errors[key] = true;
    }
  });
  return Object.keys(errors).length ? errors : null;
}
