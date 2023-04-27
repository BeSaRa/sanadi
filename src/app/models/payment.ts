import { ControlValueLabelLangKey } from './../types/types';
import { AuditOperationTypes } from '@app/enums/audit-operation-types';
import { CommonUtils } from '@app/helpers/common-utils';
import { SearchableCloneable } from '@app/models/searchable-cloneable';
import { IMyDateModel } from 'angular-mydatepicker';
import { AdminResult } from './admin-result';
import { CustomValidators } from '@app/validators/custom-validators';

export class Payment extends SearchableCloneable<Payment> {
  auditOperation: AuditOperationTypes = AuditOperationTypes.NO_CHANGE;
  paymentNo!: string;
  dueDate!: string | IMyDateModel;
  totalCost!: number;
  notes!: string;

  isEqual(payment: Payment): boolean {
    return payment.paymentNo === this.paymentNo &&
      payment.totalCost === this.totalCost &&
      payment.dueDate === this.dueDate &&
      payment.notes === this.notes;
  }

  isNotEqual(payment: Payment): boolean {
    return payment.paymentNo !== this.paymentNo ||
      payment.totalCost !== this.totalCost ||
      payment.dueDate !== this.dueDate ||
      payment.notes !== this.notes;
  }
  getValuesWithLabels(): { [key: string]: ControlValueLabelLangKey } {
    return {
      paymentNo: { langKey: 'payment_name', value: this.paymentNo },
      dueDate: { langKey: 'due_date', value: this.dueDate },
      totalCost: { langKey: 'amount', value: this.totalCost },
      notes: { langKey: 'notes', value: this.notes },
    };
  }
  buildForm(control: boolean = false) {
    const {
      paymentNo,
      dueDate,
      totalCost,
      notes,
    } = this
    return {
      paymentNo: control ? [paymentNo, [CustomValidators.required, CustomValidators.maxLength(CustomValidators.defaultLengths.ENGLISH_NAME_MAX)]] : paymentNo,
      dueDate: control ? [dueDate, [CustomValidators.required]] : dueDate,
      totalCost: control ? [totalCost, [CustomValidators.required]] : totalCost,
      notes: control ? [notes, [CustomValidators.maxLength(CustomValidators.defaultLengths.ADDRESS_MAX)]] : notes
    }
  }
  getAdminResultByProperty(property: keyof Payment): AdminResult {
    let adminResultValue: AdminResult;
    let value: any = this[property];
    if (!CommonUtils.isValidValue(value) || typeof value === 'object') {
      value = '';
    }
    adminResultValue = AdminResult.createInstance({ arName: value as string, enName: value as string });
    return adminResultValue ?? new AdminResult();
  }
}
