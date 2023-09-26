import { GdxEidCharitableFoundationResponse } from './../models/gdx-eid-charitable-foundation-response';
import {AdminResult} from '@app/models/admin-result';
import {IModelInterceptor} from '@contracts/i-model-interceptor';
import {DateUtils} from "@helpers/date-utils";

export class GdxEidCharitableFoundationResponseInterceptor implements IModelInterceptor<GdxEidCharitableFoundationResponse> {
  receive(model: GdxEidCharitableFoundationResponse): GdxEidCharitableFoundationResponse {
    model.periodicTypeInfo = AdminResult.createInstance(model.periodicTypeInfo ?? {});
    model.aidLookupCategoryInfo = AdminResult.createInstance(model.aidLookupCategoryInfo ?? {});
    model.aidLookupParentInfo = AdminResult.createInstance(model.aidLookupParentInfo ?? {});
    model.aidLookupInfo = AdminResult.createInstance(model.aidLookupInfo ?? {});
    model.donorInfo = AdminResult.createInstance(model.donorInfo ?? {});
    model.approvalDateString = DateUtils.getDateStringFromDate(model.approvalDate, 'DEFAULT_DATE_FORMAT');
    model.aidStartPayDateString = DateUtils.getDateStringFromDate(model.aidStartPayDate, 'DEFAULT_DATE_FORMAT');
    return model;
  }

  send(model: Partial<GdxEidCharitableFoundationResponse>): Partial<GdxEidCharitableFoundationResponse> {
    delete model.periodicTypeInfo;
    delete model.aidLookupCategoryInfo;
    delete model.aidLookupParentInfo;
    delete model.aidLookupInfo;
    delete model.donorInfo;
    delete model.approvalDateString;
    delete model.aidStartPayDateString;
    return model;
  }
}
