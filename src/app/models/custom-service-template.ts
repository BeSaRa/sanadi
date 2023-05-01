import { CustomServiceTemplateInterceptor } from '@app/model-interceptors/custom-service-template-interceptor';
import { normalSearchFields } from '@app/helpers/normal-search-fields';
import { INames } from '@app/interfaces/i-names';
import { AdminResult } from '@app/models/admin-result';
import { FactoryService } from '@app/services/factory.service';
import { LangService } from '@app/services/lang.service';
import { ISearchFieldsMap } from '@app/types/types';
import { CustomValidators } from '@app/validators/custom-validators';
import { SearchableCloneable } from './searchable-cloneable';
import { InterceptModel } from '@app/decorators/decorators/intercept-model';

const interceptor = new CustomServiceTemplateInterceptor()

@InterceptModel({
  send: interceptor.send,
  receive: interceptor.receive
})
export class CustomServiceTemplate extends SearchableCloneable<CustomServiceTemplate>{
  id!: string;
  approvalTemplateType!: number;
  arabicName!: string;
  englishName!: string;
  arName!: string;
  enName!: string;
  approvalTemplateTypeInfo!: AdminResult;
  langService: LangService;
  isOriginal!: boolean;
  constructor() {
    super();
    this.langService = FactoryService.getService('LangService');
    this.arName = this.arabicName
    this.enName = this.englishName
  }
  searchFields: ISearchFieldsMap<CustomServiceTemplate> = {
    ...normalSearchFields(['arabicName','englishName'])
  };
  getName(): string {
    return this[(this.langService?.map.lang + 'Name') as keyof INames] || '';
  }
  buildForm(control: boolean = false): any {
    const {
      arabicName,
      englishName,
      approvalTemplateType
    } = this;
    return {
      arabicName: control
        ? [
          arabicName,
          [
            CustomValidators.required,
            CustomValidators.maxLength(
              CustomValidators.defaultLengths.ARABIC_NAME_MAX
            ),
            CustomValidators.pattern('AR_ONLY'),
            CustomValidators.minLength(
              CustomValidators.defaultLengths.MIN_LENGTH
            ),
          ],
        ]
        : arabicName,
      englishName: control
        ? [
          englishName,
          [
            CustomValidators.required,
            CustomValidators.maxLength(
              CustomValidators.defaultLengths.ENGLISH_NAME_MAX
            ),
            CustomValidators.pattern('ENG_ONLY'),
            CustomValidators.minLength(
              CustomValidators.defaultLengths.MIN_LENGTH
            ),
          ],
        ]
        : englishName,
      approvalTemplateType: control ? [approvalTemplateType] : approvalTemplateType,
    };
  }
}
