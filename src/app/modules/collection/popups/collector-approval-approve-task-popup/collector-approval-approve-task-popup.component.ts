import {Component, Inject, OnDestroy, OnInit} from '@angular/core';
import {Subject} from 'rxjs';
import {ILanguageKeys} from '@app/interfaces/i-language-keys';
import {LicenseApprovalInterface} from '@app/interfaces/license-approval-interface';
import {WFResponseType} from '@app/enums/wfresponse-type.enum';
import {CollectorApproval} from '@app/models/collector-approval';
import {FormControl} from '@angular/forms';
import {DialogService} from '@app/services/dialog.service';
import {DialogRef} from '@app/shared/models/dialog-ref';
import {InboxService} from '@app/services/inbox.service';
import {DIALOG_DATA_TOKEN} from '@app/shared/tokens/tokens';
import {LangService} from '@app/services/lang.service';
import {CommonUtils} from '@app/helpers/common-utils';
import {CollectorItem} from '@app/models/collector-item';
import {exhaustMap, filter, map, switchMap, takeUntil, tap} from 'rxjs/operators';
import {IWFResponse} from '@app/interfaces/i-w-f-response';

@Component({
  selector: 'collector-approval-approve-task-popup',
  templateUrl: './collector-approval-approve-task-popup.component.html',
  styleUrls: ['./collector-approval-approve-task-popup.component.scss']
})
export class CollectorApprovalApproveTaskPopupComponent implements OnInit, OnDestroy {
  private destroy$: Subject<any> = new Subject();
  label: keyof ILanguageKeys;

  selectedLicense: LicenseApprovalInterface | null = null;

  selectedIndex: number | false = false;
  action$: Subject<any> = new Subject<any>();

  response: WFResponseType = WFResponseType.APPROVE;

  model: CollectorApproval;
  comment: FormControl = new FormControl();

  constructor(
    private dialog: DialogService,
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
    this.listenToAction()
  }

  setSelectedLicense({item, index}: { item: LicenseApprovalInterface, index: number }) {
    this.selectedLicense = item;
    this.selectedIndex = (++index); // add one to the selected inbox to avoid the  check false value
  }

  saveLicenseInfo(license: LicenseApprovalInterface) {
    if (this.selectedIndex) {
      this.data.model.collectorItemList.splice(this.selectedIndex - 1, 1, (license as unknown as CollectorItem))
      this.data.model.collectorItemList = this.data.model.collectorItemList.slice();
    } else {
      this.data.model.collectorItemList.map((item) => {
        return item.clone({
          ...(license as unknown as CollectorItem)
        })
      })
    }
    this.formCancel();
  }

  formCancel() {
    this.selectedLicense = null;
    this.selectedIndex = false;
  }

  private listenToAction() {
    this.action$
      .pipe(takeUntil(this.destroy$))
      .pipe(map(_ => this.data.model.hasInvalidCollectorItems()))
      .pipe(tap(invalid => invalid && this.displayInvalidItemMessages()))
      .pipe(filter(invalid => !invalid))
      .pipe(exhaustMap(_ => this.data.model.save()))
      .pipe(switchMap(_ => this.inboxService.takeActionOnTask(this.data.model.taskDetails.tkiid, this.getResponse(), this.model.service)))
      .subscribe(() => {
        this.dialogRef.close();
      })
  }

  private displayInvalidItemMessages() {
    this.dialog.error(this.lang.map.please_make_sure_that_you_filled_out_all_required_data_for_all_license);
  }

  private getResponse(): Partial<IWFResponse> {
    return this.comment.value ? {
      selectedResponse: this.response,
      comment: this.comment.value
    } : {selectedResponse: this.response};
  }
}
