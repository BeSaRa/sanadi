import {Directive, ElementRef, HostBinding, Input, OnInit, Optional} from '@angular/core';
import {ControlContainer, FormGroup} from '@angular/forms';
import {Subject} from 'rxjs';

@Directive({
  selector: '[validationGroupClasses]'
})
export class ValidationGroupClassesDirective implements OnInit {
  destroy$: Subject<any> = new Subject<any>();

  private invalidOnly: boolean = true;

  @Input()
  group!: FormGroup;

  @HostBinding('class.is-valid')
  get checkIsValid(): boolean {
    return this.invalidOnly ? false : (this.formGroup && this.formGroup.valid && (this.formGroup.touched || this.formGroup.dirty));
  }

  @HostBinding('class.is-invalid')
  get checkIsInValid(): boolean {
    return this.formGroup && this.formGroup.invalid && (this.formGroup.touched || this.formGroup.dirty);
  }

  @Input()
  set onlyInvalid(value: boolean) {
    this.invalidOnly = value;
  };


  get formGroup(): FormGroup {
    return (this.group ? this.group : this.parent.control) as FormGroup;
  }

  constructor(private element: ElementRef,
              @Optional() private parent: ControlContainer) {
  }

  ngOnInit(): void {

  }
}

