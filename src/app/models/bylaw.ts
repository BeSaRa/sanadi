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
import { IAuditModelProperties } from '@app/interfaces/i-audit-model-properties';
import { CommonUtils } from '@app/helpers/common-utils';
import { AuditOperationTypes } from '@app/enums/audit-operation-types';
import { ControlValueLabelLangKey } from '@app/types/types';


const { send, receive } = new ByLawInterceptor();
@InterceptModel({
  receive,
  send
})
export class Bylaw extends SearchableCloneable<Bylaw> implements IAuditModelProperties<Bylaw> {
  fullName!: string;
  category!: number;
  categoryInfo!: AdminResult;
  firstReleaseDate!: string | IMyDateModel;
  lastUpdateDate!: string | IMyDateModel;
  id!: number;
  objectDBId?: number;
  firstReleaseDateStamp!:number|null;
  lastUpdateDateStamp!:number|null;

  searchFields: ISearchFieldsMap<Bylaw> = {
    ...normalSearchFields(['fullName']),
    ...infoSearchFields(['categoryInfo'])
  }

  getAdminResultByProperty(property: keyof Bylaw): AdminResult {
    let adminResultValue: AdminResult;
    switch (property) {
      case 'category':
        adminResultValue = this.categoryInfo;
        break;
      case 'firstReleaseDate':
        const firstReleaseDateValue = DateUtils.getDateStringFromDate(this.firstReleaseDate, 'DATEPICKER_FORMAT');
        adminResultValue = AdminResult.createInstance({arName: firstReleaseDateValue, enName: firstReleaseDateValue});
        break;
      case 'lastUpdateDate':
        const lastUpdateDateValue = DateUtils.getDateStringFromDate(this.lastUpdateDate, 'DATEPICKER_FORMAT');
        adminResultValue = AdminResult.createInstance({arName: lastUpdateDateValue, enName: lastUpdateDateValue});
        break;
      default:
        let value: any = this[property];
        if (!CommonUtils.isValidValue(value) || typeof value === 'object') {
          value = '';
        }
        adminResultValue = AdminResult.createInstance({ arName: value as string, enName: value as string });
    }
    return adminResultValue ?? new AdminResult();
  }
  auditOperation: AuditOperationTypes = AuditOperationTypes.NO_CHANGE;

  getValuesWithLabels(): { [key: string]: ControlValueLabelLangKey } {
    return {
      fullName: { langKey: 'full_name', value: this.fullName },
      firstReleaseDate:{ langKey: 'first_realase_date', value: this.firstReleaseDate ,comparisonValue : this.firstReleaseDateStamp},
      lastUpdateDate:{ langKey: 'last_update_date', value: this.lastUpdateDate, comparisonValue:this.lastUpdateDateStamp },
      category:{ langKey: 'classification', value: this.category },
    };
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
    const { id, fullName, firstReleaseDate, lastUpdateDate, category,categoryInfo } = this;
    return new Bylaw().clone({
      objectDBId: id,
      firstReleaseDate: DateUtils.getDateStringFromDate(firstReleaseDate),
      fullName,
      lastUpdateDate: DateUtils.getDateStringFromDate(lastUpdateDate),
      category,
      categoryInfo :categoryInfo
    })
  }
}
