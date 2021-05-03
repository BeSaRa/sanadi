import {Component, Inject, OnInit} from '@angular/core';
import {LangService} from '../../../services/lang.service';
import {DIALOG_DATA_TOKEN} from '../../tokens/tokens';
import {FileNetDocument} from '../../../models/file-net-document';
import {DocumentService} from '../../../services/document.service';
import {FormArray, FormBuilder, FormGroup} from '@angular/forms';
import {CustomValidators} from '../../../validators/custom-validators';
import {DialogService} from '../../../services/dialog.service';
import {ToastService} from '../../../services/toast.service';
import {ConfigurationService} from '../../../services/configuration.service';
import {interval, Subject} from 'rxjs';
import {concatMap, map, takeUntil, tap} from 'rxjs/operators';
import {DialogRef} from '../../models/dialog-ref';

@Component({
  selector: 'app-upload-document-popup',
  templateUrl: './upload-document-popup.component.html',
  styleUrls: ['./upload-document-popup.component.scss']
})
export class UploadDocumentPopupComponent implements OnInit {
  caseId: string;
  documents: FileNetDocument[] = [];
  form!: FormGroup;
  service: DocumentService<any>;

  constructor(@Inject(DIALOG_DATA_TOKEN) data: { caseId: string, service: DocumentService<any> },
              public lang: LangService,
              private dialog: DialogService,
              private dialogRef: DialogRef,
              private configurationService: ConfigurationService,
              private toast: ToastService,
              private fb: FormBuilder) {

    this.caseId = data.caseId;
    this.service = data.service;
    console.log(this.service);
  }

  ngOnInit(): void {
    this.buildForm();
  }

  private buildFormRow(): FormGroup {
    return this.fb.group({
      documentTitle: [null, [CustomValidators.required]],
      files: [null, [CustomValidators.required]],
      isPublished: [false]
    }, {validators: CustomValidators.attachment});
  }

  private buildForm(): void {
    this.form = this.fb.group({
      documents: this.fb.array([this.buildFormRow()]),
    });
  }

  get formArray(): FormArray {
    return this.form.get('documents') as FormArray;
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
          .change({files: this.configurationService.CONFIG.ALLOWED_FILE_TYPES_TO_UPLOAD.join(',')})
      );
    }

  }

  uploadFiles(): void {
    if (!this.isValidFormUploader()) {
      this.dialog.error(this.lang.map.msg_all_required_fields_are_filled);
      return;
    }
    this.prepareDocuments();
    this.saveUploadedDocuments();
  }

  isValidFormUploader(): boolean {
    return !!(this.formArray.length && this.formArray.valid);
  }

  private saveUploadedDocuments(): void {
    const valueDone: Subject<any> = new Subject();
    interval(500)
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
          this.dialogRef.close();
        }
      });
  }

  private prepareDocuments(): void {
    this.documents = this.formArray.controls.map(ctrl => {
      return (new FileNetDocument()).clone({
        documentTitle: ctrl.get('documentTitle')?.value!,
        isPublished: ctrl.get('isPublished')?.value!,
        files: ctrl.get('files')?.value!
      });
    });
  }
}
