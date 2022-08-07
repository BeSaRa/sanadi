import { Component, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { BehaviorSubject, Observable, of, Subject } from "rxjs";
import { filter, map, skip, switchMap, takeUntil, tap } from "rxjs/operators";
import { FileNetDocument } from "@app/models/file-net-document";
import { LangService } from "@app/services/lang.service";
import { FormControl } from "@angular/forms";
import { AttachmentTypeService } from "@app/services/attachment-type.service";
import { DocumentService } from "@app/services/document.service";
import { DialogService } from "@app/services/dialog.service";
import { ConfigurationService } from "@app/services/configuration.service";
import { UserClickOn } from "@app/enums/user-click-on.enum";
import { ToastService } from "@app/services/toast.service";
import { TableComponent } from "@app/shared/components/table/table.component";
import { AttachmentTypeServiceData } from "@app/models/attachment-type-service-data";
import { FileIconsEnum } from '@app/enums/file-extension-mime-types-icons.enum';
import { AdminResult } from "@app/models/admin-result";

// noinspection AngularMissingOrInvalidDeclarationInModule
@Component({
  selector: 'attachments',
  templateUrl: './attachments.component.html',
  styleUrls: ['./attachments.component.scss']
})
export class AttachmentsComponent implements OnInit, OnDestroy {
  // public attachment types
  attachmentTypes: AttachmentTypeServiceData[] = [];
  multiAttachmentTypes: AttachmentTypeServiceData[] = [];

  attachments: FileNetDocument[] = [];
  fileIconsEnum = FileIconsEnum;
  defaultAttachments: FileNetDocument[] = [];

  private loadingStatus: BehaviorSubject<any> = new BehaviorSubject(false);
  // only the true value will emit
  private reload$ = this.loadingStatus.asObservable().pipe(filter(v => !!v));

  loadedStatus$: Subject<any> = new Subject<any>();
  // loaded status to check before load the stuff again
  private loaded: boolean = false;
  @Input()
  forceLoadEveryTime: boolean = false;
  private _caseId: BehaviorSubject<string | undefined> = new BehaviorSubject<string | undefined>(undefined);
  @Input()
  set caseId(value: string | undefined) {
    this._caseId.next(value);
  }

  get caseId(): string | undefined {
    return this._caseId.value;
  }

  @Input()
  disabled: boolean = false;
  @Input()
  caseType?: number;
  @Input()
  service!: DocumentService;
  @ViewChild(TableComponent)
  table!: TableComponent

  selectedFile?: FileNetDocument;

  private loadedAttachments: Record<number, FileNetDocument> = {};
  private selectedIndex!: number;

  @Input()
  set load(load: boolean) {
    this.loadingStatus.next(load);
  }

  destroy$: Subject<any> = new Subject<any>();
  displayedColumns: string[] = [/*'rowSelection',*/ 'title', 'type', 'description', 'mandatory', 'date', 'actions'];

  filter: FormControl = new FormControl();

  addOtherAttachments: Subject<null> = new Subject<null>();

  constructor(public lang: LangService,
              private dialog: DialogService,
              private toast: ToastService,
              private configurationService: ConfigurationService,
              private attachmentTypeService: AttachmentTypeService) {
    this.attachmentTypeService.attachmentsComponent = this;
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.destroy$.unsubscribe();
  }

  ngOnInit(): void {
    this.listenToReload();
    this.listenToCaseIdChanges();
    this.listenToAddOtherAttachment();
    this.loadingStatus.next(true);
  }

  private loadDocumentsByCaseId(types: FileNetDocument[]): Observable<FileNetDocument[]> {
    return this.caseId ? this.service.loadDocuments(this.caseId)
      .pipe(map(attachments => attachments.length ? this.mergeAttachments(attachments, types) : types)) : of(types);
  }

  private listenToReload(): void {
    this.reload$
      .pipe(filter(val => (val && (!this.loaded || (this.loaded && this.forceLoadEveryTime)))))
      .pipe(
        tap(_ => this.loaded = true),
        // load attachment types related to the service
        switchMap(_ => this.caseType ? this.attachmentTypeService.loadTypesByCaseType(this.caseType) : of([])),
        tap(types => {
          this.attachmentTypes = types.filter(item => !item.multi);
          this.multiAttachmentTypes = types.filter(item => item.multi);
        }),
        map<AttachmentTypeServiceData[], FileNetDocument[]>(() => this.attachmentTypes.map(type => type.convertToAttachment())),
        tap((attachments) => this.defaultAttachments = attachments.slice()),
        switchMap((types) => this.loadDocumentsByCaseId(types)),
        takeUntil(this.destroy$)
      )
      .subscribe((attachments) => {
        this.attachments = attachments;
        this.loadedStatus$.next(true);
      })
  }

  private mergeAttachments(attachments: FileNetDocument[] = [], types: FileNetDocument[]): FileNetDocument[] {
    const typeIds = types.map(type => type.attachmentTypeInfo.id!)
    const attachmentTypeIds = attachments.map(attachment => attachment.attachmentTypeInfo.id!)
    // if attachments gt types
    // if types gt attachments
    //
    this.loadedAttachments = types.reduce((acc, file) => {
      return { ...acc, [file.attachmentTypeInfo.id!]: file }
    }, {} as Record<number, FileNetDocument>);

    const differenceIds = typeIds.filter((id) => !attachmentTypeIds.includes(id))

    attachments = attachments.map(attachment => {
      if (attachment.attachmentTypeId === -1) {
        attachment.attachmentTypeInfo = AttachmentsComponent.createOtherLookup()
      }
      return attachment
    })

    return attachments.concat(differenceIds.map(id => this.loadedAttachments[id]))
  }

  uploadAttachment(row: FileNetDocument, uploader: HTMLInputElement): void {
    if (this.disabled) {
      return;
    }

    if (!this.caseId) {
      this.dialog.info(this.lang.map.this_action_cannot_be_performed_before_saving_the_request);
      return;
    }
    uploader.click();
    this.selectedFile = row;
    this.selectedIndex = this.attachments.indexOf(row);
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
    const deleteFirst$ = this.selectedFile && this.selectedFile.id ? this.service.deleteDocument(this.selectedFile.id) : of(null);
    of(null)
      .pipe(switchMap(_ => deleteFirst$))
      .pipe(
        switchMap(_ => {
          return this.service
            .addSingleDocument(this.caseId!, (new FileNetDocument()).clone({
              documentTitle: this.selectedFile?.documentTitle,
              description: this.selectedFile?.description,
              attachmentTypeId: this.selectedFile?.attachmentTypeId,
              required: this.selectedFile?.required,
              files: input.files!
            }))
        }),
        takeUntil(this.destroy$)
      )
      .subscribe((attachment) => {
        input.value = '';
        this.toast.success(this.lang.map.files_have_been_uploaded_successfully);
        this.loadedAttachments[attachment.attachmentTypeId] = attachment;
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

      this.service.deleteDocument(file.id)
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

  viewFile(file: FileNetDocument): void {
    if (!file.id) {
      return;
    }
    this.service.downloadDocument(file.id)
      .pipe(
        map(model => this.service.viewDocument(model, file))
      )
      .subscribe();
  }

  reload(): Observable<boolean> {
    this.loaded = false;
    return new Observable((subscriber) => {
      this.loadingStatus.next(true);
      const sub = this.loadedStatus$.subscribe(() => {
        subscriber.next(true);
      });
      return () => {
        sub.unsubscribe();
      }
    })
  }

  hasRequiredAttachments(): boolean {
    return this.attachments.some(attachment => attachment.required && !attachment.id);
  }

  forceReload() {
    this.loaded = false;
    this.loadingStatus.next(true);
  }

  private listenToCaseIdChanges() {
    this._caseId
      .pipe(skip(1))
      .pipe(takeUntil(this.destroy$))
      .pipe(filter<undefined | string, undefined>((value): value is undefined => !value))
      .subscribe(() => {
        this.resetAttachments();
      })
  }

  private resetAttachments() {
    this.attachments = this.defaultAttachments.slice();
  }

  private listenToAddOtherAttachment() {
    this.addOtherAttachments
      .pipe(map(_ => this.createOtherAttachment()))
      .subscribe((attachment) => {
        this.attachments = ([] as FileNetDocument[]).concat([attachment, ...this.attachments])
      })
  }

  private static createOtherLookup(): AdminResult {
    return AdminResult.createInstance({
      arName: 'اخري',
      enName: 'Other',
    })
  }

  private createOtherAttachment(): FileNetDocument {
    const descriptions = {
      en: 'A special type of attachment whose name has not been specified',
      ar: 'نوع خاص من المرفقات لم يتم تحديد مسمي له '
    }
    return new FileNetDocument().clone({
      attachmentTypeInfo: AttachmentsComponent.createOtherLookup(),
      attachmentTypeId: -1,
      description: descriptions[this.lang.map.lang as keyof typeof descriptions]
    })
  }
}
