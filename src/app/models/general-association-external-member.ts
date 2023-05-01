import { AuditOperationTypes } from '@app/enums/audit-operation-types';
import { CommonUtils } from '@app/helpers/common-utils';
import { IAuditModelProperties } from '@app/interfaces/i-audit-model-properties';
import { AdminResult } from '@app/models/admin-result';
import { SearchableCloneable } from '@app/models/searchable-cloneable';
import { ControlValueLabelLangKey } from '@app/types/types';
import { FactoryService } from '@services/factory.service';
import { LangService } from '@services/lang.service';

export class GeneralAssociationExternalMember extends SearchableCloneable<GeneralAssociationExternalMember>  implements IAuditModelProperties<GeneralAssociationExternalMember>{
  id?: number;
  arabicName!: string;
  englishName!: string;
  jobTitleId!: number;
  identificationNumber!: number;
  jobTitleInfo!: AdminResult;
  langService!: LangService;

  constructor() {
    super();
    this.langService = FactoryService.getService('LangService');
  }
// don't delete (used in case audit history)
getAdminResultByProperty(property: keyof GeneralAssociationExternalMember): AdminResult {
  let adminResultValue: AdminResult;
  switch (property) {
    case 'jobTitleId':
      adminResultValue = this.jobTitleInfo;
      break;
    default:
      let value: any = this[property];
      if (!CommonUtils.isValidValue(value) || typeof value === 'object') {
        value = '';
      }
      adminResultValue = AdminResult.createInstance({arName: value as string, enName: value as string});
  }
  return adminResultValue ?? new AdminResult();
}
 // extra properties
 auditOperation: AuditOperationTypes = AuditOperationTypes.NO_CHANGE;
 getValuesWithLabels(): { [key: string]: ControlValueLabelLangKey } {
  return {
    id:{langKey: 'id_number', value: this.id},
    arabicName:{langKey: 'arabic_name', value: this.arabicName},
    englishName:{langKey: 'english_name', value: this.englishName},
    jobTitleId:{langKey: 'job_title', value: this.jobTitleId},
    identificationNumber:{langKey: 'identification_number', value: this.identificationNumber},
  };
}
  getName(): string {
    return this.langService.map.lang === 'ar' ? this.arabicName : this.englishName;
  }
}
