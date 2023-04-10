import {Component, Inject, OnDestroy, OnInit} from '@angular/core';
import {LangService} from '@services/lang.service';
import {DIALOG_DATA_TOKEN} from '@app/shared/tokens/tokens';
import {FileExtensionsEnum, FileIconsEnum} from '@app/enums/file-extension-mime-types-icons.enum';
import {FileNetDocument} from '@app/models/file-net-document';
import {UntypedFormControl} from '@angular/forms';
import {CustomAttachmentDataContract} from '@contracts/custom-attachment-data-contract';
import {AttachmentsComponent} from '@app/shared/components/attachments/attachments.component';
import {of, Subject} from 'rxjs';
import {map, switchMap, takeUntil} from 'rxjs/operators';
import {AttachmentTypeServiceData} from '@app/models/attachment-type-service-data';
import {CaseModel} from '@app/models/case-model';
import {ToastService} from '@services/toast.service';
import {DialogService} from '@services/dialog.service';
import {UserClickOn} from '@app/enums/user-click-on.enum';
import {EmployeeService} from '@services/employee.service';
import {ExternalUser} from '@app/models/external-user';
import {InternalUser} from '@app/models/internal-user';
import {DialogRef} from '@app/shared/models/dialog-ref';
import {ItemId} from '@app/types/types';
import { GlobalSettingsService } from '@app/services/global-settings.service';
import { GlobalSettings } from '@app/models/global-settings';

@Component({
  selector: 'custom-attachment-popup',
  templateUrl: './custom-attachment-popup.component.html',
  styleUrls: ['./custom-attachment-popup.component.scss']
})
export class CustomAttachmentPopupComponent implements OnInit, OnDestroy {
  displayedColumns: string[] = ['title', 'type', 'description', 'mandatory', 'isPublished', 'date', 'actions'];
  disabled: boolean = false;
  fileIconsEnum: typeof FileIconsEnum = FileIconsEnum;
  attachments: FileNetDocument[] = [];
  filter: UntypedFormControl = new UntypedFormControl();
  component!: AttachmentsComponent;
  loadStatus$: Subject<Omit<CustomAttachmentDataContract, 'loadStatus$'>>;
  destroy$: Subject<void> = new Subject<void>();
  attachmentsTypes: AttachmentTypeServiceData[] = [];
  model!: CaseModel<any, any>;
  identifier!: string;
  itemId!: string;
  selectedFile!: FileNetDocument;
  selectedIndex!: number;
  globalSettings: GlobalSettings = this.globalSettingsService.getGlobalSettings();
  allowedExtensions: string[] = [];
  allowedFileMaxSize: number = this.globalSettings.fileSize;
  attachmentsUpdated$!: Subject<FileNetDocument[]>;

  constructor(public lang: LangService,
              private toast: ToastService,
              private dialogRef: DialogRef,
              private dialog: DialogService,
              private employeeService: EmployeeService,
              @Inject(DIALOG_DATA_TOKEN)
              public data: CustomAttachmentDataContract,
              private globalSettingsService: GlobalSettingsService) {
    this.loadStatus$ = this.data.loadStatus$;
    this.assignNeededData(this.data);
  }

  private assignNeededData(data: Omit<CustomAttachmentDataContract, 'loadStatus$'>): void {
    this.attachments = data.attachments;
    this.component = data.component;
    this.attachmentsTypes = data.attachmentsTypes;
    this.model = data.model;
    this.identifier = data.identifier;
    this.itemId = data.itemId;
    this.attachmentsUpdated$ = data.attachmentsUpdated$;
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.destroy$.unsubscribe();
  }

  ngOnInit(): void {
    this.setAllowedFiles();
    this.listenToLoadStatus();
  }

  setAllowedFiles() {
    this.globalSettingsService.getAllowedFileTypes()
      .pipe(
        map(fileTypes => fileTypes.map(fileType => '.' + (fileType.extension ?? '').toLowerCase()))
      )
      .subscribe(list => {
        this.allowedExtensions = list;
      })
  }

  canChangePublished(attachment: FileNetDocument): boolean {
    if (!attachment.attachmentTypeStatus || this.employeeService.isExternalUser()) {
      return false;
    }
    return !attachment.id;
  }

