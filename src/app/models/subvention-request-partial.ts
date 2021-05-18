import {AdminResult} from './admin-result';
import {FactoryService} from '../services/factory.service';
import {Observable} from 'rxjs';
import {DialogRef} from '../shared/models/dialog-ref';
import {SubventionRequestPartialService} from '../services/subvention-request-partial.service';
import {BaseModel} from './base-model';
import {SubventionRequestService} from '../services/subvention-request.service';
import {isValidValue} from '../helpers/utils';

export class SubventionRequestPartial extends BaseModel<SubventionRequestPartial> {

  requestId!: number;
  requestFullSerial!: string;
  creationDate!: string;
  creationYear!: number;
  status!: number;
  orgId!: number;
  orgBranchId!: number;
  statusInfo!: AdminResult;
  orgBranchInfo!: AdminResult;
  orgInfo!: AdminResult;
  benCategory!: number;
  gender!: number;
  requestType!: number;
  requestTypeInfo!: AdminResult;
  benCategoryInfo!: AdminResult;
  genderInfo!: AdminResult;
  aidTotalSuggestedAmount?: number;
  aidTotalPayedAmount?: number;
  aidRemainingAmount?: number;

  // extra properties
  creationDateString!: string;
  subventionRequestPartialService: SubventionRequestPartialService;
  subventionRequestService: SubventionRequestService;

  constructor() {
    super();
    this.subventionRequestPartialService = FactoryService.getService('SubventionRequestPartialService');
    this.subventionRequestService = FactoryService.getService('SubventionRequestService');
  }

  get orgAndBranchInfo() {
    if (!isValidValue(this.orgInfo.getName())) {
      return new AdminResult();
    }
    return AdminResult.createInstance({
      arName: this.orgInfo.arName + ' - ' + this.orgBranchInfo.arName,
      enName: this.orgInfo.enName + ' - ' + this.orgBranchInfo.enName,
    });
  }

  create(): Observable<SubventionRequestPartial> {
    throw new Error('Method not implemented.');
  }

  delete(): Observable<boolean> {
    throw new Error('Method not implemented.');
  }

  save(): Observable<SubventionRequestPartial> {
    throw new Error('Method not implemented.');
  }

  update(): Observable<SubventionRequestPartial> {
    throw new Error('Method not implemented.');
  }

  showPartialRequestDetails($event: MouseEvent): void {
    $event.preventDefault();
    this.subventionRequestPartialService.openPartialRequestDetailsDialog(this.requestId)
      .subscribe((dialog: DialogRef) => {
        dialog.onAfterClose$.subscribe();
      });
  }
}
