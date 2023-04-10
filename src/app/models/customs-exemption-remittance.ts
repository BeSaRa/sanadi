import {CaseTypes} from '@app/enums/case-types.enum';
import {dateSearchFields} from '@app/helpers/date-search-fields';
import {infoSearchFields} from '@app/helpers/info-search-fields';
import {normalSearchFields} from '@app/helpers/normal-search-fields';
import {FactoryService} from '@app/services/factory.service';
import {CustomsExemptionRemittanceService} from '@services/customs-exemption-remittance.service';
import {ISearchFieldsMap} from '@app/types/types';
import {CustomValidators} from '@app/validators/custom-validators';
import {AdminResult} from './admin-result';
import {CaseModel} from './case-model';
import {TaskDetails} from './task-details';
import {DialogService} from '@app/services/dialog.service';
import {DateUtils} from '@app/helpers/date-utils';
import {mixinRequestType} from '@app/mixins/mixin-request-type';
import {HasRequestType} from '@app/interfaces/has-request-type';
import {InterceptModel} from '@decorators/intercept-model';
import {CustomsExemptionRemittanceInterceptor} from '@app/model-interceptors/customs-exemption-remittance-interceptor';

const _ApprovalDocument = mixinRequestType(CaseModel);
const {send, receive} = new CustomsExemptionRemittanceInterceptor();

@InterceptModel({send, receive})
export class CustomsExemptionRemittance extends _ApprovalDocument<CustomsExemptionRemittanceService, CustomsExemptionRemittance> implements HasRequestType {
  service: CustomsExemptionRemittanceService;
  id!: string;
  createdOn!: string;
  lastModified!: string;
  classDescription!: string;
  creatorInfo!: AdminResult;
  ouInfo!: AdminResult;
  serial!: number;
  fullSerial!: string;
  caseStatus!: number;
  caseType: number = CaseTypes.CUSTOMS_EXEMPTION_REMITTANCE;
  organizationId!: number;
  taskDetails!: TaskDetails;
  caseStatusInfo!: AdminResult;
  arName!: string;
  exportedBookFullSerial!: string;
  chiefDecision!: number;
  chiefJustification!: string;
  country!: number;
  customTerms!: string;
  description!: string;
  enName!: string;
  exportedBookId!: string;
  bookId!: string;
  bookTemplateId!: string;
  exportedBookVSID!: string;
  followUpDate!: string;
  linkedProject!: number;
  managerDecision!: number;
  managerJustification!: string;
  otherReceiverName!: string;
  oldFullSerial!: string;   // old order number
  oldBookFullSerial!: string; // old book document number
  projectLicense!: string;
  projectName!: string;
  publicTerms!: string;
  requestType!: number;
  reviewerDepartmentDecision!: number;
  reviewerDepartmentJustification!: string;
  receiverType!: number;
  receiverName!: string;
  specialistDecision!: number;
  specialistJustification!: string;
  shipmentApproximateValue!: number;
  shipmentCarrier!: number;
  shipmentPort!: string;
  shipmentSource!: number;
  shipmentWeight!: number;
  subject!: string;
  waybill!: string;
  zoneNumber!: string;
  managerDecisionInfo!: AdminResult;
  reviewerDepartmentDecisionInfo!: AdminResult;
  specialistDecisionInfo!: AdminResult;
  chiefDecisionInfo!: AdminResult;
  requestTypeInfo!: AdminResult;
  countryInfo!: AdminResult;
  shipmentSourceInfo!: AdminResult;
  linkedProjectInfo!: AdminResult;
  receiverTypeInfo!: AdminResult;
  receiverNameInfo!: AdminResult;
  shipmentCarrierInfo!: AdminResult;
  className!: string;
  licenseClassName!: string;

  dialog!: DialogService;

  searchFields: ISearchFieldsMap<CustomsExemptionRemittance> = {
    ...normalSearchFields(['fullSerial']),
    ...dateSearchFields(['createdOn']),
    ...infoSearchFields(['requestTypeInfo', 'creatorInfo', 'caseStatusInfo']),
  };

