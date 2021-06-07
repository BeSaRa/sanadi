import {Directive, ElementRef, Input, OnDestroy, OnInit, Renderer2} from '@angular/core';
import {AbstractControl, ControlContainer} from '@angular/forms';
import {Subject} from 'rxjs';
import {takeUntil} from 'rxjs/operators';

@Directive({
  selector: '[validationClasses]'
})
export class ValidationClassesDirective implements OnInit, OnDestroy {
  @Input() isValid: string = 'is-valid';
  @Input() isInvalid: string = 'is-invalid';
  private invalidOnly: boolean = true;
  @Input()
  control!: AbstractControl;

  @Input()
  set onlyInvalid(value: boolean) {
    this.invalidOnly = value;
  };

  @Input() validationClasses!: string;
  destroy$: Subject<any> = new Subject<any>();

  get formControl(): AbstractControl {
    return (this.control ? this.control : this.parent.control?.get(this.validationClasses)) as AbstractControl;
  }

  constructor(private element: ElementRef,
              private parent: ControlContainer,
              private renderer: Renderer2) {
  }

  ngOnInit(): void {

    if (!this.validationClasses && !this.control) {
      console.log(this.element.nativeElement);
      throw Error('PLEASE PROVIDE control name for given element');
    }

    this.formControl
      .statusChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(_ => {
        this.applyControlClassValidity();
      });

  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.destroy$.unsubscribe();
  }

  private applyControlClassValidity(): void {
    this.applyControlInvalidClass();
    this.applyControlValidClass();
  }

  private applyControlInvalidClass(): void {
    const isInvalid = this.formControl.invalid && (this.formControl.touched || this.formControl.dirty);
    if (isInvalid) {
      this.renderer.addClass(this.element.nativeElement, this.isInvalid);
    } else {
      this.renderer.removeClass(this.element.nativeElement, this.isInvalid);
    }
  }

  private applyControlValidClass(): void {
    if (this.invalidOnly) {
      return;
    }
    const isValid = this.formControl.valid && (this.formControl.touched || this.formControl.dirty);

    if (isValid) {
      this.renderer.addClass(this.element.nativeElement, this.isValid);
    } else {
      this.renderer.removeClass(this.element.nativeElement, this.isValid);
    }
  }

}
