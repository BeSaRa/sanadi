import {Observable} from 'rxjs';
import {BaseModel} from './base-model';
import {SubventionRequestService} from '../services/subvention-request.service';
import {FactoryService} from '../services/factory.service';
import {SubventionRequestAidService} from '../services/subvention-request-aid.service';
import {CustomValidators} from '../validators/custom-validators';
import {SubventionAid} from './subvention-aid';
import {Validators} from '@angular/forms';
import {formatDate} from '@angular/common';
import {AdminResult} from './admin-result';
import {changeDateFromDatepicker, changeDateToDatepicker, printBlobData} from '../helpers/utils';
import {DialogRef} from '../shared/models/dialog-ref';
import {searchFunctionType} from '../types/types';
import {UserClickOn} from '../enums/user-click-on.enum';
import {take} from 'rxjs/operators';
import {SubventionRequestStatus} from '../enums/subvention-request-status';
import * as dayjs from 'dayjs';
import {ConfigurationService} from '../services/configuration.service';
import {IMyDateModel} from 'angular-mydatepicker';

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
  creationDate: IMyDateModel = changeDateToDatepicker((new Date()).setHours(0, 0, 0, 0));// formatDate(new Date(), 'yyyy-MM-dd', 'en-US');
  approvalIndicator!: number;
  status: number = 2;
  statusDateModified!: IMyDateModel;
  requestNotes!: string;
  orgBranchId!: number;
  orgId!: number;
  benId!: number;
  // not belongs to the Model
  service: SubventionRequestService;
  subventionRequestAidService: SubventionRequestAidService;
  configService: ConfigurationService;

  orgBranchInfo!: AdminResult;
  orgInfo!: AdminResult;
  orgUserInfo!: AdminResult;
  requestChannelInfo!: AdminResult;
  requestStatusInfo!: AdminResult;
  requestTypeInfo!: AdminResult;
  creationDateString!: string;


  searchFields: { [key: string]: searchFunctionType | string } = {
    requestNumber: 'requestFullSerial',
    requestSerial: 'requestSerial',
    requestDate: 'creationDateString',
    requestedAidAmount: 'requestedAidAmount',
    organization: text => this.orgBranchInfo.getName().toLowerCase().indexOf(text) !== -1,
    requestStatusInfo: text => this.requestStatusInfo.getName().toLowerCase().indexOf(text) !== -1
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

  loadRequestAids(): Observable<SubventionAid[]> {
    return this.service.loadSubventionAidByCriteria({
      benId: this.benId,
      requestId: this.id
    });
  }

  getInfoFields(control: boolean = false): any {
    const {requestType, creationDate, requestedAidAmount, requestSummary} = this;
    return {
      requestType: control ? [requestType, CustomValidators.required] : requestType,
      creationDate: control ? [creationDate, CustomValidators.required] : creationDate,
      requestedAidAmount: control ? [requestedAidAmount, [CustomValidators.required, CustomValidators.number, CustomValidators.maxLength(15)]] : requestedAidAmount,
      requestSummary: control ? [requestSummary, [CustomValidators.required, Validators.maxLength(1000)]] : requestSummary
    };
  }

  getStatusFields(control: boolean = false): any {
    const {status, statusDateModified, requestNotes} = this;
    return {
      status: control ? [status, CustomValidators.required] : status,
      // @ts-ignore
      statusDateModified: control ? [statusDateModified ? statusDateModified : changeDateToDatepicker(new Date()), [CustomValidators.minDate(changeDateFromDatepicker(this.creationDate))]] : statusDateModified,
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

  showLog($event: MouseEvent): void {
    $event.preventDefault();
    this.service.openLogDialog(this.id)
      .subscribe((dialog: DialogRef) => {
        dialog.onAfterClose$.subscribe();
      });
  }

  showAid($event: MouseEvent): void {
    $event.preventDefault();
    this.service.openAidDialog(this.id)
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
