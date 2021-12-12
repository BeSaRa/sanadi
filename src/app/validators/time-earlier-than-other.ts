import {ValidationErrors, ValidatorFn} from '@angular/forms';

export function timeEarlierThanOther(endTime: number): ValidatorFn {
  return (control): ValidationErrors | null => {
    if (!control.value || +control.value > endTime) {
      return { invalidEarlierTime: true };
    }
    return null;
  };
}
