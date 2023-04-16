import {CaseTypes} from '@app/enums/case-types.enum';
import {dateSearchFields} from '@app/helpers/date-search-fields';
import {infoSearchFields} from '@app/helpers/info-search-fields';
import {normalSearchFields} from '@app/helpers/normal-search-fields';
import {FactoryService} from '@app/services/factory.service';
import {CustomsExemptionRemittanceService} from '@services/customs-exemption-remittance.service';
import {ControlValueLabelLangKey, ISearchFieldsMap} from '@app/types/types';
import {ControlValueLabelLangKey, ISearchFieldsMap} from '@app/types/types';
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
import {ObjectUtils} from '@helpers/object-utils';
import {CommonUtils} from '@helpers/common-utils';
import {IAuditModelProperties} from '@contracts/i-audit-model-properties';
import {AuditOperationTypes} from '@enums/audit-operation-types';

const _ApprovalDocument = mixinRequestType(CaseModel);
const {send, receive} = new CustomsExemptionRemittanceInterceptor();

@InterceptModel({send, receive})
export class CustomsExemptionRemittance extends _ApprovalDocument<CustomsExemptionRemittanceService, CustomsExemptionRemittance> implements HasRequestType, IAuditModelProperties<CustomsExemptionRemittance> {
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
  auditOperation: AuditOperationTypes = AuditOperationTypes.NO_CHANGE;

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

  getBasicInfoValuesWithLabels(): { [key: string]: ControlValueLabelLangKey } {
    return {
      requestType: {langKey: 'request_type', value: this.requestType},
      oldFullSerial: {langKey: 'order_number', value: this.oldFullSerial}, // order number
      oldBookFullSerial: {langKey: 'document_number', value: this.oldBookFullSerial}, // document number
      arName: {langKey: 'arabic_name', value: this.arName},
      enName: {langKey: 'english_name', value: this.enName},
      shipmentCarrier: {langKey: 'shipping_method', value: this.shipmentCarrier},
      shipmentSource: {langKey: 'shipment_source', value: this.shipmentSource},
      shipmentWeight: {langKey: 'shipment_weight', value: this.shipmentWeight},
      waybill: {langKey: 'bill_of_lading_number', value: this.waybill},
      shipmentPort: {langKey: 'shipment_port', value: this.shipmentPort},
      linkedProject: {langKey: 'subordinate_to_project', value: this.linkedProject},
      projectName: {langKey: 'project_name', value: this.projectName},
      country: {langKey: 'country', value: this.country},
      zoneNumber: {langKey: 'region', value: this.zoneNumber},
      receiverType: {langKey: 'recipient_type', value: this.receiverType},
      receiverName: {langKey: 'recipient_name', value: this.receiverName},
      otherReceiverName: {langKey: 'other_recipient_name', value: this.otherReceiverName},
      shipmentApproximateValue: {langKey: 'shipment_approximate_value', value: this.shipmentApproximateValue},
      description: {langKey: 'lbl_description', value: this.description}
    };
  }

  buildBasicInfo(controls: boolean = false): any {
    const values = ObjectUtils.getControlValues<CustomsExemptionRemittance>(this.getBasicInfoValuesWithLabels());
    return {
      arName: controls ? [values.arName, [CustomValidators.required,
        CustomValidators.maxLength(200),
        CustomValidators.minLength(CustomValidators.defaultLengths.MIN_LENGTH),
        CustomValidators.pattern('AR_NUM')]] : values.arName,
      enName: controls ? [values.enName, [CustomValidators.required,
        CustomValidators.maxLength(200),
        CustomValidators.minLength(CustomValidators.defaultLengths.MIN_LENGTH),
        CustomValidators.pattern('ENG_NUM')]] : values.enName,
      requestType: controls ? [values.requestType, [CustomValidators.required]] : values.requestType,
      description: controls ? [values.description, [CustomValidators.required, CustomValidators.maxLength(2000)]] : values.description,
      shipmentSource: controls ? [values.shipmentSource, [CustomValidators.required]] : values.shipmentSource,
      shipmentWeight: controls ? [values.shipmentWeight, [CustomValidators.required, CustomValidators.maxLength(50)]] : values.shipmentWeight,
      waybill: controls ? [values.waybill, [CustomValidators.required, CustomValidators.maxLength(200)]] : values.waybill,
      shipmentPort: controls ? [values.shipmentPort, [CustomValidators.required, CustomValidators.maxLength(200)]] : values.shipmentPort,
      linkedProject: controls ? [values.linkedProject, [CustomValidators.required]] : values.linkedProject,
      projectName: controls ? [values.projectName, [CustomValidators.maxLength(50)]] : values.projectName,
      country: controls ? [values.country, [CustomValidators.required]] : values.country,
      zoneNumber: controls ? [values.zoneNumber, [CustomValidators.required, CustomValidators.maxLength(200)]] : values.zoneNumber,
      receiverType: controls ? [values.receiverType, [CustomValidators.required]] : values.receiverType,
      receiverName: controls ? [values.receiverName, [CustomValidators.required]] : values.receiverName,
      otherReceiverName: controls ? [values.otherReceiverName, [CustomValidators.maxLength(200)]] : values.otherReceiverName,
      shipmentApproximateValue: controls ? [values.shipmentApproximateValue, [CustomValidators.required, CustomValidators.maxLength(50), CustomValidators.decimal(2)]] : values.shipmentApproximateValue,
      shipmentCarrier: controls ? [values.shipmentCarrier, [CustomValidators.required]] : values.shipmentCarrier,
      oldFullSerial: controls ? [values.oldFullSerial, [CustomValidators.maxLength(250)]] : values.oldFullSerial,
      oldBookFullSerial: controls ? [values.oldBookFullSerial, [CustomValidators.maxLength(250)]] : values.oldBookFullSerial,
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

  // don't delete (used in case audit history)
  getAdminResultByProperty(property: keyof CustomsExemptionRemittance): AdminResult {
    let adminResultValue: AdminResult;
    switch (property) {
      case 'requestType':
        adminResultValue = this.requestTypeInfo;
        break;
      case 'receiverType':
        adminResultValue = this.receiverTypeInfo;
        break;
      case 'receiverName':
        adminResultValue = this.receiverNameInfo;
        break;
      case 'caseStatus':
        adminResultValue = this.caseStatusInfo;
        break;
      case 'shipmentCarrier':
        adminResultValue = this.shipmentCarrierInfo;
        break;
      case 'shipmentSource':
        adminResultValue = this.shipmentSourceInfo;
        break;
      case 'country':
        adminResultValue = this.countryInfo;
        break;
      case 'linkedProject':
        adminResultValue = this.linkedProjectInfo;
        break;
      default:
        let value: any = this[property];
        if (!CommonUtils.isValidValue(value) || typeof value === 'object') {
          value = '';
        }
        adminResultValue = AdminResult.createInstance({arName: value as string, enName: value as string});
    }
    return adminResultValue ?? new AdminResult();
  }
}
