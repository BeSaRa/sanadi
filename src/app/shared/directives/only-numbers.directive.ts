import {Directive, HostListener} from '@angular/core';
import {AbstractControl, NG_VALIDATORS, ValidationErrors, Validator} from "@angular/forms";
import {CustomValidators} from "@app/validators/custom-validators";

// noinspection AngularMissingOrInvalidDeclarationInModule
@Directive({
  selector: '[onlyNumbers]',
  providers: [{provide: NG_VALIDATORS, multi: true, useExisting: OnlyNumbersDirective}]
})
export class OnlyNumbersDirective implements Validator {
  validate(control: AbstractControl): ValidationErrors | null {
    return CustomValidators.number(control);
  }

  @HostListener('keypress', ['$event'])
  onKeyPress(event: KeyboardEvent): void {
    const key = (event.key).trim();
    if (!key || isNaN(key as unknown as number)) {
      event.preventDefault();
    }
  }

}
