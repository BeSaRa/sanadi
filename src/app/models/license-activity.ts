import { ObjectUtils } from "@app/helpers/object-utils";
import { EmployeeService } from "@app/services/employee.service";
import { FactoryService } from "@app/services/factory.service";
import { LicenseActivityService } from "@app/services/license-activity.service";
import { ControlValueLabelLangKey, ISearchFieldsMap } from "@app/types/types";
import { CustomValidators } from "@app/validators/custom-validators";
import { BaseModel } from "./base-model";
import { InterceptModel } from "@app/decorators/decorators/intercept-model";
import { LicenseActivityInterceptor } from "@app/model-interceptors/license-activity-interceptor";
import { AdminResult } from "./admin-result";
import { ActualInspection } from "./actual-inspection";

const { send, receive } = new LicenseActivityInterceptor()
@InterceptModel({ send, receive })
export class LicenseActivity extends BaseModel<LicenseActivity, LicenseActivityService>{
  employeeService!: EmployeeService
  service: LicenseActivityService;
  licenseNumber!: string;
  licenseType!: number;
  caseType!: number;
  otherData!: string;
  activityName!: string;
  activityDescription!: string;
  status!:number;
  isDefined = false;
  inspectionDate!: string;
  activityFolderId!:string;
  comment!:string;
  actualInspection?:ActualInspection;
  uploadedDocId!:string;
  licenseVSID!:string;
  
  licenseTypeInfo!:AdminResult
  statusInfo!:AdminResult;
  


  searchFields: ISearchFieldsMap<LicenseActivity> = {
    // ...dateSearchFields(['createdOn']),
    // ...infoSearchFields(['categoryInfo', 'caseStatusInfo']),
    // ...normalSearchFields(['fullName', 'organization'])
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
    this.service = FactoryService.getService('LicenseActivityService');
    this.employeeService = FactoryService.getService('EmployeeService');
    this.finalizeSearchFields();
  }
  getFormValuesWithLabels(): { [key: string]: ControlValueLabelLangKey } {
    return {
      licenseNumber: { langKey: 'license_number', value: this.licenseNumber },
      licenseType: { langKey: 'license_type', value: this.licenseType },
      otherData: { langKey: 'lbl_other_data', value: this.otherData },
      activityName: { langKey: 'activity_name', value: this.activityName },
      activityDescription: { langKey: 'lbl_activity_description', value: this.activityDescription },
      status: { langKey: 'lbl_status', value: this.status },
      comment: { langKey: 'comment', value: this.comment },
      
    };
  }
  buildForm(controls: boolean = false): any {
    const values = ObjectUtils.getControlValues<LicenseActivity>(
      this.getFormValuesWithLabels()
    );
    return {
      licenseNumber : controls ? [values.licenseNumber,[]]: values.licenseNumber,
      licenseType : controls ? [values.licenseType,[]]: values.licenseType,
      otherData : controls ? [values.otherData,[]]: values.otherData,
      activityName : controls ? [values.activityName,[CustomValidators.maxLength(CustomValidators.defaultLengths.ENGLISH_NAME_MAX)]]: values.activityName,
      activityDescription : controls ? [values.activityDescription,[CustomValidators.maxLength(CustomValidators.defaultLengths.EXPLANATIONS)]]: values.activityDescription,
    }
  }
  buildCompleteActivityForm(controls:boolean = false):any{
    const values = ObjectUtils.getControlValues<LicenseActivity>(
      this.getFormValuesWithLabels()
    );
    return {
     
      status : controls ? [values.status,[CustomValidators.required]]: values.status,
      comment : controls ? [values.comment,[CustomValidators.required,CustomValidators.maxLength(CustomValidators.defaultLengths.EXPLANATIONS)]]: values.comment,
    }
  }
}
