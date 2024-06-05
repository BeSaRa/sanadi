import { InterceptModel } from "@app/decorators/decorators/intercept-model";
import { infoSearchFields } from "@app/helpers/info-search-fields";
import { normalSearchFields } from "@app/helpers/normal-search-fields";
import { BannedPersonInterceptor } from "@app/model-interceptors/banned-person-interceptor";
import { BannedPersonService } from "@app/services/banned-person.service";
import { FactoryService } from "@app/services/factory.service";
import { LangService } from "@app/services/lang.service";
import { ISearchFieldsMap } from "@app/types/types";
import { CustomValidators } from "@app/validators/custom-validators";
import { IMyDateModel } from "angular-mydatepicker";
import { AdminResult } from "./admin-result";
import { BaseModel } from "./base-model";

const { send, receive } = new BannedPersonInterceptor();

@InterceptModel({ send, receive })
export class BannedPerson extends BaseModel<BannedPerson, BannedPersonService> {
    
    status!: number;
    surName!: string;
    gender!: number;
    placeOfBirth!: number;
    requestSerial!: number;
    requestFullSerial!: string;
    requestNotes!: string;
    requestType!: number;
    requestStatus!: number;
    registrationNo!: string;
    nationality!: number;
    placeOfResidence!: number;
    legalNature!: number;
    issuingCity!: string;
    documentNumber!: string;
    documentType!: number;
    otherName!: string;
    otherNationality!: string;
    countryId!: number;
    internalUserId!: number;
    departmentId!: number;
    otherIssuingCountry!: string;
    sourceType!: number;
    sourceClassification!: number;
    sourceLink!: string;
    additionStatus!: number;
    reasonsforAddition!: string;


    dateOfBirth!: IMyDateModel | string;
    otherDateOfBirth!: IMyDateModel | string;
    documentIssuanceDate!: IMyDateModel | string;
    dateOfAdding!: IMyDateModel | string;
    statusDateModified!: string;

    countryInfo!: AdminResult;
    internalUserInfo!: AdminResult;
    requestStatusInfo!: AdminResult;
    requestTypeInfo!: AdminResult;

    documentTypeInfo!: AdminResult;
    legalNatureInfo!: AdminResult;
    sourceTypeInfo!: AdminResult;
    nationalityInfo!: AdminResult;
    departmentInfo!: AdminResult;
    sourceClassificationInfo!: AdminResult;

    langService!:LangService;
    service!: BannedPersonService;

    constructor() {
        super();
        this.service = FactoryService.getService('BannedPersonService');
        this.langService = FactoryService.getService('LangService');

    }

