import {Component, ElementRef, Inject, ViewChild} from '@angular/core';
import {LangService} from '@app/services/lang.service';
import {FormBuilder, FormGroup} from '@angular/forms';
import {FormManager} from '@app/models/form-manager';
import {OperationTypes} from '@app/enums/operation-types.enum';
import {Certificate} from '@app/models/certificate';
import {isObservable, Observable, of, Subject} from 'rxjs';
import {DIALOG_DATA_TOKEN} from '@app/shared/tokens/tokens';
import {IDialogData} from '@app/interfaces/i-dialog-data';
import {ExceptionHandlerService} from '@app/services/exception-handler.service';
import {LookupService} from '@app/services/lookup.service';
import {ToastService} from '@app/services/toast.service';
import {DialogRef} from '@app/shared/models/dialog-ref';
import {DialogService} from '@app/services/dialog.service';
import {AdminGenericDialog} from '@app/generics/admin-generic-dialog';
import {catchError, exhaustMap, filter, switchMap, takeUntil} from 'rxjs/operators';

@Component({
  selector: 'certificates-popup',
  templateUrl: './certificate-popup.component.html',
  styleUrls: ['./certificate-popup.component.scss']
})
export class CertificatePopupComponent extends AdminGenericDialog<Certificate> {
  form!: FormGroup;
  fm!: FormManager;
  operation!: OperationTypes;
  model!: Certificate;
  validateFieldsVisible = true;
  saveVisible = true;
  templateExtensions: string[] = ['.doc', '.docx'];
  templateFile: any;
  viewTemplate$: Subject<void> = new Subject<void>();
  saveTemplate$: Subject<any> = new Subject<any>();
  @ViewChild('templateUploader') templateUploader!: ElementRef;

  constructor(@Inject(DIALOG_DATA_TOKEN) data: IDialogData<Certificate>,
              public lang: LangService,
              public fb: FormBuilder,
              public exceptionHandlerService: ExceptionHandlerService,
              public lookupService: LookupService,
              public toast: ToastService,
              public dialogRef: DialogRef,
              public dialogService: DialogService) {
    super();
    this.operation = data.operation;
    this.model = data.model;
  }

  ngOnInit(): void {
    this.buildForm();
    this.listenToSave();
    this.initPopup();
  }

  get popupTitle() {
    return 'Any';
  }

  initPopup(): void {
    this.listenToViewTemplate();
  }

  buildForm(): void {
    this.form = this.fb.group(this.model.buildForm(true));
    this.fm = new FormManager(this.form, this.lang);
  }

  beforeSave(model: Certificate, form: FormGroup): Observable<boolean> | boolean {
    return form.valid;
  }

  prepareModel(model: Certificate, form: FormGroup): Observable<Certificate> | Certificate {
    let certificate =  (new Certificate()).clone({...model, ...form.value});
    certificate.file = this.templateFile;
    return certificate;
  }

  afterSave(model: Certificate, dialogRef: DialogRef): void {
    const message = this.operation === OperationTypes.CREATE ? this.lang.map.msg_create_x_success : this.lang.map.msg_update_x_success;
    // @ts-ignore
    this.toast.success(message.change({x: this.form.get('documentTitle').value}));
    this.model = model;
    this.operation = OperationTypes.UPDATE;

    this.dialogRef.close(this.model);
  }

  listenToSave() {
    this.saveTemplate$
      // call before Save callback
      .pipe(switchMap(() => {
        const result = this.beforeSave(this.model, this.form);
        return isObservable(result) ? result : of(result)
      }))
      // filter the return value from saveBeforeCallback and allow only the true
      .pipe(filter(value => value))
      .pipe(switchMap(_ => {
        const result = this.prepareModel(this.model, this.form);
        return isObservable(result) ? result : of(result);
      }))
      .pipe(exhaustMap((model: Certificate) => {
        return model.createTemplate().pipe(catchError(error => {
          this.saveFail(error);
          return of({
            error: error,
            model
          })
        }))
      }))
      .pipe(filter((value) => !value.hasOwnProperty('error')))
      .subscribe((model: Certificate | any) => {
        this.afterSave(model, this.dialogRef);
      })
  }

  openFileBrowser($event: MouseEvent): void {
    $event?.stopPropagation();
    $event?.preventDefault();
    this.templateUploader?.nativeElement.click();
  }

  onTemplateSelected($event: Event): void {
    let files = ($event.target as HTMLInputElement).files;
    if (files && files[0]) {
      const extension = files[0].name.getExtension().toLowerCase();
      if (this.templateExtensions.indexOf(extension) === -1) {
        this.dialogService.error(this.lang.map.msg_invalid_format_allowed_formats.change({formats: this.templateExtensions.join(', ')}));
        this._clearTemplateUploader();
        return;
      }

      let reader = new FileReader();
      reader.readAsDataURL(files[0]);

      reader.onload = () => {
        // @ts-ignore
        this.templateFile = files[0];
      };
    }
  }

  private _clearTemplateUploader(): void {
    this.templateFile = null;
    this.templateUploader.nativeElement.value = "";
  }

  listenToViewTemplate() {
    this.viewTemplate$.pipe(
      takeUntil(this.destroy$),
      switchMap(() => {
        return this.model.viewTemplate();
      })
    ).subscribe();
  }

  saveFail(error: Error): void {
  }

  destroyPopup(): void {
  }
}
