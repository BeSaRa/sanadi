import {Component, Inject} from '@angular/core';
import {AbstractControl, UntypedFormBuilder, UntypedFormGroup} from '@angular/forms';
import {UiCrudDialogComponentDataContract} from '@app/contracts/ui-crud-dialog-component-data-contract';
import {OperationTypes} from '@app/enums/operation-types.enum';
import {UserClickOn} from '@app/enums/user-click-on.enum';
import {UiCrudDialogGenericComponent} from '@app/generics/ui-crud-dialog-generic-component.directive';
import {ICoordinates} from '@app/interfaces/ICoordinates';
import {ILanguageKeys} from '@app/interfaces/i-language-keys';
import {ProjectAddress} from '@app/models/project-address';
import {DialogRef} from '@app/shared/models/dialog-ref';
import {DIALOG_DATA_TOKEN} from '@app/shared/tokens/tokens';
import {Observable} from 'rxjs';
import {CommonUtils} from "@helpers/common-utils";

@Component({
  selector: 'project-addresses-popup',
  templateUrl: './project-addresses-popup.component.html',
  styleUrls: ['./project-addresses-popup.component.scss']
})
export class ProjectAddressesPopupComponent extends UiCrudDialogGenericComponent<ProjectAddress> {
  popupTitleKey: keyof ILanguageKeys;
  hideFullScreen = true;

  constructor(@Inject(DIALOG_DATA_TOKEN) data: UiCrudDialogComponentDataContract<ProjectAddress>,
              public dialogRef: DialogRef,
              public fb: UntypedFormBuilder) {
    super();
    this.setInitDialogData(data);
    this.popupTitleKey = 'project_addresses';
  }

  _getNewInstance(override?: Partial<ProjectAddress> | undefined): ProjectAddress {
    return new ProjectAddress().clone(override ?? {});
  }

  initPopup(): void {
  }

  getPopupHeadingText(): string {
    return '';
  }

  destroyPopup(): void {
  }

  afterSave(savedModel: ProjectAddress, originalModel: ProjectAddress): void {
    this.toast.success(this.operation === OperationTypes.CREATE
      ? this.lang.map.msg_added_in_list_success : this.lang.map.msg_updated_in_list_success);
    this.dialogRef.close(savedModel);
  }

  get longitude(): AbstractControl {
    return this.form.get('longitude')!;
  }

  get latitude(): AbstractControl {
    return this.form.get('latitude')!;
  }

  isValidForm() {
    return this.form.valid && CommonUtils.isValidValue(this.latitude.value) && CommonUtils.isValidValue(this.longitude.value);
  }

  beforeSave(model: ProjectAddress, form: UntypedFormGroup): Observable<boolean> | boolean {
    if (!this.isValidForm()) {
      this.displayRequiredFieldsMessage();
      return false;
    }

    const isDuplicate = this.list.some((x) => x === form.getRawValue());
    if (isDuplicate) {
      this.displayDuplicatedItemMessage();
      return false;
    }
    return true;
  }

  prepareModel(model: ProjectAddress, form: UntypedFormGroup): Observable<ProjectAddress> | ProjectAddress {
    let formValue = form.getRawValue();
    return this._getNewInstance({
      ...this.model,
      ...formValue,
    });
  }

  saveFail(error: Error): void {
    throw new Error(error.message);
  }

  buildForm(): void {
    this.form = this.fb.group(this.model.buildForm(true));
  }

  openMapMarker() {
    (this.model!).openMap(this.readonly)
      .onAfterClose$
      .subscribe(({click, value}: { click: UserClickOn, value: ICoordinates }) => {
        if (click === UserClickOn.YES) {
          this.model!.latitude = value.latitude;
          this.model!.longitude = value.longitude;
          this.form.get('latitude')!.patchValue(value.latitude)
          this.form.get('longitude')!.patchValue(value.longitude)
        }
      });
  }

}
