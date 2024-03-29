import { ControlValueLabelLangKey } from './../types/types';
import { AuditOperationTypes } from "@app/enums/audit-operation-types";
import { CommonUtils } from "@app/helpers/common-utils";
import { Cloneable } from "@app/models/cloneable";
import { AdminResult } from "./admin-result";
import { IAuditModelProperties } from '@app/interfaces/i-audit-model-properties';

export class AmountOverYear extends Cloneable<AmountOverYear> implements IAuditModelProperties<AmountOverYear> {
  auditOperation: AuditOperationTypes = AuditOperationTypes.NO_CHANGE;
  year!: string;
  targetAmount!: number;
  itemId!:string;

  getValuesWithLabels(): { [key: string]: ControlValueLabelLangKey } {
    return {
      year: { langKey: 'year', value: this.year },
      targetAmount: { langKey: 'target_amount', value: this.targetAmount },
    };
  }
  getAdminResultByProperty(property: keyof AmountOverYear): AdminResult {
    let adminResultValue: AdminResult;
    switch (property) {
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
