import {Directive, Input, OnDestroy, OnInit, SkipSelf} from '@angular/core';
import {Subject} from 'rxjs';
import {AbstractControl, ControlContainer} from '@angular/forms';
import {debounceTime, takeUntil} from 'rxjs/operators';

@Directive({
  selector: 'input[trimInput]'
})
export class TrimInputDirective implements OnInit, OnDestroy {
  @Input() trimDelay: number = 500;
  @Input() formControlName!: string;

  _parentControl!: ControlContainer;
  private destroy$: Subject<any> = new Subject();

  constructor(@SkipSelf() parent: ControlContainer) {
    this._parentControl = parent;
  }

  ngOnInit(): void {
    this._checkRequiredInputs();
    this.listenToInputChange();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.destroy$.unsubscribe();
  }

  _checkRequiredInputs(): void {
    if (!this.formControlName) {
      throw new Error('Missing input attribute - formControlName');
    }
    if (!this._parentControl) {
      throw new Error('this controller has no parent from Group Controller');
    }
  }

  listenToInputChange(): void {
    this.control?.valueChanges
      .pipe(
        takeUntil(this.destroy$),
        debounceTime(this.trimDelay)
      )
      .subscribe((value) => {
        let trimmedValue = value;
        if (typeof value === 'string' || typeof value === 'number') {
          trimmedValue = ('' + value).trim();
        }
        this.control?.patchValue(trimmedValue, {emitEvent: false});
      });
  }

  get control(): AbstractControl {
    return this._parentControl.control?.get(this.formControlName) as AbstractControl;
  }
}
