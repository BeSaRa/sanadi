import {IModelInterceptor} from '../interfaces/i-model-interceptor';
import {InquirySearchCriteria} from '../models/inquiry-search-criteria';
import {DateUtils} from '../helpers/date-utils';
import {IMyDateModel} from 'angular-mydatepicker';

export class GeneralSearchCriteriaInterceptor implements IModelInterceptor<InquirySearchCriteria> {
  // not important we will never use it
  receive(model: InquirySearchCriteria): InquirySearchCriteria {
    return model;
  }

  send(model: Partial<InquirySearchCriteria>): Partial<InquirySearchCriteria> {
    // here you can check the search criteria type if match any of your model you can pass it to your custom interceptor.send method
    delete model.service;
    model.createdOnFrom = DateUtils.changeDateFromDatepicker(model.createdOnFrom as unknown as IMyDateModel);
    model.createdOnTo = DateUtils.changeDateFromDatepicker(model.createdOnTo as unknown as IMyDateModel);
    return model;
  }

}
