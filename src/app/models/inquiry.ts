import {CaseModel} from './case-model';
import {CustomValidators} from '../validators/custom-validators';
import {InquiryService} from '../services/inquiry.service';
import {FactoryService} from '../services/factory.service';

export class Inquiry extends CaseModel<InquiryService, Inquiry> {
  caseType: number = 1;
  category!: number;
  email!: string;
  fullName!: string;
  mobileNo!: string;
  occupation!: string;
  organization!: string;
  requestBody!: string;

  service: InquiryService;

  constructor() {
    super();
    this.service = FactoryService.getService('InquiryService');
  }

  getFormFields(control: boolean = false): any {
    const {
      category,
      fullName,
      email,
      mobileNo,
      occupation,
      organization,
      requestBody,
      competentDepartmentID,
      competentDepartmentAuthName
    } = this;

    return {
      category: control ? [category, [CustomValidators.required]] : category,
      fullName: control ? [fullName, [CustomValidators.required,
        CustomValidators.minLength(4),
        CustomValidators.maxLength(100),
        CustomValidators.pattern('ENG_AR_ONLY')]] : fullName,
      email: control ? [email, [CustomValidators.required, CustomValidators.pattern('EMAIL')]] : email,
      mobileNo: control ? [mobileNo, [CustomValidators.required, CustomValidators.number, CustomValidators.maxLength(20)]] : mobileNo,
      occupation: control ? [occupation, [CustomValidators.maxLength(100)]] : occupation,
      organization: control ? [organization, [CustomValidators.maxLength(100)]] : organization,
      requestBody: control ? [requestBody, [CustomValidators.required, CustomValidators.maxLength(1200)]] : requestBody,
      competentDepartmentID: control ? [competentDepartmentID, [CustomValidators.required]] : competentDepartmentID,
      competentDepartmentAuthName: control ? [competentDepartmentAuthName, [CustomValidators.required]] : competentDepartmentAuthName
    };
  }
}
