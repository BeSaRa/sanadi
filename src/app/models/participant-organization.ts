import { ControlValueLabelLangKey } from './../types/types';
import { SearchableCloneable } from '@app/models/searchable-cloneable';
import { IMyDateModel } from 'angular-mydatepicker';
import { LangService } from '@services/lang.service';
import { FactoryService } from '@services/factory.service';
import { Lookup } from '@app/models/lookup';
import { AuditOperationTypes } from '@app/enums/audit-operation-types';
import { AdminResult } from './admin-result';
import { CommonUtils } from '@app/helpers/common-utils';
import { DateUtils } from '@app/helpers/date-utils';
import { IAuditModelProperties } from '@app/interfaces/i-audit-model-properties';

export class ParticipantOrganization extends SearchableCloneable<ParticipantOrganization> implements IAuditModelProperties<ParticipantOrganization> {
  auditOperation: AuditOperationTypes = AuditOperationTypes.NO_CHANGE;
  organizationId!: number;
  arabicName!: string;
  englishName!: string;
  donation?: number;
  workStartDate?: string | IMyDateModel;
  langService: LangService;
  managerDecisionInfo!: Lookup|AdminResult;

  constructor() {
    super();
    this.langService = FactoryService.getService('LangService');
  }

  getName() {
    return this.langService?.map.lang == 'ar' ? this.arabicName : this.englishName;
  }

  getValuesWithLabels(): { [key: string]: ControlValueLabelLangKey } {
    return {
      arabicName: { langKey: 'campaign_name', value: this.arabicName },
      englishName: { langKey: 'campaign_name', value: this.englishName },
      donation: { langKey: 'campaign_name', value: this.donation },
      workStartDate: { langKey: 'campaign_name', value: this.workStartDate },
    };
  }
  getAdminResultByProperty(property: keyof ParticipantOrganization): AdminResult {
    let adminResultValue: AdminResult;
    switch (property) {
      case 'workStartDate':
        const licenseEndDate = DateUtils.getDateStringFromDate(this.workStartDate, 'DATEPICKER_FORMAT');
        adminResultValue = AdminResult.createInstance({ arName: licenseEndDate, enName: licenseEndDate });
        break;
      case 'managerDecisionInfo':
        adminResultValue = AdminResult.createInstance({ arName: this.managerDecisionInfo.arName, enName: this.managerDecisionInfo.enName });
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
