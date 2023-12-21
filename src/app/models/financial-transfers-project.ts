import {AdminResult} from './admin-result';
import {normalSearchFields} from '@app/helpers/normal-search-fields';
import {ControlValueLabelLangKey, ISearchFieldsMap} from '@app/types/types';
import {CustomValidators} from '../validators/custom-validators';
import {SearchableCloneable} from './searchable-cloneable';
import {IAuditModelProperties} from '@app/interfaces/i-audit-model-properties';
import {AuditOperationTypes} from '@app/enums/audit-operation-types';
import {CommonUtils} from '@app/helpers/common-utils';

export class FinancialTransfersProject extends SearchableCloneable<FinancialTransfersProject> implements IAuditModelProperties<FinancialTransfersProject> {
  // extra properties
  auditOperation: AuditOperationTypes = AuditOperationTypes.NO_CHANGE;

  fullSerial!: string;
  qatariTransactionAmount!: number;
  notes!: string;
  projectTotalCost!: number;
  remainingAmount!: number;
  transferAmount!: number;
  dueAmount!: number;
  projectName!: string;
  projectLicenseId!: string;

  searchFields: ISearchFieldsMap<FinancialTransfersProject> = {
    ...normalSearchFields(['fullSerial', 'qatariTransactionAmount', 'notes']),
  };

  getValuesWithLabels(): { [key: string]: ControlValueLabelLangKey } {
    return {
      fullSerial: {langKey: 'serial_number', value: this.fullSerial},
      qatariTransactionAmount: {langKey: 'qatari_riyal_transaction_amount', value: this.qatariTransactionAmount},
      notes: {langKey: 'notes', value: this.notes},
      projectTotalCost: {langKey: 'project_total_cost', value: this.projectTotalCost},
      remainingAmount: {langKey: 'remaining_amount', value: this.remainingAmount},
      transferAmount: {langKey: 'transferred_amount', value: this.transferAmount},
      dueAmount: {langKey: 'due_amount', value: this.dueAmount},
      projectName: {langKey: 'project_name', value: this.projectName},
    };
  }

  getFormFields(control = false): any {
    const {
      fullSerial,
      qatariTransactionAmount,
      notes,
      projectTotalCost,
      remainingAmount,
      transferAmount,
      dueAmount,
    } = this;
    return {
      fullSerial: control ? [fullSerial, [CustomValidators.required,
        CustomValidators.maxLength(CustomValidators.defaultLengths.ENGLISH_NAME_MAX),
      ]] : fullSerial,
      qatariTransactionAmount: control ? [qatariTransactionAmount, [CustomValidators.required,
        CustomValidators.decimal(CustomValidators.defaultLengths.DECIMAL_PLACES)]] : qatariTransactionAmount,
      notes: control ? [notes, [CustomValidators.maxLength(CustomValidators.defaultLengths.ENGLISH_NAME_MAX)]] : notes,
      projectTotalCost: [projectTotalCost],
      remainingAmount: [remainingAmount],
      transferAmount: [transferAmount],
      dueAmount: [dueAmount],
    };
  }

  // don't delete (used in case audit history)
  getAdminResultByProperty(property: keyof FinancialTransfersProject): AdminResult {
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

  isEqual(record: FinancialTransfersProject): boolean {
    return this.fullSerial === record.fullSerial;
  }
}
