import { Component, Inject, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import { FileExtensionsEnum, FileIconsEnum } from '@app/enums/file-extension-mime-types-icons.enum';
import { OperationTypes } from '@app/enums/operation-types.enum';
import { UserClickOn } from '@app/enums/user-click-on.enum';
import { WFResponseType } from '@app/enums/wfresponse-type.enum';
import { IWFResponse } from '@app/interfaces/i-w-f-response';
import { FileNetDocument } from '@app/models/file-net-document';
import { DialogService } from '@app/services/dialog.service';
import { InboxService } from '@app/services/inbox.service';
import { LangService } from '@app/services/lang.service';
import { ToastService } from '@app/services/toast.service';
import { DialogRef } from '@app/shared/models/dialog-ref';
import { OtherAttachmentDetailsPopupComponent } from '@app/shared/popups/other-attachment-details-popup/other-attachment-details-popup.component';
import { DIALOG_DATA_TOKEN } from '@app/shared/tokens/tokens';
import { CustomValidators } from '@app/validators/custom-validators';
import { of, Subject } from 'rxjs';
import { exhaustMap, filter, map, switchMap, takeUntil, tap } from 'rxjs/operators';
import { DocumentService } from './../../../../services/document.service';

@Component({
  selector: 'app-approve-with-document-popup',
  templateUrl: './approve-with-document-popup.component.html',
  styleUrls: ['./approve-with-document-popup.component.scss']
})
export class ApproveWithDocumentPopupComponent implements OnInit {

  comment: UntypedFormControl = new UntypedFormControl('',
    [CustomValidators.maxLength(CustomValidators.defaultLengths.EXPLANATIONS)]);
  response: WFResponseType = WFResponseType.APPROVE;
  action$: Subject<any> = new Subject<any>();
  attachments: FileNetDocument[] = [];
  displayedColumns: string[] = ['title', 'type', 'description', 'mandatory',  'date', 'actions'];
  fileIconsEnum = FileIconsEnum;
  addOtherAttachments: Subject<null> = new Subject<null>();
  selectedFile?: FileNetDocument;
  private selectedIndex!: number;

  private destroy$: Subject<any> = new Subject();

  constructor(
    @Inject(DIALOG_DATA_TOKEN) public data: {
      service: DocumentService,
      model: any,
      caseType:number,
      caseId:string,
      actionType: WFResponseType,

    },
    public lang: LangService,
    private dialog: DialogService,
    private dialogRef: DialogRef,
    private toast: ToastService,
    private inboxService: InboxService,
    private fb: UntypedFormBuilder
  ) {

    this.response = this.data.actionType;


  }

  ngOnInit() {
    this._listenToAddOtherAttachment();
    this._listenToAction();

  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.destroy$.unsubscribe();
  }

  isEditAllowed() {
    return true;
  }

  private _listenToAddOtherAttachment() {
    this.addOtherAttachments
      .pipe(
        switchMap(() => this.dialog.show(OtherAttachmentDetailsPopupComponent, {
          model: new FileNetDocument(),
          operation: OperationTypes.CREATE
        }).onAfterClose$.pipe(filter((attachment) => !!attachment))))
      .subscribe((attachment) => {
        this.attachments = ([] as FileNetDocument[]).concat([attachment, ...this.attachments]);
      });
  }
  private _listenToAction() {
    console.log(this.attachments);

    this.action$
      .pipe(takeUntil(this.destroy$))
      .pipe(map(_ => (this.isCommentRequired() ? this.comment.invalid : false) ||
        ( this.attachments.filter(attachment=> !!attachment.id).length < 1) ))

      .pipe(tap(invalid => {
        invalid && this.dialog.error(this.lang.map.msg_all_required_fields_are_filled);
      }))
      .pipe(filter(invalid => !invalid))

      .pipe(exhaustMap(_ => this.data.model.save()))
      .pipe(switchMap(_ => this.inboxService.takeActionOnTask(this.data.model.taskDetails.tkiid, this.getResponse(),
        this.data.model.service)))
      .subscribe(() => {
        this.toast.success(this.lang.map.process_has_been_done_successfully);
        this.dialogRef.close(true);
      });
  }

  private getResponse(): Partial<IWFResponse> {
    return this.comment.value ? {
      selectedResponse: this.response,
      comment: this.comment.value
    } : {selectedResponse: this.response};
  }
  private isCommentRequired(): boolean {
    return false;
  }
  canChangePublished(attachment: FileNetDocument): boolean {

    return !attachment.id;
  }

  uploadAttachment(row: FileNetDocument, uploader: HTMLInputElement): void {

    if (!this.data.model.id) {
      this.dialog.info(this.lang.map.this_action_cannot_be_performed_before_saving_the_request);
      return;
    }
    uploader.click();
    this.selectedFile = row;
    this.selectedIndex = this.attachments.indexOf(row);
  }

  viewFile(file: FileNetDocument): void {

    this.data.service.downloadDocument(file.id)
      .pipe(
        map(model => this.data.service.viewDocument(model, file))
      )
      .subscribe();
  }

  deleteFile(file: FileNetDocument): void {
    this.dialog
      .confirm(this.lang.map.msg_confirm_delete_x.change({x: file.documentTitle}))
      .onAfterClose$.subscribe((userClick: UserClickOn) => {
      if (userClick !== UserClickOn.YES) {
        return;
      }
      this.data.service.deleteDocument(file.id)
        .subscribe(() => {
          this.toast.success(this.lang.map.msg_delete_x_success.change({x: file.documentTitle}));
          this.attachments.splice(this.attachments.indexOf(file), 1, (new FileNetDocument()).clone({
            documentTitle: file.documentTitle,
            description: file.description,
            attachmentTypeId: file.attachmentTypeId,
            attachmentTypeInfo: file.attachmentTypeInfo,
            required: file.required,
            attachmentTypeStatus: file.attachmentTypeStatus
          }));
          this.attachments = this.attachments.slice();
        });
    });

  }
  allowedExtensions: string[] = [FileExtensionsEnum.PDF];
  loadedAttachments: Record<number, FileNetDocument> = {};

  uploaderFileChange($event: Event): void {
    const input = ($event.target as HTMLInputElement);
    const file = input.files?.item(0);
    const validFile = file ? (file.type === 'application/pdf') : true;
    !validFile ? input.value = '' : null;
    if (!validFile) {
      this.dialog.error(
        this.lang.map
          .msg_only_those_files_allowed_to_upload
          .change({files: this.allowedExtensions.join(',')})
      );
      input.value = '';
      return;
    }
    const deleteFirst$ = this.selectedFile && this.selectedFile.id ? this.data.service.deleteDocument(this.selectedFile.id) : of(null);
    of(null)
      .pipe(switchMap(_ => deleteFirst$))
      .pipe(
        switchMap(_ => {
          return this.data.service
            .addSingleDocument(this.data.model.id!, (new FileNetDocument()).clone({
              documentTitle: this.selectedFile?.documentTitle,
              description: this.selectedFile?.description,
              attachmentTypeId: this.selectedFile?.attachmentTypeId,
              required: this.selectedFile?.required,
              files: input.files!,
              isPublished: false
            }));
        }),
        takeUntil(this.destroy$)
      )
      .subscribe((attachment) => {
        input.value = '';
        this.toast.success(this.lang.map.files_have_been_uploaded_successfully);
        attachment.attachmentTypeStatus = this.selectedFile?.attachmentTypeStatus!;
        this.loadedAttachments[attachment.attachmentTypeId] = attachment;
        this.attachments.splice(this.selectedIndex, 1, attachment.clone({attachmentTypeInfo: this.selectedFile?.attachmentTypeInfo}));
        this.attachments = this.attachments.slice();
      });
  }
  isDisabledActionButtons(attachment: FileNetDocument) {
    return  !attachment.id;
  }
}

