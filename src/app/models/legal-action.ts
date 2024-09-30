import { CommonStatusEnum } from "@app/enums/common-status.enum";
import { infoSearchFields } from "@app/helpers/info-search-fields";
import { normalSearchFields } from "@app/helpers/normal-search-fields";
import { FactoryService } from "@app/services/factory.service";
import { LangService } from "@app/services/lang.service";
import { ISearchFieldsMap } from "@app/types/types";
import { AdminResult } from "./admin-result";
import { BaseModel } from "./base-model";
import { LegalActionInterceptor } from "@app/model-interceptors/legal-action-interceptor";
import { InterceptModel } from "@app/decorators/decorators/intercept-model";
import { LegalActionService } from "@app/services/legal-action.service";
import { CustomValidators } from "@app/validators/custom-validators";

const {send,receive} = new LegalActionInterceptor();

@InterceptModel({send,receive})
export class LegalAction extends BaseModel<LegalAction, LegalActionService> {
    service: LegalActionService;
    subActionAr!: string;
    subActionEn!: string;
    mainAction!: number;
    status: number = CommonStatusEnum.ACTIVATED;
    statusInfo!: AdminResult;
    mainActionInfo!: AdminResult;
    statusDateModified!: string;

    langService: LangService;
    searchFields: ISearchFieldsMap<LegalAction> = {
        ...normalSearchFields(['subActionAr', 'subActionEn']),
        ...infoSearchFields(['statusInfo'])
    };

    constructor() {
        super();
        this.langService = FactoryService.getService('LangService');
        this.service = FactoryService.getService('LegalActionService');
    }
    buildForm(controls?: boolean): any {
        const {
            subActionAr,
            subActionEn,
            mainAction,
        } = this;
        return {
            subActionAr: controls ? [subActionAr, [
                CustomValidators.required,
                CustomValidators.maxLength(CustomValidators.defaultLengths.ARABIC_NAME_MAX),
                CustomValidators.minLength(CustomValidators.defaultLengths.MIN_LENGTH),
                CustomValidators.pattern('AR_NUM_ONE_AR')
            ]] : subActionAr,
            subActionEn: controls ? [subActionEn, [
                CustomValidators.required,
                CustomValidators.maxLength(CustomValidators.defaultLengths.ENGLISH_NAME_MAX),
                CustomValidators.minLength(CustomValidators.defaultLengths.MIN_LENGTH),
                CustomValidators.pattern('ENG_NUM_ONE_ENG')
            ]] : subActionEn,
            mainAction :controls ? [mainAction, [CustomValidators.required]] : mainAction
         
        }
    }

    getName(): string {
        return this.langService.map.lang === 'en' ? this.subActionEn : this.subActionAr;

    }
    isActive(): boolean {
        return Number(this.status) === CommonStatusEnum.ACTIVATED;
      }
    
      updateStatus(newStatus: CommonStatusEnum): any {
        return this.service.updateStatus(this.id, newStatus);
      }
}
