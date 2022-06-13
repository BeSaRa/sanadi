import {AdminResult} from './admin-result';
import {FactoryService} from '@services/factory.service';
import {Observable} from 'rxjs';
import {DialogRef} from '../shared/models/dialog-ref';
import {SubventionRequestPartialService} from '@services/subvention-request-partial.service';
import {BaseModel} from './base-model';
import {SubventionRequestService} from '@services/subvention-request.service';
import {isValidValue} from '@helpers/utils';
import {ISearchFieldsMap} from '@app/types/types';
import {infoSearchFields} from '@app/helpers/info-search-fields';
import {normalSearchFields} from '@app/helpers/normal-search-fields';

export class SubventionRequestPartial extends BaseModel<SubventionRequestPartial, any> {

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
  gender!: number;
  isHandicapped: boolean = false;
  genderInfo!: AdminResult;
  aidTotalSuggestedAmount?: number;
  aidTotalPayedAmount?: number;
  aidRemainingAmount?: number;

  // extra properties
  creationDateString!: string;
  service: SubventionRequestPartialService;
  subventionRequestService: SubventionRequestService;

  searchFields: ISearchFieldsMap<SubventionRequestPartial> = {
    ...infoSearchFields(['orgAndBranchInfo', 'genderInfo']),
    ...normalSearchFields(['creationDateString', 'creationYear', 'aidTotalSuggestedAmount', 'aidTotalPayedAmount', 'aidRemainingAmount'])
  }

  constructor() {
    super();
    this.service = FactoryService.getService('SubventionRequestPartialService');
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

  showPartialRequestDetails(): void {
    this.service.openPartialRequestDetailsDialog(this.requestId)
      .subscribe((dialog: DialogRef) => {
        dialog.onAfterClose$.subscribe();
      });
  }
}
