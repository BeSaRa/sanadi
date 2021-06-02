import {AdminResult} from './admin-result';
import {SubventionApprovedAid} from './subvention-approved-aid';
import {FactoryService} from '../services/factory.service';
import {SubventionRequestService} from '../services/subvention-request.service';
import {isValidValue, printBlobData} from '../helpers/utils';
import {DialogRef} from '../shared/models/dialog-ref';
import {searchFunctionType} from '../types/types';
import {Observable} from 'rxjs';
import {UserClickOn} from '../enums/user-click-on.enum';
import {take} from 'rxjs/operators';
import {SubventionRequestStatus} from '../enums/subvention-request-status';

export class SubventionRequestAid {
  requestId!: number;
  requestedAidAmount!: number;
  aidSuggestedAmount!: number;
  aidTotalPayedAmount!: number;
  charityRefNo!: string;
  creationDate!: string;
  requestFullSerial!: string;
  aids!: SubventionApprovedAid[];
  aidLookupId?: number;
  aidLookupInfo!: AdminResult;
  aidId?: number;
  orgBranchId!: number;
  orgBranchInfo!: AdminResult;
  orgUserId!: number;
  orgUserInfo!: AdminResult;
  orgId!: number;
  orgInfo!: AdminResult;
  status!: number;
  statusInfo!: AdminResult;
  statusDateModified: string | null = '';
  benPrimaryIdType!: number;
  benPrimaryIdNumber!: string;
  benPrimaryIdNationality!: number;
  isPartial: boolean = false;
  installementsCount!: number;
  aidPayedAmount!: number;
  aidAmount!: number;


  // extra properties
  private subventionRequestService: SubventionRequestService;
  creationDateString!: string;
  statusDateModifiedString: string | null = '';

  underProcessingSearchFields: { [key: string]: searchFunctionType | string } = {
    requestNumber: 'requestFullSerial',
    requestDate: 'creationDateString',
    organization: (text) => {
      return (this.orgAndBranchInfo.getName()).toLowerCase().indexOf(text) !== -1;
    },
    requestStatus: text => this.statusInfo.getName().toLowerCase().indexOf(text) !== -1
  };
  aidCount: any = 0;

  constructor() {
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

  printRequest(fileName: string): void {
    this.subventionRequestService.loadByRequestIdAsBlob(this.requestId)
      .subscribe((data) => {
        printBlobData(data, fileName);
      });
  }

  showLog($event: MouseEvent): void {
    $event.preventDefault();
    this.subventionRequestService.openLogDialog(this.requestId)
      .subscribe((dialog: DialogRef) => {
        dialog.onAfterClose$.subscribe();
      });
  }

  showAid($event: MouseEvent): void {
    $event.preventDefault();
    this.subventionRequestService.openAidDialog(this.requestId)
      .subscribe((dialog: DialogRef) => {
        dialog.onAfterClose$.subscribe();
      });
  }

  cancel(): Observable<boolean> {
    return new Observable((subscriber) => {
      const sub = this.subventionRequestService
        .openCancelDialog(this)
        .onAfterClose$
        .subscribe((result: UserClickOn | string) => {
          if (typeof result !== 'string') {
            return subscriber.next(false);
          }
          this.subventionRequestService
            .cancelRequest(this.requestId, result)
            .pipe(
              take(1)
            )
            .subscribe(subscriber);
        });
      return () => {
        sub.unsubscribe();
      };
    });
  }

  deleteRequest(): Observable<boolean> {
    return new Observable((subscriber) => {
      const sub = this.subventionRequestService
        .openDeleteDialog(this)
        .onAfterClose$
        .subscribe((result: UserClickOn | string) => {
          if (typeof result !== 'string') {
            return subscriber.next(false);
          }
          this.subventionRequestService
            .deleteRequest(this.requestId, result)
            .pipe(
              take(1)
            )
            .subscribe(subscriber);
        });
      return () => {
        sub.unsubscribe();
      };
    });
  }

  notUnderProcess(): boolean {
    return this.statusInfo.lookupKey !== SubventionRequestStatus.UNDER_PROCESSING;
  }
}
