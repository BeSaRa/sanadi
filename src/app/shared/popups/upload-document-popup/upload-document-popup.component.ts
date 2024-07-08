import {Component, Inject, OnInit} from '@angular/core';
import {LangService} from '@app/services/lang.service';
import {DIALOG_DATA_TOKEN} from '../../tokens/tokens';
import {FileNetDocument} from '@app/models/file-net-document';
import {DocumentService} from '@app/services/document.service';
import {UntypedFormArray, UntypedFormBuilder, UntypedFormGroup} from '@angular/forms';
import {CustomValidators} from '@app/validators/custom-validators';
import {DialogService} from '@app/services/dialog.service';
import {ToastService} from '@app/services/toast.service';
import {interval, Subject} from 'rxjs';
import {concatMap, map, takeUntil, tap} from 'rxjs/operators';
import {DialogRef} from '../../models/dialog-ref';
import {EmployeeService} from '@app/services/employee.service';
import {HttpClient} from '@angular/common/http';
import {UrlService} from '@app/services/url.service';
import {AdminResult} from '@app/models/admin-result';
import {IDefaultResponse} from '@app/interfaces/idefault-response';
import {FileExtensionsEnum} from '@app/enums/file-extension-mime-types-icons.enum';

@Component({
  selector: 'app-upload-document-popup',
  templateUrl: './upload-document-popup.component.html',
  styleUrls: ['./upload-document-popup.component.scss']
})
export class UploadDocumentPopupComponent implements OnInit {
  caseId: string;
  documents: FileNetDocument[] = [];
  form!: UntypedFormGroup;
  service: DocumentService;
  attachmentTypes: AdminResult[] = [];
  customValidators = CustomValidators;
  allowedExtensions = [FileExtensionsEnum.PDF];

  constructor(@Inject(DIALOG_DATA_TOKEN) data: { caseId: string, service: DocumentService },
              public lang: LangService,
              private dialog: DialogService,
              private dialogRef: DialogRef,
              private employeeService: EmployeeService,
              private toast: ToastService,
              private fb: UntypedFormBuilder,
              // we will remove httpClient after finish the admin part of the attachments types
              private http: HttpClient,
              private urlService: UrlService) {

    this.caseId = data.caseId;
    this.service = data.service;
  }

  ngOnInit(): void {
    this.buildForm();
    this.loadAttachmentType();
  }

  private buildFormRow(): UntypedFormGroup {
    return this.fb.group({
      description: [null],
      documentTitle: [null, [CustomValidators.required, CustomValidators.maxLength(100)]],
      attachmentTypeId: [null, [CustomValidators.required]],
      files: [null, [CustomValidators.required]],
      isPublished: this.fb.control({
        value: this.employeeService.isExternalUser(),
        disabled: this.employeeService.isExternalUser()
      })
    }, {validators: CustomValidators.attachment});
  }

  private buildForm(): void {
    this.form = this.fb.group({
      documents: this.fb.array([this.buildFormRow()]),
    });
  }

  get formArray(): UntypedFormArray {
    return this.form.get('documents') as UntypedFormArray;
  }

  addFormRow(): void {
    this.formArray.push(this.buildFormRow());
  }

  removeControl(index: number) {
    this.formArray.removeAt(index);
  }

  fileChange($event: Event, i: number) {
    const input = $event.target as HTMLInputElement;
    const file = input?.files?.item(0);
    const formGroup = this.formArray.get([i]);
    const title = formGroup?.get('documentTitle');
    const validFile = file ? (file.type === 'application/pdf') : true;
    !validFile ? input.value = '' : null;
    formGroup?.patchValue({
      documentTitle: title?.value ? title.value : (file && validFile ? file.name : null),
      files: input?.files?.length && validFile ? input.files : null
    });

    if (!validFile) {
      this.dialog.error(
        this.lang.map
          .msg_only_those_files_allowed_to_upload
          .change({files: this.allowedExtensions.join(',')})
      );
    }

  }

  uploadFiles(): void {
    if (!this.isValidFormUploader()) {
      this.dialog.error(this.lang.map.msg_all_required_fields_are_filled);
      return;
    }
    this.prepareDocuments();
    if (!this.caseId) {
      this.toast.success(this.lang.map.files_have_been_uploaded_successfully);
      this.dialogRef.close(this.documents);
      return;
    }
    this.saveUploadedDocuments();
  }

  isValidFormUploader(): boolean {
    return !!(this.formArray.length && this.formArray.valid);
  }

  private saveUploadedDocuments(): void {
    const valueDone: Subject<void> = new Subject();
    interval()
      .pipe(
        tap(index => {
          if (!this.documents[index]) {
            valueDone.next();
            valueDone.complete();
          }
        }),
        takeUntil(valueDone),
        map(index => this.documents[index]),
        concatMap((doc: FileNetDocument) => {
          return this.service.addSingleDocument(this.caseId, doc);
        })
      )
      .subscribe({
        complete: () => {
          this.toast.success(this.lang.map.files_have_been_uploaded_successfully);
          this.dialogRef.close(this.documents);
        }
      });
  }

  private prepareDocuments(): void {
    this.documents = this.formArray.controls.map(ctrl => {
      return (new FileNetDocument()).clone({
        documentTitle: ctrl.get('documentTitle')?.value!,
        isPublished: ctrl.get('isPublished')?.value!,
        files: ctrl.get('files')?.value!,
        mimeType: ctrl.get('files')?.value[0].type,
        attachmentTypeId: ctrl.get('attachmentTypeId')?.value!,
        description: ctrl.get('description')?.value || undefined,
      });
    });
  }


  closeDialog() {
    this.dialogRef.close(this.documents);
  }

  checkUploadForm() {
    this.form.markAllAsTouched();
    this.form.markAsDirty();
    this.form.updateValueAndValidity({
      emitEvent: true
    });
  }

  // tamp implementations for load attachment type till we finish the attachment type part from admin
  private loadAttachmentType() {
    this.http.get<IDefaultResponse<AdminResult[]>>(this.urlService.URLS.BASE_URL + '/admin/attachment-type')
      .pipe(
        map(response => response.rs.map(item => AdminResult.createInstance(item)))
      ) // map to admin result for now
      .subscribe((list: AdminResult[]) => {
        this.attachmentTypes = list;
      });
  }
}
