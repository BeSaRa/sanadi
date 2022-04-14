import {IModelInterceptor} from '../interfaces/i-model-interceptor';
import {InquirySearchCriteria} from '../models/inquiry-search-criteria';
import {DateUtils} from '../helpers/date-utils';
import {IMyDateModel} from 'angular-mydatepicker';
import {identity} from 'rxjs';
import {ICaseSearchCriteria} from '../interfaces/icase-search-criteria';
import {InquirySearchCriteriaInterceptor} from '../search-criteria-interceptors/inquiry-search-criteria-interceptor';
import {
  ConsultationSearchCriteriaInterceptor
} from '../search-criteria-interceptors/consultation-search-criteria-interceptor';
import {
  InternationalCooperationSearchCriteriaInterceptor
} from '../search-criteria-interceptors/international-cooperation-search-criteria-interceptor';
import {CaseTypes} from '../enums/case-types.enum';
import {FactoryService} from '../services/factory.service';
import {ConfigurationService} from '../services/configuration.service';
import {
  FinalExternalOfficeApprovalSearchCriteriaInterceptor
} from '@app/search-criteria-interceptors/final-external-office-approval-search-criteria-interceptor';
import {
  PartnerApprovalSearchCriteriaInterceptor
} from "@app/search-criteria-interceptors/partner-approval-search-criteria-interceptor";
import {
  CollectionApprovalSearchCriteriaInterceptor
} from '@app/search-criteria-interceptors/collection-approval-search-criteria-interceptor';
import {CollectorApprovalSearchCriteriaInterceptor} from '@app/search-criteria-interceptors/collector-approval-search-criteria-interceptor';

const interceptors: Map<number, IModelInterceptor<any>> = new Map<number, IModelInterceptor<any>>();

interceptors.set(CaseTypes.INQUIRY, new InquirySearchCriteriaInterceptor());
interceptors.set(CaseTypes.CONSULTATION, new ConsultationSearchCriteriaInterceptor());
interceptors.set(CaseTypes.INTERNATIONAL_COOPERATION, new InternationalCooperationSearchCriteriaInterceptor());
interceptors.set(CaseTypes.FINAL_EXTERNAL_OFFICE_APPROVAL, new FinalExternalOfficeApprovalSearchCriteriaInterceptor());
interceptors.set(CaseTypes.PARTNER_APPROVAL, new PartnerApprovalSearchCriteriaInterceptor());
interceptors.set(CaseTypes.COLLECTION_APPROVAL, new CollectionApprovalSearchCriteriaInterceptor());
interceptors.set(CaseTypes.COLLECTOR_LICENSING, new CollectorApprovalSearchCriteriaInterceptor());

export class GeneralSearchCriteriaInterceptor implements IModelInterceptor<ICaseSearchCriteria> {
  // not important we will never use it
  receive(model: ICaseSearchCriteria): ICaseSearchCriteria {
    return interceptors.get(model.caseType!)?.receive(model) || identity(model);
  }

  send(model: Partial<InquirySearchCriteria>): Partial<ICaseSearchCriteria> {
    const configurationService: ConfigurationService = FactoryService.getService('ConfigurationService');
    // here you can check the search criteria type if match any of your model you can pass it to your custom interceptor.send method
    delete model.service;
    delete model.employeeService;

    model.createdOnFrom = DateUtils.setStartOfDay(model.createdOnFrom as unknown as IMyDateModel).format(configurationService.CONFIG.TIMESTAMP).split(' ').join('T') + 'Z';
    model.createdOnTo = DateUtils.setEndOfDay(model.createdOnTo as unknown as IMyDateModel).format(configurationService.CONFIG.TIMESTAMP).split(' ').join('T') + 'Z';
    return interceptors.get(model.caseType!)?.send(model) || identity(model);
  }

}
