import {AdminResult} from '@app/models/admin-result';
import {SearchableCloneable} from '@app/models/searchable-cloneable';

export class FundingSource extends SearchableCloneable<FundingSource>{
  category!: number;
  totalCost!: number;
  notes!: string
  categoryInfo!: AdminResult
}
