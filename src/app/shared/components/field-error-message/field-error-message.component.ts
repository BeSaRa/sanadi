import {Component, Input, HostBinding} from '@angular/core';
import {AbstractControl} from '@angular/forms';
import {CustomValidators} from '../../../validators/custom-validators';
import {LangService} from '../../../services/lang.service';

@Component({
  selector: 'app-field-error-message',
  templateUrl: './field-error-message.component.html',
  styleUrls: ['./field-error-message.component.scss']
})
export class FieldErrorMessageComponent {
  @Input() control: (AbstractControl | null | undefined);
  @Input() labelKey?: string;
  @Input() labelText?: string;

  @HostBinding('class') containerClass = 'invalid-feedback position-absolute';

  constructor(private langService: LangService) {
  }

  get errorMessage(): (string | null) {
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
