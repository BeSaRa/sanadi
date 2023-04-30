import { InterceptModel } from '@app/decorators/decorators/intercept-model';
import { normalSearchFields } from '@app/helpers/normal-search-fields';
import { OrganizationOfficerInterceptor } from '@app/model-interceptors/organization-officer-interceptor';
import { SearchableCloneable } from '@app/models/searchable-cloneable';
import { ISearchFieldsMap } from '@app/types/types';
import { CustomValidators } from '@app/validators/custom-validators';
import { FactoryService } from '@services/factory.service';
import { LangService } from '@services/lang.service';

const { receive, send } = new OrganizationOfficerInterceptor();

@InterceptModel({ receive, send })
export class OrganizationOfficer extends SearchableCloneable<OrganizationOfficer>{
  qid!: string;
  organizationId!: number;
  fullName!: string;
  email!: string;
  phone!: string;
  identificationNumber!: string;
  extraPhone!: string;
  langService?: LangService;
  searchFields: ISearchFieldsMap<OrganizationOfficer> = {
    ...normalSearchFields(['fullName'])
  };
  constructor() {
    super();
    this.langService = FactoryService.getService('LangService');
  }
  buildForm(controls:boolean) {
    return {
      identificationNumber: controls? 
        [null, [CustomValidators.required].concat(CustomValidators.commonValidations.qId)]:this.identificationNumber,
      fullName: controls?  
        [null, [CustomValidators.required, CustomValidators.maxLength(CustomValidators.defaultLengths.ENGLISH_NAME_MAX)]]:this.fullName,
      email: controls? 
        [null, [CustomValidators.required, CustomValidators.maxLength(50), CustomValidators.pattern('EMAIL')]]:this.email,
      phone: controls? 
        [null, [CustomValidators.required].concat(CustomValidators.commonValidations.phone)]:this.phone,
      extraPhone: controls? 
        [null, CustomValidators.commonValidations.phone]:this.extraPhone
    }
  }
}
