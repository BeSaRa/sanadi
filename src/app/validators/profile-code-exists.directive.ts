import {Directive, forwardRef, Input} from '@angular/core';
import {AbstractControl, AsyncValidator, NG_ASYNC_VALIDATORS, ValidationErrors} from '@angular/forms';
import {OperationTypes} from '@app/enums/operation-types.enum';
import {Observable} from 'rxjs';
import {debounceTime, map, startWith, switchMap, take, tap} from 'rxjs/operators';
import {ProfileService} from '@services/profile.service';

@Directive({
  selector: '[profileCodeExists]',
  providers: [
    {
      provide: NG_ASYNC_VALIDATORS,
      useExisting: forwardRef(() => ProfileCodeExistsDirective),
      multi: true
    }
  ]
})
export class ProfileCodeExistsDirective implements AsyncValidator {
  @Input('operation') operation!: OperationTypes;
  @Input('profileId') profileId!: number;
  private firstTime = true;

  constructor(private profileService: ProfileService) {
  }

  validate(control: AbstractControl): Promise<ValidationErrors | null> | Observable<ValidationErrors | null> {
    return control.valueChanges.pipe(
      debounceTime(500),
      (this.firstTime ? startWith(control.value) : tap(_ => undefined)),
      switchMap((val: string) => {
        this.firstTime = false;
        return this.profileService.getByIdAndProfileCode(this.profileId, val)
          .pipe(map(value => value.length > 0 ? {profileCodeExists: true} : null));
      }),
      take(1)
    );
  }
}
