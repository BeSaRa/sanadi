import {ControlValueLabelLangKey, ISearchFieldsMap} from './../types/types';
import {AuditOperationTypes} from '@app/enums/audit-operation-types';
import {CommonUtils} from '@app/helpers/common-utils';
import {SearchableCloneable} from '@app/models/searchable-cloneable';
import {IMyDateModel} from 'angular-mydatepicker';
import {AdminResult} from './admin-result';
import {CustomValidators} from '@app/validators/custom-validators';
import {ObjectUtils} from '@app/helpers/object-utils';
import {IAuditModelProperties} from '@app/interfaces/i-audit-model-properties';
import {normalSearchFields} from "@helpers/normal-search-fields";
import {DateUtils} from "@helpers/date-utils";

export class Payment extends SearchableCloneable<Payment> implements IAuditModelProperties<Payment> {
  auditOperation: AuditOperationTypes = AuditOperationTypes.NO_CHANGE;
  paymentNo!: string;
  dueDate!: string | IMyDateModel;
  totalCost!: number;
  notes!: string;

  dueDateString!: string;

  searchFields: ISearchFieldsMap<Payment> = {
    ...normalSearchFields(['paymentNo', 'totalCost', 'dueDate'])
  }

  isEqual(payment: Payment): boolean {
    return payment.paymentNo === this.paymentNo &&
      payment.totalCost === this.totalCost &&
      payment.notes === this.notes
      && DateUtils.getTimeStampFromDate(payment.dueDate!) === DateUtils.getTimeStampFromDate(this.dueDate!);
  }

  isNotEqual(payment: Payment): boolean {
    return payment.paymentNo !== this.paymentNo ||
      payment.totalCost !== this.totalCost ||
      payment.dueDate !== this.dueDate ||
      payment.notes !== this.notes;
  }

  getValuesWithLabels(): { [key: string]: ControlValueLabelLangKey } {
    return {
      paymentNo: {langKey: 'payment_name', value: this.paymentNo},
      dueDate: {langKey: 'due_date', value: this.dueDate},
      totalCost: {langKey: 'amount', value: this.totalCost},
      notes: {langKey: 'notes', value: this.notes},
    };
  }

  buildForm(control: boolean = false) {
    const values = ObjectUtils.getControlValues<Payment>(this.getValuesWithLabels())

    return {
      paymentNo: control ? [values.paymentNo, [CustomValidators.required, CustomValidators.maxLength(CustomValidators.defaultLengths.ENGLISH_NAME_MAX)]] : values.paymentNo,
      dueDate: control ? [values.dueDate, [CustomValidators.required]] : values.dueDate,
      totalCost: control ? [values.totalCost, [CustomValidators.required]] : values.totalCost,
      notes: control ? [values.notes, [CustomValidators.maxLength(CustomValidators.defaultLengths.ADDRESS_MAX)]] : values.notes
    }
  }

  getAdminResultByProperty(property: keyof Payment): AdminResult {
    let adminResultValue: AdminResult;
    let value: any = this[property];
    if (!CommonUtils.isValidValue(value) || typeof value === 'object') {
      value = '';
    }
    adminResultValue = AdminResult.createInstance({arName: value as string, enName: value as string});
    return adminResultValue ?? new AdminResult();
  }
}
