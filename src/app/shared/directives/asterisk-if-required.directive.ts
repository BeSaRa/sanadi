import {Directive, ElementRef, Host, Inject, Input, OnDestroy, OnInit, Optional, SkipSelf} from '@angular/core';
import {AbstractControl, ControlContainer, ValidatorFn, Validators} from '@angular/forms';
import {CustomValidators} from '../../validators/custom-validators';
import {debounceTime, takeUntil} from 'rxjs/operators';
import {Observable, Subject} from 'rxjs';
import {DOCUMENT} from '@angular/common';


interface ValidatorsInterface {
  _rawValidators: ValidatorFn [] | ValidatorFn | null
}

@Directive({
  selector: '[asteriskIfRequired]'
})
export class AsteriskIfRequiredDirective implements OnInit, OnDestroy {
  private _controlName!: string;
  readonly _parentControl!: ControlContainer;
  private destroy$: Subject<any> = new Subject();
  private requiredElement: HTMLSpanElement = this.document.createElement('span') as HTMLSpanElement;
  readonly requiredArray = [
    CustomValidators.required,
    Validators.required
  ];
  readonly element: HTMLElement;

  get control(): AbstractControl {
    return this._parentControl.control?.get(this._controlName) as AbstractControl;
  }

  private valueOrValidityChanged$!: Observable<any>;

  @Input() set asteriskIfRequired(value: string) {
    if (!value) {
      throw new Error('Please Fill asteriskIfRequired Value');
    }
    this._controlName = value;
  };

  get asteriskIfRequired(): string {
    return this._controlName;
  }

  constructor(@Optional() @Host() @SkipSelf() parent: ControlContainer,
              @Inject(DOCUMENT) private  document: Document,
              elementRef: ElementRef) {
    this._parentControl = parent;
    this.element = elementRef.nativeElement;
    this.requiredElement.classList.add('text-danger');
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.destroy$.unsubscribe();
  }

  ngOnInit(): void {
    this.element.appendChild(this.requiredElement);
    this.valueOrValidityChanged$ = this.control.valueChanges.pipe(debounceTime(200));

    if (!this._parentControl) {
      throw new Error('this controller has no parent from Group Controller');
    }

    this.applyAsteriskIfExists();
    this.valueOrValidityChanged$.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.applyAsteriskIfExists();
    });
  }

  controlHasRequiredValidator(): boolean {
    const control = <AbstractControl & ValidatorsInterface> this.control;
    if (control._rawValidators === null) {
      return false;
    } else if (control._rawValidators instanceof Array) {
      return control._rawValidators?.some(validateFn => {
        return this.requiredArray.indexOf(validateFn) !== -1;
      });
    } else {
      return this.requiredArray.indexOf(control._rawValidators) !== -1;
    }
  }

  applyAsteriskIfExists(): void {
    this.requiredElement.innerText = this.controlHasRequiredValidator() ? ' * ' : '';
  }

}
