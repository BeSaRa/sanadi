import {AuditOperationTypes} from '@app/enums/audit-operation-types';
import {CommonUtils} from '@app/helpers/common-utils';
import {IAuditModelProperties} from '@app/interfaces/i-audit-model-properties';
import {AdminResult} from '@app/models/admin-result';
import {SearchableCloneable} from '@app/models/searchable-cloneable';
import {ControlValueLabelLangKey} from '@app/types/types';

export class GeneralAssociationAgenda extends SearchableCloneable<GeneralAssociationAgenda>  implements IAuditModelProperties<GeneralAssociationAgenda>{
  description!: string;

  constructor() {
    super();
  }
// don't delete (used in case audit history)
getAdminResultByProperty(property: keyof GeneralAssociationAgenda): AdminResult {
  let adminResultValue: AdminResult;
  switch (property) {

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
    description:{langKey: 'lbl_description', value: this.description},

  };
}

}
