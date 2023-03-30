import { Injectable } from '@angular/core';
import { CaseTypes } from "@app/enums/case-types.enum";
import { Lookup } from "@app/models/lookup";
import { ServiceRequestTypes } from "@app/enums/service-request-types";
import { LookupService } from "@services/lookup.service";
import { Memoize } from "typescript-memoize";

@Injectable({
  providedIn: 'root'
})
export class RequestTypeFollowupService {
  serviceRequestTypes: Record<number, Lookup[]> = {
    [CaseTypes.INQUIRY]: [this.getNewRequestType()],
    [CaseTypes.CONSULTATION]: [this.getNewRequestType()],
    [CaseTypes.INTERNATIONAL_COOPERATION]: [this.getNewRequestType()],
    [CaseTypes.INITIAL_EXTERNAL_OFFICE_APPROVAL]: this.lookupService.listByCategory.ServiceRequestType,
    [CaseTypes.PARTNER_APPROVAL]: this.lookupService.listByCategory.ServiceRequestType,
    [CaseTypes.FINAL_EXTERNAL_OFFICE_APPROVAL]: this.lookupService.listByCategory.ServiceRequestType,
    [CaseTypes.INTERNAL_PROJECT_LICENSE]: this.lookupService.listByCategory.ServiceRequestTypeNoRenew,
    [CaseTypes.EXTERNAL_PROJECT_MODELS]: this.lookupService.listByCategory.ProjectModelingReqType,
    [CaseTypes.URGENT_INTERVENTION_LICENSING]: this.lookupService.listByCategory.ServiceRequestType,
    [CaseTypes.COLLECTION_APPROVAL]: this.lookupService.listByCategory.CollectionRequestType,
    [CaseTypes.COLLECTOR_LICENSING]: this.lookupService.listByCategory.CollectionRequestType,
    [CaseTypes.FUNDRAISING_LICENSING]: this.lookupService.listByCategory.CollectionRequestType,
    [CaseTypes.CUSTOMS_EXEMPTION_REMITTANCE]: this.lookupService.listByCategory.CustomsExemptionRequestType,
    [CaseTypes.INTERNAL_BANK_ACCOUNT_APPROVAL]: this.lookupService.listByCategory.BankRequestType,
    [CaseTypes.EMPLOYMENT]: this.lookupService.listByCategory.EmploymentRequestType,
    [CaseTypes.URGENT_JOINT_RELIEF_CAMPAIGN]: this.lookupService.listByCategory.RequestTypeNewOnly,
    [CaseTypes.URGENT_INTERVENTION_ANNOUNCEMENT]: this.lookupService.listByCategory.UrgentInterventionAnnouncementRequestType,
    [CaseTypes.EXTERNAL_ORG_AFFILIATION_REQUEST]: this.lookupService.listByCategory.AffiliationRequestType,
    [CaseTypes.URGENT_INTERVENTION_CLOSURE]: this.lookupService.listByCategory.RequestTypeNewOnly,
    [CaseTypes.URGENT_INTERVENTION_FINANCIAL_NOTIFICATION]: this.lookupService.listByCategory.UrgentInterventionFinancialRequestType,
    [CaseTypes.FOREIGN_COUNTRIES_PROJECTS]: this.lookupService.listByCategory.CollectionRequestType,
    [CaseTypes.TRANSFERRING_INDIVIDUAL_FUNDS_ABROAD]: this.lookupService.listByCategory.TransferringIndividualRequestType,
    [CaseTypes.NPO_MANAGEMENT]: this.lookupService.listByCategory.NPORequestType,
    [CaseTypes.COORDINATION_WITH_ORGANIZATION_REQUEST]: [this.getNewRequestType()],
    [CaseTypes.URGENT_INTERVENTION_LICENSE_FOLLOWUP]: [this.getNewRequestType()],
    [CaseTypes.CHARITY_ORGANIZATION_UPDATE]: this.lookupService.listByCategory.RequestTypeUpdateOnly,
    [CaseTypes.GENERAL_ASSOCIATION_MEETING_ATTENDANCE]: this.lookupService.listByCategory.RequestTypeNewUpdate,
    [CaseTypes.AWARENESS_ACTIVITY_SUGGESTION]: this.lookupService.listByCategory.CollectionRequestType,
    [CaseTypes.ORGANIZATION_ENTITIES_SUPPORT]: this.lookupService.listByCategory.RequestTypeNewOnly,
    [CaseTypes.PROJECT_IMPLEMENTATION]: this.lookupService.listByCategory.ServiceRequestTypeNoRenew,
    [CaseTypes.PROJECT_FUNDRAISING]: this.lookupService.listByCategory.ServiceRequestTypeNoRenew,
    [CaseTypes.FINANCIAL_TRANSFERS_LICENSING]: this.lookupService.listByCategory.FinancialTransferRequestType
  }

  constructor(private lookupService: LookupService) {
    this.getNewRequestType()
  }

  @Memoize()
  getNewRequestType(): Lookup {
    return this.lookupService.listByCategory.ServiceRequestType.find(item => item.lookupKey === ServiceRequestTypes.NEW)!
  }


}
