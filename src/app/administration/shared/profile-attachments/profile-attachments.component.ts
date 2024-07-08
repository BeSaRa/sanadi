import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {BehaviorSubject, of, Subject} from 'rxjs';
import {filter, map, switchMap, takeUntil, tap} from 'rxjs/operators';
import {FileNetDocument} from '@app/models/file-net-document';
import {LangService} from '@app/services/lang.service';
import {DialogService} from '@app/services/dialog.service';
import {ToastService} from '@app/services/toast.service';
import {FileIconsEnum} from '@app/enums/file-extension-mime-types-icons.enum';
import {OperationTypes} from '@app/enums/operation-types.enum';
import {ProfileAttachmentsService} from '@app/services/profile-attachments.service';
import {
  ProfileAttachmentDetailsPopupComponent
} from '@app/shared/popups/profile-attachment-details-popup/profile-attachment-details-popup.component';
import {GlobalSettingsService} from '@app/services/global-settings.service';
import {GlobalSettings} from '@app/models/global-settings';

@Component({
  selector: 'profile-attachments',
  templateUrl: './profile-attachments.component.html',
  styleUrls: ['./profile-attachments.component.scss']
})
export class ProfileAttachmentsComponent implements OnInit, OnDestroy {
  constructor(
    public lang: LangService,
    private service: ProfileAttachmentsService,
    private dialog: DialogService,
    private toast: ToastService,
    private globalSettingsService: GlobalSettingsService) {
    this.setAllowedFiles();

  }

  ngOnInit(): void {
    this.listenToReload();
    this.listenToAddOtherAttachment();
    this.loadingStatus.next(true);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.destroy$.unsubscribe();
  }

  addOtherAttachments: Subject<null> = new Subject<null>();
  destroy$: Subject<void> = new Subject();
  private loadingStatus: BehaviorSubject<any> = new BehaviorSubject(false);
  loadedStatus$: BehaviorSubject<boolean | null> = new BehaviorSubject<boolean | null>(null);

  private reload$ = this.loadingStatus.asObservable().pipe(filter(v => !!v));

  @Input() profileId!: string;
  @Input() readonly: boolean = false;

  selectedFile?: FileNetDocument;
  attachments: FileNetDocument[] = [];
  displayedColumns: string[] = ['title', 'name', 'description', 'date', 'actions'];
  fileIconsEnum = FileIconsEnum;
  globalSettings: GlobalSettings = this.globalSettingsService.getGlobalSettings();
  allowedExtensions: string[] = [];
  allowedFileMaxSize: number = this.globalSettings.fileSize;
  defaultAttachments: FileNetDocument[] = [];
  private selectedIndex!: number;

  setAllowedFiles() {

    this.globalSettingsService.getAllowedFileTypes()
      .pipe(
        map(fileTypes => fileTypes.map(fileType => '.' + (fileType.extension ?? '').toLowerCase()))
      )
      .subscribe(list => {
        this.allowedExtensions = list;

      })
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
          .change({files: this.allowedExtensions.join(',')})
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

    of(null)
      .pipe(
        switchMap(_ => {
          return this.service
            .addSingleDocument(this.profileId!, (new FileNetDocument()).clone({
              documentTitle: this.selectedFile?.documentTitle,
              description: this.selectedFile?.description,
              attachmentTypeId: this.selectedFile?.attachmentTypeId,
              required: this.selectedFile?.required,
              files: input.files!,
            }));
        }),
        takeUntil(this.destroy$)
      )
      .subscribe((attachment) => {
        input.value = '';
        this.toast.success(this.lang.map.files_have_been_uploaded_successfully);
        attachment.attachmentTypeStatus = this.selectedFile?.attachmentTypeStatus!;
        this.attachments.splice(this.selectedIndex, 1, attachment.clone({attachmentTypeInfo: this.selectedFile?.attachmentTypeInfo}));
        this.attachments = this.attachments.slice();
      });
  }

  canShowActionButtons(attachment: FileNetDocument, buttonType: 'view' | 'upload') {
    if (this.readonly && (buttonType === 'upload')) {
      return false;
    }
    return attachment.id ? true : (attachment.attachmentTypeStatus);
  }

  viewFile(file: FileNetDocument): void {
    this.service.downloadDocument(file.id)
      .pipe(
        map(model => this.service.viewDocument(model, file))
      )
      .subscribe();
  }

  uploadAttachment(row: FileNetDocument, uploader: HTMLInputElement): void {

    if (this.isDisabledActionButtons(row, 'upload')) {
      return;
    }

    uploader.click();
    this.selectedFile = row;
    this.selectedIndex = this.attachments.indexOf(row);
  }

  isDisabledActionButtons(attachment: FileNetDocument, buttonType: 'view' | 'upload') {
    if (buttonType === 'view') {
      return !attachment.id;
    } else if (buttonType === 'upload') {
      return !attachment.attachmentTypeStatus;
    }
    return true;
  }

  private listenToAddOtherAttachment() {
    this.addOtherAttachments
      .pipe(
        switchMap(() => this.dialog.show(ProfileAttachmentDetailsPopupComponent, {
          model: new FileNetDocument(),
          operation: OperationTypes.CREATE
        }).onAfterClose$.pipe(filter((attachment) => !!attachment))))
      .subscribe((attachment) => {
        this.attachments = ([] as FileNetDocument[]).concat([attachment, ...this.attachments]);
      });
  }

  private listenToReload(): void {
    this.reload$
      .pipe(
        switchMap(_ => this.profileId ? this.service.loadAttachments(this.profileId) : of([])),
        tap((attachments) => this.defaultAttachments = attachments.slice()),
        takeUntil(this.destroy$)
      )
      .subscribe((attachments) => {
        this.attachments = attachments;
        this.loadedStatus$.next(true);
      });
  }

}
