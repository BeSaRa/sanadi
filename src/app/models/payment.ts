import {SearchableCloneable} from '@app/models/searchable-cloneable';
import {IMyDateModel} from 'angular-mydatepicker';

export class Payment extends SearchableCloneable<Payment> {
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
}
