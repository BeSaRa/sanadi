import { InterceptModel } from "@app/decorators/decorators/intercept-model";
import { DateUtils } from "@app/helpers/date-utils";
import { infoSearchFields } from "@app/helpers/info-search-fields";
import { normalSearchFields } from "@app/helpers/normal-search-fields";
import { ObjectUtils } from "@app/helpers/object-utils";
import { ActualInspectionInterceptor } from "@app/model-interceptors/actual-inspection-interceptor";
import { ActualInspectionService } from "@app/services/actual-inspection.service";
import { EmployeeService } from "@app/services/employee.service";
import { FactoryService } from "@app/services/factory.service";
import { ControlValueLabelLangKey, ISearchFieldsMap } from "@app/types/types";
import { CustomValidators } from "@app/validators/custom-validators";
import { IMyDateModel } from '@nodro7/angular-mydatepicker';
import { AdminResult } from "./admin-result";
import { BaseModel } from "./base-model";
import { InspectionActionLog } from "./inspection-action-log";
import { InspectionSpecialist } from "./inspection-specialist";
import { LicenseActivity } from "./license-activity";
import { ProposedInspection } from "./proposed-inspection";

const { send, receive } = new ActualInspectionInterceptor()
@InterceptModel({ send, receive })
export class ActualInspection extends BaseModel<ActualInspection, ActualInspectionService> {
  employeeService!: EmployeeService
  service: ActualInspectionService;
  departmentId!: number;
  taskSerialNumber!: string;
  proposedTaskSerial!: string;
  actualTaskType!: number;
  mainOperationType!: number;
  subOperationType!: number;
  operationDescription!: string;
  knownOrgId!: number;
  unknownOrgType!: number;
  unknownOrgName!: string;
  unknownOrgOtherData!: string;
  unknownOrgEmail!: string;
  dateFrom!: string | IMyDateModel;
  dateTo!: string | IMyDateModel;
  taskNature!: number;
  taskArea!: number;
  countryId!: number;
  moneyLaundryOrTerrorism!: number | boolean;
  relation!: boolean;
  inspectorId!: number;
  priority!: number;
  taskSubject!: string;
  status!: number;
  creationSource!: number;
  taskFolderId!:string;

  licenseActivities: LicenseActivity[] = [];
  inspectionSpecialists: InspectionSpecialist[] = [];
  inspectionLogs: InspectionActionLog[] = [];

  proposedInspectionTask!: ProposedInspection
  mainOperationInfo!: AdminResult;
  subOperationInfo!: AdminResult;
  inspectorInfo!: AdminResult;
  statusInfo!: AdminResult;

  searchFields: ISearchFieldsMap<ActualInspection> = {
    // ...dateSearchFields(['createdOn']),
    ...infoSearchFields(['mainOperationInfo', 'subOperationInfo', 'statusInfo', 'inspectorInfo']),
    ...normalSearchFields(['taskSerialNumber', 'operationDescription'])
  }
  finalizeSearchFields(): void {
    if (this.employeeService.isExternalUser()) {
      delete this.searchFields.ouInfo;
      delete this.searchFields.organizationId;
      delete this.searchFields.organization;
    }
  }
  constructor() {
    super();
    this.service = FactoryService.getService('ActualInspectionService');
    this.employeeService = FactoryService.getService('EmployeeService');
    this.finalizeSearchFields();
  }


