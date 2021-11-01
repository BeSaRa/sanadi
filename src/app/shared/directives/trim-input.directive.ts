import {Directive, HostListener, Input, OnDestroy, OnInit, SkipSelf} from '@angular/core';
import {Subject, Subscription} from 'rxjs';
import {AbstractControl, ControlContainer} from '@angular/forms';
import {debounceTime} from 'rxjs/operators';

@Directive({
  selector: 'input[trimInput],textarea[trimInput]'
})
export class TrimInputDirective implements OnInit, OnDestroy {
  @Input() trimInput: 'START' | 'END' | '' | 'ALL' = '';
  @Input() trimDelay: number = 500;
  @Input() formControlName!: string;
  @Input() trimOn: 'blur' | 'inline' = 'blur';

  _parentControl!: ControlContainer;
  private destroy$: Subject<any> = new Subject();
  private trim$: Subject<any> = new Subject();
  trimSubscription!: Subscription;

  constructor(@SkipSelf() parent: ControlContainer) {
    this._parentControl = parent;
  }

  ngOnInit(): void {
    this.checkRequiredInputs();
    this.listenToTrim();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.destroy$.unsubscribe();
    this.trimSubscription?.unsubscribe();
  }

  checkRequiredInputs(): void {
    if (!this.formControlName) {
      throw new Error('Missing input attribute - formControlName');
    }
    if (!this._parentControl) {
      throw new Error('this controller has no parent from Group Controller');
    }
  }

  listenToTrim(): void {
    this.trimSubscription = this.trim$.pipe(
      debounceTime(this.trimDelay)
    ).subscribe(() => {
      this.updateControlValue();
    });
  }

  getTrimValue(value: any): any {
    if (typeof value === 'undefined' || value === null) {
      return value;
    }
    let trimmedValue = value;
    if (typeof value === 'string' || typeof value === 'number') {
      if (this.trimInput === '') {
        trimmedValue = ('' + value).trim();
      } else if (this.trimInput === 'START') {
        // @ts-ignore
        trimmedValue = ('' + value).trimStart();
      } else if (this.trimInput === 'END') {
        // @ts-ignore
        trimmedValue = ('' + value).trimEnd();
      } else if (this.trimInput === 'ALL') {
        trimmedValue = ('' + value).replace(/ /g, '');
      }
    }
    return trimmedValue;
  }

  updateControlValue(): void {
    if (!this.control) {
      return;
    }
    let trimmedValue = this.getTrimValue(this.control.value);
    this.control.patchValue(trimmedValue, {emitEvent: false});
  }

  @HostListener('blur')
  trimInputOnBlur(): void {
    if (this.trimOn === 'blur') {
      this.updateControlValue();
    }
  }

  @HostListener('input')
  trimInputInline(): void {
    if (this.trimOn === 'inline') {
      this.trim$.next(true);
    }
  }

  get control(): AbstractControl {
    return this._parentControl.control?.get(this.formControlName) as AbstractControl;
  }
}
