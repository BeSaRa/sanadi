import { infoSearchFields } from '@app/helpers/info-search-fields';
import { normalSearchFields } from '@app/helpers/normal-search-fields';
import {ControlValueLabelLangKey, ISearchFieldsMap} from '@app/types/types';
import { CustomValidators } from '@app/validators/custom-validators';
import { AdminResult } from './admin-result';
import { SearchableCloneable } from './searchable-cloneable';
import {AuditOperationTypes} from '@enums/audit-operation-types';
import {CommonUtils} from '@helpers/common-utils';
import {ObjectUtils} from '@helpers/object-utils';

export class WorkArea extends SearchableCloneable<WorkArea> {
  arabicName!: string;
  englishName!: string;
  country!: number;
  region!:string;
  objectDBId?: number;
  id!: number;
  countryInfo!: AdminResult;

  searchFields: ISearchFieldsMap<WorkArea> = {
    ...infoSearchFields(['countryInfo']),
    ...normalSearchFields(['region'])
  };

  // extra fields
  auditOperation: AuditOperationTypes = AuditOperationTypes.NO_CHANGE;

  getValuesWithLabels(): { [key: string]: ControlValueLabelLangKey } {
    return {
      country: {langKey: 'country', value: this.country},
      region: {langKey: 'region', value: this.region}
    };
  }

  buildForm(controls = true) {
    const values = ObjectUtils.getControlValues<WorkArea>(this.getValuesWithLabels());
    return {
      country: controls ? [values.country, [CustomValidators.required]] : values.country,
      region: controls ? [values.region, [CustomValidators.required,CustomValidators.maxLength(50)]] : values.region,

    }
  }

  toCharityOrgnizationUpdate() {
    const { id, country } = this;
    return new WorkArea().clone({
      objectDBId: id,
      country,
      countryInfo: AdminResult.createInstance({ arName: this.arabicName, enName: this.englishName })
    })
  }

  // don't delete (used in case audit history)
  getAdminResultByProperty(property: keyof WorkArea): AdminResult {
    let adminResultValue: AdminResult;
    switch (property) {
      case 'country':
        adminResultValue = this.countryInfo;
        break;
      default:
        let value: any = this[property];
        if (!CommonUtils.isValidValue(value) || typeof value === 'object') {
          value = '';
        }
        adminResultValue = AdminResult.createInstance({arName: value as string, enName: value as string});
    }
    return adminResultValue ?? new AdminResult();
  }

}
