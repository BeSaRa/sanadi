import {IModelInterceptor} from '../interfaces/i-model-interceptor';
import {InquirySearchCriteria} from '../models/inquiry-search-criteria';
import {DateUtils} from '../helpers/date-utils';
import {IMyDateModel} from 'angular-mydatepicker';
import {identity} from 'rxjs';
import {ICaseSearchCriteria} from '../interfaces/icase-search-criteria';
import {InquirySearchCriteriaInterceptor} from '../search-criteria-interceptors/inquiry-search-criteria-interceptor';
import {ConsultationSearchCriteriaInterceptor} from '../search-criteria-interceptors/consultation-search-criteria-interceptor';
import {InternationalCooperationSearchCriteriaInterceptor} from '../search-criteria-interceptors/international-cooperation-search-criteria-interceptor';
import {CaseTypes} from '../enums/case-types.enum';

const interceptors: Map<number, IModelInterceptor<any>> = new Map<number, IModelInterceptor<any>>();

interceptors.set(CaseTypes.INQUIRY, new InquirySearchCriteriaInterceptor());
interceptors.set(CaseTypes.CONSULTATION, new ConsultationSearchCriteriaInterceptor());
interceptors.set(CaseTypes.INTERNATIONAL_COOPERATION, new InternationalCooperationSearchCriteriaInterceptor());

export class GeneralSearchCriteriaInterceptor implements IModelInterceptor<ICaseSearchCriteria> {
  // not important we will never use it
  receive(model: ICaseSearchCriteria): ICaseSearchCriteria {
    return interceptors.get(model.caseType!)?.receive(model) || identity(model);
  }

  send(model: Partial<InquirySearchCriteria>): Partial<ICaseSearchCriteria> {
    // here you can check the search criteria type if match any of your model you can pass it to your custom interceptor.send method
    delete model.service;
    model.createdOnFrom = DateUtils.changeDateFromDatepicker(model.createdOnFrom as unknown as IMyDateModel);
    model.createdOnTo = DateUtils.changeDateFromDatepicker(model.createdOnTo as unknown as IMyDateModel);

    return interceptors.get(model.caseType!)?.send(model) || identity(model);
  }

}
