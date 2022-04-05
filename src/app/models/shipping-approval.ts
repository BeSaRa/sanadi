import { CaseTypes } from "@app/enums/case-types.enum";
import { FactoryService } from "@app/services/factory.service";
import { ShippingApprovalService } from "@app/services/shipping-approval.service";
import { CustomValidators } from "@app/validators/custom-validators";
import { AdminResult } from "./admin-result";
import { CaseModel } from "./case-model";
import { TaskDetails } from "./task-details";

export class ShippingApproval extends CaseModel<
  ShippingApprovalService,
  ShippingApproval
> {
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
  className!: string;

  constructor() {
    super();
    this.service = FactoryService.getService("ShippingApprovalService");
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
    } = this;

    return {
      requestType: controls
        ? [requestType, [CustomValidators.required]]
        : requestType,
      description: controls
        ? [description, [CustomValidators.required]]
        : description,
      subject: controls ? [subject, [CustomValidators.required]] : subject,
      shipmentSource: controls
        ? [shipmentSource, [CustomValidators.required]]
        : shipmentSource,
      shipmentWeight: controls
        ? [shipmentWeight, [CustomValidators.required]]
        : shipmentWeight,
      waybill: controls ? [waybill, [CustomValidators.required]] : waybill,
      shipmentPort: controls
        ? [shipmentPort, [CustomValidators.required]]
        : shipmentPort,
      linkedProject: controls
        ? [linkedProject, [CustomValidators.required]]
        : linkedProject,
      projectLicense: controls ? [projectLicense] : projectLicense,
      projectName: controls ? [projectName] : projectName,
      country: controls ? [country, [CustomValidators.required]] : country,
      zoneNumber: controls
        ? [zoneNumber, [CustomValidators.required]]
        : zoneNumber,
      receiverType: controls
        ? [receiverType, [CustomValidators.required]]
        : receiverType,
      receiverName: controls
        ? [receiverName, [CustomValidators.required]]
        : receiverName,
      otherReceiverName: controls ? [otherReceiverName] : otherReceiverName,
      shipmentApproximateValue: controls
        ? [shipmentApproximateValue, [CustomValidators.required]]
        : shipmentApproximateValue,
      shipmentCarrier: controls
        ? [shipmentCarrier, [CustomValidators.required]]
        : shipmentCarrier,
    };
  }
}
