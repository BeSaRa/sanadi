import { IModelInterceptor } from '@app/interfaces/i-model-interceptor';
import { InquirySearchCriteria } from '@models/inquiry-search-criteria';
import { DateUtils } from '@app/helpers/date-utils';
import { IMyDateModel } from '@nodro7/angular-mydatepicker';
import { identity } from 'rxjs';
import { ICaseSearchCriteria } from '@contracts/icase-search-criteria';
import { InquirySearchCriteriaInterceptor } from '../search-criteria-interceptors/inquiry-search-criteria-interceptor';
import { ConsultationSearchCriteriaInterceptor } from '../search-criteria-interceptors/consultation-search-criteria-interceptor';
import {
  InternationalCooperationSearchCriteriaInterceptor
} from '../search-criteria-interceptors/international-cooperation-search-criteria-interceptor';
import { CaseTypes } from '../enums/case-types.enum';
import { FactoryService } from '@services/factory.service';
import { ConfigurationService } from '@services/configuration.service';
import {
  FinalExternalOfficeApprovalSearchCriteriaInterceptor
} from '@app/search-criteria-interceptors/final-external-office-approval-search-criteria-interceptor';
import { PartnerApprovalSearchCriteriaInterceptor } from '@app/search-criteria-interceptors/partner-approval-search-criteria-interceptor';
import {
  CollectionApprovalSearchCriteriaInterceptor
} from '@app/search-criteria-interceptors/collection-approval-search-criteria-interceptor';
import { CollectorApprovalSearchCriteriaInterceptor } from '@app/search-criteria-interceptors/collector-approval-search-criteria-interceptor';
import {
  UrgentJointReliefCampaignSearchCriteriaInterceptor
} from '@app/search-criteria-interceptors/urgent-joint-relief-campaign-search-criteria-interceptor';
import { CustomsExemptionRemittanceInterceptor } from '@app/model-interceptors/customs-exemption-remittance-interceptor';
import { FundraisingInterceptor } from '@app/model-interceptors/fundraising-interceptor';
import {
  SearchUrgentInterventionAnnouncementCriteriaInterceptor
} from '@app/search-criteria-interceptors/search-urgent-intervention-announcement-criteria-interceptor';
import { ProjectModelInterceptor } from '@app/model-interceptors/project-model-interceptor';
import { ForeignCountriesProjectsSearchCriteriaInterceptor } from '@app/search-criteria-interceptors/foreign-countries-projects-seach-criteria-interceptor';
import { EmploymentSearchCriteriaInterceptor } from '@app/search-criteria-interceptors/employment-seach-criteria-interceptor';
import { ProjectImplementationInterceptor } from '@model-interceptors/project-implementation-interceptor';
import { ProjectModelSearchCriteriaInterceptor } from '@app/search-criteria-interceptors/project-model-seach-criteria-interceptor';

const interceptors: Map<number, IModelInterceptor<any>> = new Map<number, IModelInterceptor<any>>();

interceptors.set(CaseTypes.INQUIRY, new InquirySearchCriteriaInterceptor());
interceptors.set(CaseTypes.CONSULTATION, new ConsultationSearchCriteriaInterceptor());
interceptors.set(CaseTypes.INTERNATIONAL_COOPERATION, new InternationalCooperationSearchCriteriaInterceptor());
interceptors.set(CaseTypes.FINAL_EXTERNAL_OFFICE_APPROVAL, new FinalExternalOfficeApprovalSearchCriteriaInterceptor());
interceptors.set(CaseTypes.PARTNER_APPROVAL, new PartnerApprovalSearchCriteriaInterceptor());
interceptors.set(CaseTypes.EXTERNAL_PROJECT_MODELS, new ProjectModelInterceptor());
interceptors.set(CaseTypes.COLLECTION_APPROVAL, new CollectionApprovalSearchCriteriaInterceptor());
interceptors.set(CaseTypes.COLLECTOR_LICENSING, new CollectorApprovalSearchCriteriaInterceptor());
interceptors.set(CaseTypes.URGENT_JOINT_RELIEF_CAMPAIGN, new UrgentJointReliefCampaignSearchCriteriaInterceptor());
interceptors.set(CaseTypes.CUSTOMS_EXEMPTION_REMITTANCE, new CustomsExemptionRemittanceInterceptor());
interceptors.set(CaseTypes.FUNDRAISING_LICENSING, new FundraisingInterceptor());
interceptors.set(CaseTypes.URGENT_INTERVENTION_ANNOUNCEMENT, new SearchUrgentInterventionAnnouncementCriteriaInterceptor());
interceptors.set(CaseTypes.FOREIGN_COUNTRIES_PROJECTS, new ForeignCountriesProjectsSearchCriteriaInterceptor());
interceptors.set(CaseTypes.EMPLOYMENT, new EmploymentSearchCriteriaInterceptor());
interceptors.set(CaseTypes.PROJECT_IMPLEMENTATION, new ProjectImplementationInterceptor());
interceptors.set(CaseTypes.EXTERNAL_PROJECT_MODELS, new ProjectModelSearchCriteriaInterceptor());


export class GeneralSearchCriteriaInterceptor implements IModelInterceptor<ICaseSearchCriteria> {
  // not important we will never use it
  receive(model: ICaseSearchCriteria): ICaseSearchCriteria {
    const interceptor = interceptors.get(model.caseType!);
    return interceptor ? interceptor.receive(interceptor.caseInterceptor ? interceptor.caseInterceptor.receive(model) : model) : identity(model);
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
