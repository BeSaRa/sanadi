import { ControlValueLabelLangKey } from './../types/types';
import { AuditOperationTypes } from '@app/enums/audit-operation-types';
import { AdminResult } from '@app/models/admin-result';
import { SearchableCloneable } from '@app/models/searchable-cloneable';
import { CommonUtils } from '@app/helpers/common-utils';
import { CustomValidators } from '@app/validators/custom-validators';

export class TransferFundsCharityPurpose extends SearchableCloneable<TransferFundsCharityPurpose> {
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
    const {
      projectName,
      projectType,
      domain,
      mainUNOCHACategory,
      mainDACCategory,
      beneficiaryCountry,
      executionCountry,
      totalCost,
      projectImplementationPeriod,
    } = this
    return {
      projectName: control ? [projectName, [CustomValidators.required, CustomValidators.maxLength(CustomValidators.defaultLengths.ENGLISH_NAME_MAX)]] : projectName,
      projectType: control ? [projectType, [CustomValidators.required]] : projectType,
      domain: control ? [domain, [CustomValidators.required]] : domain,
      mainUNOCHACategory: control ? [mainUNOCHACategory, []] : mainUNOCHACategory,
      mainDACCategory: control ? [mainDACCategory, []] : mainDACCategory,
      beneficiaryCountry: control ? [beneficiaryCountry, [CustomValidators.required]] : beneficiaryCountry,
      executionCountry: control ? [executionCountry, [CustomValidators.required]] : executionCountry,
      totalCost: control ? [totalCost, [CustomValidators.required, CustomValidators.number, CustomValidators.maxLength(20)]] : totalCost,
      projectImplementationPeriod: control ? [projectImplementationPeriod, [CustomValidators.required, CustomValidators.number, CustomValidators.maxLength(2)]] : projectImplementationPeriod
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
