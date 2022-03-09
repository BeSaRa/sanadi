import {Component, Inject, OnDestroy, OnInit} from '@angular/core';
import {LangService} from "@app/services/lang.service";
import {CollectionApproval} from "@app/models/collection-approval";
import {Subject} from "rxjs";
import {DIALOG_DATA_TOKEN} from "@app/shared/tokens/tokens";
import {WFResponseType} from "@app/enums/wfresponse-type.enum";
import {CommonUtils} from "@app/helpers/common-utils";
import {ILanguageKeys} from "@app/interfaces/i-language-keys";
import {LicenseApprovalInterface} from "@app/interfaces/license-approval-interface";
import {CollectionItem} from "@app/models/collection-item";
import {exhaustMap, filter, map, switchMap, takeUntil, tap} from "rxjs/operators";
import {DialogService} from "@app/services/dialog.service";
import {InboxService} from "@app/services/inbox.service";
import {FormControl} from "@angular/forms";
import {IWFResponse} from "@app/interfaces/i-w-f-response";
import {DialogRef} from "@app/shared/models/dialog-ref";

@Component({
  selector: 'collection-approval-approve-task-popup',
  templateUrl: './collection-approval-approve-task-popup.component.html',
  styleUrls: ['./collection-approval-approve-task-popup.component.scss']
})
export class CollectionApprovalApproveTaskPopupComponent implements OnInit, OnDestroy {
  private destroy$: Subject<any> = new Subject();
  label: keyof ILanguageKeys;

  selectedLicense: LicenseApprovalInterface | null = null;

  selectedIndex: number | false = false;
  action$: Subject<any> = new Subject<any>();

  response: WFResponseType = WFResponseType.APPROVE;

  model: CollectionApproval;
  comment: FormControl = new FormControl();

  constructor(
    private dialog: DialogService,
    private dialogRef: DialogRef,
    private inboxService: InboxService,
    @Inject(DIALOG_DATA_TOKEN) public data: {
      model: CollectionApproval,
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
      this.data.model.collectionItemList.splice(this.selectedIndex - 1, 1, (license as unknown as CollectionItem))
      this.data.model.collectionItemList = this.data.model.collectionItemList.slice();
    } else {
      this.data.model.collectionItemList.map((item) => {
        return item.clone({
          ...(license as unknown as CollectionItem)
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
      .pipe(map(_ => this.data.model.hasInvalidCollectionItems()))
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