    searchFields: ISearchFieldsMap<BannedPerson> = {
        ...normalSearchFields(['name','registrationNo','requestNotes']),
        ...infoSearchFields(['nationalityInfo','documentTypeInfo','internalUserInfo'])
      };
   get name():string {
        return this[(this.langService.map.lang + 'Name') as keyof BannedPerson] as string;
    }
    set name(value:string) {
        this.arName = value;
        this.enName= value;
    }
    buildForm(controls: boolean = false) {
        const {registrationNo,sourceClassification,sourceType,
            legalNature, sourceLink, documentType,
            documentNumber, documentIssuanceDate, otherIssuingCountry,
            issuingCity, arName, enName,
            otherName, surName, placeOfResidence,
            countryId, gender, nationality, otherNationality,
            dateOfBirth, otherDateOfBirth, dateOfAdding, placeOfBirth,
            additionStatus, reasonsforAddition } = this
        return {
            registrationNo: controls ? [registrationNo,
                [CustomValidators.required, CustomValidators.maxLength(CustomValidators.defaultLengths.ENGLISH_NAME_MAX)]] :
                registrationNo,
            sourceType: controls ? [sourceType, [CustomValidators.required]] : sourceType,
            sourceClassification: controls ? [sourceClassification, [CustomValidators.required]] : sourceClassification,
            legalNature: controls ? [legalNature, [CustomValidators.required]] : legalNature,
            sourceLink: controls ? [sourceLink, [
                CustomValidators.pattern('URL'),
                CustomValidators.maxLength(CustomValidators.defaultLengths.ENGLISH_NAME_MAX)]] :
                sourceLink,
            documentType: controls ? [documentType, [CustomValidators.required]] : documentType,
            documentNumber: controls ? [documentNumber,
                [CustomValidators.required, CustomValidators.maxLength(CustomValidators.defaultLengths.ENGLISH_NAME_MAX)]] :
                documentNumber,
            documentIssuanceDate: controls ? [documentIssuanceDate, [CustomValidators.required]] : documentIssuanceDate,
            otherIssuingCountry: controls ? [otherIssuingCountry,
                [CustomValidators.maxLength(CustomValidators.defaultLengths.ENGLISH_NAME_MAX)]] : otherIssuingCountry,
            issuingCity: controls ? [issuingCity, [CustomValidators.maxLength(CustomValidators.defaultLengths.ENGLISH_NAME_MAX)]] : issuingCity,
            arName: controls ? [arName,
                [CustomValidators.required, CustomValidators.maxLength(CustomValidators.defaultLengths.ARABIC_NAME_MAX),
                CustomValidators.pattern('AR_ONLY')]] :
                arName,
            enName: controls ? [enName,
                [CustomValidators.required, CustomValidators.maxLength(CustomValidators.defaultLengths.ENGLISH_NAME_MAX),
                CustomValidators.pattern('ENG_ONLY')]] : enName,
            otherName: controls ? [otherName, [CustomValidators.maxLength(CustomValidators.defaultLengths.ENGLISH_NAME_MAX)]] :
                otherName,
            surName: controls ? [surName, [CustomValidators.maxLength(CustomValidators.defaultLengths.ENGLISH_NAME_MAX)]] :
                surName,
            placeOfResidence: controls ? [placeOfResidence, [CustomValidators.required]] : placeOfResidence,
            placeOfBirth: controls ? [placeOfBirth, [CustomValidators.required]] : placeOfBirth,
            countryId: controls ? [countryId, [CustomValidators.required]] : countryId,
            gender: controls ? [gender, [CustomValidators.required]] : gender,
            nationality: controls ? [nationality, [CustomValidators.required]] : nationality,
            otherNationality: controls ? [otherNationality,
                [CustomValidators.maxLength(CustomValidators.defaultLengths.ENGLISH_NAME_MAX)]] : otherNationality,
            dateOfBirth: controls ? [dateOfBirth, [CustomValidators.required]] : dateOfBirth,
            otherDateOfBirth: controls ? [otherDateOfBirth, []] : otherDateOfBirth,
            dateOfAdding: controls ? [dateOfAdding, [CustomValidators.required]] : dateOfAdding,
            additionStatus: controls ? [additionStatus, [CustomValidators.required]] : additionStatus,
            reasonsforAddition: controls ? [reasonsforAddition,
                [CustomValidators.required, CustomValidators.maxLength(CustomValidators.defaultLengths.EXPLANATIONS)]] :
                reasonsforAddition,
        }
    }
    buildInquiryForm() {
        const { arName, enName, documentNumber, nationality, documentType } = this;
        return {
            arName: [arName,
                [
                    CustomValidators.maxLength(CustomValidators.defaultLengths.ARABIC_NAME_MAX),
                    CustomValidators.pattern('AR_ONLY')
                ]
            ],
            enName: [enName,
                [
                    CustomValidators.maxLength(CustomValidators.defaultLengths.ENGLISH_NAME_MAX),
                    CustomValidators.pattern('ENG_ONLY')
                ]
            ],
            documentNumber: [documentNumber,
                [CustomValidators.maxLength(CustomValidators.defaultLengths.ENGLISH_NAME_MAX)]
            ],
            nationality: [nationality],
            documentType: [documentType],
        }
    }
  
}
export type BannedPersonInquiry = Pick<BannedPerson, 'arName' | 'enName' | 'documentNumber' | 'nationality' | 'documentType'>
