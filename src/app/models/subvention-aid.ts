import {AdminResult} from './admin-result';
import {CustomValidators} from '../validators/custom-validators';
import {SubventionAidService} from '../services/subvention-aid.service';
import {FactoryService} from '../services/factory.service';
import {BaseModel} from './base-model';
import {Observable} from 'rxjs';
import {Validators} from '@angular/forms';
import {IMyDateModel} from 'angular-mydatepicker';

export class SubventionAid extends BaseModel<SubventionAid> {
  installementsCount: number = 0;
  periodicType!: number;
  approvalDate!: IMyDateModel;
  aidAmount!: number;
  aidDescription!: string;
  aidStartPayDate!: IMyDateModel;
  aidLookupId!: number;
  subventionRequestId!: number;
  orgBranchId!: number;
  orgId!: number;
  orgUserId!: number;
  // not belong to the model
  orgBranchInfo!: AdminResult;
  orgInfo!: AdminResult;
  orgUserInfo!: AdminResult;
  aidLookupInfo!: Partial<AdminResult>;
  periodicTypeInfo!: AdminResult;
  service: SubventionAidService;
  approvalDateString: string | undefined;
  aidStartPayDateString: string | undefined;

  constructor() {
    super();
    this.service = FactoryService.getService('SubventionAidService');
  }

  create(): Observable<SubventionAid> {
    return this.service.create(this);
  }

  delete(): Observable<boolean> {
    return this.service.delete(this.id);
  }

  save(): Observable<SubventionAid> {
    return this.id ? this.update() : this.create();
  }

  update(): Observable<SubventionAid> {
    return this.service.update(this);
  }

  getAidFields(control: boolean = false): any {
    const {
      id,
      approvalDate,
      periodicType,
      aidAmount,
      aidDescription,
      aidStartPayDate,
      aidLookupId,
      installementsCount
    } = this;

    return {
      id: control ? [id] : id,
      approvalDate: control ? [approvalDate, CustomValidators.required] : approvalDate,
      periodicType: control ? [periodicType, CustomValidators.required] : periodicType,
      aidAmount: control ? [aidAmount, [CustomValidators.required, CustomValidators.number, CustomValidators.maxLength(20)]] : aidAmount,
      aidDescription: control ? [aidDescription, [CustomValidators.required, CustomValidators.maxLength(1000)]] : aidDescription,
      aidStartPayDate: control ? [aidStartPayDate, [CustomValidators.required]] : aidStartPayDate,
      aidLookupId: control ? [aidLookupId, CustomValidators.required] : aidLookupId,
      installementsCount: control ? [installementsCount, [CustomValidators.number , Validators.min(1), CustomValidators.maxLength(20)]] : installementsCount
    };
  }
}
