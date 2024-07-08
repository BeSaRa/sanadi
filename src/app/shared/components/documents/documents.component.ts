import {Component, ElementRef, Input, OnDestroy, OnInit, Renderer2, ViewChild} from '@angular/core';
import {FileNetDocument} from '@app/models/file-net-document';
import {DialogService} from '@app/services/dialog.service';
import {ToastService} from '@app/services/toast.service';
import {LookupService} from '@app/services/lookup.service';
import {DocumentService} from '@app/services/document.service';
import {concatMap, map, takeUntil, tap} from 'rxjs/operators';
import {interval, Subject} from 'rxjs';
import {LangService} from '@app/services/lang.service';
import {UserClickOn} from '@app/enums/user-click-on.enum';
import {UploadDocumentPopupComponent} from '../../popups/upload-document-popup/upload-document-popup.component';
import {BlobModel} from '@app/models/blob-model';
import {DomSanitizer} from '@angular/platform-browser';

// noinspection AngularMissingOrInvalidDeclarationInModule
@Component({
  selector: 'app-documents',
  templateUrl: './documents.component.html',
  styleUrls: ['./documents.component.scss']
})
export class DocumentsComponent implements OnInit, OnDestroy {
  _caseId: string = '';
  @Input()
  set caseId(value: string | undefined) {
    this._caseId = value ? value : '';
    if (value) {
      this.uploadFileSilently();
    } else {
      this.documents = [];
    }
  };

  get caseId(): string | undefined {
    return this._caseId;
  }

  @Input() documents: FileNetDocument[] = [];
  @Input() readonly: boolean = false;
  @Input() service!: DocumentService;
  selectedDocuments: FileNetDocument[] = [];
  private destroy$: Subject<void> = new Subject();

  @ViewChild('selectAllToggle') selectAllToggle!: ElementRef<HTMLInputElement>;

  constructor(private dialog: DialogService,
              private renderer: Renderer2,
              private lookupService: LookupService,
              public lang: LangService,
              private sanitizer: DomSanitizer,
              private toast: ToastService) {

  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.destroy$.unsubscribe();
  }

  ngOnInit(): void {
    if (!this.service) {
      throw Error('Please provide the document service');
    }
    if (this.caseId) {
      this.loadDocuments();
    }
  }

  deleteFile(file: FileNetDocument): void {
    this.dialog
      .confirm(this.lang.map.msg_confirm_delete_x.change({x: file.documentTitle}))
      .onAfterClose$.subscribe((userClick: UserClickOn) => {
      if (userClick !== UserClickOn.YES) {
        return;
      }
      file.id ? this._deleteFileByApi(file) : this._deleteFileByClient(file);
    });
  }

  private _deleteFileByClient(file: FileNetDocument): void {
    this.documents.splice(this.documents.indexOf(file), 1);
    this.toast.success(this.lang.map.msg_delete_x_success.change({x: file.documentTitle}));
    this.removeFileFromSelected(file);
    this.checkAndSetIndeterminate();
  }

