import { InterceptModel } from "@app/decorators/decorators/intercept-model";
import { infoSearchFields } from "@app/helpers/info-search-fields";
import { ProposedInspectionInterceptor } from "@app/model-interceptors/proposed_inspection-interceptor";
import { FactoryService } from "@app/services/factory.service";
import { ProposedInspectionService } from "@app/services/proposed-inspection.service";
import { ISearchFieldsMap } from "@app/types/types";
import { CustomValidators } from "@app/validators/custom-validators";
import { AdminResult } from "./admin-result";
import { BaseModel } from "./base-model";

const { send, receive } = new ProposedInspectionInterceptor();

@InterceptModel({ send, receive })
export class ProposedInspection extends BaseModel<ProposedInspection, ProposedInspectionService> {
  service!: ProposedInspectionService;
  departmentId!: number;
  ProposedTaskType!: number;
  otherProposedTask!: string;
  complaintNumber!: string;
  priority!: number;
  operationDescription!: string;
  status!: number;
  taskSerialNumber!: string;
  rejectionReason!: string;
  proposedTaskType!: number;
  createdby!:number;
  creationDate!:string;
  inspectionLog!: AdminResult;
  proposedTaskTypeInfo!: AdminResult;
  statusInfo!: AdminResult;
  departmentInfo!: AdminResult;
  priorityInfo!: AdminResult;
  userInfo!: AdminResult;
  /**
   *
   */
  constructor() {
    super();
    this.service = FactoryService.getService('ProposedInspectionService')
  }
  searchFields: ISearchFieldsMap< ProposedInspection> = {
    ...infoSearchFields(['proposedTaskTypeInfo','statusInfo','priorityInfo','departmentInfo'])
  };
  buildForm(controls?: boolean): any {
    const {
      departmentId,
      otherProposedTask,
      complaintNumber,
      priority,
      operationDescription,
      proposedTaskType,
    } = this;

    return {
      departmentId: controls ? [departmentId , [CustomValidators.required]]:departmentId,
      proposedTaskType: controls ? [proposedTaskType, [CustomValidators.required]] : proposedTaskType,
      otherProposedTask: controls ? [otherProposedTask, [CustomValidators.maxLength(CustomValidators.defaultLengths.ENGLISH_NAME_MAX)]] : otherProposedTask,
      complaintNumber: controls ? [complaintNumber, []] : complaintNumber,
      priority: controls ? [priority, [CustomValidators.required]] : priority,
      operationDescription: controls ? [operationDescription, [CustomValidators.required,CustomValidators.maxLength(CustomValidators.defaultLengths.EXPLANATIONS)]] : operationDescription,

    }
  }
}
