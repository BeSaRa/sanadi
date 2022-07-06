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
    [CaseTypes.EXTERNAL_PROJECT_MODELS]: this.lookupService.listByCategory.ExternalModelingReqType,
    [CaseTypes.URGENT_INTERVENTION_LICENSING]: this.lookupService.listByCategory.ServiceRequestType,
    [CaseTypes.EXTERNAL_PROJECT_IMPLEMENTATION]: [this.getNewRequestType()],
    [CaseTypes.COLLECTION_APPROVAL]: this.lookupService.listByCategory.CollectionRequestType,
    [CaseTypes.COLLECTOR_LICENSING]: this.lookupService.listByCategory.CollectionRequestType,
    [CaseTypes.FUNDRAISING_LICENSING]: this.lookupService.listByCategory.CollectionRequestType,
    [CaseTypes.CUSTOMS_EXEMPTION_REMITTANCE]: this.lookupService.listByCategory.CustomsExemptionRequestType,
    [CaseTypes.INTERNAL_BANK_ACCOUNT_APPROVAL]: this.lookupService.listByCategory.BankRequestType,
    [CaseTypes.URGENT_JOINT_RELIEF_CAMPAIGN]: [this.getNewRequestType()],
    [CaseTypes.URGENT_INTERVENTION_REPORTING]: this.lookupService.listByCategory.ServiceRequestType,
  }

  constructor(private lookupService: LookupService) {
    this.getNewRequestType()
  }

  @Memoize()
  getNewRequestType(): Lookup {
    return this.lookupService.listByCategory.ServiceRequestType.find(item => item.lookupKey === ServiceRequestTypes.NEW)!
  }


}
