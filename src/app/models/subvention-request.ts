import {Observable} from 'rxjs';
import {BaseModel} from './base-model';
import {SubventionRequestService} from '../services/subvention-request.service';
import {FactoryService} from '../services/factory.service';
import {SubventionRequestAidService} from '../services/subvention-request-aid.service';

export class SubventionRequest extends BaseModel<SubventionRequest> {
  id!: number;
  requestSerial!: number;
  requestFullSerial!: string;
  requestChannel!: number;
  requestType!: number;
  requestedAidAmount!: number;
  requestYear!: number;
  requestSummary!: string;
  charityRefNo!: string;
  charitySerialNo!: string;
  creationDate!: string;
  approvalIndicator!: number;
  status!: number;
  statusDateModified!: number;
  orgBranchId!: number;
  orgId!: number;
  benId!: number;
  // not belongs to the Model
  service: SubventionRequestService;
  subventionRequestAidService: SubventionRequestAidService;

  constructor() {
    super();
    this.service = FactoryService.getService('SubventionRequestService');
    this.subventionRequestAidService = FactoryService.getService('SubventionRequestAidService');
  }

  create(): Observable<SubventionRequest> {
    throw new Error('Method not implemented.');
  }

  delete(): Observable<boolean> {
    throw new Error('Method not implemented.');
  }

  save(): Observable<SubventionRequest> {
    throw new Error('Method not implemented.');
  }

  update(): Observable<SubventionRequest> {
    throw new Error('Method not implemented.');
  }
}
