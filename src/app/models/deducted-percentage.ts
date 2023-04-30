import { ControlValueLabelLangKey } from './../types/types';
import { AuditOperationTypes } from "@app/enums/audit-operation-types";
import { CommonUtils } from "@app/helpers/common-utils";
import { AdminResult } from "@app/models/admin-result";
import { Cloneable } from "@app/models/cloneable";

export class DeductedPercentage extends Cloneable<DeductedPercentage> {
  auditOperation: AuditOperationTypes = AuditOperationTypes.NO_CHANGE;
  deductionType!: number;
  deductionTypeInfo!: AdminResult;
  deductionPercent!: number;

  getValuesWithLabels(): { [key: string]: ControlValueLabelLangKey } {
    return {
      deductionType: { langKey: 'deduction_type', value: this.deductionType },
      deductionPercent: { langKey: 'deduction_ratio', value: this.deductionPercent },
    };
  }
  getAdminResultByProperty(property: keyof DeductedPercentage): AdminResult {
    let adminResultValue: AdminResult;
    switch (property) {
      case 'deductionType':
        adminResultValue = this.deductionTypeInfo;
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

