import {SearchableCloneable} from '@app/models/searchable-cloneable';

export class Payment extends SearchableCloneable<Payment> {
  paymentNo!: string;
  dueDate!: string;
  totalCost!: number;
  notes!: string;
}
