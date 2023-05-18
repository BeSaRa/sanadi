import {InterventionField} from '@app/models/intervention-field';
import {Component, Inject} from '@angular/core';
import {UntypedFormBuilder, UntypedFormControl, UntypedFormGroup} from '@angular/forms';
import {DIALOG_DATA_TOKEN} from '@app/shared/tokens/tokens';
import {LangService} from '@app/services/lang.service';
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
import {DialogService} from '@app/services/dialog.service';
import {ToastService} from '@app/services/toast.service';
import {UiCrudDialogComponentDataContract} from '@app/contracts/ui-crud-dialog-component-data-contract';

@Component({
  selector: 'app-intervention-field-list-popup',
  templateUrl: './intervention-field-list-popup.component.html',
  styleUrls: ['./intervention-field-list-popup.component.scss']
})
export class InterventionFieldListPopupComponent extends UiCrudDialogGenericComponent<InterventionField> {
  model: InterventionField;
  form!: UntypedFormGroup;
  operation: OperationTypes;
  popupTitleKey!: keyof ILanguageKeys;

  mainOchaCategories: AdminLookup[] = [];
  subOchaCategories: AdminLookup[] = [];

  hideFullScreen = true;

  constructor(@Inject(DIALOG_DATA_TOKEN) data: UiCrudDialogComponentDataContract<InterventionField>,
              public lang: LangService,
              public dialogRef: DialogRef,
              public dialogService: DialogService,
              public fb: UntypedFormBuilder,
              public toast: ToastService,
              private dacOchaService: DacOchaService) {
    super();
    this.model = data.model;
    this.operation = data.operation;
    this.list = data.list;
  }

  initPopup(): void {
    this.popupTitleKey = 'intervention_fields';
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

  beforeSave(model: InterventionField, form: UntypedFormGroup): boolean | Observable<boolean> {
    if (this.form.invalid) {
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