  uploaderFileChange($event: Event): void {
    const input = ($event.target as HTMLInputElement);
    const file = input.files?.item(0);
    const validFile = file ? (this.allowedExtensions.includes(file.name.getExtension())) : true;
    !validFile ? input.value = '' : null;
    if (!validFile) {
      this.dialog.error(
        this.lang.map
          .msg_only_those_files_allowed_to_upload
          .change({files: this.allowedExtensions.join(', ')})
      );
      input.value = '';
      return;
    }
    const validFileSize = file ? (file.size <= this.allowedFileMaxSize * 1000 * 1024) : true;
    !validFileSize ? input.value = '' : null;
    if (!validFileSize) {
      this.dialog.error(this.lang.map.msg_only_this_file_size_or_less_allowed_to_upload.change({size: this.allowedFileMaxSize}));
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
            itemId: this.itemId,
            gridName: this.identifier,
            isPublished: this.employeeService.isExternalUser() ? true : this.selectedFile?.isPublished
          }));
      }))
      .pipe(takeUntil(this.destroy$))
      .subscribe((document) => {
        const attachment = document as FileNetDocument;
        attachment.attachmentTypeStatus = this.selectedFile?.attachmentTypeStatus!;
        input.value = '';
        this.toast.success(this.lang.map.files_have_been_uploaded_successfully);
        this.attachments.splice(this.selectedIndex, 1, attachment.clone({attachmentTypeInfo: this.selectedFile?.attachmentTypeInfo}));
        this.attachments = this.attachments.slice();
        this.updateAttachments(this.attachments);
      });
  }

  deleteFile(file: FileNetDocument): void {
    if (this.isDisabledActionButtons(file, 'delete')) {
      return;
    }

    this.dialog
      .confirm(this.lang.map.msg_confirm_delete_x.change({x: file.documentTitle}))
      .onAfterClose$.subscribe((userClick: UserClickOn) => {
      if (userClick !== UserClickOn.YES) {
        return;
      }

      this.model.service.documentService.deleteDocument(file.id)
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
          this.updateAttachments(this.attachments);
        });
    });
  }

  uploadAttachment(row: FileNetDocument, uploader: HTMLInputElement): void {
    if (this.isDisabledActionButtons(row, 'upload')) {
      return;
    }
    uploader.click();
    this.selectedFile = row;
    this.selectedIndex = this.attachments.indexOf(row);
  }

  reload(): void {
    this.component.forceReload();
  }

  viewFile(file: FileNetDocument): void {
    if (this.isDisabledActionButtons(file, 'view')) {
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
        this.assignNeededData(data);
      });
  }

  handleChangePublished(attachment: FileNetDocument, $event?: MouseEvent): void {
    if (this.disabled || !attachment.attachmentTypeStatus) {
      $event?.preventDefault();
      return;
    } else {
      attachment.isPublished = !attachment.isPublished;
    }
  }

  canShowActionButtons(attachment: FileNetDocument, buttonType: 'view' | 'delete' | 'upload' | 'publish') {
    // if attachment is already saved, show buttons
    // otherwise, show only if attachment type is active
    return attachment.id ? true : (attachment.attachmentTypeStatus);
  }

  isDisabledActionButtons(attachment: FileNetDocument, buttonType: 'view' | 'delete' | 'upload' | 'publish') {
    if (buttonType === 'view') {
      return !attachment.id;
    } else if (buttonType === 'delete') {
      if (this.model.isFinalApproved() || this.model.isFinalNotification()) {
        return true;
      }
      return this.disabled || !attachment.attachmentTypeStatus || !attachment.id || !this._isCreatedByCurrentUser(attachment);
    } else if (buttonType === 'upload') {
      return this.disabled || !attachment.attachmentTypeStatus;
    } else if (buttonType === 'publish') {
      return this.disabled;
    }
    return true;
  }

  private _isCreatedByCurrentUser(attachment: FileNetDocument) {
    let user = this.employeeService.getCurrentUser();
    if (this.employeeService.isExternalUser()) {
      return ('' + ((user as ExternalUser).qid ?? '')).trim() === attachment.createdBy;
    } else {
      return (user as InternalUser).domainName === attachment.createdBy;
    }
  }

  private updateAttachments(attachments: FileNetDocument[]): void {
    let grid = this.data.component.multiAttachments.get(this.identifier)!;
    if (!grid) {
      this.data.component.multiAttachments.set(this.identifier, new Map<ItemId, FileNetDocument[]>());
      grid = this.data.component.multiAttachments.get(this.identifier)!;
    }
    grid.set(this.itemId, attachments);
    this.data.attachmentsUpdated$.next(attachments);
  }

  closeAttachmentsPopup(): void {
    this.updateAttachments(this.attachments);
    this.dialogRef.close();
  }
}
