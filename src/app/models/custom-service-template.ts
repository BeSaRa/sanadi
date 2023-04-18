import { InterceptModel } from '@app/decorators/decorators/intercept-model';
import { CustomServiceTemplateInterceptor } from '@app/model-interceptors/custom-service-template-interceptor';
import { AdminResult } from '@app/models/admin-result';
import { CustomValidators } from '@app/validators/custom-validators';
import { SearchableCloneable } from './searchable-cloneable';

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
  approvalTemplateTypeInfo!: AdminResult;
  constructor() {
    super();
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
