import {CaseModel} from './case-model';
import {FactoryService} from '../services/factory.service';
import {CustomValidators} from '../validators/custom-validators';
import {InternationalCooperationService} from '../services/international-cooperation.service';
import {CaseTypes} from '@app/enums/case-types.enum';
import {ISearchFieldsMap} from '@app/types/types';
import {dateSearchFields} from '@app/helpers/date-search-fields';
import {infoSearchFields} from '@app/helpers/info-search-fields';
import {normalSearchFields} from '@app/helpers/normal-search-fields';

export class InternationalCooperation extends CaseModel<InternationalCooperationService, InternationalCooperation> {
  caseType: number = CaseTypes.INTERNATIONAL_COOPERATION;
  country!: string;
  email!: string;
  fullName!: string;
  mobileNo!: string;
  organization!: string;
  requestBody!: string;
  service: InternationalCooperationService;

  searchFields: ISearchFieldsMap<InternationalCooperation> = {
    ...dateSearchFields(['createdOn']),
    ...infoSearchFields(['creatorInfo', 'caseStatusInfo']),
    ...normalSearchFields(['fullSerial', 'organization', 'fullName'])
  }

  constructor() {
    super();
    this.service = FactoryService.getService('InternationalCooperationService');
    this.finalizeSearchFields();
  }

  finalizeSearchFields(): void {
    if (this.employeeService.isExternalUser()) {
      delete this.searchFields.ouInfo;
      delete this.searchFields.organizationId;
      delete this.searchFields.organization;
    }
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
      email: controls ? [email, [CustomValidators.required, CustomValidators.maxLength(50), CustomValidators.pattern('EMAIL')]] : email,
      fullName: controls ? [fullName, [CustomValidators.required,
        CustomValidators.minLength(4),
        CustomValidators.maxLength(100),
        CustomValidators.pattern('ENG_AR_ONLY')]] : fullName,
      mobileNo: controls ? [mobileNo, [CustomValidators.required].concat(CustomValidators.commonValidations.mobileNo)] : mobileNo,
      organization: controls ? [organization, [CustomValidators.maxLength(100)]] : organization,
      requestBody: controls ? [requestBody, [CustomValidators.required, CustomValidators.maxLength(1200)]] : requestBody,
      competentDepartmentID: controls ? [competentDepartmentID, [CustomValidators.required]] : competentDepartmentID,
      competentDepartmentAuthName: controls ? [competentDepartmentAuthName, [CustomValidators.required]] : competentDepartmentAuthName
    };
  }
}
