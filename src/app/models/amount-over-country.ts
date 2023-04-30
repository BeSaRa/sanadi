import { ControlValueLabelLangKey } from './../types/types';
import { AdminResult } from "./admin-result";
import { Cloneable } from "@app/models/cloneable";
import { AuditOperationTypes } from "@app/enums/audit-operation-types";
import { CommonUtils } from "@app/helpers/common-utils";

export class AmountOverCountry extends Cloneable<AmountOverCountry> {
  auditOperation: AuditOperationTypes = AuditOperationTypes.NO_CHANGE;
  targetAmount!: number;
  country!: number;
  countryInfo!: AdminResult;

  getValuesWithLabels(): { [key: string]: ControlValueLabelLangKey } {
    return {
      targetAmount: { langKey: 'target_amount', value: this.targetAmount },
      country: { langKey: 'country', value: this.country },
    };
  }
  getAdminResultByProperty(property: keyof AmountOverCountry): AdminResult {
    let adminResultValue: AdminResult;
    switch (property) {
      case 'country':
        adminResultValue = this.countryInfo;
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
