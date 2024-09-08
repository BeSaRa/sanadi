import { AdminResult } from './admin-result';
import { SubventionApprovedAid } from './subvention-approved-aid';
import { FactoryService } from '@services/factory.service';
import { SubventionRequestService } from '@services/subvention-request.service';
import { printBlobData } from '@helpers/utils';
import { DialogRef } from '../shared/models/dialog-ref';
import { ISearchFieldsMap } from '../types/types';
import { Observable } from 'rxjs';
import { UserClickOn } from '@enums/user-click-on.enum';
import { take } from 'rxjs/operators';
import { SubventionRequestStatus } from '@app/enums/status.enum';
import { infoSearchFields } from '@app/helpers/info-search-fields';
import { normalSearchFields } from '@app/helpers/normal-search-fields';
import { SearchableCloneable } from '@app/models/searchable-cloneable';
import { SubventionRequestAidInterceptor } from "@app/model-interceptors/subvention-request-aid-interceptor";
import { InterceptModel } from "@decorators/intercept-model";

const { send, receive } = new SubventionRequestAidInterceptor();

@InterceptModel({ send, receive })
export class SubventionRequestAid extends SearchableCloneable<SubventionRequestAid> {

  constructor() {
    super();
    this.subventionRequestService = FactoryService.getService('SubventionRequestService');
  }

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
  aidLookupParentId?: number;
  aidLookupParentInfo!: AdminResult;
  aidId?: number;
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
  installmentsCount!: number;
  aidPayedAmount!: number;
  aidAmount!: number;

  // extra properties
  private subventionRequestService: SubventionRequestService;
  creationDateString!: string;
  statusDateModifiedString: string | null = '';
  aidCount: any = 0;

  searchFieldsInquiry: ISearchFieldsMap<SubventionRequestAid> = {
    ...infoSearchFields(['orgInfo', 'statusInfo', 'aidLookupParentInfo']),
    ...normalSearchFields(['requestFullSerial', 'creationDateString', 'requestedAidAmount', 'aidTotalPayedAmount'])
  };

  searchFieldsSearch: ISearchFieldsMap<SubventionRequestAid> = {
    ...infoSearchFields(['orgInfo', 'orgUserInfo', 'statusInfo', 'aidLookupParentInfo']),
    ...normalSearchFields(['requestFullSerial', 'creationDateString', 'aidSuggestedAmount', 'requestedAidAmount', 'aidTotalPayedAmount', 'statusDateModifiedString'])
  };

  printRequest(fileName: string): void {
    this.subventionRequestService.loadByRequestIdAsBlob(this.requestId)
      .subscribe((data) => {
        printBlobData(data, fileName);
      });
  }

  showLogs($event?: MouseEvent): void {
    $event?.preventDefault();
    this.subventionRequestService.openLogDialog(this.requestId)
      .subscribe((dialog: DialogRef) => {
        dialog.onAfterClose$.subscribe();
      });
  }

  showAids($event?: MouseEvent): void {
    $event?.preventDefault();
    this.subventionRequestService.openAidDialog(this.requestId, this.isPartial)
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
