import { CustomValidators } from './../validators/custom-validators';
import { FactoryService } from './../services/factory.service';
import { ISearchFieldsMap } from './../types/types';
import { CaseModel } from '@app/models/case-model';
import { mixinRequestType } from '@app/mixins/mixin-request-type';
import { mixinLicenseDurationType } from '@app/mixins/mixin-license-duration';
import { NpoManagementService } from './../services/npo-management.service';
import { HasRequestType } from './../interfaces/has-request-type';
import { HasLicenseDurationType } from './../interfaces/has-license-duration-type';
import { CaseModelContract } from './../contracts/case-model-contract';
import { CaseTypes } from '@app/enums/case-types.enum';
import { InterceptModel } from '@app/decorators/decorators/intercept-model';
import { NpoManagementInterceptor } from '@app/model-interceptors/npo-management-interceptor';
const _RequestType = mixinLicenseDurationType(mixinRequestType(CaseModel));
const interceptor = new NpoManagementInterceptor();

@InterceptModel({
  send: interceptor.send,
  receive: interceptor.receive,
})
export class NpoManagement
  extends _RequestType<NpoManagementService, NpoManagement>
  implements HasRequestType, HasLicenseDurationType, CaseModelContract<NpoManagementService, NpoManagement> {
  service!: NpoManagementService;
  caseType: number = CaseTypes.NPO_MANAGEMENT;
  requestType!: number;
  searchFields: ISearchFieldsMap<NpoManagement> = {
  };

  constructor() {
    super();
    this.service = FactoryService.getService("NpoManagementService");
    this.finalizeSearchFields();
  }
  finalizeSearchFields(): void {
    if (this.employeeService.isExternalUser()) {
      delete this.searchFields.ouInfo;
      delete this.searchFields.organizationId;
      delete this.searchFields.organization;
    }
  }

  buildForm(controls ?: boolean) {
    const { requestType } = this;
    return {
      requestType: controls ? [requestType, [CustomValidators.required]] : requestType,
    };
  }
}
