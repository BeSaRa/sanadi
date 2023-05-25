import { ControlValueLabelLangKey } from './../types/types';
import { AdminResult } from '@app/models/admin-result';
import { CustomValidators } from '@app/validators/custom-validators';
import { SearchableCloneable } from '@app/models/searchable-cloneable';
import { ISearchFieldsMap } from '@app/types/types';
import { infoSearchFields } from '@app/helpers/info-search-fields';
import { ImplementingAgencyInterceptor } from "@model-interceptors/implementing-agency-interceptor";
import { InterceptModel } from "@decorators/intercept-model";
import { AuditOperationTypes } from '@app/enums/audit-operation-types';
import { CommonUtils } from '@app/helpers/common-utils';
import { ObjectUtils } from '@app/helpers/object-utils';
import { IAuditModelProperties } from '@app/interfaces/i-audit-model-properties';

const { send, receive } = new ImplementingAgencyInterceptor()

@InterceptModel({ send, receive })
export class ImplementingAgency extends SearchableCloneable<ImplementingAgency> implements IAuditModelProperties<ImplementingAgency> {
  auditOperation: AuditOperationTypes = AuditOperationTypes.NO_CHANGE;
  implementingAgency!: string;
  implementingAgencyType!: number;
  implementingAgencyInfo!: AdminResult;
  agencyTypeInfo!: AdminResult;

  searchFields: ISearchFieldsMap<ImplementingAgency> = {
    ...infoSearchFields(['agencyTypeInfo', 'implementingAgencyInfo'])
  };

  constructor() {
    super();
  }
  getValuesWithLabels(): { [key: string]: ControlValueLabelLangKey } {
    return {
      implementingAgencyType: { langKey: 'entity_type', value: this.implementingAgencyType },
      implementingAgency: { langKey: 'entity_name', value: this.implementingAgency }
    };
  }
  getAgencyFields(control: boolean = false) {
    const values = ObjectUtils.getControlValues<ImplementingAgency>(this.getValuesWithLabels())

    return {
      implementingAgencyType: control ? [values.implementingAgencyType, [CustomValidators.required]] : values.implementingAgencyType,
      implementingAgency: control ? [values.implementingAgency, [CustomValidators.required]] : values.implementingAgency,
    }
  }
  // don't delete (used in case audit history)
  getAdminResultByProperty(property: keyof ImplementingAgency): AdminResult {
    let adminResultValue: AdminResult;
    switch (property) {
      case 'implementingAgency':
        adminResultValue = this.implementingAgencyInfo;
        break;
      case 'implementingAgencyType':
        adminResultValue = this.agencyTypeInfo;
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

  isEqual(record: ImplementingAgency): boolean {
    return this.implementingAgencyType === record.implementingAgencyType
    && this.implementingAgency === record.implementingAgency;
  }
}
