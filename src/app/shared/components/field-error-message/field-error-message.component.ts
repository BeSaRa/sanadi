import {Component, Input, HostBinding, Optional} from '@angular/core';
import {AbstractControl, ControlContainer} from '@angular/forms';
import {CustomValidators} from '@app/validators/custom-validators';
import {LangService} from '@app/services/lang.service';

@Component({
  selector: 'app-field-error-message',
  templateUrl: './field-error-message.component.html',
  styleUrls: ['./field-error-message.component.scss']
})
export class FieldErrorMessageComponent {
  @Input() control: (AbstractControl | null | undefined);
  @Input() labelKey?: string;
  @Input() labelText?: string;
  @Input() controlName?: string;
  @HostBinding('class') containerClass = 'invalid-feedback';
  @HostBinding('class.position-absolute')
  @Input()
  absolute = true
  @HostBinding('class.ignore-top-position')
  @Input()
  ignoreTop: boolean = false;

  constructor(private langService: LangService, @Optional() private parent: ControlContainer) {
  }

  get errorMessage(): (string | null) {
    if (this.controlName && parent) {
      this.control = this.parent.control?.get(this.controlName)!;
    }

    if (!this.control) {
      return null;
    }

    let objValidationData;
    for (const errorName in this.control.errors) {
      if (this.control.errors.hasOwnProperty(errorName)) {
        objValidationData = CustomValidators.getValidationData(this.control, (errorName || ''));
        break;
      }
    }
    if (!objValidationData || !objValidationData.message) {
      return null;
    }
    // handle invalid date format
    if (objValidationData.errorValue && objValidationData.errorValue.invalidDateFormat) {
      return this.langService.map.err_invalid_date;
    }

    // @ts-ignore
    const messageText = this.langService.map[objValidationData.message.key];
    if (!objValidationData.message.replaceValues) {
      return messageText;
    }
    // @ts-ignore
    const fieldLabel = this.labelText || (this.labelKey ? this.langService.map[this.labelKey] : '');
    return objValidationData.message.replaceValues(messageText, objValidationData.errorValue, fieldLabel);
  }

}
