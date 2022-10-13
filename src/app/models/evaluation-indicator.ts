import {SearchableCloneable} from '@app/models/searchable-cloneable';
import {AdminResult} from '@app/models/admin-result';

export class EvaluationIndicator extends SearchableCloneable<EvaluationIndicator> {
  indicator!: number;
  percentage!: number;
  notes!: string;
  indicatorInfo?: AdminResult;
}
