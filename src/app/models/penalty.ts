import { InterceptModel } from "@app/decorators/decorators/intercept-model";
import { CommonStatusEnum } from "@app/enums/common-status.enum";
import { infoSearchFields } from "@app/helpers/info-search-fields";
import { normalSearchFields } from "@app/helpers/normal-search-fields";
import { PenaltyInterceptor } from "@app/model-interceptors/penalty-interceptor";
import { FactoryService } from "@app/services/factory.service";
import { LangService } from "@app/services/lang.service";
import { PenaltyService } from "@app/services/penalty.service";
import { ISearchFieldsMap } from "@app/types/types";
import { CustomValidators } from "@app/validators/custom-validators";
import { AdminResult } from "./admin-result";
import { BaseModel } from "./base-model";

const { send, receive } = new PenaltyInterceptor();

@InterceptModel({ send, receive })
export class Penalty extends BaseModel<Penalty, PenaltyService> {
    service!: PenaltyService;
    penaltyClassificationAr!: string;
    penaltyClassificationEn!: string;
    penaltyAr!: string;
    penaltyEn!: string;
    status: number = CommonStatusEnum.ACTIVATED;
    statusInfo!: AdminResult;
    statusDateModified!: string;

    langService: LangService;
    searchFields: ISearchFieldsMap<Penalty> = {
        ...normalSearchFields(['penaltyClassificationAr', 'penaltyClassificationEn', 'penaltyAr', 'penaltyEn']),
        ...infoSearchFields(['statusInfo'])
    };

    constructor() {
        super();
        this.langService = FactoryService.getService('LangService');
        try {
            this.service = FactoryService.getService('PenaltyService');
        } catch { }
    }

    buildForm(controls?: boolean): any {
        const {
            penaltyAr,
            penaltyEn,
            penaltyClassificationAr,
            penaltyClassificationEn,
        } = this;
        return {
            penaltyAr: controls ? [penaltyAr, [
                CustomValidators.required,
                CustomValidators.maxLength(CustomValidators.defaultLengths.ARABIC_NAME_MAX),
                CustomValidators.minLength(CustomValidators.defaultLengths.MIN_LENGTH),
                CustomValidators.pattern('AR_NUM_ONE_AR')
            ]] : penaltyAr,
            penaltyEn: controls ? [penaltyEn, [
                CustomValidators.required,
                CustomValidators.maxLength(CustomValidators.defaultLengths.ENGLISH_NAME_MAX),
                CustomValidators.minLength(CustomValidators.defaultLengths.MIN_LENGTH),
                CustomValidators.pattern('ENG_NUM_ONE_ENG')
            ]] : penaltyEn,
            penaltyClassificationAr: controls ? [penaltyClassificationAr, [
                CustomValidators.required,
                CustomValidators.maxLength(CustomValidators.defaultLengths.ARABIC_NAME_MAX),
                CustomValidators.minLength(CustomValidators.defaultLengths.MIN_LENGTH),
                CustomValidators.pattern('AR_NUM_ONE_AR')
            ]] : penaltyClassificationAr,
            penaltyClassificationEn: controls ? [penaltyClassificationEn, [
                CustomValidators.required,
                CustomValidators.maxLength(CustomValidators.defaultLengths.ENGLISH_NAME_MAX),
                CustomValidators.minLength(CustomValidators.defaultLengths.MIN_LENGTH),
                CustomValidators.pattern('ENG_NUM_ONE_ENG')
            ]] : penaltyClassificationEn,
        }
    }

    getName(): string {
        return this.langService.map.lang === 'en' ? this.penaltyEn : this.penaltyAr;

    }

    getClassification(): string {
        return this.langService.map.lang === 'en' ? this.penaltyClassificationEn : this.penaltyClassificationAr;

    }
    isActive(): boolean {
        return Number(this.status) === CommonStatusEnum.ACTIVATED;
    }

    updateStatus(newStatus: CommonStatusEnum): any {
        return this.service.updateStatus(this.id, newStatus);
    }
}
