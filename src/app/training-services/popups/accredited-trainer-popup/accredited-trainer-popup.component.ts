import {Component, Inject} from '@angular/core';
import {AdminGenericDialog} from '@app/generics/admin-generic-dialog';
import {Trainer} from '@app/models/trainer';
import {DialogRef} from '@app/shared/models/dialog-ref';
import {FormBuilder, FormGroup} from '@angular/forms';
import {Observable} from 'rxjs';
import {DIALOG_DATA_TOKEN} from '@app/shared/tokens/tokens';
import {IDialogData} from '@app/interfaces/i-dialog-data';
import {LangService} from '@app/services/lang.service';
import {ExceptionHandlerService} from '@app/services/exception-handler.service';
import {LookupService} from '@app/services/lookup.service';
import {ToastService} from '@app/services/toast.service';
import {DialogService} from '@app/services/dialog.service';
import {TrainerService} from '@app/services/trainer.service';
import {FormManager} from '@app/models/form-manager';
import {OperationTypes} from '@app/enums/operation-types.enum';
import {Lookup} from '@app/models/lookup';
import {IKeyValue} from '@app/interfaces/i-key-value';

@Component({
  selector: 'trainer-popup',
  templateUrl: './accredited-trainer-popup.component.html',
  styleUrls: ['./accredited-trainer-popup.component.scss']
})
export class AccreditedTrainerPopupComponent extends AdminGenericDialog<Trainer>{
  form!: FormGroup;
  fm!: FormManager;
  operation!: OperationTypes;
  model!: Trainer;
  validateFieldsVisible = true;
  saveVisible = true;
  nationalities: Lookup[] = this.lookupService.listByCategory.Nationality;
  trainingLanguages: Lookup[] = this.lookupService.listByCategory.TRAINING_LANG;
  tabsData: IKeyValue = {
    basic: {name: 'basic'},
    cv: {name: 'cv'}
  };
  validToAddResume = false;

  constructor(@Inject(DIALOG_DATA_TOKEN) data: IDialogData<Trainer>,
              public lang: LangService,
              public fb: FormBuilder,
              public exceptionHandlerService: ExceptionHandlerService,
              public lookupService: LookupService,
              public toast: ToastService,
              public dialogRef: DialogRef,
              public dialogService: DialogService,
              public trainerService: TrainerService) {
    super();
    this.operation = data.operation;
    this.model = data.model;
  }

  initPopup(): void {
    if(this.model.id) {
      this.validToAddResume = true;
    }
  }

  buildForm(): void {
    this.form = this.fb.group(this.model.buildForm(true));
    this.fm = new FormManager(this.form, this.lang);
  }

  beforeSave(model: Trainer, form: FormGroup): Observable<boolean> | boolean {
    return form.valid;
  }

  prepareModel(model: Trainer, form: FormGroup): Observable<Trainer> | Trainer {
    return (new Trainer()).clone({...model, ...form.value});
  }
  afterSave(model: Trainer, dialogRef: DialogRef): void {
    this.validToAddResume = true;
    const message = this.operation === OperationTypes.CREATE ? this.lang.map.msg_create_x_success : this.lang.map.msg_update_x_success;
    // @ts-ignore
    this.toast.success(message.change({x: model.getName()}));
    this.model = model;
    const operationBeforeSave = this.operation;
    this.operation = OperationTypes.UPDATE;

    if (operationBeforeSave == OperationTypes.UPDATE) {
      this.dialogRef.close(this.model);
    }
  }

  saveFail(error: Error): void {
  }

  get popupTitle(): string {
    return this.operation === OperationTypes.CREATE ?
      this.lang.map.add_trainer :
      this.lang.map.edit_trainer;
  };

  destroyPopup(): void {
  }
}
