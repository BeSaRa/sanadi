import { IAuditModelProperties } from './../interfaces/i-audit-model-properties';
import { ControlValueLabelLangKey } from './../types/types';
import { AuditOperationTypes } from '@app/enums/audit-operation-types';
import { AdminResult } from '@app/models/admin-result';
import { SearchableCloneable } from '@app/models/searchable-cloneable';
import { CommonUtils } from '@app/helpers/common-utils';
import { CustomValidators } from '@app/validators/custom-validators';
import { ObjectUtils } from '@app/helpers/object-utils';

export class TransferFundsCharityPurpose extends SearchableCloneable<TransferFundsCharityPurpose> implements IAuditModelProperties<TransferFundsCharityPurpose> {
  auditOperation: AuditOperationTypes = AuditOperationTypes.NO_CHANGE;
  mainDACCategory!: number;
  mainUNOCHACategory!: number;
  projectName!: string;
  projectType!: number;
  totalCost!: number;
  projectImplementationPeriod!: number;
  domain!: number;
  beneficiaryCountry!: number;
  executionCountry!: number;
  domainInfo!: AdminResult;
  mainDACCategoryInfo!: AdminResult;
  mainUNOCHACategoryInfo!: AdminResult;
  projectTypeInfo!: AdminResult;
  beneficiaryCountryInfo!: AdminResult;
  executionCountryInfo!: AdminResult;

  isEqual(purpose: TransferFundsCharityPurpose): boolean {
    return purpose.projectName === this.projectName &&
      purpose.projectType === this.projectType &&
      purpose.totalCost === this.totalCost &&
      purpose.projectImplementationPeriod === this.projectImplementationPeriod &&
      purpose.domain === this.domain &&
      purpose.beneficiaryCountry === this.beneficiaryCountry &&
      purpose.executionCountry === this.executionCountry;
  }

  isNotEqual(purpose: TransferFundsCharityPurpose): boolean {
    return purpose.projectName !== this.projectName ||
      purpose.projectType !== this.projectType ||
      purpose.totalCost !== this.totalCost ||
      purpose.projectImplementationPeriod !== this.projectImplementationPeriod ||
      purpose.domain !== this.domain ||
      purpose.beneficiaryCountry !== this.beneficiaryCountry ||
      purpose.executionCountry !== this.executionCountry;
  }

  getValuesWithLabels(): { [key: string]: ControlValueLabelLangKey } {
    return {
      projectName: { langKey: 'project_name', value: this.projectName },
      projectType: { langKey: 'project_type', value: this.projectType },
      domain: { langKey: 'domain', value: this.domain },
      mainUNOCHACategory: { langKey: 'ocha', value: this.mainUNOCHACategory },
      mainDACCategory: { langKey: 'dac', value: this.mainDACCategory },
      beneficiaryCountry: { langKey: 'beneficiary_country', value: this.beneficiaryCountry },
      executionCountry: { langKey: 'execution_country', value: this.executionCountry },
      totalCost: { langKey: 'total_cost', value: this.totalCost },
      projectImplementationPeriod: { langKey: 'execution_period_in_months', value: this.projectImplementationPeriod },
    };
  }
  buildForm(control: boolean = false) {
    const values = ObjectUtils.getControlValues<TransferFundsCharityPurpose>(this.getValuesWithLabels())

    return {
      projectName: control ? [values.projectName, [CustomValidators.required, CustomValidators.maxLength(CustomValidators.defaultLengths.ENGLISH_NAME_MAX)]] : values.projectName,
      projectType: control ? [values.projectType, [CustomValidators.required]] : values.projectType,
      domain: control ? [values.domain, [CustomValidators.required]] : values.domain,
      mainUNOCHACategory: control ? [values.mainUNOCHACategory, []] : values.mainUNOCHACategory,
      mainDACCategory: control ? [values.mainDACCategory, []] : values.mainDACCategory,
      beneficiaryCountry: control ? [values.beneficiaryCountry, [CustomValidators.required]] : values.beneficiaryCountry,
      executionCountry: control ? [values.executionCountry, [CustomValidators.required]] : values.executionCountry,
      totalCost: control ? [values.totalCost, [CustomValidators.required, CustomValidators.number, CustomValidators.maxLength(20)]] : values.totalCost,
      projectImplementationPeriod: control ? [values.projectImplementationPeriod, [CustomValidators.required, CustomValidators.number, CustomValidators.maxLength(2)]] : values.projectImplementationPeriod
    }
  }
  getAdminResultByProperty(property: keyof TransferFundsCharityPurpose): AdminResult {
    let adminResultValue: AdminResult;
    switch (property) {
      case 'domain':
        adminResultValue = this.domainInfo;
        break;
      case 'mainDACCategory':
        adminResultValue = this.mainDACCategoryInfo;
        break;
      case 'mainUNOCHACategory':
        adminResultValue = this.mainUNOCHACategoryInfo;
        break;
      case 'projectType':
        adminResultValue = this.projectTypeInfo;
        break;
      case 'beneficiaryCountry':
        adminResultValue = this.beneficiaryCountryInfo;
        break;
      case 'executionCountry':
        adminResultValue = this.executionCountryInfo;
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
