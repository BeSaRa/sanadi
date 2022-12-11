import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { LangService } from '@app/services/lang.service';
import { DIALOG_DATA_TOKEN } from '../../tokens/tokens';
import { Localization } from '@app/models/localization';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { FormManager } from '@app/models/form-manager';
import { FactoryService } from '@app/services/factory.service';
import { ToastService } from '@app/services/toast.service';
import { OperationTypes } from '@app/enums/operation-types.enum';
import { IDialogData } from '@app/interfaces/i-dialog-data';
import { CustomValidators } from '@app/validators/custom-validators';
import { of, Subject } from 'rxjs';
import { catchError, exhaustMap, takeUntil } from 'rxjs/operators';
import { DialogRef } from '../../models/dialog-ref';

@Component({
  selector: 'app-localization-popup',
  templateUrl: './localization-popup.component.html',
  styleUrls: ['./localization-popup.component.scss']
})
export class LocalizationPopupComponent implements OnInit, OnDestroy {
  private save$: Subject<any> = new Subject<any>();
  private destroy$: Subject<any> = new Subject<any>();
  form!: UntypedFormGroup;
  model: Localization;
  operation: OperationTypes;
  fm!: FormManager;
  langService!: LangService;

  constructor(@Inject(DIALOG_DATA_TOKEN) data: IDialogData<Localization>,
              private toast: ToastService,
              private dialogRef: DialogRef,
              private fb: UntypedFormBuilder) {
    this.model = data.model;
    this.operation = data.operation;
  }

  ngOnInit(): void {
    this.buildForm();
    this._saveModel();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.destroy$.unsubscribe();
  }

  buildForm(): void {
    this.langService = FactoryService.getService('LangService');
    this.form = this.fb.group({
      localizationKey: [{
        value: this.model.localizationKey,
        // disabled: (this.operation === OperationTypes.UPDATE)
        disabled: false
      }, [CustomValidators.required, Validators.minLength(2), Validators.maxLength(150)]],
      arName: [this.model.arName, [CustomValidators.required, Validators.maxLength(1000)]],
      enName: [this.model.enName, [CustomValidators.required, Validators.maxLength(1000)]]
    });
    this.fm = new FormManager(this.form, this.langService);
    // will check it later
    if (this.operation === OperationTypes.UPDATE) {
      this.fm.displayFormValidity();
    }
  }

  saveModel(): void {
    this.save$.next();
  }

  _saveModel(): void {
    this.save$
      .pipe(takeUntil(this.destroy$),
        exhaustMap(() => {
          const localization = (new Localization()).clone({ ...this.model, ...this.form.value });
          return localization.save().pipe(
            catchError((_err) => {
              return of(null);
            })
          );
        }))
      .subscribe((local: Localization | null) => {
        if (!local) {
          return;
        }
        const message = this.operation === OperationTypes.CREATE ? this.langService.map.msg_create_x_success : this.langService.map.msg_update_x_success;
        this.toast.success(message.change({ x: local.localizationKey }));
        this.model = local;
        this.operation = OperationTypes.UPDATE;
        this.form.get('localizationKey')?.disable();
        this.dialogRef.close(this.model);
      });
  }

  get popupTitle(): string {
    return this.operation === OperationTypes.CREATE ? this.langService.map.lbl_add_localization : this.langService.map.lbl_edit_localization;
  }
}
