import {Observable} from 'rxjs';
import {BaseModel} from './base-model';
import {SubventionRequestService} from '../services/subvention-request.service';
import {FactoryService} from '../services/factory.service';
import {SubventionRequestAidService} from '../services/subvention-request-aid.service';
import {CustomValidators} from '../validators/custom-validators';

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
  statusDateModified!: string;
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
    return this.service.create(this);
  }

  delete(): Observable<boolean> {
    return this.service.delete(this.id);
  }

  save(): Observable<SubventionRequest> {
    return this.id ? this.update() : this.create();
  }

  update(): Observable<SubventionRequest> {
    return this.service.update(this);
  }

  getInfoFields(control: boolean = false): any {
    const {requestType, creationDate} = this;
    return {
      requestType: control ? [requestType, CustomValidators.required] : requestType,
      creationDate: control ? [creationDate, CustomValidators.required] : creationDate
    };
  }

  getStatusFields(control: boolean = false): any {
    const {status, statusDateModified, requestSummary} = this;
    return {
      status: control ? [status, CustomValidators.required] : status,
      statusDateModified: control ? [statusDateModified] : statusDateModified,
      requestSummary: control ? [requestSummary] : requestSummary
    };
  }
}