  private _deleteFileByApi(file: FileNetDocument): void {
    this.service
      .deleteDocument(file.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe(_ => {
        this.toast.success(this.lang.map.msg_delete_x_success.change({x: file.documentTitle}));
        this.removeFileFromSelected(file);
        this.checkAndSetIndeterminate();
        this.loadDocuments();
      });
  }

  private removeFileFromSelected(file: FileNetDocument): void {
    this.selectedDocuments.splice(this.selectedDocuments.indexOf(file), 1);
  }

  loadDocuments(): void {
    if (!this.caseId) {
      return;
    }
    this.service.loadDocuments(this.caseId)
      .pipe(takeUntil(this.destroy$))
      .subscribe(documents => {
        this.documents = documents;
      });
  }


  private checkAndSetIndeterminate() {
    if (this.selectedDocuments.length && this.selectedDocuments.length !== this.documents.length) {
      this.renderer.setProperty(this.selectAllToggle.nativeElement, 'indeterminate', true);
    } else {
      this.renderer.setProperty(this.selectAllToggle.nativeElement, 'indeterminate', false);
    }
  }

  viewDocument(document: FileNetDocument, $event: Event): void {
    $event.preventDefault();
    document.files ? this._viewDocumentByClient(document) : this._viewDocumentByAPI(document);
  }


  private _viewDocumentByClient(document: FileNetDocument) {
    const blobModel = new BlobModel(document.files?.item(0) as Blob, this.sanitizer);
    this.service.viewDocument(blobModel, document);
  }

  private _viewDocumentByAPI(document: FileNetDocument) {
    this.service.downloadDocument(document.id)
      .pipe(
        map(model => this.service.viewDocument(model, document))
      )
      .subscribe();
  }

  toggleSelectedDocument($event: MouseEvent, file: FileNetDocument): void {
    const target = $event.target as HTMLInputElement;
    if (target.checked) {
      this.selectedDocuments.push(file);
    } else {
      this.removeFileFromSelected(file);
    }
    this.checkAndSetIndeterminate();
  }

  allSelected(): boolean {
    return (!!this.documents.length && (this.documents.length === this.selectedDocuments.length));
  }

  toggleSelectAll($event: MouseEvent): void {
    const target = $event.target as HTMLInputElement;
    if (target.checked) {
      this.documents.forEach(item => this.selectedDocuments.push(item));
    } else {
      this.documents.forEach(item => this.removeFileFromSelected(item));
    }
  }

  deleteSelectedFiles() {
    if (!this.selectedDocuments.length) {
      return;
    }
    this.dialog
      .confirm(this.lang.map.msg_confirm_delete_selected)
      .onAfterClose$
      .subscribe((clicked: UserClickOn) => {
        if (clicked === UserClickOn.YES) {
          this.caseId ? this._deleteSelectedFilesByApi() : this._deleteSelectedFilesByClient();
        }
      });
  }

  private _deleteSelectedFilesByClient(): void {
    this.documents = this.documents.filter(item => {
      return this.selectedDocuments.indexOf(item) === -1;
    });
    this.toast.success(this.lang.map.msg_delete_success);
    this.emptySelectedDocuments();
  }

  private _deleteSelectedFilesByApi(): void {
    this.service.deleteBulkDocument(this.selectedDocuments.map(item => item.id))
      .subscribe(_ => {
        this.toast.success(this.lang.map.msg_delete_success);
        this.emptySelectedDocuments();
        this.loadDocuments();
      });
  }

  private emptySelectedDocuments(): void {
    this.selectedDocuments = [];
  }

  openUploadDialog(): void {
    if (!this.caseId) {
      this.dialog.info(this.lang.map.this_action_cannot_be_performed_before_saving_the_request);
      return;
    }

    this.dialog.show(UploadDocumentPopupComponent, {
      caseId: this.caseId,
      service: this.service
    }).onAfterClose$.subscribe((list: FileNetDocument[]) => {
      if (list.length && !this.caseId) {
        this.documents = this.documents.concat(list);
      }
      this.loadDocuments();
    });
  }

  isDocumentSelected(doc: FileNetDocument) {
    return this.selectedDocuments.indexOf(doc) !== -1;
  }

  private uploadFileSilently(): void {
    const files = this.documents.filter(item => !item.id);
    if (!files.length || !this.caseId) {
      return;
    }
    const valueDone: Subject<void> = new Subject();

    interval()
      .pipe(
        tap(index => {
          if (!files[index]) {
            valueDone.next();
            valueDone.complete();
          }
        }),
        takeUntil(valueDone),
        map(index => files[index]),
        concatMap((doc: FileNetDocument) => {
          return this.service.addSingleDocument(this._caseId, doc);
        })
      )
      .subscribe({
        complete: () => {
          this.loadDocuments();
        }
      });
  }


}
