import {AdminResult} from './admin-result';
import {SubventionApprovedAid} from './subvention-approved-aid';
import {FactoryService} from '../services/factory.service';
import {SubventionRequestService} from '../services/subvention-request.service';
import {printBlobData} from '../helpers/utils';

export class SubventionRequestAid {
  requestId!: number;
  aidAmount!: number;
  requestedAidAmount!: number;
  charityRefNo!: string;
  creationDate!: string;
  requestFullSerial!: string;
  aids!: SubventionApprovedAid[];
  aidLookupInfo!: AdminResult;
  orgBranchInfo!: AdminResult;
  orgInfo!: AdminResult;
  statusInfo!: AdminResult;

  private subventionRequestService: SubventionRequestService;

  constructor() {
    this.subventionRequestService = FactoryService.getService('SubventionRequestService');
  }

  printRequest(fileName: string): void {
    this.subventionRequestService.loadByRequestIdAsBlob(this.requestId)
      .subscribe((data) => {
        printBlobData(data, fileName);
      });
  }
}
