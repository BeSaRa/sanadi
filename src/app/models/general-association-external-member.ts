import { SearchableCloneable } from '@app/models/searchable-cloneable';
import { AdminResult } from '@app/models/admin-result';
import { LangService } from '@services/lang.service';
import { FactoryService } from '@services/factory.service';
import { CustomValidators } from '@app/validators/custom-validators';

export class GeneralAssociationExternalMember extends SearchableCloneable<GeneralAssociationExternalMember>{
  id?: number;
  arabicName!: string;
  englishName!: string;
  jobTitleId!: number;
  identificationNumber!: number;
  jobTitleInfo!: AdminResult;
  langService!: LangService;

  constructor() {
    super();
    this.langService = FactoryService.getService('LangService');
  }

  getName(): string {
    return this.langService.map.lang === 'ar' ? this.arabicName : this.englishName;
  }

  buildForm(control:boolean, isGeneralAssociationMembers:boolean){
    const {arabicName, englishName, identificationNumber, jobTitleId} = this;
    if(isGeneralAssociationMembers) {
      return {
        arabicName: control? 
          [arabicName, 
            [ CustomValidators.required, 
              CustomValidators.minLength(CustomValidators.defaultLengths.MIN_LENGTH), 
              CustomValidators.maxLength(CustomValidators.defaultLengths.ARABIC_NAME_MAX), 
              CustomValidators.pattern('AR_NUM')]
          ]:
          arabicName,
        englishName: control? 
          [englishName, 
            [ CustomValidators.required, 
              CustomValidators.minLength(CustomValidators.defaultLengths.MIN_LENGTH), 
              CustomValidators.maxLength(CustomValidators.defaultLengths.ENGLISH_NAME_MAX), 
              CustomValidators.pattern('ENG_NUM')]
          ]:
          englishName,
        identificationNumber: console? 
          [identificationNumber, 
            [ CustomValidators.required ].concat(CustomValidators.commonValidations.qId)
          ]:
          identificationNumber,
        jobTitleId: control? 
          [jobTitleId, 
            [ CustomValidators.required ]
          ]:
          jobTitleId,
      }
    } else {
      return {
      arabicName: control? 
        [arabicName, 
          [ CustomValidators.required, 
            CustomValidators.minLength(CustomValidators.defaultLengths.MIN_LENGTH), 
            CustomValidators.maxLength(CustomValidators.defaultLengths.ARABIC_NAME_MAX), 
            CustomValidators.pattern('AR_NUM')]
        ]:
        arabicName,
      englishName: control? 
        [englishName, 
          [ CustomValidators.required, 
            CustomValidators.minLength(CustomValidators.defaultLengths.MIN_LENGTH), 
            CustomValidators.maxLength(CustomValidators.defaultLengths.ENGLISH_NAME_MAX), 
            CustomValidators.pattern('ENG_NUM')]
        ]:
        englishName,
      identificationNumber: console? 
        [identificationNumber, 
          [ CustomValidators.required ].concat(CustomValidators.commonValidations.qId)
        ]:
        identificationNumber,
      }
    }
  }
}
