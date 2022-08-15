import {Component, Inject} from '@angular/core';
import {UntypedFormBuilder, UntypedFormGroup} from '@angular/forms';
import {OperationTypes} from '@app/enums/operation-types.enum';
import {AdminGenericDialog} from '@app/generics/admin-generic-dialog';
import {Bank} from '@app/models/bank';
import {DialogRef} from '@app/shared/models/dialog-ref';
import {Observable} from 'rxjs';
import {DIALOG_DATA_TOKEN} from '@app/shared/tokens/tokens';
import {IDialogData} from '@app/interfaces/i-dialog-data';
import {LangService} from '@app/services/lang.service';
import {LookupService} from '@app/services/lookup.service';
import {DialogService} from '@app/services/dialog.service';
import {ToastService} from '@app/services/toast.service';
import {FormManager} from '@app/models/form-manager';
import {Lookup} from '@app/models/lookup';
import {CommonStatusEnum} from '@app/enums/common-status.enum';

@Component({
  selector: 'bank-popup',
  templateUrl: './bank-popup.component.html',
  styleUrls: ['./bank-popup.component.scss']
})
export class BankPopupComponent extends AdminGenericDialog<Bank> {
  model!: Bank;
  form!: UntypedFormGroup;
  fm!: FormManager;
  operation!: OperationTypes;
  commonStatusEnum = CommonStatusEnum;
  statuses: Lookup[] = this.lookupService.listByCategory.CommonStatus;

  constructor(@Inject(DIALOG_DATA_TOKEN) data: IDialogData<Bank>,
              public fb: UntypedFormBuilder,
              public dialogRef: DialogRef,
              public lang: LangService,
              private lookupService: LookupService,
              private dialogService: DialogService,
              private toast: ToastService) {
    super();
    this.model = data.model;
    this.operation = data.operation;
  }

  get popupTitle(): string {
    return this.operation === OperationTypes.CREATE ? this.lang.map.lbl_add_bank : this.lang.map.lbl_edit_bank;
  };

  initPopup(): void {

  }

  buildForm(): void {
    this.form = this.fb.group(this.model.buildForm(true));
    this.fm = new FormManager(this.form, this.lang);
  }

  prepareModel(model: Bank, form: UntypedFormGroup): Bank | Observable<Bank> {
    return (new Bank()).clone({...model, ...form.value});
  }

  beforeSave(model: Bank, form: UntypedFormGroup): boolean | Observable<boolean> {
    return form.valid;
  }

  afterSave(model: Bank, dialogRef: DialogRef): void {
    const message = this.operation === OperationTypes.CREATE ? this.lang.map.msg_create_x_success : this.lang.map.msg_update_x_success;
    // @ts-ignore
    this.toast.success(message.change({x: model.getName()}));
    this.model = model;
    this.dialogRef.close(this.model);
  }

  saveFail(error: Error): void {

  }

  destroyPopup(): void {

  }
}
