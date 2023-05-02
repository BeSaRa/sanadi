import { ControlValueLabelLangKey } from './../types/types';
import { AdminResult } from '@app/models/admin-result';
import { SearchableCloneable } from '@app/models/searchable-cloneable';
import { ISearchFieldsMap } from '@app/types/types';
import { normalSearchFields } from '@helpers/normal-search-fields';
import { infoSearchFields } from '@helpers/info-search-fields';
import { CustomValidators } from '@app/validators/custom-validators';
import { AuditOperationTypes } from '@app/enums/audit-operation-types';
import { CommonUtils } from '@app/helpers/common-utils';
import { ObjectUtils } from '@app/helpers/object-utils';

export class OfficeEvaluation extends SearchableCloneable<OfficeEvaluation>{
  auditOperation: AuditOperationTypes = AuditOperationTypes.NO_CHANGE;
  evaluationHub!: number;
  evaluationResult!: number;
  notes!: string;
  evaluationHubInfo!: AdminResult;
  evaluationResultInfo!: AdminResult;

  constructor() {
    super();
  }

  searchFields: ISearchFieldsMap<OfficeEvaluation> = {
    ...normalSearchFields(['notes']),
    ...infoSearchFields(['evaluationHubInfo', 'evaluationResultInfo'])
  }

  getAdminResultByProperty(property: keyof OfficeEvaluation): AdminResult {
    let adminResultValue: AdminResult;
    switch (property) {
      case 'evaluationHub':
        adminResultValue = this.evaluationHubInfo;
        break;
      case 'evaluationResult':
        adminResultValue = this.evaluationResultInfo;
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

  getValuesWithLabels(): { [key: string]: ControlValueLabelLangKey } {
    return {
      evaluationHub: { langKey: 'evaluation_hub', value: this.evaluationHub },
      evaluationResult: { langKey: 'evaluation_result', value: this.evaluationResult },
      notes: { langKey: 'notes', value: this.notes },
    };
  }
  buildForm(controls?: boolean) {
    const values = ObjectUtils.getControlValues<OfficeEvaluation>(this.getValuesWithLabels())

    return {
      evaluationHub: controls ? [values.evaluationHub, [CustomValidators.required]] : values.evaluationHub,
      evaluationResult: controls ? [values.evaluationResult, [CustomValidators.required]] : values.evaluationResult,
      notes: controls ? [values.notes, [CustomValidators.maxLength(CustomValidators.defaultLengths.EXPLANATIONS)]] : values.notes
    };
  }
}
