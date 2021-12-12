import {ValidationErrors, ValidatorFn} from '@angular/forms';

export function timeLaterThanOther(startTime: number): ValidatorFn {
  return (control): ValidationErrors | null => {
    if (!control.value || +control.value < startTime) {
      return { invalidLaterTime: true };
    }
    return null;
  };
}
