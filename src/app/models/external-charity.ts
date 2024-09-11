import { CaseTypes } from "@app/enums/case-types.enum";
import { normalSearchFields } from "@app/helpers/normal-search-fields";
import { ExternalCharityService } from "@app/services/external-charity.service";
import { FactoryService } from "@app/services/factory.service";
import { ISearchFieldsMap } from "@app/types/types";
import { CustomValidators } from "@app/validators/custom-validators";
import { BaseModel } from "./base-model";
import { ExternalCharityFounder } from "./external-charity-founder";
import { CommonCaseStatus } from "@app/enums/common-case-status.enum";
import { ExternalCharityInterceptor } from "@app/model-interceptors/external-charity";
import { InterceptModel } from "@app/decorators/decorators/intercept-model";
import { FileNetDocument } from "./file-net-document";
import { ExternalCharityLog } from "./external-charity-log";

const { send, receive } = new ExternalCharityInterceptor();

@InterceptModel({ send, receive })
export class ExternalCharity extends BaseModel<ExternalCharity, ExternalCharityService> {
    service!: ExternalCharityService;
    caseType: CaseTypes = CaseTypes.CREATE_EXTERNAL_CHARITY;
    requestType!: number;
    creationDate!: string;
    requestFullSerial!: string;
    requestSerial!: number;
    suggestedCharityName!: string;
    previousRequestSerial!: string;
    statusDateModified!: string;
    workFieldId!: number;
    requestStatus!: number;
    requestorName!: string;
    requestorQID!: string;
    requestorAddress!: string;
    requestorEmail!: string;
    requestorMobileNo!: string;
    suggestedActivities!: string;
    serviceType!: number;
    founderList: ExternalCharityFounder[] = [];
    requestDocumentList:FileNetDocument[] =[];
    logList:ExternalCharityLog[] =[];



    constructor() {
        super();
        this.service = FactoryService.getService('ExternalCharityService')
    }

    searchFields: ISearchFieldsMap<ExternalCharity> = {
        ...normalSearchFields(['requestFullSerial', 'requestType', 'requestStatus']),
        // ...infoSearchFields(['departmentInfo'])
    };
    buildForm(controls?: boolean): any {
        const {
            requestType, serviceType, previousRequestSerial,
            suggestedCharityName, suggestedActivities, workFieldId,
            requestorName, requestorQID, requestorAddress,
            requestorEmail, requestorMobileNo, founderList
        } = this;
        return {

            requestType: controls ? [requestType, [CustomValidators.required]] : requestType,
            serviceType: controls ? [serviceType, [CustomValidators.required]] : serviceType,
            founderList: controls ? [founderList, [CustomValidators.requiredArray]] : founderList,
            previousRequestSerial: controls ? [previousRequestSerial,
                [CustomValidators.maxLength(CustomValidators.defaultLengths.ENGLISH_NAME_MAX)]] : previousRequestSerial,
            suggestedCharityName: controls ? [suggestedCharityName,
                [CustomValidators.required,CustomValidators.maxLength(CustomValidators.defaultLengths.ENGLISH_NAME_MAX)]] : suggestedCharityName,
            suggestedActivities: controls ? [suggestedActivities,
                [CustomValidators.required,CustomValidators.maxLength(CustomValidators.defaultLengths.ENGLISH_NAME_MAX)]] : suggestedActivities,
            workFieldId: controls ? [workFieldId, [CustomValidators.required]] : workFieldId,
            requestorName: controls ? [requestorName, [CustomValidators.maxLength(CustomValidators.defaultLengths.ENGLISH_NAME_MAX)]] : requestorName,
            requestorQID: controls ? [{ value: requestorQID, disabled: true }, []] : requestorQID,
            requestorAddress: controls ? [requestorAddress,
                [CustomValidators.maxLength(CustomValidators.defaultLengths.ADDRESS_MAX)]] : requestorAddress,
            requestorEmail: controls ? [requestorEmail,
                [
                    CustomValidators.pattern('EMAIL'),
                    CustomValidators.maxLength(CustomValidators.defaultLengths.EMAIL_MAX)
                ]] : requestorEmail,
            requestorMobileNo: controls ? [requestorMobileNo,
                [CustomValidators.maxLength(CustomValidators.defaultLengths.PHONE_NUMBER_MAX)]] : requestorMobileNo,
        }
    }

    isFinalApproved(): boolean {
        return this.requestStatus === CommonCaseStatus.FINAL_APPROVE;
    }

    isFinalNotification(): boolean {
        return this.requestStatus === CommonCaseStatus.FINAL_NOTIFICATION;
    }
}

