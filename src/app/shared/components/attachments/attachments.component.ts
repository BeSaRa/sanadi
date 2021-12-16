import {Component, Input, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {BehaviorSubject, Observable, of, Subject} from "rxjs";
import {filter, map, switchMap, takeUntil, tap} from "rxjs/operators";
import {FileNetDocument} from "@app/models/file-net-document";
import {LangService} from "@app/services/lang.service";
import {FormControl} from "@angular/forms";
import {AttachmentTypeService} from "@app/services/attachment-type.service";
import {DocumentService} from "@app/services/document.service";
import {DialogService} from "@app/services/dialog.service";
import {ConfigurationService} from "@app/services/configuration.service";
import {UserClickOn} from "@app/enums/user-click-on.enum";
import {ToastService} from "@app/services/toast.service";
import {TableComponent} from "@app/shared/components/table/table.component";
import {AttachmentTypeServiceData} from "@app/models/attachment-type-service-data";
import {FileIconsEnum} from '@app/enums/file-extension-mime-types-icons.enum';

@Component({
  selector: 'attachments',
  templateUrl: './attachments.component.html',
  styleUrls: ['./attachments.component.scss']
})
export class AttachmentsComponent implements OnInit, OnDestroy {
  attachmentTypes: AttachmentTypeServiceData[] = [];
  attachments: FileNetDocument[] = [];
  fileIconsEnum = FileIconsEnum;

  private loadingStatus: BehaviorSubject<any> = new BehaviorSubject(false);
  // only the true value will emit
  private reload$ = this.loadingStatus.asObservable().pipe(filter(v => !!v));
  private loadedStatus$: Subject<any> = new Subject<any>();
  // loaded status to check before load the stuff again
  private loaded: boolean = false;
  @Input()
  forceLoadEveryTime: boolean = false;
  @Input()
  caseId?: string
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
  displayedColumns: string[] = [/*'select',*/ 'title', 'type', 'description', 'mandatory', 'date', 'actions'];

  filter: FormControl = new FormControl();

  constructor(public lang: LangService,
              private dialog: DialogService,
              private toast: ToastService,
              private configurationService: ConfigurationService,
              private attachmentTypeService: AttachmentTypeService) {

  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.destroy$.unsubscribe();
  }

  ngOnInit(): void {
    this.listenToReload();
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
        switchMap(_ => this.caseType ? this.attachmentTypeService.loadTypesByCaseType(this.caseType)
          .pipe(tap(types => this.attachmentTypes = types)) : of([])),
        map<AttachmentTypeServiceData[], FileNetDocument[]>(attachmentTypes => attachmentTypes.map(type => type.convertToAttachment())),
        switchMap((types) => this.loadDocumentsByCaseId(types)),
        takeUntil(this.destroy$)
      )
      .subscribe((attachments) => {
        this.attachments = attachments;
        this.loadedStatus$.next(true);
      })
  }

  private mergeAttachments(attachments: FileNetDocument[], types: FileNetDocument[]): FileNetDocument[] {

    this.loadedAttachments = attachments.reduce((record, attachment) => {
      return {...record, [attachment.attachmentTypeId]: attachment};
    }, {} as Record<number, FileNetDocument>);
    return types.map(attachment => {
      attachment.id = this.loadedAttachments[attachment.attachmentTypeId]?.id;
      attachment.createdOn = this.loadedAttachments[attachment.attachmentTypeId]?.createdOn;
      return attachment;
    });
  }

  uploadAttachment(row: FileNetDocument, uploader: HTMLInputElement): void {
    if (this.disabled) {
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
          .change({files: this.configurationService.CONFIG.ALLOWED_FILE_TYPES_TO_UPLOAD.join(',')})
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
        this.attachments.splice(this.selectedIndex, 1, attachment.clone({attachmentTypeInfo: this.selectedFile?.attachmentTypeInfo}));
        this.attachments = this.attachments.slice();
      })
  }

  deleteFile(file: FileNetDocument): void {
    if (!file.id) {
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
}
