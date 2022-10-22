import { WFResponseType } from './../enums/wfresponse-type.enum';
import { DialogRef } from './../shared/models/dialog-ref';
import { IMyDateModel } from 'angular-mydatepicker';
import { GeneralProcessNotificationInterceptor } from './../model-interceptors/generalProcessNotificationInterceptor';
import { GeneralProcessNotificationService } from './../services/general-process-notification.service';
import { normalSearchFields } from '@app/helpers/normal-search-fields';
import { infoSearchFields } from '@app/helpers/info-search-fields';
import { dateSearchFields } from '@app/helpers/date-search-fields';
import { CustomValidators } from './../validators/custom-validators';
import { FactoryService } from './../services/factory.service';
import { ISearchFieldsMap } from './../types/types';
import { CaseModel } from '@app/models/case-model';
import { mixinRequestType } from '@app/mixins/mixin-request-type';
import { mixinLicenseDurationType } from '@app/mixins/mixin-license-duration';
import { HasRequestType } from './../interfaces/has-request-type';
import { HasLicenseDurationType } from './../interfaces/has-license-duration-type';
import { CaseModelContract } from './../contracts/case-model-contract';
import { CaseTypes } from '@app/enums/case-types.enum';
import { InterceptModel } from '@app/decorators/decorators/intercept-model';
const _RequestType = mixinLicenseDurationType(mixinRequestType(CaseModel));
const interceptor = new GeneralProcessNotificationInterceptor();

@InterceptModel({
  send: interceptor.send,
  receive: interceptor.receive,
})
export class GeneralProcessNotification
  extends _RequestType<GeneralProcessNotificationService, GeneralProcessNotification>
  implements HasRequestType, HasLicenseDurationType, CaseModelContract<GeneralProcessNotificationService, GeneralProcessNotification> {
  service!: GeneralProcessNotificationService;
  caseType: number = CaseTypes.GENERAL_PROCESS_NOTIFICATION;
  // basic data
  requestType!: number;
  description!: string;

  followUpDate!: string | IMyDateModel;

  subject!: string;
  fullSerial!: string;
  oldLicenseFullSerial!: string;
  oldLicenseId!: string;
  oldLicenseSerial!: number;

  searchFields: ISearchFieldsMap<GeneralProcessNotification> = {
    ...dateSearchFields(['createdOn']),
    ...infoSearchFields(['creatorInfo', 'ouInfo']),
    ...normalSearchFields(['fullSerial', 'subject'])
  };
  constructor() {
    super();
    this.service = FactoryService.getService("GeneralProcessNotificationService");
    this.finalizeSearchFields();
  }
  finalizeSearchFields(): void {
    if (this.employeeService.isExternalUser()) {
      delete this.searchFields.ouInfo;
      delete this.searchFields.organizationId;
      delete this.searchFields.organization;
    }
  }

  buildForm(controls?: boolean) {
    const {
      requestType,
      description,
      oldLicenseFullSerial
    } = this;
    return {
      requestType: controls ? [requestType, CustomValidators.required] : requestType,
      oldLicenseFullSerial: controls ? [oldLicenseFullSerial] : oldLicenseFullSerial,
      description: controls ? [description, CustomValidators.required] : description,
      DSNNN: {

      },
      sampleDataForOperations: {

      },
      //   unifiedEconomicRecord: controls ? [unifiedEconomicRecord, [Validators.maxLength(150)]] : unifiedEconomicRecord,
      //   activityType: controls ? [activityType, [Validators.required]] : activityType,
      //   registrationNumber: controls ? [registrationNumber, []] : registrationNumber,
      //   registrationAuthority: controls ? [registrationAuthority, []] : registrationAuthority,
      //   clearanceName: controls ? [clearanceName, []] : clearanceName,
      //   clearanceType: controls ? [clearanceType, []] : clearanceType,
      //   clearanceDate: controls ? [clearanceDate, []] : clearanceDate,
      //   disbandmentType: controls ? [disbandmentType, []] : disbandmentType,
      //   disbandmentDate: controls ? [disbandmentDate, []] : disbandmentDate,
      //   establishmentDate: controls ? [establishmentDate, []] : establishmentDate,
      //   registrationDate: controls ? [registrationDate, []] : registrationDate,
      // email: controls ? [email, [CustomValidators.required, CustomValidators.maxLength(50), CustomValidators.pattern('EMAIL')]] : email,
      // phone: controls ? [phone, [CustomValidators.required].concat(CustomValidators.commonValidations.phone)] : phone,
      // zoneNumber: controls ? [zoneNumber, [CustomValidators.required, CustomValidators.maxLength(200)]] : zoneNumber,
      // streetNumber: controls ? [streetNumber, [CustomValidators.required, CustomValidators.maxLength(200)]] : streetNumber,
      // buildingNumber: controls ? [buildingNumber, [CustomValidators.required, CustomValidators.maxLength(200)]] : buildingNumber,
      // fax: controls ? [fax, [CustomValidators.required].concat(CustomValidators.commonValidations.fax)] : fax,
      // address: controls ? [address, [CustomValidators.required, CustomValidators.maxLength(100)]] : address,
      // website: controls ? [website, [CustomValidators.required, CustomValidators.maxLength(350)]] : website,
      // facebook: controls ? [facebook, [CustomValidators.maxLength(350)]] : facebook,
      // twitter: controls ? [twitter, [CustomValidators.maxLength(350)]] : twitter,
      // instagram: controls ? [instagram, [CustomValidators.maxLength(350)]] : instagram,
      // snapChat: controls ? [snapChat, [CustomValidators.maxLength(350)]] : snapChat,
      // youTube: controls ? [youTube, [CustomValidators.maxLength(350)]] : youTube,
      // hotline: controls ? [hotline, [CustomValidators.number, Validators.maxLength(10)]] : hotline
    }
  }
  buildApprovalForm(control: boolean = false): any {
    const {
      followUpDate
    } = this;
    return {
      followUpDate: control ? [followUpDate, [CustomValidators.required]] : followUpDate
    }
  }
  approve(): DialogRef {
    return this.service.approve(this, WFResponseType.APPROVE)
  }
}
