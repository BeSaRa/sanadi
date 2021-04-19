import {CaseModel} from './case-model';
import {CustomValidators} from '../validators/custom-validators';
import {InquiryService} from '../services/inquiry.service';
import {FactoryService} from '../services/factory.service';

export class Inquiry extends CaseModel<InquiryService, Inquiry> {
  category!: number;
  email: string = '';
  fullName: string = '';
  mobileNo: string = '';
  occupation: string = '';
  organization: string = '';
  requestBody: string = '';

  service: InquiryService;

  constructor() {
    super();
    this.service = FactoryService.getService('InquiryService');
  }

  getFormData(control: boolean = false): any {
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
      fullName: control ? [fullName, [CustomValidators.required, CustomValidators.minLength(4)]] : fullName,
      email: control ? [email, [CustomValidators.required]] : email,
      mobileNo: control ? [mobileNo, [CustomValidators.required]] : mobileNo,
      occupation: control ? [occupation, [CustomValidators.required]] : occupation,
      organization: control ? [organization, [CustomValidators.required]] : organization,
      requestBody: control ? [requestBody, [CustomValidators.required]] : requestBody,
      competentDepartmentID: control ? [competentDepartmentID, [CustomValidators.required]] : competentDepartmentID,
      competentDepartmentAuthName: control ? [competentDepartmentAuthName, [CustomValidators.required]] : competentDepartmentAuthName
    };
  }
}
