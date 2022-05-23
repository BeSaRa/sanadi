import { CaseModel } from './case-model';
import { ConsultationService } from '@services/consultation.service';
import { FactoryService } from '@services/factory.service';
import { CustomValidators } from '../validators/custom-validators';
import { AdminResult } from './admin-result';
import { ISearchFieldsMap } from "@app/types/types";
import { dateSearchFields } from "@app/helpers/date-search-fields";
import { infoSearchFields } from "@app/helpers/info-search-fields";
import { normalSearchFields } from "@app/helpers/normal-search-fields";
import { InterceptModel } from "@decorators/intercept-model";
import { ConsultationInterceptor } from "@app/model-interceptors/consultation-interceptor";
import { CaseTypes } from "@app/enums/case-types.enum";

const interceptor = new ConsultationInterceptor()

@InterceptModel({
  send: interceptor.send,
  receive: interceptor.receive
})
export class Consultation extends CaseModel<ConsultationService, Consultation> {
  caseType: number = CaseTypes.CONSULTATION;
  category!: number;
  email!: string;
  fullName!: string;
  mobileNo!: string;
  organizationId!: number;
  requestBody!: string;
  categoryInfo!: AdminResult;
  service: ConsultationService;
  organizationInfo!: AdminResult;
  searchFields: ISearchFieldsMap<Consultation> = {
    ...dateSearchFields(['createdOn']),
    ...infoSearchFields(['creatorInfo', 'caseStatusInfo', 'organizationInfo', 'categoryInfo']),
    ...normalSearchFields(['fullName', 'fullSerial'])
  }

  constructor() {
    super();
    this.service = FactoryService.getService('ConsultationService');
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
      organizationId,
      fullName,
      mobileNo,
      email,
      requestBody,
      competentDepartmentID,
      competentDepartmentAuthName
    } = this;

    return {
      category: control ? [category, [CustomValidators.required]] : category,
      organizationId: control ? [organizationId, [CustomValidators.required]] : organizationId,
      fullName: control ? [fullName, [CustomValidators.required,
        CustomValidators.minLength(4),
        CustomValidators.maxLength(100),
        CustomValidators.pattern('ENG_AR_NUM_ONLY')]] : fullName,
      mobileNo: control ? [mobileNo, [CustomValidators.required].concat(CustomValidators.commonValidations.mobileNo)] : mobileNo,
      email: control ? [email, [CustomValidators.required, CustomValidators.maxLength(50), CustomValidators.pattern('EMAIL')]] : email,
      requestBody: control ? [requestBody, [CustomValidators.required, CustomValidators.maxLength(CustomValidators.defaultLengths.EXPLANATIONS)]] : requestBody,
      competentDepartmentID: control ? [competentDepartmentID] : competentDepartmentID,
      competentDepartmentAuthName: control ? [competentDepartmentAuthName] : competentDepartmentAuthName
    };
  }
}