  constructor() {
    super();
    this.service = FactoryService.getService('CustomsExemptionRemittanceService');
    this.dialog = FactoryService.getService('DialogService');
  }

  buildBasicInfo(controls: boolean = false): any {
    const {
      arName,
      enName,
      requestType,
      description,
      shipmentSource,
      shipmentWeight,
      waybill,
      shipmentPort,
      linkedProject,
      // projectLicense,
      projectName,
      country,
      zoneNumber,
      receiverType,
      receiverName,
      otherReceiverName,
      shipmentApproximateValue,
      shipmentCarrier,
      oldFullSerial, // order number
      oldBookFullSerial // document number
    } = this;

    return {
      arName: controls ? [arName, [CustomValidators.required,
        CustomValidators.maxLength(200),
        CustomValidators.minLength(CustomValidators.defaultLengths.MIN_LENGTH),
        CustomValidators.pattern('AR_NUM')]] : arName,
      enName: controls ? [enName, [CustomValidators.required,
        CustomValidators.maxLength(200),
        CustomValidators.minLength(CustomValidators.defaultLengths.MIN_LENGTH),
        CustomValidators.pattern('ENG_NUM')]] : enName,
      requestType: controls ? [requestType, [CustomValidators.required]] : requestType,
      description: controls ? [description, [CustomValidators.required, CustomValidators.maxLength(2000)]] : description,
      shipmentSource: controls ? [shipmentSource, [CustomValidators.required]] : shipmentSource,
      shipmentWeight: controls ? [shipmentWeight, [CustomValidators.required, CustomValidators.maxLength(50)]] : shipmentWeight,
      waybill: controls ? [waybill, [CustomValidators.required, CustomValidators.maxLength(200)]] : waybill,
      shipmentPort: controls ? [shipmentPort, [CustomValidators.required, CustomValidators.maxLength(200)]] : shipmentPort,
      linkedProject: controls ? [linkedProject, [CustomValidators.required]] : linkedProject,
      // projectLicense: controls ? [projectLicense, CustomValidators.maxLength(50)] : projectLicense,
      projectName: controls ? [projectName, [CustomValidators.maxLength(50)]] : projectName,
      country: controls ? [country, [CustomValidators.required]] : country,
      zoneNumber: controls ? [zoneNumber, [CustomValidators.required, CustomValidators.maxLength(200)]] : zoneNumber,
      receiverType: controls ? [receiverType, [CustomValidators.required]] : receiverType,
      receiverName: controls ? [receiverName, [CustomValidators.required]] : receiverName,
      otherReceiverName: controls ? [otherReceiverName, [CustomValidators.maxLength(200)]] : otherReceiverName,
      shipmentApproximateValue: controls ? [shipmentApproximateValue, [CustomValidators.required, CustomValidators.maxLength(50), CustomValidators.decimal(2)]] : shipmentApproximateValue,
      shipmentCarrier: controls ? [shipmentCarrier, [CustomValidators.required]] : shipmentCarrier,
      oldFullSerial: controls ? [oldFullSerial, [CustomValidators.maxLength(250)]] : oldFullSerial,
      oldBookFullSerial: controls ? [oldBookFullSerial, [CustomValidators.maxLength(250)]] : oldBookFullSerial,
    };
  }

  /*approve(): DialogRef {
    return this.dialog.show(CustomsExemptionApproveTaskPopupComponent, {
      model: this,
      action: WFResponseType.APPROVE,
    });
  }

  finalApprove(): DialogRef {
    return this.dialog.show(CustomsExemptionApproveTaskPopupComponent, {
      model: this,
      action: WFResponseType.FINAL_APPROVE,
    });
  }*/

  buildApprovalForm(controls: boolean = false): any {
    const {followUpDate} = this;
    return {
      followUpDate: controls ? [DateUtils.changeDateToDatepicker(followUpDate)] : DateUtils.changeDateToDatepicker(followUpDate),
    };
  }
}
