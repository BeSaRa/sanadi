import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { LangService } from "@services/lang.service";
import { DIALOG_DATA_TOKEN } from "@app/shared/tokens/tokens";
import { FileIconsEnum } from "@app/enums/file-extension-mime-types-icons.enum";
import { FileNetDocument } from "@app/models/file-net-document";
import { UntypedFormControl } from "@angular/forms";
import { CustomAttachmentDataContract } from "@contracts/custom-attachment-data-contract";
import { AttachmentsComponent } from "@app/shared/components/attachments/attachments.component";
import { of, Subject } from "rxjs";
import { map, switchMap, takeUntil } from "rxjs/operators";
import { AttachmentTypeServiceData } from "@app/models/attachment-type-service-data";
import { CaseModel } from "@app/models/case-model";
import { ConfigurationService } from "@services/configuration.service";
import { ToastService } from "@services/toast.service";
import { DialogService } from "@services/dialog.service";
import { UserClickOn } from "@app/enums/user-click-on.enum";

@Component({
  selector: 'custom-attachment-popup',
  templateUrl: './custom-attachment-popup.component.html',
  styleUrls: ['./custom-attachment-popup.component.scss']
})
export class CustomAttachmentPopupComponent implements OnInit, OnDestroy {
  displayedColumns: string[] = ['title', 'type', 'description', 'mandatory', 'date', 'actions'];
  disabled: boolean = false;
  fileIconsEnum: typeof FileIconsEnum = FileIconsEnum;
  attachments: FileNetDocument[] = [];
  filter: UntypedFormControl = new UntypedFormControl();
  component!: AttachmentsComponent
  loadStatus$: Subject<Omit<CustomAttachmentDataContract, 'loadStatus$'>>
  destroy$: Subject<void> = new Subject<void>()
  attachmentsTypes: AttachmentTypeServiceData[] = []
  model!: CaseModel<any, any>
  identifier!: string;
  itemId!: string;
  selectedFile!: FileNetDocument;
  selectedIndex!: number;

  constructor(public lang: LangService,
              private configurationService: ConfigurationService,
              private toast: ToastService,
              private dialog: DialogService,
              @Inject(DIALOG_DATA_TOKEN)
              public data: CustomAttachmentDataContract) {
    this.loadStatus$ = this.data.loadStatus$
    this.assignNeededData(this.data)
  }

  private assignNeededData(data: Omit<CustomAttachmentDataContract, 'loadStatus$'>): void {
    this.attachments = data.attachments;
    this.component = data.component
    this.attachmentsTypes = data.attachmentsTypes
    this.model = data.model
    this.identifier = data.identifier
    this.itemId = data.itemId
  }

  ngOnDestroy(): void {
    this.destroy$.next()
    this.destroy$.complete()
    this.destroy$.unsubscribe()
  }

  ngOnInit(): void {
    this.listenToLoadStatus()
  }

  uploaderFileChange($event: Event): void {
    const input = ($event.target as HTMLInputElement);
    const file = input.files?.item(0);
    const validFile = file ? (file.type === 'application/pdf') : true;
    !validFile ? input.value = '' : null;
    if (!validFile) {
      this.dialog.error(
        this.lang.map
          .msg_only_those_files_allowed_to_upload
          .change({ files: this.configurationService.CONFIG.ALLOWED_FILE_TYPES_TO_UPLOAD.join(',') })
      );
      input.value = '';
      return;
    }
    const deleteFirst$ = this.selectedFile && this.selectedFile.id ? this.model.service.documentService.deleteDocument(this.selectedFile.id) : of(null);
    of(null)
      .pipe(switchMap(_ => deleteFirst$))
      .pipe(switchMap(_ => {
        return this.model.service.documentService
          .addSingleDocument(this.model.id!, (new FileNetDocument()).clone({
            documentTitle: this.selectedFile?.documentTitle,
            description: this.selectedFile?.description,
            attachmentTypeId: this.selectedFile?.attachmentTypeId,
            required: this.selectedFile?.required,
            files: input.files!,
            itemId: this.identifier + '|' + this.itemId
          }))
      }))
      .pipe(takeUntil(this.destroy$))
      .subscribe((document) => {
        const attachment = document as FileNetDocument
        input.value = '';
        this.toast.success(this.lang.map.files_have_been_uploaded_successfully);
        this.attachments.splice(this.selectedIndex, 1, attachment.clone({ attachmentTypeInfo: this.selectedFile?.attachmentTypeInfo }));
        this.attachments = this.attachments.slice();
      })
  }

  deleteFile(file: FileNetDocument): void {
    if (!file.id) {
      return;
    }

    this.dialog
      .confirm(this.lang.map.msg_confirm_delete_x.change({ x: file.documentTitle }))
      .onAfterClose$.subscribe((userClick: UserClickOn) => {
      if (userClick !== UserClickOn.YES) {
        return;
      }

      this.model.service.documentService.deleteDocument(file.id)
        .subscribe(() => {
          this.toast.success(this.lang.map.msg_delete_x_success.change({ x: file.documentTitle }));
          this.attachments.splice(this.attachments.indexOf(file), 1, (new FileNetDocument()).clone({
            documentTitle: file.documentTitle,
            description: file.description,
            attachmentTypeId: file.attachmentTypeId,
            attachmentTypeInfo: file.attachmentTypeInfo,
            required: file.required
          }))
          this.attachments = this.attachments.slice();
        })
    });
  }

  uploadAttachment(row: FileNetDocument, uploader: HTMLInputElement): void {
    if (this.disabled) {
      return;
    }
    uploader.click();
    this.selectedFile = row
    this.selectedIndex = this.attachments.indexOf(row);
  }

  reload(): void {
    this.component.forceReload()
  }

  viewFile(file: FileNetDocument): void {
    if (!file.id) {
      return;
    }
    this.model.service.documentService.downloadDocument(file.id)
      .pipe(
        map(model => this.model.service.documentService.viewDocument(model, file))
      )
      .subscribe();
  }

  private listenToLoadStatus(): void {
    this.loadStatus$
      .pipe(takeUntil(this.destroy$))
      .subscribe((data) => {
        this.assignNeededData(data)
      })
  }
}
