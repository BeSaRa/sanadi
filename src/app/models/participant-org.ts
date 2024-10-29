import { Validators } from '@angular/forms';
import { InterceptModel } from '@app/decorators/decorators/intercept-model';
import { infoSearchFields } from '@app/helpers/info-search-fields';
import { normalSearchFields } from '@app/helpers/normal-search-fields';
import { AdminResult } from '@app/models/admin-result';
import { SearchableCloneable } from '@app/models/searchable-cloneable';
import { EmployeeService } from '@app/services/employee.service';
import { FactoryService } from '@app/services/factory.service';
import { ControlValueLabelLangKey, ISearchFieldsMap } from '@app/types/types';
import { CustomValidators } from '../validators/custom-validators';
import { ParticipatingOrgInterceptor } from './../model-interceptors/participating-org-interceptor';
import { IAuditModelProperties } from '@app/interfaces/i-audit-model-properties';
import { AuditOperationTypes } from '@app/enums/audit-operation-types';
import { CommonUtils } from '@app/helpers/common-utils';

const {send, receive} = new ParticipatingOrgInterceptor();

@InterceptModel({send, receive})
export class ParticipantOrg extends SearchableCloneable<ParticipantOrg> implements IAuditModelProperties<ParticipantOrg> {
  organizationId!: number;
  arabicName!: string;
  englishName!: string;
  organizationOfficerName!: string;
  value!: number;
  notes!: string;

  managerDecision!:number;
  managerDecisionInfo!: AdminResult;

  DisplayedColumns = ['arName', 'enName', 'managerDecisionInfo','value', 'notes' ,'actions'];
  employeeService: EmployeeService;
  searchFields: ISearchFieldsMap<ParticipantOrg> = {
    ...infoSearchFields(['managerDecisionInfo']),
    ...normalSearchFields(['arabicName', 'englishName','value']),
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
  getAdminResultByProperty(property: keyof ParticipantOrg): AdminResult {
    let adminResultValue: AdminResult;
    switch (property) {
      case 'managerDecision':
        adminResultValue = this.managerDecisionInfo;
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
  auditOperation: AuditOperationTypes = AuditOperationTypes.NO_CHANGE;

  getValuesWithLabels(): { [key: string]: ControlValueLabelLangKey } {
    return {
      organizationId:{ langKey: 'organization', value: this.organizationId },
      arabicName:{ langKey: 'arabic_name', value: this.arabicName },
      englishName:{ langKey: 'english_name', value: this.englishName },
      value:{ langKey: 'participating_value', value: this.value },
      notes:{ langKey: 'notes', value: this.notes },
      managerDecision:{ langKey: 'request_state', value: this.managerDecision },
      organizationOfficerName:{ langKey: 'organization_officers', value: this.organizationOfficerName },
     };
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
      value: controls ? [value, [CustomValidators.decimal(
          CustomValidators.defaultLengths.DECIMAL_PLACES
        ),
        CustomValidators.maxLength(
          CustomValidators.defaultLengths.NUMBERS_MAXLENGTH
        )]] : value,

    };
  }
}
