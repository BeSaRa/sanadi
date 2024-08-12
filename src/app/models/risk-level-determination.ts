import { InterceptModel } from "@app/decorators/decorators/intercept-model";
import { infoSearchFields } from "@app/helpers/info-search-fields";
import { normalSearchFields } from "@app/helpers/normal-search-fields";
import { RiskLevelDeterminationInterceptor } from "@app/model-interceptors/risk-level-determination-interceptor ";
import { FactoryService } from "@app/services/factory.service";
import { ISearchFieldsMap } from "@app/types/types";
import { CustomValidators } from "@app/validators/custom-validators";
import { AdminResult } from "./admin-result";
import { BaseModel } from "./base-model";
import { RiskLevelDeterminationService } from "@app/services/risk-level-determination.service";
import { Country } from "./country";

const { send, receive } = new RiskLevelDeterminationInterceptor()
@InterceptModel({ send, receive })
export class RiskLevelDetermination extends BaseModel<RiskLevelDetermination, RiskLevelDeterminationService> {
    countryId!: number;
    applicantId!: number;
    requestSerial!: number;
    requestFullSerial!: string;
    requestStatus!: number;
    riskLevel!: number;
    requiredAttentionLevel!: number;
    isAcknowledged!: boolean;
    privateConditionAr!: string;
    privateConditionEn!: string;
    comment!: string;
    statusDateModified!: string;
    auditDate!:string;
    operation!:number;
    status!: number;
    statusInfo!: AdminResult;
    requestStatusInfo!: AdminResult;
    countryInfo!: AdminResult;
    applicantInfo!: AdminResult;
    operationInfo!: AdminResult;



    service: RiskLevelDeterminationService;

    constructor() {
        super();
        this.service = FactoryService.getService('RiskLevelDeterminationService')
    }

    searchFields: ISearchFieldsMap<RiskLevelDetermination> = {
        ...normalSearchFields(['comment']),
        ...infoSearchFields(['applicantInfo','countryInfo','requestStatusInfo']),
    };

    buildForm(controls?: boolean): any {
        const {
            riskLevel,
            privateConditionAr,
            privateConditionEn
        } = this;
        return {
            riskLevel: controls ? [riskLevel, CustomValidators.required] : riskLevel,
            privateConditionEn: controls ?
                [privateConditionEn,
                    [CustomValidators.required, CustomValidators.maxLength(CustomValidators.defaultLengths.EXPLANATIONS)]
                ] : privateConditionEn,
            privateConditionAr: controls ?
                [privateConditionAr,
                    [CustomValidators.required, CustomValidators.maxLength(CustomValidators.defaultLengths.EXPLANATIONS)]
                ] : privateConditionAr,
        }
    }

    static MapFromCountry(country: Country) {
        return new RiskLevelDetermination().clone({
            countryId: country.id,
            privateConditionAr: country.privateConditionAr,
            privateConditionEn: country.privateConditionEn,
            riskLevel: country.riskLevel,
            requiredAttentionLevel: country.requiredAttentionLevel
        })
    }


}