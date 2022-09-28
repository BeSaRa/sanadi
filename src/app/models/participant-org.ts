import {ParticipatingOrgInterceptor} from './../model-interceptors/participating-org-interceptor';
import {Validators} from '@angular/forms';
import {dateSearchFields} from '@app/helpers/date-search-fields';
import {infoSearchFields} from '@app/helpers/info-search-fields';
import {normalSearchFields} from '@app/helpers/normal-search-fields';
import {AdminResult} from '@app/models/admin-result';
import {SearchableCloneable} from '@app/models/searchable-cloneable';
import {EmployeeService} from '@app/services/employee.service';
import {FactoryService} from '@app/services/factory.service';
import {ISearchFieldsMap} from '@app/types/types';
import {CustomValidators} from '../validators/custom-validators';
import {InterceptModel} from '@app/decorators/decorators/intercept-model';

const {send, receive} = new ParticipatingOrgInterceptor();

@InterceptModel({send, receive})
export class ParticipantOrg extends SearchableCloneable<ParticipantOrg> {
  organizationId!: number;
  arabicName!: string;
  englishName!: string;
  organizationOfficerName!: string;
  value!: number;

  managerDecisionInfo!: AdminResult;

  DisplayedColumns = ['arName', 'enName', 'managerDecisionInfo', 'actions'];
  employeeService: EmployeeService;
  searchFields: ISearchFieldsMap<ParticipantOrg> = {
    ...dateSearchFields([]),
    ...infoSearchFields(['managerDecisionInfo']),
    ...normalSearchFields(['arabicName', 'englishName']),
  };

  constructor() {
    super();
    this.employeeService = FactoryService.getService('EmployeeService');
  }

  finalizeSearchFields(): void {
    if (this.employeeService.isExternalUser()) {
      delete this.searchFields.ouInfo;
      delete this.searchFields.organizationId;
      delete this.searchFields.organization;
    }
  }

  BuildForm(controls?: boolean) {
    const {organizationId, arabicName, englishName} = this;
    return {
      organizationId: controls
        ? [
          organizationId,
          [Validators.required].concat(CustomValidators.number),
        ]
        : organizationId,
      arabicName: controls ? [arabicName, [Validators.required]] : arabicName,
      englishName: controls
        ? [englishName, [Validators.required]]
        : englishName,
    };
  }

  buildApprovalForm(controls?: boolean) {
    const {organizationOfficerName, value} = this;
    return {
      organizationOfficerName: controls ? [organizationOfficerName, [Validators.required]] : organizationOfficerName,
      value: controls ? [value, [Validators.required].concat(CustomValidators.decimal(
          CustomValidators.defaultLengths.DECIMAL_PLACES
        ),
        CustomValidators.maxLength(
          CustomValidators.defaultLengths.SWIFT_CODE_MAX
        ))] : value,

    };
  }
}
