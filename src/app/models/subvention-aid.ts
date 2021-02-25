import {AdminResult} from './admin-result';
import {CustomValidators} from '../validators/custom-validators';
import {SubventionAidService} from '../services/subvention-aid.service';
import {FactoryService} from '../services/factory.service';
import {BaseModel} from './base-model';
import {Observable} from 'rxjs';

export class SubventionAid extends BaseModel<SubventionAid> {
  installementsCount: number = 0;
  periodicType!: number;
  approvalDate!: string;
  aidAmount!: number;
  aidDescription!: string;
  aidStartPayDate!: string;
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
      approvalDate: control ? [approvalDate] : approvalDate,
      periodicType: control ? [periodicType, CustomValidators.required] : periodicType,
      aidAmount: control ? [aidAmount, [CustomValidators.required, CustomValidators.number]] : aidAmount,
      aidDescription: control ? [aidDescription, [CustomValidators.maxLength(1000)]] : aidDescription,
      aidStartPayDate: control ? [aidStartPayDate] : aidStartPayDate,
      aidLookupId: control ? [aidLookupId, CustomValidators.required] : aidLookupId,
      mainAidType: control ? [this.aidLookupInfo?.parent, CustomValidators.required] : this.aidLookupInfo?.parent,
      installementsCount: control ? [installementsCount, [CustomValidators.number]] : installementsCount
    };
  }
}
