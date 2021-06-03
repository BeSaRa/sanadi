import {CaseModel} from './case-model';
import {FactoryService} from '../services/factory.service';
import {CustomValidators} from '../validators/custom-validators';
import {Validators} from '@angular/forms';
import {InternationalCooperationService} from '../services/international-cooperation.service';

export class InternationalCooperation extends CaseModel<InternationalCooperationService, InternationalCooperation> {
  country!: string;
  email: string = '';
  fullName: string = '';
  mobileNo: string = '';
  organization: string = '';
  requestBody: string = '';
  service: InternationalCooperationService;

  constructor() {
    super();
    this.service = FactoryService.getService('InternationalCooperationService');
  }

  getFormFields(control: boolean = false): any {
    const {
      country,
      email,
      fullName,
      mobileNo,
      organization,
      requestBody
    } = this;

    return {
      country: control ? [country, [CustomValidators.required]] : country,
      email: control ? [email, [CustomValidators.required, Validators.email]] : email,
      fullName: control ? [fullName, [CustomValidators.required,
        CustomValidators.minLength(4),
        CustomValidators.pattern('ENG_AR_ONLY')]] : fullName,
      mobileNo: control ? [mobileNo, [CustomValidators.required, CustomValidators.number]] : mobileNo,
      organization: control ? [organization, []] : organization,
      requestBody: control ? [requestBody, [CustomValidators.required]] : requestBody
    };
  }
}
