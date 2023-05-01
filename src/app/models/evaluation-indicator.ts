import { SearchableCloneable } from '@app/models/searchable-cloneable';
import { AdminResult } from '@app/models/admin-result';
import { IAuditModelProperties } from '@app/interfaces/i-audit-model-properties';
import { AuditOperationTypes } from '@app/enums/audit-operation-types';
import { CommonUtils } from '@app/helpers/common-utils';
import { ControlValueLabelLangKey } from '@app/types/types';

export class EvaluationIndicator extends SearchableCloneable<EvaluationIndicator> implements IAuditModelProperties<EvaluationIndicator> {
  indicator!: number;
  percentage!: number;
  notes!: string;
  indicatorInfo?: AdminResult;

  getAdminResultByProperty(property: keyof EvaluationIndicator): AdminResult {
    let adminResultValue: AdminResult;
    switch (property) {
      case 'indicator':
        adminResultValue = this.indicatorInfo!;
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
      indicator:{ langKey: 'indicator', value: this.indicator },
      percentage:{ langKey: 'percentage', value: this.percentage },
      notes:{ langKey: 'notes', value: this.notes },
    };
  }
}
