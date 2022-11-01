import {Component, Input, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {BehaviorSubject, Observable, of, Subject} from 'rxjs';
import {filter, map, skip, switchMap, takeUntil, tap} from 'rxjs/operators';
import {FileNetDocument} from '@app/models/file-net-document';
import {LangService} from '@app/services/lang.service';
import {UntypedFormControl} from '@angular/forms';
import {AttachmentTypeService} from '@app/services/attachment-type.service';
import {DocumentService} from '@app/services/document.service';
import {DialogService} from '@app/services/dialog.service';
import {UserClickOn} from '@app/enums/user-click-on.enum';
import {ToastService} from '@app/services/toast.service';
import {TableComponent} from '@app/shared/components/table/table.component';
import {AttachmentTypeServiceData} from '@app/models/attachment-type-service-data';
import {FileExtensionsEnum, FileIconsEnum} from '@app/enums/file-extension-mime-types-icons.enum';
import {AdminResult} from '@app/models/admin-result';
import {GridName, ItemId} from '@app/types/types';
import {EmployeeService} from '@services/employee.service';
import {ExternalUser} from '@app/models/external-user';
import {InternalUser} from '@app/models/internal-user';

// noinspection AngularMissingOrInvalidDeclarationInModule
@Component({
  selector: 'attachments',
  templateUrl: './attachments.component.html',
  styleUrls: ['./attachments.component.scss']
})
export class AttachmentsComponent implements OnInit, OnDestroy {
  // public attachment types
  attachmentTypes: AttachmentTypeServiceData[] = [];
  multiAttachmentTypes: Map<GridName, AttachmentTypeServiceData[]> = new Map<GridName, AttachmentTypeServiceData[]>();

  attachments: FileNetDocument[] = [];

  multiAttachments: Map<GridName, Map<ItemId, FileNetDocument[]>> = new Map<GridName, Map<ItemId, FileNetDocument[]>>();

  fileIconsEnum = FileIconsEnum;
  defaultAttachments: FileNetDocument[] = [];

  private loadingStatus: BehaviorSubject<any> = new BehaviorSubject(false);
  // only the true value will emit
  private reload$ = this.loadingStatus.asObservable().pipe(filter(v => !!v));

  loadedStatus$: BehaviorSubject<boolean | null> = new BehaviorSubject<boolean | null>(null);
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

  @Input() model!: any;
  @Input()
  disabled: boolean = false;
  @Input()
  caseType?: number;
  @Input()
  service!: DocumentService;
  @ViewChild(TableComponent)
  table!: TableComponent;

  selectedFile?: FileNetDocument;

  loadedAttachments: Record<number, FileNetDocument> = {};
  allowedExtensions: string[] = [FileExtensionsEnum.PDF];

  private selectedIndex!: number;

  @Input()
  set load(load: boolean) {
    this.loadingStatus.next(load);
  }

  destroy$: Subject<any> = new Subject<any>();
  displayedColumns: string[] = [/*'rowSelection',*/ 'title', 'type', 'description', 'mandatory', 'isPublished', 'date', 'actions'];

  filter: UntypedFormControl = new UntypedFormControl();

  addOtherAttachments: Subject<null> = new Subject<null>();

  allAttachmentTypesByCase: AttachmentTypeServiceData[] = [];

  constructor(public lang: LangService,
              private dialog: DialogService,
              private toast: ToastService,
              private employeeService: EmployeeService,
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
        tap((types: AttachmentTypeServiceData[]) => {
          this.allAttachmentTypesByCase = types;
          this.multiAttachmentTypes.clear();
          this.attachmentTypes = types.filter(item => {
            if (item.multi) {
              !this.multiAttachmentTypes.has(item.identifier) ?
                this.multiAttachmentTypes.set(item.identifier, [item]) :
                (this.multiAttachmentTypes.set(item.identifier, this.multiAttachmentTypes.get(item.identifier)!.concat([item])));
            }
            return !item.multi;
          });
        }),
        map<AttachmentTypeServiceData[], FileNetDocument[]>(() => this.attachmentTypes.map(type => type.convertToAttachment())),
        tap((attachments) => this.defaultAttachments = attachments.slice()),
        switchMap((types) => this.loadDocumentsByCaseId(types)),
        takeUntil(this.destroy$)
      )
      .subscribe((attachments) => {
        this.attachments = attachments;
        this.loadedStatus$.next(true);
      });
  }

  private mergeAttachments(attachments: FileNetDocument[] = [], types: FileNetDocument[]): FileNetDocument[] {
    this.multiAttachments.clear();
    const typeIds = types.map(type => type.attachmentTypeInfo.id!);
    const attachmentTypeIds = attachments.map(attachment => attachment.attachmentTypeInfo.id!);
    this.loadedAttachments = types.reduce((acc, file) => {
      return {...acc, [file.attachmentTypeInfo.id!]: file};
    }, {} as Record<number, FileNetDocument>);

    const differenceIds = typeIds.filter((id) => !attachmentTypeIds.includes(id));

    attachments = attachments.map(attachment => {
      if (attachment.attachmentTypeId === -1) {
        attachment.attachmentTypeInfo = this.createOtherLookup();
        attachment.attachmentTypeStatus = true;
      } else {
        const type = this.allAttachmentTypesByCase.find(x => x.attachmentTypeId === attachment.attachmentTypeId);
        attachment.attachmentTypeStatus = type ? type.attachmentTypeInfo.isActive() : false;
        attachment.required = type ? type.isRequired : false;
      }
      return attachment;
    }).filter((attachment) => {
      if (attachment.itemId && attachment.gridName) {
        if (this.multiAttachments.has(attachment.gridName)) {
          const grid = this.multiAttachments.get(attachment.gridName)!;
          if (!grid.has(attachment.itemId)) {
            grid.set(attachment.itemId, []);
          }
          const itemInGrid = grid.get(attachment.itemId)!;
          itemInGrid.push(attachment);
        } else {
          this.multiAttachments.set(attachment.gridName, new Map<ItemId, FileNetDocument[]>());
          const grid = this.multiAttachments.get(attachment.gridName)!;
          grid.set(attachment.itemId, [attachment]);
        }
      }
      return !attachment.itemId;
    });

    return attachments.concat(differenceIds.map(id => this.loadedAttachments[id]));
  }

  uploadAttachment(row: FileNetDocument, uploader: HTMLInputElement): void {
    if (this.isDisabledActionButtons(row, 'upload')) {
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
          .change({files: this.allowedExtensions.join(',')})
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
              files: input.files!,
              isPublished: this.employeeService.isExternalUser() ? true : this.selectedFile?.isPublished
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

      this.service.deleteDocument(file.id)
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

  viewFile(file: FileNetDocument): void {
    if (this.isDisabledActionButtons(file, 'view')) {
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
      };
    });
  }

  hasRequiredAttachments(): boolean {
    return this.attachments.some(attachment => attachment.required && !attachment.id);
  }

  hasMissingRequiredAttachments(): boolean {
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
      });
  }

  private resetAttachments() {
    this.attachments = this.defaultAttachments.slice();
  }

  private listenToAddOtherAttachment() {
    this.addOtherAttachments
      .pipe(map(_ => this.createOtherAttachment()))
      .subscribe((attachment) => {
        this.attachments = ([] as FileNetDocument[]).concat([attachment, ...this.attachments]);
      });
  }

  private createOtherLookup(): AdminResult {
    return AdminResult.createInstance({
      arName: this.lang.getArabicLocalByKey('attachment_other'),
      enName: this.lang.getEnglishLocalByKey('attachment_other'),
    });
  }

  private createOtherAttachment(): FileNetDocument {
    return new FileNetDocument().clone({
      attachmentTypeInfo: this.createOtherLookup(),
      attachmentTypeId: -1,
      description: this.lang.map.attachment_other_desc,
      attachmentTypeStatus: true
    });
  }

  canChangePublished(attachment: FileNetDocument): boolean {
    if (!attachment.attachmentTypeStatus || this.employeeService.isExternalUser()) {
      return false;
    }
    return !attachment.id;
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
      if (this.model && (this.model.isFinalApproved() || this.model.isFinalNotification())) {
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
}
