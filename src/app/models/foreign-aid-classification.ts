import { CustomValidators } from '@app/validators/custom-validators';
import { SearchableCloneable } from './searchable-cloneable';

export class ForeignAidClassification extends SearchableCloneable<ForeignAidClassification> {
  charityWorkArea!: number;
  aidClassification!: number;
  governanceDomain!: number;
  mainDACCategory!: number;
  mainUNOCHACategory!: number;
  subDACCategory!: number;
  subUNOCHACategory!: number;
  id!: number;

}
