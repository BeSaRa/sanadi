import { CustomValidators } from '@app/validators/custom-validators';
import { SearchableCloneable } from './searchable-cloneable';

export class Bylaw extends SearchableCloneable<Bylaw> {
  fullName!: string;
  category!: number;
  firstReleaseDate!: string;
  lastUpdateDate!: string;

  buildForm(controls = true) {
    const { fullName, firstReleaseDate, lastUpdateDate, category } = this;
    return {
      fullName: controls ? [fullName, [CustomValidators.required]] : fullName,
      firstReleaseDate: controls ? [firstReleaseDate, [CustomValidators.required]] : firstReleaseDate,
      lastUpdateDate: controls ? [lastUpdateDate, [CustomValidators.required]] : lastUpdateDate,
      category: controls ? [category, [CustomValidators.required]] : category,
    };
  }
}
