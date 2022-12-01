import { InterceptModel } from "@app/decorators/decorators/intercept-model";
import { WFResponseType } from "@app/enums/wfresponse-type.enum";
import { dateSearchFields } from "@app/helpers/date-search-fields";
import { infoSearchFields } from "@app/helpers/info-search-fields";
import { normalSearchFields } from "@app/helpers/normal-search-fields";
import { mixinLicenseDurationType } from "@app/mixins/mixin-license-duration";
import { mixinRequestType } from "@app/mixins/mixin-request-type";
import { CollectionApprovalInterceptorClone } from "@app/model-interceptors/collection-approval-interceptor-clone";
import { CollectionApprovalCloneService } from "@app/services/collection-approval-clone.service";
import { FactoryService } from "@app/services/factory.service";
import { DialogRef } from "@app/shared/models/dialog-ref";
import { ISearchFieldsMap } from "@app/types/types";
import { CustomValidators } from "@app/validators/custom-validators";
import { AdminResult } from "./admin-result";
import { CaseModel } from "./case-model";
import { CollectionItem } from "./collection-item";
import { TaskDetails } from "./task-details";

const _CaseModelWithLicenseDurationTypeAndRequestType = mixinLicenseDurationType(mixinRequestType(CaseModel))
const interceptor = new CollectionApprovalInterceptorClone()

@InterceptModel({
    send: interceptor.send,
    receive: interceptor.receive
})
export class CollectionApprovalClone extends _CaseModelWithLicenseDurationTypeAndRequestType<CollectionApprovalCloneService, CollectionApprovalClone> {
    service!: CollectionApprovalCloneService;
    classDescription!:	string
    creatorInfo!:	AdminResult
    ouInfo!: AdminResult
    serial!:number
    fullSerial!:	string
    caseStatus!:	number
    caseType!:	number
    organizationId	!:number
    licenseApprovedDate!:	string
    taskDetails!:	TaskDetails
    caseStatusInfo!: AdminResult
    chiefDecision	!:number
    chiefJustification	!:string
    description	!:string
    licenseStartDate	!:string
    licenseEndDate	!:string
    managerDecision	!:number
    managerJustification	!:string
    publicTerms	!:string
    requestClassification	!:number
    reviewerDepartmentDecision	!:number
    reviewerDepartmentJustification	!:string
    secondSpecialistDecision	!:number
    secondSpecialistJustification	!:string
    specialistDecision	!:number
    specialistJustification	!:string
    subject	!:string
    inRenewalPeriod	!:boolean
    collectionItemList:CollectionItem[]=[]
    managerDecisionInfo!:AdminResult
    reviewerDepartmentDecisionInfo!:AdminResult
    specialistDecisionInfo!:AdminResult
    secondSpecialistDecisionInfo!:AdminResult
    chiefDecisionInfo!:AdminResult
    requestClassificationInfo!:AdminResult
    licenseDurationTypeInfo!:AdminResult
    className	!:string
    licenseClassName	!:string
    

    searchFields:ISearchFieldsMap<CollectionApprovalClone> ={
        ...normalSearchFields(['fullSerial', 'subject']),
        ...dateSearchFields(['createdOn']),
        ...infoSearchFields(['requestTypeInfo','creatorInfo','ouInfo', 'caseStatusInfo','requestClassificationInfo'])
    }

    constructor(){
        super()
        this.service = FactoryService.getService('CollectionApprovalCloneService')
        this.finalizeSearchFields();
    }

    finalizeSearchFields(): void {
        //why 
        if (this.employeeService.isExternalUser()) {
          delete this.searchFields.ouInfo;
          delete this.searchFields.organizationId;
          delete this.searchFields.organization;
        }
    }
    
    buildBasicInfo(controls:boolean=false){
        const { requestType, requestClassification, licenseDurationType } = this;
        return {
            requestType: controls ? [requestType, [CustomValidators.required]] : requestType,
            requestClassification: controls ? [requestClassification, [CustomValidators.required]] : requestClassification,
            licenseDurationType: controls ? [licenseDurationType, [CustomValidators.required]] : licenseDurationType
        }
    }

    buildExplanation(controls:boolean=false){
        const {description} =this;
        return {
            description:controls?[description,[CustomValidators.maxLength(CustomValidators.defaultLengths.EXPLANATIONS)]]:description
        }
    }
    approve(): DialogRef {
        return this.service.approveTask(this, WFResponseType.APPROVE);
    }
    
    finalApprove(): DialogRef {
        return this.service.approveTask(this, WFResponseType.FINAL_APPROVE);
    }
    
    hasInvalidCollectionItems(): boolean {
        return !this.collectionItemList.length || this.collectionItemList.some((item) => !item.hasValidApprovalInfo());
    }
    
}