import {CaseModel} from './case-model';
import {CustomValidators} from '../validators/custom-validators';
import {InquiryService} from '../services/inquiry.service';
import {FactoryService} from '../services/factory.service';
import {dateSearchFields} from "@app/helpers/date-search-fields";
import {ISearchFieldsMap} from "@app/types/types";
import {CaseTypes} from "@app/enums/case-types.enum";
import {infoSearchFields} from "@app/helpers/info-search-fields";
import {normalSearchFields} from "@app/helpers/normal-search-fields";

export class Inquiry extends CaseModel<InquiryService, Inquiry> {
  caseType: number = CaseTypes.INQUIRY;
  category!: number;
  email!: string;
  fullName!: string;
  mobileNo!: string;
  occupation!: string;
  organization!: string;
  requestBody!: string;

  service: InquiryService;
  searchFields: ISearchFieldsMap<Inquiry> = {
    ...dateSearchFields(['createdOn']),
    ...infoSearchFields(['categoryInfo', 'caseStatusInfo']),
    ...normalSearchFields(['fullName', 'organization'])
  }

  constructor() {
    super();
    this.service = FactoryService.getService('InquiryService');
    this.finalizeSearchFields();
  }

  finalizeSearchFields(): void {
    if (this.employeeService.isExternalUser()) {
      delete this.searchFields.ouInfo;
      delete this.searchFields.organizationId;
      delete this.searchFields.organization;
    }
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
      email: control ? [email, [CustomValidators.required, CustomValidators.maxLength(50), CustomValidators.pattern('EMAIL')]] : email,
      mobileNo: control ? [mobileNo, [CustomValidators.required].concat(CustomValidators.commonValidations.mobileNo)] : mobileNo,
      occupation: control ? [occupation, [CustomValidators.maxLength(100)]] : occupation,
      organization: control ? [organization, [CustomValidators.maxLength(100)]] : organization,
      requestBody: control ? [requestBody, [CustomValidators.required, CustomValidators.maxLength(CustomValidators.defaultLengths.EXPLANATIONS)]] : requestBody,
      competentDepartmentID: control ? [competentDepartmentID, [CustomValidators.required]] : competentDepartmentID,
      competentDepartmentAuthName: control ? [competentDepartmentAuthName, [CustomValidators.required]] : competentDepartmentAuthName
    };
  }
}
