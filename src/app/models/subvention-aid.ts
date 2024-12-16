import { AdminResult } from './admin-result';
import { CustomValidators } from '../validators/custom-validators';
import { SubventionAidService } from '@services/subvention-aid.service';
import { FactoryService } from '@services/factory.service';
import { BaseModel } from './base-model';
import { Observable } from 'rxjs';
import { Validators } from '@angular/forms';
import { IMyDateModel } from '@nodro7/angular-mydatepicker';
import { isValidValue } from '@helpers/utils';
import { ISearchFieldsMap } from '@app/types/types';
import { infoSearchFields } from '@app/helpers/info-search-fields';
import { normalSearchFields } from '@app/helpers/normal-search-fields';
import { SubventionAidInterceptor } from "@app/model-interceptors/subvention-aid-interceptor";
import { InterceptModel } from "@decorators/intercept-model";

const { send, receive } = new SubventionAidInterceptor();

@InterceptModel({ send, receive })
export class SubventionAid extends BaseModel<SubventionAid, SubventionAidService> {
  installmentsCount: number = 0;
  periodicType!: number;
  approvalDate!: IMyDateModel;
  aidAmount!: number;
  aidSuggestedAmount?: number;
  aidTotalPayedAmount?: number;
  aidRemainingAmount?: number;
  aidPayedAmount?: number;
  aidDescription!: string;
  aidStartPayDate!: IMyDateModel;
  aidLookupId!: number;
  subventionRequestId!: number;
  subventionAidParentId?: number;
  orgId!: number;
  orgUserId!: number;
  aidLookupParentId!: number;
  donorId!: number;

  permitType!: number;
  licenseId!: string;
  // not belong to the model
  orgInfo!: AdminResult;
  orgUserInfo!: AdminResult;
  aidLookupInfo!: AdminResult;
  aidLookupParentInfo!: AdminResult;
  periodicTypeInfo!: AdminResult;
  donorInfo!: AdminResult;

  service: SubventionAidService;
  approvalDateString: string | undefined;
  aidStartPayDateString: string | undefined;

  searchFields: ISearchFieldsMap<SubventionAid> = {
    ...infoSearchFields(['aidLookupParentInfo', 'aidLookupInfo', 'periodicTypeInfo']),
    ...normalSearchFields(['approvalDateString', 'aidSuggestedAmount', 'installmentsCount', 'aidStartPayDateString', 'aidAmount', 'aidPayedAmount', 'aidRemainingAmount'])
  };
  searchFieldsPartial: ISearchFieldsMap<SubventionAid> = {
    ...infoSearchFields(['aidLookupParentInfo', 'aidLookupInfo', 'periodicTypeInfo']),
    ...normalSearchFields(['approvalDateString', 'aidSuggestedAmount', 'installmentsCount', 'aidStartPayDateString', 'aidAmount', 'aidPayedAmount'])
  };
  searchFieldsUserRequest: ISearchFieldsMap<SubventionAid> = {
    ...infoSearchFields(['aidLookupParentInfo', 'aidLookupInfo', 'periodicTypeInfo']),
    ...normalSearchFields(['approvalDateString', 'aidSuggestedAmount', 'installmentsCount', 'aidStartPayDateString', 'aidAmount', 'aidRemainingAmount'])
  };
  searchFieldsPartialRequestDetails: ISearchFieldsMap<SubventionAid> = {
    ...infoSearchFields(['aidLookupParentInfo', 'aidLookupInfo', 'periodicTypeInfo']),
    ...normalSearchFields(['approvalDateString', 'aidSuggestedAmount', 'installmentsCount', 'aidStartPayDateString', 'aidAmount', 'aidRemainingAmount'])
  };

  constructor() {
    super();
    this.service = FactoryService.getService('SubventionAidService');
  }

  create(): Observable<SubventionAid> {
    return this.service.create(this);
  }

  delete(): Observable<boolean> {
    return this.service.delete(this.id);
  }

  save(): Observable<SubventionAid> {
    return this.id ? this.update() : this.create();
  }

  update(): Observable<SubventionAid> {
    return this.service.update(this);
  }

  getAidFields(control: boolean = false): any {
    const {
      id,
      approvalDate,
      periodicType,
      aidAmount,
      aidSuggestedAmount,
      aidDescription,
      aidStartPayDate,
      aidLookupParentId,
      aidLookupId,
      installmentsCount,
      donorId,
      permitType,
      licenseId
    } = this;

    return {
      id: control ? [id] : id,
      approvalDate: control ? [approvalDate, CustomValidators.required] : approvalDate,
      periodicType: control ? [periodicType, CustomValidators.required] : periodicType,
      aidAmount: control ? [aidAmount, [CustomValidators.required, CustomValidators.number, CustomValidators.maxLength(15)]] : aidAmount,
      aidSuggestedAmount: control ? [aidSuggestedAmount, [CustomValidators.required, CustomValidators.number, CustomValidators.maxLength(15)]] : aidSuggestedAmount,
      aidDescription: control ? [aidDescription, [CustomValidators.required, CustomValidators.maxLength(1000)]] : aidDescription,
      aidStartPayDate: control ? [aidStartPayDate, [CustomValidators.required]] : aidStartPayDate,
      aidLookupParentId: control ? [aidLookupParentId, CustomValidators.required] : aidLookupParentId,
      aidLookupId: control ? [aidLookupId, CustomValidators.required] : aidLookupId,
      donorId: control ? [donorId, CustomValidators.required] : donorId,
      installmentsCount: control ? [installmentsCount, [CustomValidators.number, Validators.min(1), CustomValidators.maxLength(20)]] : installmentsCount,
      permitType: control ? [permitType] : permitType,
      licenseId: control ? [licenseId] : licenseId
    };
  }
}
