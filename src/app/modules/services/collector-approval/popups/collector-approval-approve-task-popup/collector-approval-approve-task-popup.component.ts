import {Component, Inject, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {Subject} from 'rxjs';
import {ILanguageKeys} from '@contracts/i-language-keys';
import {WFResponseType} from '@enums/wfresponse-type.enum';
import {CollectorApproval} from '@models/collector-approval';
import {UntypedFormControl} from '@angular/forms';
import {DialogService} from '@services/dialog.service';
import {DialogRef} from '@app/shared/models/dialog-ref';
import {InboxService} from '@services/inbox.service';
import {DIALOG_DATA_TOKEN} from '@app/shared/tokens/tokens';
import {LangService} from '@services/lang.service';
import {CommonUtils} from '@helpers/common-utils';
import {CollectorItem} from '@models/collector-item';
import {exhaustMap, filter, map, switchMap, takeUntil, tap} from 'rxjs/operators';
import {IWFResponse} from '@contracts/i-w-f-response';
import {HasLicenseApproval} from '@contracts/has-license-approval';
import {ToastService} from '@services/toast.service';
import {CollectionRequestType} from '@enums/service-request-types';
import {CustomValidators} from '@app/validators/custom-validators';
import {ApprovalFormComponent} from '@modules/services/shared-services/components/approval-form/approval-form.component';
import {LicenseDurationType} from '@enums/license-duration-type';
import {DateUtils} from '@helpers/date-utils';

@Component({
  selector: 'collector-approval-approve-task-popup',
  templateUrl: './collector-approval-approve-task-popup.component.html',
  styleUrls: ['./collector-approval-approve-task-popup.component.scss']
})
export class CollectorApprovalApproveTaskPopupComponent implements OnInit, OnDestroy {
  private destroy$: Subject<any> = new Subject();
  label: keyof ILanguageKeys;

  selectedLicense: HasLicenseApproval | null = null;
  selectedItemOriginal: CollectorItem | null = null;

  selectedIndex: number | false = false;
  action$: Subject<any> = new Subject<any>();

  response: WFResponseType = WFResponseType.APPROVE;

  model: CollectorApproval;
  comment: UntypedFormControl = new UntypedFormControl('', [CustomValidators.maxLength(CustomValidators.defaultLengths.EXPLANATIONS)]);
  @ViewChild(ApprovalFormComponent) approvalForm!: ApprovalFormComponent;

  constructor(
    private dialog: DialogService,
    private toast: ToastService,
    private dialogRef: DialogRef,
    private inboxService: InboxService,
    @Inject(DIALOG_DATA_TOKEN) public data: {
      model: CollectorApproval,
      action: WFResponseType
    },
    public lang: LangService,
  ) {
    this.label = ((CommonUtils.changeCamelToSnakeCase(this.data.action) + '_task') as unknown as keyof ILanguageKeys);
    this.response = this.data.action;
    this.model = this.data.model;
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.destroy$.unsubscribe();
  }

  ngOnInit(): void {
    this.listenToAction();
    if (this.isCommentRequired()) {
      this.comment.setValidators([CustomValidators.required, CustomValidators.maxLength(CustomValidators.defaultLengths.EXPLANATIONS)]);
    }
  }

  setSelectedLicense({item, index}: { item: HasLicenseApproval, index: number }) {
    this.selectedLicense = item;
    this.selectedItemOriginal = this.model.collectorItemList.find(x => x.itemId === item.itemId) || null;
    this.selectedIndex = (++index); // add one to the selected inbox to avoid the  check false value
  }

  saveLicenseInfo(license: HasLicenseApproval) {
    let finalValue = (license as unknown as CollectorItem);
    if (this.selectedItemOriginal) {
      finalValue.collectorType = this.selectedItemOriginal.collectorType;
      finalValue.collectorTypeInfo = this.selectedItemOriginal.collectorTypeInfo;
    }
    if (this.selectedIndex) {
      this.data.model.collectorItemList.splice(this.selectedIndex - 1, 1, finalValue)
      this.data.model.collectorItemList = this.data.model.collectorItemList.slice();
    } else {
      this.data.model.collectorItemList.map((item) => {
        return item.clone({
          ...finalValue
        })
      })
    }
    this.formCancel();
  }

  formCancel() {
    this.selectedLicense = null;
    this.selectedItemOriginal = null;
    this.selectedIndex = false;
  }

  private listenToAction() {
    this.action$
      .pipe(takeUntil(this.destroy$))
      .pipe(map(_ => this.isCancelRequestType() ? false : this.data.model.hasInvalidCollectorItems()))
      .pipe(tap(invalid => invalid && this.displayInvalidItemMessages()))
      .pipe(filter(invalid => !invalid))
      .pipe(map(_ => this.isCancelRequestType() ? false : this.approvalForm && this.hasInvalidCollectionItemDateRange()))
      .pipe(tap(invalid => invalid && this.displayInvalidItemDurationMessage(this.approvalForm.minLicenseMonths, this.approvalForm.maxLicenseMonths)))
      .pipe(filter(invalid => !invalid))
      .pipe(map(_ => this.isCommentRequired() ? this.comment.invalid : false))
      .pipe(tap(invalid => invalid && this.dialog.error(this.lang.map.msg_all_required_fields_are_filled)))
      .pipe(filter(invalid => !invalid))
      .pipe(exhaustMap(_ => this.data.model.save()))
      .pipe(switchMap(_ => this.inboxService.takeActionOnTask(this.data.model.taskDetails.tkiid, this.getResponse(), this.model.service)))
      .subscribe(() => {
        this.toast.success(this.lang.map.process_has_been_done_successfully);
        this.dialogRef.close(true);
      })
  }

  private displayInvalidItemMessages() {
    this.dialog.error(this.lang.map.please_make_sure_that_you_filled_out_all_required_data_for_all_license);
  }

  private displayInvalidItemDurationMessage(serviceMinDate: number, serviceMaxDate: number) {
    this.dialog.error(this.lang.map.msg_license_duration_diff_between_x_and_y_months.change({
      x: serviceMinDate,
      y: serviceMaxDate
    }));
  }

  private getResponse(): Partial<IWFResponse> {
    return this.comment.value ? {
      selectedResponse: this.response,
      comment: this.comment.value
    } : {selectedResponse: this.response};
  }

  isCancelRequestType(): boolean {
    return this.data.model.requestType === CollectionRequestType.CANCEL;
  }

  private isCommentRequired(): boolean {
    return this.isCancelRequestType();
  }

  private isPermanent(): boolean {
    return this.model.licenseDurationType === LicenseDurationType.PERMANENT;
  }

  hasInvalidCollectionItemDateRange(): boolean {
    return this.data.model.collectorItemList.some(x => !this.validateLicenseDateRange(DateUtils.getDateStringFromDate(x.licenseStartDate), DateUtils.getDateStringFromDate(x.licenseEndDate)));
  }

  private validateLicenseDateRange(startDate: string, endDate: string) {
    if (!this.isPermanent() && startDate) {
      let minLicenseMonths, maxLicenseMonths;
      this.approvalForm && (minLicenseMonths = this.approvalForm.minLicenseMonths);
      this.approvalForm && (maxLicenseMonths = this.approvalForm.maxLicenseMonths);

      if (!!minLicenseMonths && !!maxLicenseMonths && minLicenseMonths > 0 && maxLicenseMonths > 0) {
        let licenseDuration = DateUtils.getDifference(startDate, endDate, 'month');// (dayjs(endDate).diff(startDate, 'month'));
        return licenseDuration >= minLicenseMonths && licenseDuration <= maxLicenseMonths;
      }
      return true;
    }
    return true;
  }
}
