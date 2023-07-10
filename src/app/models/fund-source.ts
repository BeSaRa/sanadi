import { AuditOperationTypes } from "@app/enums/audit-operation-types";
import { CommonUtils } from '@app/helpers/common-utils';
import { IAuditModelProperties } from '@app/interfaces/i-audit-model-properties';
import { ILanguageKeys } from '@app/interfaces/i-language-keys';
import { FundingResourceContract } from "@contracts/funding-resource-contract";
import { Cloneable } from "@models/cloneable";
import { ControlValueLabelLangKey } from './../types/types';
import { AdminResult } from "./admin-result";

export class FundSource extends Cloneable<FundSource> implements IAuditModelProperties<FundSource>, FundingResourceContract {
  auditOperation: AuditOperationTypes = AuditOperationTypes.NO_CHANGE;
  fullName!: string;
  totalCost!: number;
  notes!: string;
  itemId !: string;
  getAdminResultByProperty(property: keyof FundSource): AdminResult {
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

  getValuesWithLabels(): { [key: string]: ControlValueLabelLangKey } {
    return {
      fullName: { langKey: 'name', value: this.fullName },
      totalCost: { langKey: 'total_cost', value: this.totalCost },
      notes: { langKey: 'notes', value: this.notes },
      itemId : { langKey: {} as keyof ILanguageKeys, value: this.itemId  },
    };
  }

}
