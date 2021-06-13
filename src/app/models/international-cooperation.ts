import {CaseModel} from './case-model';
import {FactoryService} from '../services/factory.service';
import {CustomValidators} from '../validators/custom-validators';
import {Validators} from '@angular/forms';
import {InternationalCooperationService} from '../services/international-cooperation.service';

export class InternationalCooperation extends CaseModel<InternationalCooperationService, InternationalCooperation> {
  caseType: number = 3;
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

  getFormFields(controls: boolean = false): any {
    const {
      country,
      email,
      fullName,
      mobileNo,
      organization,
      requestBody,
      competentDepartmentID,
      competentDepartmentAuthName
    } = this;

    return {
      country: controls ? [country, [CustomValidators.required]] : country,
      email: controls ? [email, [CustomValidators.required, Validators.email]] : email,
      fullName: controls ? [fullName, [CustomValidators.required,
        CustomValidators.minLength(4),
        CustomValidators.pattern('ENG_AR_ONLY')]] : fullName,
      mobileNo: controls ? [mobileNo, [CustomValidators.number]] : mobileNo,
      organization: controls ? [organization, []] : organization,
      requestBody: controls ? [requestBody, [CustomValidators.required]] : requestBody,
      competentDepartmentID: controls ? [competentDepartmentID, [CustomValidators.required]] : competentDepartmentID,
      competentDepartmentAuthName: controls ? [competentDepartmentAuthName, [CustomValidators.required]] : competentDepartmentAuthName
    };
  }
}
