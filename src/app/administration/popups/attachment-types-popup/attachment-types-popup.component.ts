import {Component, Inject, OnDestroy, OnInit} from '@angular/core';
import {LangService} from '../../../services/lang.service';
import {CustomValidators} from '../../../validators/custom-validators';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {FormManager} from '../../../models/form-manager';
import {OperationTypes} from '../../../enums/operation-types.enum';
import {catchError, exhaustMap, takeUntil} from 'rxjs/operators';
import {extender} from '../../../helpers/extender';
import {of, Subject} from 'rxjs';
import {AttachmentType} from '../../../models/attachment-type';
import {ExceptionHandlerService} from '../../../services/exception-handler.service';
import {DIALOG_DATA_TOKEN} from '../../../shared/tokens/tokens';
import {IDialogData} from '../../../interfaces/i-dialog-data';
import {Lookup} from '../../../models/lookup';
import {LookupService} from '../../../services/lookup.service';
import {ToastService} from '../../../services/toast.service';
import {DialogRef} from '../../../shared/models/dialog-ref';

@Component({
  selector: 'attachment-types-popup',
  templateUrl: './attachment-types-popup.component.html',
  styleUrls: ['./attachment-types-popup.component.scss']
})
export class AttachmentTypesPopupComponent implements OnInit, OnDestroy {
  statuses: Lookup[] = this.lookupService.listByCategory.CommonStatus;
  form!: FormGroup;
  fm!: FormManager;
  operation!: OperationTypes;
  model!: AttachmentType;
  validateFieldsVisible = true;
  saveVisible = true;
  private save$: Subject<any> = new Subject<any>();
  private destroy$: Subject<any> = new Subject<any>();

  constructor(@Inject(DIALOG_DATA_TOKEN) data: IDialogData<AttachmentType>,
              public lang: LangService,
              private fb: FormBuilder,
              private exceptionHandlerService: ExceptionHandlerService,
              private lookupService: LookupService,
              private toast: ToastService,
              private dialogRef: DialogRef) {
    this.operation = data.operation;
    this.model = data.model;
  }

  ngOnInit(): void {
    this.buildForm();
    this._saveModel();
  }

  private buildForm(): void {
    this.form = this.fb.group({
      arName: [this.model.arName, [
        CustomValidators.required, Validators.maxLength(CustomValidators.defaultLengths.ARABIC_NAME_MAX),
        Validators.minLength(CustomValidators.defaultLengths.MIN_LENGTH), CustomValidators.pattern('AR_NUM')
      ]],
      enName: [this.model.enName, [
        CustomValidators.required, Validators.maxLength(CustomValidators.defaultLengths.ENGLISH_NAME_MAX),
        Validators.minLength(CustomValidators.defaultLengths.MIN_LENGTH), CustomValidators.pattern('ENG_NUM')
      ]],
      status: [this.model.status, [CustomValidators.required]]
    });
    this.fm = new FormManager(this.form, this.lang);

    if (this.operation === OperationTypes.UPDATE) {
      this.fm.displayFormValidity();
    }
  }

  get popupTitle(): string {
    return this.operation === OperationTypes.CREATE ? this.lang.map.lbl_add_attachment_type : this.lang.map.lbl_edit_attachment_type;
  };

  saveModel(): void {
    this.save$.next();
  }

  _saveModel(): void {
    this.save$
      .pipe(takeUntil(this.destroy$),
        exhaustMap(() => {
          const attachmentType = extender<AttachmentType>(AttachmentType, {...this.model, ...this.fm.getForm()?.value});
          return attachmentType.save().pipe(
            catchError((err) => {
              this.exceptionHandlerService.handle(err);
              return of(null);
            }));
        }))
      .subscribe((attachmentType: AttachmentType | null) => {
        if (!attachmentType) {
          return;
        }
        const message = this.operation === OperationTypes.CREATE ? this.lang.map.msg_create_x_success : this.lang.map.msg_update_x_success;
        // @ts-ignore
        this.toast.success(message.change({x: attachmentType.getName()}));
        this.model = attachmentType;
        this.operation = OperationTypes.UPDATE;
        this.dialogRef.close(this.model);
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.destroy$.unsubscribe();
  }
}