  getFormValuesWithLabels(): { [key: string]: ControlValueLabelLangKey } {
    const dateToStamp = DateUtils.getTimeStampFromDate(this.dateTo);
    const dateFromStamp = DateUtils.getTimeStampFromDate(this.dateFrom);
    return {
      departmentId: { langKey: 'department', value: this.departmentId },
      taskSerialNumber: { langKey: 'task_serial_number', value: this.taskSerialNumber },
      proposedTaskSerial: { langKey: 'lbl_proposed_task_serial', value: this.proposedTaskSerial },
      actualTaskType: { langKey: 'lbl_actual_task', value: this.actualTaskType },
      mainOperationType: { langKey: 'lbl_main_operation', value: this.mainOperationType },
      subOperationType: { langKey: 'lbl_sub_operation', value: this.subOperationType },
      operationDescription: { langKey: 'lbl_operation_description', value: this.operationDescription },
      knownOrgId: { langKey: 'lbl_operation_description', value: this.knownOrgId },
      unknownOrgType: { langKey: 'lbl_unknown_org_type', value: this.unknownOrgType },
      unknownOrgName: { langKey: 'lbl_unknown_org_name', value: this.unknownOrgName },
      unknownOrgOtherData: { langKey: 'lbl_unknown_org_other_data', value: this.unknownOrgOtherData },
      unknownOrgEmail: { langKey: 'lbl_unknown_org_email', value: this.unknownOrgEmail },
      dateFrom: { langKey: 'start_date', value: this.dateFrom, comparisonValue: dateFromStamp },
      dateTo: { langKey: 'ending_date', value: this.dateTo, comparisonValue: dateToStamp },
      taskNature: { langKey: 'lbl_task_nature', value: this.taskNature },
      taskArea: { langKey: 'lbl_task_area', value: this.taskArea },
      countryId: { langKey: 'country', value: this.countryId },
      moneyLaundryOrTerrorism: { langKey: 'lbl_money_laundry_or_terrorism', value: this.moneyLaundryOrTerrorism },
      relation: { langKey: 'lbl_relation', value: this.relation },
      inspectorId: { langKey: 'lbl_inspector', value: this.inspectorId },
      priority: { langKey: 'lbl_priority', value: this.priority },
      taskSubject: { langKey: 'lbl_task_subject', value: this.taskSubject },
      licenseActivities: { langKey: 'lbl_license_activities', value: this.licenseActivities },
      inspectionSpecialists: { langKey: 'lbl_inspection_specialists', value: this.inspectionSpecialists },

    };
  }
  buildForm(controls: boolean = false): any {
    const values = ObjectUtils.getControlValues<ActualInspection>(
      this.getFormValuesWithLabels()
    );
    return {
      departmentId: controls ? [values.departmentId, [CustomValidators.required]] : values.departmentId,
      proposedTaskSerial: controls ? [values.proposedTaskSerial, []] : values.proposedTaskSerial,
      actualTaskType: controls ? [values.actualTaskType, [CustomValidators.required]] : values.actualTaskType,
      mainOperationType: controls ? [values.mainOperationType, [CustomValidators.required]] : values.mainOperationType,
      subOperationType: controls ? [values.subOperationType, [CustomValidators.required]] : values.subOperationType,
      operationDescription: controls ? [values.operationDescription, [CustomValidators.required, CustomValidators.maxLength(CustomValidators.defaultLengths.EXPLANATIONS)]] : values.operationDescription,
      knownOrgId: controls ? [values.knownOrgId, [CustomValidators.required]] : values.knownOrgId,
      unknownOrgType: controls ? [values.unknownOrgType, []] : values.unknownOrgType,
      unknownOrgName: controls ? [values.unknownOrgName, [CustomValidators.maxLength(CustomValidators.defaultLengths.ENGLISH_NAME_MAX)]] : values.unknownOrgName,
      unknownOrgOtherData: controls ? [values.unknownOrgOtherData, [CustomValidators.maxLength(CustomValidators.defaultLengths.ENGLISH_NAME_MAX)]] : values.unknownOrgOtherData,
      unknownOrgEmail: controls ? [values.unknownOrgEmail, [CustomValidators.pattern('EMAIL')]] : values.unknownOrgEmail,
      dateFrom: controls ? [values.dateFrom, [CustomValidators.required]] : values.dateFrom,
      dateTo: controls ? [values.dateTo, [CustomValidators.required]] : values.dateTo,
      taskNature: controls ? [values.taskNature, [CustomValidators.required]] : values.taskNature,
      taskArea: controls ? [values.taskArea, [CustomValidators.required]] : values.taskArea,
      countryId: controls ? [values.countryId, [CustomValidators.required]] : values.countryId,
      moneyLaundryOrTerrorism: controls ? [values.moneyLaundryOrTerrorism, [CustomValidators.required]] : values.moneyLaundryOrTerrorism,
      relation: controls ? [values.relation, [CustomValidators.required]] : values.relation,
      inspectorId: controls ? [values.inspectorId, [CustomValidators.required]] : values.inspectorId,
      priority: controls ? [values.priority, [CustomValidators.required]] : values.priority,
      taskSubject: controls ? [values.taskSubject, [CustomValidators.maxLength(CustomValidators.defaultLengths.EXPLANATIONS)]] : values.taskSubject,
      licenseActivities: controls ? [values.licenseActivities] : values.licenseActivities,
      inspectionSpecialists: controls ? [values.inspectionSpecialists ] : values.inspectionSpecialists,
    }
  }
  static mapFromProposedInspection(proposedInspection: ProposedInspection): ActualInspection {
    

    return new ActualInspection().clone({
      proposedInspectionTask: proposedInspection,
      departmentId: proposedInspection.departmentId,
      proposedTaskSerial: proposedInspection.taskSerialNumber,
      // actualTaskType: proposedInspection.proposedTaskType,
      priority: proposedInspection.priority,
      operationDescription: proposedInspection.operationDescription,
    
    })
  }
  static prepareCopy(model: ActualInspection): ActualInspection {

    return new ActualInspection().clone({
      departmentId: model.departmentId,
      taskSerialNumber: model.taskSerialNumber,
      proposedTaskSerial: model.proposedTaskSerial,
      actualTaskType: model.actualTaskType,
      mainOperationType: model.mainOperationType,
      subOperationType: model.subOperationType,
      operationDescription: model.operationDescription,
      knownOrgId: model.knownOrgId,
      unknownOrgType: model.unknownOrgType,
      unknownOrgName: model.unknownOrgName,
      unknownOrgOtherData: model.unknownOrgOtherData,
      unknownOrgEmail: model.unknownOrgEmail,
      dateFrom: model.dateFrom,
      dateTo: model.dateTo,
      taskNature: model.taskNature,
      taskArea: model.taskArea,
      countryId: model.countryId,
      moneyLaundryOrTerrorism: model.moneyLaundryOrTerrorism,
      relation: model.relation,
      inspectorId: model.inspectorId,
      priority: model.priority,
      taskSubject: model.taskSubject,
      // status: model.status,
      creationSource: model.creationSource,
      licenseActivities: model.licenseActivities.map(item => {
        const newItem: Partial<LicenseActivity> = item
        delete newItem.id
        return newItem as LicenseActivity

      }),
      inspectionSpecialists: model.inspectionSpecialists.map(item => {
        const newItem: Partial<InspectionSpecialist> = item
        delete newItem.id
        return newItem as InspectionSpecialist
      }),
      inspectionLogs: model.inspectionLogs,
      proposedInspectionTask:model.proposedInspectionTask
    })
  }
}
