import { Observable } from 'rxjs';
import { BaseModel } from './base-model';
import { SubventionRequestService } from '@services/subvention-request.service';
import { FactoryService } from '@services/factory.service';
import { SubventionRequestAidService } from '@services/subvention-request-aid.service';
import { CustomValidators } from '../validators/custom-validators';
import { SubventionAid } from './subvention-aid';
import { Validators } from '@angular/forms';
import { AdminResult } from './admin-result';
import { isValidValue, printBlobData } from '@helpers/utils';
import { DialogRef } from '../shared/models/dialog-ref';
import { searchFunctionType } from '../types/types';
import { UserClickOn } from '../enums/user-click-on.enum';
import { take } from 'rxjs/operators';
import { SubventionRequestStatus } from '@app/enums/status.enum';
import { ConfigurationService } from '@services/configuration.service';
import { IMyDateModel } from '@nodro7/angular-mydatepicker';
import { DateUtils } from '@helpers/date-utils';
import { SubventionRequestInterceptor } from "@app/model-interceptors/subvention-request-interceptor";
import { InterceptModel } from "@decorators/intercept-model";

const { send, receive } = new SubventionRequestInterceptor()

@InterceptModel({ send, receive })
export class SubventionRequest extends BaseModel<SubventionRequest, SubventionRequestService> {
  id!: number;
  requestSerial!: number;
  requestFullSerial!: string;
  requestChannel!: number;
  requestedAidAmount!: number;
  requestYear!: number;
  requestSummary!: string;
  charityRefNo!: string;
  charitySerialNo!: string;
  creationDate: IMyDateModel = DateUtils.changeDateToDatepicker((new Date()).setHours(0, 0, 0, 0));
  approvalIndicator!: number;
  status: number = 2;
  statusDateModified: IMyDateModel = DateUtils.changeDateToDatepicker((new Date()).setHours(0, 0, 0, 0));
  requestNotes!: string;
  orgId!: number;
  orgUserId!: number;
  benId!: number;
  isPartial: boolean = false;
  allowCompletion: boolean = false;
  aidTotalPayedAmount: number = 0;
  requestParentId?: number;
  aidLookupId!: number;
  aidLookupParentId!: number;
  allowDataSharing: boolean = true;

  // not belongs to the Model
  service: SubventionRequestService;
  subventionRequestAidService: SubventionRequestAidService;
  configService: ConfigurationService;

  orgInfo!: AdminResult;
  orgUserInfo!: AdminResult;
  requestChannelInfo!: AdminResult;
  requestStatusInfo!: AdminResult;
  requestTypeInfo!: AdminResult;
  aidLookupInfo !: AdminResult;
  aidLookupParentInfo !: AdminResult;
  creationDateString!: string;
  statusDateModifiedString!: string;


  searchFields: { [key: string]: searchFunctionType | string } = {
    requestNumber: 'requestFullSerial',
    requestSerial: 'requestSerial',
    requestDate: 'creationDateString',
    requestedAidAmount: 'requestedAidAmount',
    organization: text => !this.orgInfo ? false : this.orgInfo.getName().toLowerCase().indexOf(text) !== -1,
    requestStatusInfo: text => !this.requestStatusInfo ? false : this.requestStatusInfo.getName().toLowerCase().indexOf(text) !== -1
  };


  constructor() {
    super();
    this.service = FactoryService.getService('SubventionRequestService');
    this.subventionRequestAidService = FactoryService.getService('SubventionRequestAidService');
    this.configService = FactoryService.getService('ConfigurationService');
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

  isUnderProcessing(): boolean {
    return this.status === SubventionRequestStatus.UNDER_PROCESSING;
  }

  isNewPartialRequest(): boolean {
    return !this.id && this.isPartial;
  }

  loadRequestAids(): Observable<SubventionAid[]> {
    return this.service.loadSubventionAidByCriteria({
      benId: this.benId,
      requestId: this.id
    });
  }

  getInfoFields(control: boolean = false): any {
    const {
      aidLookupParentId,
      aidLookupId,
      creationDate,
      requestedAidAmount,
      requestSummary,
      allowCompletion,
      allowDataSharing
    } = this;
    return {
      aidLookupParentId: control ? [aidLookupParentId, CustomValidators.required] : aidLookupParentId,
      aidLookupId: control ? [aidLookupId, CustomValidators.required] : aidLookupId,
      creationDate: control ? [creationDate, CustomValidators.required] : creationDate,
      requestedAidAmount: control ? [requestedAidAmount, [CustomValidators.required, CustomValidators.number, CustomValidators.maxLength(15)]] : requestedAidAmount,
      requestSummary: control ? [requestSummary, [CustomValidators.required, Validators.maxLength(1000)]] : requestSummary,
      allowCompletion: control ? [allowCompletion] : allowCompletion,
      allowDataSharing: control ? [allowDataSharing] : allowDataSharing
    };
  }

  getStatusFields(control: boolean = false): any {
    const { status, statusDateModified, requestNotes } = this;
    return {
      status: control ? [status, CustomValidators.required] : status,
      // @ts-ignore
      statusDateModified: control ? [statusDateModified ? statusDateModified : DateUtils.changeDateToDatepicker((new Date()).setHours(0, 0, 0, 0)), [CustomValidators.minDate(DateUtils.changeDateFromDatepicker(this.creationDate))]] : statusDateModified,
      requestNotes: control ? [requestNotes, [Validators.maxLength(1000)]] : requestNotes
    };
  }

  printRequest(fileName?: string, $event?: MouseEvent): void {
    $event?.preventDefault();
    this.service.loadByRequestIdAsBlob(this.id)
      .subscribe((data) => {
        printBlobData(data, fileName);
      });
  }

  showLogs($event?: MouseEvent): void {
    $event?.preventDefault();
    this.service.openLogDialog(this.id)
      .subscribe((dialog: DialogRef) => {
        dialog.onAfterClose$.subscribe();
      });
  }

  showAids($event: MouseEvent): void {
    $event.preventDefault();
    this.service.openAidDialog(this.id, this.isPartial)
      .subscribe((dialog: DialogRef) => {
        dialog.onAfterClose$.subscribe();
      });
  }


  cancel(): Observable<boolean> {
    return new Observable((subscriber) => {
      const sub = this.service
        .openCancelDialog(this)
        .onAfterClose$
        .subscribe((result: UserClickOn | string) => {
          if (typeof result !== 'string') {
            return subscriber.next(false);
          }
          this.service
            .cancelRequest(this.id, result)
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
      const sub = this.service
        .openDeleteDialog(this)
        .onAfterClose$
        .subscribe((result: UserClickOn | string) => {
          if (typeof result !== 'string') {
            return subscriber.next(false);
          }
          this.service
            .deleteRequest(this.id, result)
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
}
