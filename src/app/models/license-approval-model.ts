import { CaseModel } from '@app/models/case-model';
import { FileNetModel } from '@app/models/FileNetModel';
import { Observable } from 'rxjs';
import { AdminResult } from '@app/models/admin-result';
import { BaseGenericEService } from "@app/generics/base-generic-e-service";

export abstract class LicenseApprovalModel<S extends BaseGenericEService<M>, M extends FileNetModel<M>> extends CaseModel<S, M> {
  licenseNumber!: string;
  licenseDuration!: number;
  licenseStatus!: number;
  licenseStartDate!: string;
  licenseEndDate!: string;
  licenseApprovedDate!: string;
  customTerms!: string;
  publicTerms!: string;
  conditionalLicenseIndicator: boolean = false;
  followUpDate!: string;
  requestType!: number;
  deductionPercent!: number;
  requestTypeInfo!: AdminResult;

  oldLicenseFullSerial!: string;
  oldLicenseId!: string;
  oldLicenseSerial!: number;
  exportedLicenseFullSerial!: string;
  exportedLicenseId!: string;
  exportedLicenseSerial!: number;
  ignoreSendInterceptor?: boolean;
  inspectionStatus!:number
  licenseType!:number
  inspectorId!:number
  lastInspectionDate!:string;
  inspectionStatusInfo!:AdminResult;
  inspectorInfo!:AdminResult;


  patchAndUpdateModel(data: Partial<LicenseApprovalModel<any, any>>, callback?: (data: any) => any): Observable<any> {
    return this.service.update(((callback ? callback(data) : data) as unknown as M));
  }

  getRequestType(): number {
    return this.requestType;
  }
}
