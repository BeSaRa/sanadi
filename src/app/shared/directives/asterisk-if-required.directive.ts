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
  @Input()
  control!: AbstractControl;
  private _controlName!: string;
  readonly _parentControl!: ControlContainer;
  private destroy$: Subject<any> = new Subject();
  private requiredElement: HTMLSpanElement = this.document.createElement('span') as HTMLSpanElement;
  readonly requiredArray = [
    CustomValidators.required,
    Validators.required
  ];
  readonly element: HTMLElement;

  get formControl(): AbstractControl {
    return this.control ? this.control : this._parentControl.control?.get(this._controlName) as AbstractControl;
  }

  private valueOrValidityChanged$!: Observable<any>;

  @Input()
  set asteriskIfRequired(value: string) {
    this._controlName = value;
  };

  get asteriskIfRequired(): string {
    return this._controlName;
  }

  constructor(@Optional() @Host() @SkipSelf() parent: ControlContainer,
              @Inject(DOCUMENT) private document: Document,
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
    if (!this._controlName && !this.control) {
      console.info(this.element);
      throw new Error('Please Provide Form control name or [formControl]');
    }
    if (this._controlName && !this._parentControl) {
      console.info(this.element);
      throw new Error('Please provide form group as parent for this control ' + this._controlName);
    }
    this.element.appendChild(this.requiredElement);
    this.valueOrValidityChanged$ = this.formControl.valueChanges.pipe(debounceTime(200));

    this.applyAsteriskIfExists();
    this.valueOrValidityChanged$.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.applyAsteriskIfExists();
    });
  }

  controlHasRequiredValidator(): boolean {
    const control = <AbstractControl & ValidatorsInterface> this.formControl;
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
