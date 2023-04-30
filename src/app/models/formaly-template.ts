import { AuditOperationTypes } from '@app/enums/audit-operation-types';
import { CommonUtils } from '@app/helpers/common-utils';
import { IAuditModelProperties } from '@app/interfaces/i-audit-model-properties';
import { ControlValueLabelLangKey } from '@app/types/types';
import { AdminResult } from './admin-result';
import { ILanguageKeys } from '@app/interfaces/i-language-keys';
import { LangService } from '@app/services/lang.service';
import { FactoryService } from '@app/services/factory.service';
import { Cloneable } from './cloneable';
export class FormalyTemplate extends Cloneable<FormalyTemplate> implements IAuditModelProperties<FormalyTemplate>{
  id!: string
  identifyingName!: string;
  arName!: string;
  enName!: string;
  note!: string;
  order!: number;
  wrappers!: string;
  wrapper!: string;
  type!: number;
  pattern!: string;
  mask!: string | null;
  required!: boolean | null;
  options!:any[] ;
  value!: string;
  status!: number;
  showOnTable!: number;

  comparisonValue:any;

  langService!: LangService;

  getName(): string {
    const langService: LangService = FactoryService.getService('LangService');
    // @ts-ignore
    return this[(langService!.map.lang + 'Name') as keyof INames] || '';
  }

  constructor() {
    super();

  }
  getValuesWithLabels(): { [key: string]: ControlValueLabelLangKey } {
    return {
      value: { langKey: {} as keyof ILanguageKeys, value: this.value,comparisonValue: this.comparisonValue, label: () => this.getName() },
    };
  }
  // extra properties
  auditOperation: AuditOperationTypes = AuditOperationTypes.NO_CHANGE;
  // don't delete (used in case audit history)
  getAdminResultByProperty(property: keyof FormalyTemplate): AdminResult {
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
