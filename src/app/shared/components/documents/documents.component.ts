import {Component, ElementRef, EventEmitter, Input, OnDestroy, OnInit, Output, Renderer2, ViewChild} from '@angular/core';
import {FileNetDocument} from '../../../models/file-net-document';
import {Lookup} from '../../../models/lookup';
import {DialogService} from '../../../services/dialog.service';
import {ToastService} from '../../../services/toast.service';
import {LookupService} from '../../../services/lookup.service';
import {DocumentService} from '../../../services/document.service';
import {map, takeUntil} from 'rxjs/operators';
import {Subject} from 'rxjs';
import {LangService} from '../../../services/lang.service';
import {UserClickOn} from '../../../enums/user-click-on.enum';
import {UploadDocumentPopupComponent} from '../../popups/upload-document-popup/upload-document-popup.component';

@Component({
  selector: 'app-documents',
  templateUrl: './documents.component.html',
  styleUrls: ['./documents.component.scss']
})
export class DocumentsComponent implements OnInit, OnDestroy {
  @Input() caseId: string = '{93A0A4F9-3649-C709-857B-78F3A1A00000}';
  @Output() afterUpload: EventEmitter<any> = new EventEmitter<any>();
  @Input() documents: FileNetDocument[] = [];
  @Input() service!: DocumentService<any>;
  documentTypes: Lookup[] = [];
  selectedDocuments: Map<string, FileNetDocument> = new Map<string, FileNetDocument>();
  // {93A0A4F9-3649-C709-857B-78F3A1A00000}
  private destroy$: Subject<any> = new Subject();

  @ViewChild('selectAllToggle') selectAllToggle!: ElementRef<HTMLInputElement>;

  constructor(private dialog: DialogService,
              private renderer: Renderer2,
              private lookupService: LookupService,
              public lang: LangService,
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
      this.service
        .deleteDocument(file.id)
        .pipe(takeUntil(this.destroy$))
        .subscribe(_ => {
          this.toast.success(this.lang.map.msg_delete_x_success.change({x: file.documentTitle}));
          this.selectedDocuments.delete(file.id);
          this.checkAndSetIndeterminate();
          this.loadDocuments();
        });
    });
  }

  private loadDocuments() {
    this.service.loadDocuments(this.caseId)
      .pipe(takeUntil(this.destroy$))
      .subscribe(documents => {
        this.documents = documents;
      });
  }


  private checkAndSetIndeterminate() {
    if (this.selectedDocuments.size && this.selectedDocuments.size !== this.documents.length) {
      this.renderer.setProperty(this.selectAllToggle.nativeElement, 'indeterminate', true);
    } else {
      this.renderer.setProperty(this.selectAllToggle.nativeElement, 'indeterminate', false);
    }
  }

  viewDocument(document: FileNetDocument, $event: Event): void {
    $event.preventDefault();
    this.service.downloadDocument(document.id)
      .pipe(
        map(model => this.service.viewDocument(model, document))
      )
      .subscribe();
  }

  toggleSelectedDocument($event: MouseEvent): void {
    const target = $event.target as HTMLInputElement;
    if (target.checked) {
      this.selectedDocuments.set(target.id, this.documents.find(item => item.id === target.id)!);
    } else {
      this.selectedDocuments.delete(target.id);
    }
    this.checkAndSetIndeterminate();
  }

  allSelected(): boolean {
    return !!(this.documents.length && (this.documents.length === this.selectedDocuments.size));
  }

  toggleSelectAll($event: MouseEvent): void {
    const target = $event.target as HTMLInputElement;
    if (target.checked) {
      this.documents.forEach(item => this.selectedDocuments.set(item.id, item));
    } else {
      this.documents.forEach(item => this.selectedDocuments.delete(item.id));
    }
  }

  deleteSelectedFiles() {
    if (!this.selectedDocuments.size) {
      return;
    }
    this.dialog
      .confirm(this.lang.map.msg_confirm_delete_selected)
      .onAfterClose$
      .subscribe((clicked: UserClickOn) => {
        if (clicked === UserClickOn.YES) {
          this.service.deleteBulkDocument(Array.from(this.selectedDocuments.keys()))
            .subscribe(_ => {
              this.toast.success(this.lang.map.msg_delete_success);
              this.selectedDocuments.forEach((item, key) => this.selectedDocuments.delete(key));
              this.loadDocuments();
            });
        }
      });
  }

  openUploadDialog(): void {
    this.dialog.show(UploadDocumentPopupComponent, {
      caseId: this.caseId,
      service: this.service
    }).onAfterClose$.subscribe((list: FileNetDocument[]) => {
      console.log(list);
      if (list.length) {
        this.loadDocuments();
      }
    });
  }
}
