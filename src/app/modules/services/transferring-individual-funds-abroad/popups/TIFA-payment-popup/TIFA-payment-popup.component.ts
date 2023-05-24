import {Component, Inject} from '@angular/core';
import {UntypedFormBuilder, UntypedFormControl, UntypedFormGroup} from '@angular/forms';
import {DateUtils} from '@app/helpers/date-utils';
import {Payment} from '@app/models/payment';
import {DIALOG_DATA_TOKEN} from '@app/shared/tokens/tokens';
import {DatepickerControlsMap, DatepickerOptionsMap} from '@app/types/types';
import {UiCrudDialogGenericComponent} from "@app/generics/ui-crud-dialog-generic-component.directive";
import {UiCrudDialogComponentDataContract} from "@contracts/ui-crud-dialog-component-data-contract";
import {OperationTypes} from "@enums/operation-types.enum";
import {ILanguageKeys} from "@contracts/i-language-keys";
import {Observable} from "rxjs";
import {DialogRef} from "@app/shared/models/dialog-ref";

@Component({
  selector: 'app-TIFA-payment-popup',
  templateUrl: './TIFA-payment-popup.component.html',
  styleUrls: ['./TIFA-payment-popup.component.scss']
})
export class TIFAPaymentPopupComponent extends UiCrudDialogGenericComponent<Payment> {
  popupTitleKey: keyof ILanguageKeys;
  isCancel: boolean = false;
  hideFullScreen = true;

  datepickerControlsMap: DatepickerControlsMap = {};
  datepickerOptionsMap: DatepickerOptionsMap = {
    dueDate: DateUtils.getDatepickerOptions({disablePeriod: 'past'})
  };

  constructor(@Inject(DIALOG_DATA_TOKEN) data: UiCrudDialogComponentDataContract<Payment>,
              public dialogRef: DialogRef,
              public fb: UntypedFormBuilder) {
    super();
    this.setInitDialogData(data);
    this.model.dueDate = DateUtils.changeDateToDatepicker(data.model.dueDate);

    this.isCancel = (data.extras && data.extras.isCancel) ?? false;
    this.popupTitleKey = 'payment';
  }

  initPopup() {
    this._buildDatepickerControlsMap();
    if (this.operation === OperationTypes.UPDATE) {
      this.enablePastSelectedDates(this.datepickerOptionsMap);
    }
  }

  _getNewInstance(override: Partial<Payment> | undefined): Payment {
    return new Payment().clone(override ?? {});
  }

  buildForm(): void {
    this.form = this.fb.group(this.model.buildForm(true));
  }

  afterSave(savedModel: Payment, originalModel: Payment): void {
    this.toast.success(this.operation === OperationTypes.CREATE
      ? this.lang.map.msg_added_in_list_success : this.lang.map.msg_updated_in_list_success);
    this.dialogRef.close(savedModel);
  }

  private isDuplicate(formValue: any): boolean {
    if (this.operation === OperationTypes.CREATE) {
      return this.list.some((item) => item.isEqual(formValue));
    }
    if (this.operation === OperationTypes.UPDATE) {
      return this.list.some((item: Payment, index: number) => {
        return index !== this.listIndex && item.isEqual(formValue);
      });
    }
    return false;
  }

  beforeSave(model: Payment, form: UntypedFormGroup): Observable<boolean> | boolean {
    if (this.form.invalid) {
      this.displayRequiredFieldsMessage();
      return false;
    }
    if (this.isDuplicate(form.getRawValue())) {
      this.displayDuplicatedItemMessage();
      return false;
    }
    return true;
  }

  prepareModel(model: Payment, form: UntypedFormGroup): Observable<Payment> | Payment {
    let formValue = form.getRawValue();

    return this._getNewInstance({
      ...this.model,
      ...formValue,
      dueDateString: DateUtils.getDateStringFromDate(formValue.dueDate)
    });
  }

  saveFail(error: Error): void {
    throw new Error(error.message);
  }

  destroyPopup(): void {
  }

  getPopupHeadingText(): string {
    return this.model.paymentNo;
  }


  private _buildDatepickerControlsMap() {
    this.datepickerControlsMap = {
      dueDate: this.dueDate
    };
  }

  get dueDate(): UntypedFormControl {
    return this.form.get('dueDate')! as UntypedFormControl;
  }
}
