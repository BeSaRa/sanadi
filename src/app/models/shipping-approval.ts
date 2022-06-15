import {CaseTypes} from '@app/enums/case-types.enum';
import {WFResponseType} from '@app/enums/wfresponse-type.enum';
import {dateSearchFields} from '@app/helpers/date-search-fields';
import {infoSearchFields} from '@app/helpers/info-search-fields';
import {normalSearchFields} from '@app/helpers/normal-search-fields';
import {FactoryService} from '@app/services/factory.service';
import {ShippingApprovalService} from '@app/services/shipping-approval.service';
import {DialogRef} from '@app/shared/models/dialog-ref';
import {ISearchFieldsMap} from '@app/types/types';
import {CustomValidators} from '@app/validators/custom-validators';
import {AdminResult} from './admin-result';
import {CaseModel} from './case-model';
import {TaskDetails} from './task-details';
import {DialogService} from '@app/services/dialog.service';
import {
  ShippingApproveTaskPopUpComponent
} from '@app/modules/remittances/popups/shipping-approve-task-pop-up/shipping-approve-task-pop-up.component';
import {DateUtils} from '@app/helpers/date-utils';
import {mixinRequestType} from '@app/mixins/mixin-request-type';
import {HasRequestType} from '@app/interfaces/has-request-type';

const _ApprovalDocument = mixinRequestType(CaseModel);

export class ShippingApproval extends _ApprovalDocument<ShippingApprovalService, ShippingApproval> implements HasRequestType {
  service: ShippingApprovalService;
  id!: string;
  createdOn!: string;
  lastModified!: string;
  classDescription!: string;
  creatorInfo!: AdminResult;
  ouInfo!: AdminResult;
  serial!: number;
  fullSerial!: string;
  caseStatus!: number;
  caseType: number = CaseTypes.SHIPPING_APPROVAL;
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

  dialog!: DialogService;

  searchFields: ISearchFieldsMap<ShippingApproval> = {
    ...normalSearchFields(['fullSerial']),
    ...dateSearchFields(['createdOn']),
    ...infoSearchFields(['requestTypeInfo', 'creatorInfo', 'caseStatusInfo']),
  };

  constructor() {
    super();
    this.service = FactoryService.getService('ShippingApprovalService');
    this.dialog = FactoryService.getService('DialogService');
  }

  buildBasicInfo(controls: boolean = false): any {
    const {
      requestType,
      description,
      subject,
      shipmentSource,
      shipmentWeight,
      waybill,
      shipmentPort,
      linkedProject,
      projectLicense,
      projectName,
      country,
      zoneNumber,
      receiverType,
      receiverName,
      otherReceiverName,
      shipmentApproximateValue,
      shipmentCarrier,
      fullSerial,
      exportedBookFullSerial
    } = this;

    return {
      requestType: controls ? [requestType, [CustomValidators.required]] : requestType,
      description: controls ? [description, [CustomValidators.required, CustomValidators.maxLength(2000)]] : description,
      subject: controls ? [subject, [CustomValidators.required, CustomValidators.maxLength(200)]] : subject,
      shipmentSource: controls ? [shipmentSource, [CustomValidators.required]] : shipmentSource,
      shipmentWeight: controls ? [shipmentWeight, [CustomValidators.required, CustomValidators.maxLength(50)]] : shipmentWeight,
      waybill: controls ? [waybill, [CustomValidators.required, CustomValidators.maxLength(200)]] : waybill,
      shipmentPort: controls ? [shipmentPort, [CustomValidators.required, CustomValidators.maxLength(200)]] : shipmentPort,
      linkedProject: controls ? [linkedProject, [CustomValidators.required]] : linkedProject,
      projectLicense: controls ? [projectLicense, CustomValidators.maxLength(50)] : projectLicense,
      projectName: controls ? [projectName] : projectName,
      country: controls ? [country, [CustomValidators.required]] : country,
      zoneNumber: controls ? [zoneNumber, [CustomValidators.required, CustomValidators.maxLength(200)]] : zoneNumber,
      receiverType: controls ? [receiverType, [CustomValidators.required]] : receiverType,
      receiverName: controls ? [receiverName, [CustomValidators.required]] : receiverName,
      otherReceiverName: controls ? [otherReceiverName, [CustomValidators.maxLength(200)]] : otherReceiverName,
      shipmentApproximateValue: controls ? [shipmentApproximateValue, [CustomValidators.required, CustomValidators.maxLength(50)]] : shipmentApproximateValue,
      shipmentCarrier: controls ? [shipmentCarrier, [CustomValidators.required]] : shipmentCarrier,
      fullSerial: controls ? [fullSerial] : fullSerial,
      exportedBookFullSerial: controls ? [exportedBookFullSerial] : exportedBookFullSerial,
    };
  }

  approve(): DialogRef {
    return this.dialog.show(ShippingApproveTaskPopUpComponent, {
      model: this,
      action: WFResponseType.APPROVE,
    });
  }

  finalApprove(): DialogRef {
    return this.dialog.show(ShippingApproveTaskPopUpComponent, {
      model: this,
      action: WFResponseType.FINAL_APPROVE,
    });
  }

  buildApprovalForm(controls: boolean = false): any {
    const {followUpDate} = this;
    return {
      followUpDate: controls
        ? [DateUtils.changeDateToDatepicker(followUpDate)]
        : DateUtils.changeDateToDatepicker(followUpDate),
    };
  }
}
