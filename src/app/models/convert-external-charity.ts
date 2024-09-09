import { InterceptModel } from "@app/decorators/decorators/intercept-model";
import { CaseTypes } from "@app/enums/case-types.enum";
import { CommonCaseStatus } from "@app/enums/common-case-status.enum";
import { normalSearchFields } from "@app/helpers/normal-search-fields";
import { ConvertExternalCharityInterceptor } from "@app/model-interceptors/convert-external-charity-interceptor";
import { ConvertExternalCharityService } from "@app/services/convert-external-charity.service";
import { EmployeeService } from "@app/services/employee.service";
import { FactoryService } from "@app/services/factory.service";
import { ISearchFieldsMap } from "@app/types/types";
import { CustomValidators } from "@app/validators/custom-validators";
import { BaseModel } from "./base-model";
import { ExternalCharityFounder } from "./external-charity-founder";
import { ExternalCharityLog } from "./external-charity-log";
import { FileNetDocument } from "./file-net-document";

const { send, receive } = new ConvertExternalCharityInterceptor();

@InterceptModel({ send, receive })
export class ConvertExternalCharity extends BaseModel<ConvertExternalCharity, ConvertExternalCharityService> {
    service!: ConvertExternalCharityService;
    employeeService!:EmployeeService;
    caseType: CaseTypes = CaseTypes.ESTABLISHMENT_OF_CHARITY;
    requestType!: number;
    creationDate!: string;
    requestFullSerial?: string;
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
    currentCharityName!: string;
    adjustmentReason!: number;
    founderList: ExternalCharityFounder[] = [];
    requestDocumentList:FileNetDocument[] =[];
    logList:ExternalCharityLog[] =[];

    constructor() {
        super();
        this.service = FactoryService.getService('ConvertExternalCharityService')
        this.employeeService = FactoryService.getService('EmployeeService');
        this.requestorQID = !this.requestorQID ? this.employeeService.getCurrentUser().qid??'' : this.requestorQID;
        this.requestorName = !this.requestorName ? this.employeeService.getCurrentUser().getName()??'' : this.requestorName;
        this.requestorEmail = !this.requestorEmail ? this.employeeService.getCurrentUser().email??'' : this.requestorEmail;
      }

    searchFields: ISearchFieldsMap<ConvertExternalCharity> = {
        ...normalSearchFields(['requestFullSerial', 'requestorName', 'suggestedCharityName']),
    };
    buildForm(controls?: boolean): any {
        const {
            requestType,  previousRequestSerial,currentCharityName,
            suggestedCharityName,adjustmentReason,  workFieldId,
            requestorName, requestorQID, requestorAddress,
            requestorEmail, requestorMobileNo, founderList
        } = this;
        return {

            requestType: controls ? [requestType, [CustomValidators.required]] : requestType,
            founderList: controls ? [founderList, [CustomValidators.requiredArray]] : founderList,
            previousRequestSerial: controls ? [previousRequestSerial,
                [CustomValidators.maxLength(CustomValidators.defaultLengths.ENGLISH_NAME_MAX)]] : previousRequestSerial,
            currentCharityName: controls ? [currentCharityName,
                [CustomValidators.maxLength(CustomValidators.defaultLengths.ENGLISH_NAME_MAX)]] : currentCharityName,
            suggestedCharityName: controls ? [suggestedCharityName,
                [CustomValidators.maxLength(CustomValidators.defaultLengths.ENGLISH_NAME_MAX)]] : suggestedCharityName,
            adjustmentReason: controls ? [adjustmentReason,
                [CustomValidators.maxLength(CustomValidators.defaultLengths.ENGLISH_NAME_MAX)]] : adjustmentReason,
            workFieldId: controls ? [workFieldId, []] : workFieldId,
            requestorName: controls ? [{value:requestorName,disabled:true}, [CustomValidators.maxLength(CustomValidators.defaultLengths.ENGLISH_NAME_MAX)]] : requestorName,
            requestorQID: controls ? [{ value: requestorQID, disabled: true }, []] : requestorQID,
            requestorAddress: controls ? [requestorAddress ,
                [CustomValidators.maxLength(CustomValidators.defaultLengths.ADDRESS_MAX)]] : requestorAddress,
            requestorEmail: controls ? [{value:requestorEmail, disabled:true},
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