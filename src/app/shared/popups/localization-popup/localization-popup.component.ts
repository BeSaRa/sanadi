import {Component, Inject, OnDestroy, OnInit} from '@angular/core';
import {LangService} from '../../../services/lang.service';
import {DIALOG_DATA_TOKEN} from '../../tokens/tokens';
import {Localization} from '../../../models/localization';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {FormManager} from '../../../models/form-manager';
import {FactoryService} from '../../../services/factory.service';
import {ToastService} from '../../../services/toast.service';
import {OperationTypes} from '../../../enums/operation-types.enum';
import {IDialogData} from '../../../interfaces/i-dialog-data';
import {CustomValidators} from '../../../validators/custom-validators';
import {of, Subject} from 'rxjs';
import {catchError, exhaustMap, takeUntil} from 'rxjs/operators';

@Component({
  selector: 'app-localization-popup',
  templateUrl: './localization-popup.component.html',
  styleUrls: ['./localization-popup.component.scss']
})
export class LocalizationPopupComponent implements OnInit, OnDestroy {
  private save$: Subject<any> = new Subject<any>();
  private destroy$: Subject<any> = new Subject<any>();
  form!: FormGroup;
  model: Localization;
  operation: OperationTypes;
  fm!: FormManager;
  langService!: LangService;

  constructor(@Inject(DIALOG_DATA_TOKEN) data: IDialogData<Localization>,
              private toast: ToastService,
              private fb: FormBuilder) {
    this.model = data.model;
    console.log('this.model', this.model);
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
        disabled: this.operation
      }, [CustomValidators.required, Validators.minLength(3), Validators.maxLength(150)]],
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
          const localization = (new Localization()).clone({...this.model, ...this.form.value});
          return localization.save().pipe(catchError(() => {
            return of(undefined);
          }));
        }))
      .subscribe((local) => {
        if (typeof local === 'undefined') {
          return;
        }
        const message = this.operation === OperationTypes.CREATE ? this.langService.map.msg_create_x_success : this.langService.map.msg_update_x_success;
        this.toast.success(message.change({x: local.localizationKey}));
        this.model = local;
        this.operation = OperationTypes.UPDATE;
        this.form.get('localizationKey')?.disable();
      });
  }

  get popupTitle(): string {
    return this.operation === OperationTypes.CREATE ? this.langService.map.lbl_add_localization : this.langService.map.lbl_edit_localization;
  }
}
