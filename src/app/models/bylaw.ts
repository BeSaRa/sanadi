import { DateUtils } from '@app/helpers/date-utils';
import { CustomValidators } from '@app/validators/custom-validators';
import { IMyDateModel } from 'angular-mydatepicker';
import { AdminResult } from './admin-result';
import { SearchableCloneable } from './searchable-cloneable';

export class Bylaw extends SearchableCloneable<Bylaw> {
  fullName!: string;
  category!: number;
  categoryInfo!: AdminResult;
  firstReleaseDate!: string | IMyDateModel;
  lastUpdateDate!: string | IMyDateModel;
  id!: number;
  objectDBId?: number;

  buildForm(controls = true) {
    const { fullName, firstReleaseDate, lastUpdateDate, category } = this;
    return {
      fullName: controls ? [fullName, [CustomValidators.required]] : fullName,
      firstReleaseDate: controls ? [firstReleaseDate, [CustomValidators.required]] : firstReleaseDate,
      lastUpdateDate: controls ? [lastUpdateDate, [CustomValidators.required]] : lastUpdateDate,
      category: controls ? [category, [CustomValidators.required]] : category,
    };
  }
  toCharityOrgnizationUpdate() {
    const { id, fullName, firstReleaseDate, lastUpdateDate, category } = this;
    return new Bylaw().clone({
      objectDBId: id,
      firstReleaseDate: DateUtils.getDateStringFromDate(firstReleaseDate),
      fullName,
      lastUpdateDate: DateUtils.getDateStringFromDate(lastUpdateDate),
      category
    })
  }
}
