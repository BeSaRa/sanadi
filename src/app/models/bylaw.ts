import { InterceptModel } from '@app/decorators/decorators/intercept-model';
import { DateUtils } from '@app/helpers/date-utils';
import { infoSearchFields } from '@app/helpers/info-search-fields';
import { normalSearchFields } from '@app/helpers/normal-search-fields';
import { ByLawInterceptor } from '@app/model-interceptors/bylaw-interceptor';
import { ISearchFieldsMap } from '@app/types/types';
import { CustomValidators } from '@app/validators/custom-validators';
import { IMyDateModel } from 'angular-mydatepicker';
import { AdminResult } from './admin-result';
import { SearchableCloneable } from './searchable-cloneable';


const { send, receive } = new ByLawInterceptor();
@InterceptModel({
  receive,
  send
})
export class Bylaw extends SearchableCloneable<Bylaw> {
  fullName!: string;
  category!: number;
  categoryInfo!: AdminResult;
  firstReleaseDate!: string | IMyDateModel;
  lastUpdateDate!: string | IMyDateModel;
  id!: number;
  objectDBId?: number;

  searchFields: ISearchFieldsMap<Bylaw> = {
    ...normalSearchFields(['fullName']),
    ...infoSearchFields(['categoryInfo'])
  }

  buildForm(controls = true) {
    const { fullName, firstReleaseDate, lastUpdateDate, category } = this;
    return {
      fullName: controls ? [fullName, [CustomValidators.required, CustomValidators.maxLength(CustomValidators.defaultLengths.ENGLISH_NAME_MAX)]] : fullName,
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
