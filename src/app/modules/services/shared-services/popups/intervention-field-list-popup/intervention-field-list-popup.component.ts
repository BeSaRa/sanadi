import {InterventionField} from '@app/models/intervention-field';
import {Component, Inject} from '@angular/core';
import {UntypedFormBuilder, UntypedFormControl, UntypedFormGroup} from '@angular/forms';
import {DIALOG_DATA_TOKEN} from '@app/shared/tokens/tokens';
import {DialogRef} from '@app/shared/models/dialog-ref';
import {AdminResult} from '@app/models/admin-result';
import {AdminLookup} from '@app/models/admin-lookup';
import {map, takeUntil} from 'rxjs/operators';
import {AdminLookupTypeEnum} from '@app/enums/admin-lookup-type-enum';
import {DacOchaService} from '@app/services/dac-ocha.service';
import {Observable} from 'rxjs';
import {UiCrudDialogGenericComponent} from '@app/generics/ui-crud-dialog-generic-component.directive';
import {ILanguageKeys} from '@app/interfaces/i-language-keys';
import {OperationTypes} from '@app/enums/operation-types.enum';
import {UiCrudDialogComponentDataContract} from '@app/contracts/ui-crud-dialog-component-data-contract';

@Component({
  selector: 'app-intervention-field-list-popup',
  templateUrl: './intervention-field-list-popup.component.html',
  styleUrls: ['./intervention-field-list-popup.component.scss']
})
export class InterventionFieldListPopupComponent extends UiCrudDialogGenericComponent<InterventionField> {
  popupTitleKey: keyof ILanguageKeys;

  mainOchaCategories: AdminLookup[] = [];
  subOchaCategories: AdminLookup[] = [];

  hideFullScreen = true;

  constructor(@Inject(DIALOG_DATA_TOKEN) data: UiCrudDialogComponentDataContract<InterventionField>,
              public dialogRef: DialogRef,
              public fb: UntypedFormBuilder,
              private dacOchaService: DacOchaService) {
    super();
    this.setInitDialogData(data);
    this.popupTitleKey = 'intervention_fields';
  }

  initPopup(): void {
    this.loadSubOchaList(this.form.value.mainUNOCHACategory);
    this.loadMainOchaList();
  }

  getPopupHeadingText(): string {
    return '';
  }

  destroyPopup(): void {
  }

  afterSave(savedModel: InterventionField, originalModel: InterventionField): void {
    this.toast.success(this.operation === OperationTypes.CREATE
      ? this.lang.map.msg_added_in_list_success : this.lang.map.msg_updated_in_list_success);
    this.dialogRef.close(savedModel);
  }

  _isDuplicate(record1: Partial<InterventionField>, record2: Partial<InterventionField>): boolean {
    return (record1 as InterventionField).isEqual(record2 as InterventionField);
  }

  beforeSave(model: InterventionField, form: UntypedFormGroup): boolean | Observable<boolean> {
    if (this.form.invalid) {
      this.displayRequiredFieldsMessage();
      return false;
    }
    if (this.isDuplicateInList(form.getRawValue())) {
      this.displayDuplicatedItemMessage();
      return false;
    }
    return true;
  }

  prepareModel(model: InterventionField, form: UntypedFormGroup): InterventionField | Observable<InterventionField> {
    let formValue = form.getRawValue();

    let mainUNOCHACategoryInfo: AdminResult = (this.mainOchaCategories.find(x => x.id === formValue.mainUNOCHACategory))?.convertToAdminResult() ?? new AdminResult();
    let subUNOCHACategoryInfo: AdminResult = (this.subOchaCategories.find(x => x.id === formValue.subUNOCHACategory))?.convertToAdminResult() ?? new AdminResult();

    return this._getNewInstance({
      ...this.model,
      ...formValue,
      mainUNOCHACategoryInfo: mainUNOCHACategoryInfo,
      subUNOCHACategoryInfo: subUNOCHACategoryInfo
    });
  }

  saveFail(error: Error): void {
    throw new Error(error.message);
  }

  buildForm(): void {
    this.form = this.fb.group(this.model.getInterventionFieldForm(true));
  }

  _getNewInstance(override?: Partial<InterventionField> | undefined): InterventionField {
    return new InterventionField().clone(override ?? {});
  }

  private loadMainOchaList(): void {
    this.dacOchaService.loadByType(AdminLookupTypeEnum.OCHA)
      .pipe(
        takeUntil(this.destroy$),
        map((result: AdminLookup[]) => {
          return result.filter(x => !x.parentId);
        })
      ).subscribe((list) => {
      this.mainOchaCategories = list
    });
  }

  private loadSubOchaList(mainOchaId: number): void {
    if (!mainOchaId) {
      this.subOchaCategories = [];
      return;
    }
    this.dacOchaService.loadByParentId(mainOchaId)
      .pipe(takeUntil(this.destroy$))
      .subscribe((list) => {
        this.subOchaCategories = list;
      });
  }

  handleChangeMainOcha(value: number, userInteraction: boolean = false): void {
    if (userInteraction) {
      this.subUNOCHACategoryField.setValue(null);
      this.loadSubOchaList(value);
    }
  }

  get subUNOCHACategoryField(): UntypedFormControl {
    return this.form.get('subUNOCHACategory') as UntypedFormControl;
  }
}
