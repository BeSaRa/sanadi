import { AdminResult } from '@app/models/admin-result';
import { CaseModel } from './case-model';
import { CustomValidators } from '../validators/custom-validators';
import { InquiryService } from '@services/inquiry.service';
import { FactoryService } from '@services/factory.service';
import { dateSearchFields } from "@app/helpers/date-search-fields";
import { ControlValueLabelLangKey, ISearchFieldsMap } from "@app/types/types";
import { CaseTypes } from "@app/enums/case-types.enum";
import { infoSearchFields } from "@app/helpers/info-search-fields";
import { normalSearchFields } from "@app/helpers/normal-search-fields";
import { InterceptModel } from "@decorators/intercept-model";
import { InquiryInterceptor } from "@app/model-interceptors/inquiry-interceptor";
import { ObjectUtils } from '@app/helpers/object-utils';
import {CommonUtils} from "@helpers/common-utils";

const interceptor = new InquiryInterceptor()

@InterceptModel({
  send: interceptor.send,
  receive: interceptor.receive
})
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
  getFormValuesWithLabels(): { [key: string]: ControlValueLabelLangKey } {
    return {
      category: {langKey:'subject',value:this.category},
      fullName: {langKey:'full_name',value:this.fullName},
      email: {langKey:'lbl_email',value:this.email},
      mobileNo: {langKey:'mobile_number',value:this.mobileNo},
      occupation: {langKey:'occupation',value:this.occupation},
      organization: {langKey:'lbl_organization',value:this.organization},
      requestBody: {langKey:'request_body',value:this.requestBody},
      competentDepartmentID: {langKey:'competent_dep',value:this.competentDepartmentID},
      // competentDepartmentAuthName: {langKey:'',value:this.competentDepartmentAuthName}
    };
  }
  getFormFields(control: boolean = false): any {
    const values = ObjectUtils.getControlValues<Inquiry>(
      this.getFormValuesWithLabels()
    );


    return {
      category: control ? [values.category, [CustomValidators.required]] : values.category,
      fullName: control ? [values.fullName, [CustomValidators.required,
        CustomValidators.minLength(4),
        CustomValidators.maxLength(100),
        CustomValidators.pattern('ENG_AR_ONLY')]] : values.fullName,
      email: control ? [values.email, [CustomValidators.required, CustomValidators.maxLength(50), CustomValidators.pattern('EMAIL')]] : values.email,
      mobileNo: control ? [values.mobileNo, [CustomValidators.required].concat(CustomValidators.commonValidations.mobileNo)] :values. mobileNo,
      occupation: control ? [values.occupation, [CustomValidators.maxLength(100)]] :values. occupation,
      organization: control ? [values.organization, [CustomValidators.maxLength(100)]] :values. organization,
      requestBody: control ? [values.requestBody, [CustomValidators.required, CustomValidators.maxLength(CustomValidators.defaultLengths.EXPLANATIONS)]] :values. requestBody,
      competentDepartmentID: control ? [values.competentDepartmentID, [CustomValidators.required]] : values.competentDepartmentID,
      competentDepartmentAuthName: control ? [values.competentDepartmentAuthName, [CustomValidators.required]] :values. competentDepartmentAuthName
    };
  }
  getAdminResultByProperty(property: keyof Inquiry): AdminResult {
    let adminResultValue: AdminResult;
    switch (property) {
      case 'category':
        adminResultValue = this.categoryInfo;
        break;
      case 'organizationId':
        adminResultValue = this.ouInfo;
        break;
      case 'caseStatus':
        adminResultValue = this.caseStatusInfo;
        break;

      default:
        let value: any = this[property];
        if (!CommonUtils.isValidValue(value) || typeof value === 'object') {
          value = '';
        }
        adminResultValue = AdminResult.createInstance({ arName: value as string, enName: value as string });
    }
    return adminResultValue ?? new AdminResult();
  }
}
