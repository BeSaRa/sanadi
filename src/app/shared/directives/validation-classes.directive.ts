import {Directive, ElementRef, HostBinding, Input, OnInit, Optional} from '@angular/core';
import {AbstractControl, ControlContainer} from '@angular/forms';
import {Subject} from 'rxjs';

@Directive({
  selector: '[validationClasses]'
})
export class ValidationClassesDirective implements OnInit {
  private invalidOnly: boolean = true;
  @Input()
  control!: AbstractControl;

  @HostBinding('class.is-valid')
  get checkIsValid(): boolean {
    return this.invalidOnly ? false : (this.formControl && this.formControl.valid && (this.formControl.touched || this.formControl.dirty));
  }

  @HostBinding('class.is-invalid')
  get checkIsInValid(): boolean {
    return this.formControl && this.formControl.invalid && (this.formControl.touched || this.formControl.dirty);
  }

  @Input()
  set onlyInvalid(value: boolean) {
    this.invalidOnly = value;
  };

  @Input() validationClasses!: string;
  destroy$: Subject<void> = new Subject();

  get formControl(): AbstractControl {
    return (this.control ? this.control : this.parent.control?.get(this.validationClasses)) as AbstractControl;
  }

  constructor(private element: ElementRef,
              @Optional() private parent: ControlContainer) {
  }

  ngOnInit(): void {
    if (!this.validationClasses && !this.control) {
      console.log(this.element.nativeElement);
      throw Error('PLEASE PROVIDE control name for given element');
    }
  }
}
