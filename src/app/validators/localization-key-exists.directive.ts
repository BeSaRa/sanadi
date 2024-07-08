import {Directive, forwardRef, Input} from '@angular/core';
import {AbstractControl, AsyncValidator, NG_ASYNC_VALIDATORS, ValidationErrors} from '@angular/forms';
import {Observable, of} from 'rxjs';
import {LangService} from '@services/lang.service';
import {debounceTime, map, startWith, switchMap, take, tap} from 'rxjs/operators';
import {OperationTypes} from '@app/enums/operation-types.enum';

@Directive({
  selector: '[localizationKeyExists]',
  providers: [
    {
      provide: NG_ASYNC_VALIDATORS,
      useExisting: forwardRef(() => LocalizationKeyExistsDirective),
      multi: true
    }
  ]
})
export class LocalizationKeyExistsDirective implements AsyncValidator {
  @Input('operation') operation!: OperationTypes;
  private firstTime = true;

  constructor(private lang: LangService) {
  }

  validate(control: AbstractControl): Promise<ValidationErrors | null> | Observable<ValidationErrors | null> {
    return control.valueChanges.pipe(
      debounceTime(500),
      (this.firstTime ? startWith(control.value) : tap(_ => undefined)),
      switchMap((val: string) => {
        this.firstTime = false;
        if (this.operation === OperationTypes.UPDATE) {
          return of(null);
        }
        return this.lang.getLocalizationByKey(val).pipe(map(value => value ? {keyExists: value} : null));
      }),
      take(1)
    );
  }

}
