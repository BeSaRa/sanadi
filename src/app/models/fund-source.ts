import { ControlValueLabelLangKey } from './../types/types';
import {Cloneable} from "@models/cloneable";
import {FundingResourceContract} from "@contracts/funding-resource-contract";
import { AuditOperationTypes } from "@app/enums/audit-operation-types";
import { AdminResult } from "./admin-result";
import { CommonUtils } from '@app/helpers/common-utils';

export class FundSource extends Cloneable<FundSource> implements FundingResourceContract {
  auditOperation: AuditOperationTypes = AuditOperationTypes.NO_CHANGE;
  fullName!: string;
  totalCost!: number;
  notes!: string;

  getAdminResultByProperty(property: keyof FundSource): AdminResult {
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

  getValuesWithLabels(): { [key: string]: ControlValueLabelLangKey } {
    return {
      fullName: {langKey: 'name', value: this.fullName},
      totalCost: {langKey: 'total_cost', value: this.totalCost},
      notes: {langKey: 'notes', value: this.notes},
    };
  }

}
