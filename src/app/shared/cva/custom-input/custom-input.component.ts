import {Component, forwardRef, Inject, Injector, Input, OnInit} from '@angular/core';
import {
  ControlValueAccessor,
  FormControlDirective,
  FormControlName,
  FormGroupDirective,
  NG_VALUE_ACCESSOR,
  NgControl,
  UntypedFormControl
} from '@angular/forms';
import {ILanguageKeys} from '@contracts/i-language-keys';
import {LangService} from '@services/lang.service';

@Component({
  selector: 'custom-input',
  templateUrl: './custom-input.component.html',
  styleUrls: ['./custom-input.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      multi: true,
      useExisting: forwardRef(() => CustomInputComponent)
    }
  ]
})
export class CustomInputComponent implements ControlValueAccessor, OnInit {

  inputControl!: UntypedFormControl;
  @Input() label: keyof ILanguageKeys = {} as keyof ILanguageKeys;
  @Input() columns: number = 4;
  @Input() readonly: boolean = false;

  constructor(public lang: LangService,
              @Inject(Injector) private injector: Injector) {
  }

  ngOnInit() {
    const control = this.injector.get(NgControl);
    if (control instanceof FormControlName) {
      this.inputControl = this.injector.get(FormGroupDirective).getControl(control);
    } else {
      this.inputControl = (control as FormControlDirective).form as UntypedFormControl;
    }
  }

  value: any;
  touched: boolean = false;
  disabled: boolean = false;
  id: string = crypto.randomUUID();


  onChange = (value: any) => {
  };
  onTouched = () => {
  };

  registerOnChange(onChange: any) {
    this.onChange = onChange;
  }

  registerOnTouched(onTouched: any) {
    this.onTouched = onTouched;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  writeValue(value: any): void {
    this.value = value;
  }

  updateValue($event: Event): void {
    if (this.disabled || this.readonly) {
      return;
    }
    this.onChange(($event.target as HTMLInputElement).value);
  }

  updateTouch(): void {
    if (this.disabled || this.readonly) {
      return;
    }
    this.onTouched();
  }
}
