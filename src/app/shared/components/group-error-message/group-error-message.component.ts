import {Component, HostBinding, Input, OnInit, Optional} from '@angular/core';
import {ControlContainer, UntypedFormGroup} from '@angular/forms';
import {LangService} from '@app/services/lang.service';
import {CustomValidators} from '@app/validators/custom-validators';

@Component({
  selector: 'group-error-message',
  templateUrl: './group-error-message.component.html',
  styleUrls: ['./group-error-message.component.scss']
})
export class GroupErrorMessageComponent implements OnInit {
  @Input() group?: UntypedFormGroup;
  @HostBinding('class') containerClass = 'invalid-feedback position-absolute';

  constructor(private langService: LangService, @Optional() private parent: ControlContainer) { }

  ngOnInit(): void {
  }

  get errorMessage(): (string | null) {
    if (!this.group && parent) {
      this.group = this.parent.control as UntypedFormGroup;
    }

    if (!this.group) {
      return null;
    }

    let objValidationData;
    for (const errorName in this.group.errors) {
      if (this.group.errors.hasOwnProperty(errorName)) {
        objValidationData = CustomValidators.getValidationData(this.group, (errorName || ''));
        break;
      }
    }
    if (!objValidationData || !objValidationData.message) {
      return null;
    }

    // @ts-ignore
    const messageText = this.langService.map[objValidationData.message.key];
    if (!objValidationData.message.replaceValues) {
      return messageText;
    }
    return objValidationData.message.replaceValues(messageText, objValidationData.errorValue, '');
  }

}
