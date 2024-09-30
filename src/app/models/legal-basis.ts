import { CommonStatusEnum } from "@app/enums/common-status.enum";
import { BaseModel } from "./base-model";
import { FactoryService } from "@app/services/factory.service";
import { LangService } from "@app/services/lang.service";
import { ISearchFieldsMap, searchFunctionType } from "@app/types/types";
import { normalSearchFields } from "@app/helpers/normal-search-fields";
import { infoSearchFields } from "@app/helpers/info-search-fields";
import { AdminResult } from "./admin-result";
import { LegalBasisInterceptor } from "@app/model-interceptors/legal-basis-interceptor";
import { InterceptModel } from "@app/decorators/decorators/intercept-model";
import { LegalBasisService } from "@app/services/legal-basis.service";
import { CustomValidators } from "@app/validators/custom-validators";

const {send,receive} = new LegalBasisInterceptor();

@InterceptModel({send,receive})
export class LegalBasis extends BaseModel<LegalBasis, LegalBasisService> {
    service: LegalBasisService;
    titleAr!: string;
    titleEn!: string;
    textAr!: string;
    textEn!: string;
    legalDocumentTitleAr!: string;
    legalDocumentTitleEn!: string;
    status: number = CommonStatusEnum.ACTIVATED;
    statusInfo!:AdminResult;
    statusDateModified!: string;

    langService: LangService;
    searchFields: ISearchFieldsMap<LegalBasis> = {
        ...normalSearchFields(['titleAr', 'titleEn' ,'textAr','textEn']),
        ...infoSearchFields(['statusInfo'])
      };
  
    constructor() {
      super();
      this.langService = FactoryService.getService('LangService');
      this.service = FactoryService.getService('LegalBasisService')
    }
    buildForm(controls?: boolean): any {
      const {
          titleAr,
          titleEn,
          textAr,
          textEn,
          legalDocumentTitleAr,
          legalDocumentTitleEn
      } = this;
      return {
          titleAr: controls ? [titleAr, [
              CustomValidators.required,
              CustomValidators.maxLength(CustomValidators.defaultLengths.ARABIC_NAME_MAX),
              CustomValidators.minLength(CustomValidators.defaultLengths.MIN_LENGTH),
              CustomValidators.pattern('AR_NUM_ONE_AR')
          ]] : titleAr,
          titleEn: controls ? [titleEn, [
              CustomValidators.required,
              CustomValidators.maxLength(CustomValidators.defaultLengths.ENGLISH_NAME_MAX),
              CustomValidators.minLength(CustomValidators.defaultLengths.MIN_LENGTH),
              CustomValidators.pattern('ENG_NUM_ONE_ENG')
          ]] : titleEn,
          textAr: controls ? [textAr, [
              CustomValidators.required,
              CustomValidators.maxLength(CustomValidators.defaultLengths.ARABIC_NAME_MAX),
              CustomValidators.minLength(CustomValidators.defaultLengths.MIN_LENGTH),
              CustomValidators.pattern('AR_NUM_ONE_AR')
          ]] : textAr,
          textEn: controls ? [textEn, [
              CustomValidators.required,
              CustomValidators.maxLength(CustomValidators.defaultLengths.ENGLISH_NAME_MAX),
              CustomValidators.minLength(CustomValidators.defaultLengths.MIN_LENGTH),
              CustomValidators.pattern('ENG_NUM_ONE_ENG')
          ]] : textEn,
          legalDocumentTitleAr: controls ? [legalDocumentTitleAr, [
              CustomValidators.required,
              CustomValidators.maxLength(CustomValidators.defaultLengths.ARABIC_NAME_MAX),
              CustomValidators.minLength(CustomValidators.defaultLengths.MIN_LENGTH),
              CustomValidators.pattern('AR_NUM_ONE_AR')
          ]] : legalDocumentTitleAr,
          legalDocumentTitleEn: controls ? [legalDocumentTitleEn, [
              CustomValidators.required,
              CustomValidators.maxLength(CustomValidators.defaultLengths.ENGLISH_NAME_MAX),
              CustomValidators.minLength(CustomValidators.defaultLengths.MIN_LENGTH),
              CustomValidators.pattern('ENG_NUM_ONE_ENG')
          ]] : legalDocumentTitleEn,
       
      }
  }

  getName(): string {
      return this.langService.map.lang === 'en' ? this.titleEn : this.titleAr;

  }
  getText(): string {
      return this.langService.map.lang === 'en' ? this.textEn : this.textAr;

  }
  getDocumentTitle(): string {
      return this.langService.map.lang === 'en' ? this.legalDocumentTitleEn : this.legalDocumentTitleAr;

  }
  isActive(): boolean {
    return Number(this.status) === CommonStatusEnum.ACTIVATED;
  }

  updateStatus(newStatus: CommonStatusEnum): any {
    return this.service.updateStatus(this.id, newStatus);
  }
}


