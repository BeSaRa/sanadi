import {AdminResult} from '@app/models/admin-result';
import {CustomValidators} from '@app/validators/custom-validators';
import {SearchableCloneable} from '@app/models/searchable-cloneable';
import {ISearchFieldsMap} from '@app/types/types';
import {infoSearchFields} from '@app/helpers/info-search-fields';
import {ImplementingAgencyInterceptor} from "@model-interceptors/implementing-agency-interceptor";
import {InterceptModel} from "@decorators/intercept-model";

const {send, receive} = new ImplementingAgencyInterceptor()

@InterceptModel({send, receive})
export class ImplementingAgency extends SearchableCloneable<ImplementingAgency> {
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

  getAgencyFields(control: boolean = false) {
    const {implementingAgency, implementingAgencyType} = this;
    return {
      implementingAgencyType: control ? [implementingAgencyType, [CustomValidators.required]] : implementingAgencyType,
      implementingAgency: control ? [implementingAgency, [CustomValidators.required]] : implementingAgency,
    }
  }
}
