import {Component, Inject} from '@angular/core';
import {UntypedFormBuilder, UntypedFormControl, UntypedFormGroup} from '@angular/forms';
import {GoalList} from '@app/models/goal-list';
import {DialogRef} from '@app/shared/models/dialog-ref';
import {DIALOG_DATA_TOKEN} from '@app/shared/tokens/tokens';
import {Lookup} from '@app/models/lookup';
import {map} from 'rxjs/operators';
import {DomainTypes} from '@app/enums/domain-types';
import {CustomValidators} from '@app/validators/custom-validators';
import {Observable} from 'rxjs';
import {AdminResult} from '@app/models/admin-result';
import {DacOchaService} from '@app/services/dac-ocha.service';
import {LookupService} from '@app/services/lookup.service';
import {UiCrudDialogGenericComponent} from '@app/generics/ui-crud-dialog-generic-component.directive';
import {UiCrudDialogComponentDataContract} from '@app/contracts/ui-crud-dialog-component-data-contract';
import {OperationTypes} from '@app/enums/operation-types.enum';
import {ILanguageKeys} from '@app/interfaces/i-language-keys';

@Component({
  selector: 'app-goals-list-popup',
  templateUrl: './goals-list-popup.component.html',
  styleUrls: ['./goals-list-popup.component.scss']
})
export class GoalsListPopupComponent extends UiCrudDialogGenericComponent<GoalList> {
  popupTitleKey: keyof ILanguageKeys;
  domainsList: Lookup[] = this.lookupService.listByCategory.Domain;
  mainDACCategoriesList: AdminResult[] = [];
  mainUNOCHACategoriesList: AdminResult[] = [];
  displayByDomain: 'DAC' | 'OCHA' | null = null;
  hideFullScreen = true;

  constructor(@Inject(DIALOG_DATA_TOKEN) data: UiCrudDialogComponentDataContract<GoalList>,
              public dialogRef: DialogRef,
              public fb: UntypedFormBuilder,
              private lookupService: LookupService,
              private dacOchaService: DacOchaService) {
    super();
    this.setInitDialogData(data);
    this.popupTitleKey = 'domain';
  }

  _getNewInstance(override?: Partial<GoalList> | undefined): GoalList {
    return new GoalList().clone(override ?? {});
  }

  initPopup(): void {
    this.displayByDomain = null;
    this.loadOCHADACClassifications();
  }

  getPopupHeadingText(): string {
    return '';
  }

  destroyPopup(): void {
  }

  afterSave(savedModel: GoalList, originalModel: GoalList): void {
    this.toast.success(this.operation === OperationTypes.CREATE
      ? this.lang.map.msg_added_in_list_success : this.lang.map.msg_updated_in_list_success);
    this.dialogRef.close(savedModel);
  }

  _isDuplicate(record1: Partial<GoalList>, record2: Partial<GoalList>): boolean {
    return (record1 as GoalList).isEqual(record2 as GoalList);
  }

  beforeSave(model: GoalList, form: UntypedFormGroup): boolean | Observable<boolean> {
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

  prepareModel(model: GoalList, form: UntypedFormGroup): GoalList | Observable<GoalList> {
    let formValue = form.getRawValue();

    let domainInfo: AdminResult =
      this.domainsList
        .find((x) => x.lookupKey === formValue.domain)
        ?.convertToAdminResult() ?? new AdminResult();

    let mainDACCategoryInfo: AdminResult =
      this.mainDACCategoriesList.find(
        (x) => x.id === formValue.mainDACCategory
      ) ?? new AdminResult();

    let mainUNOCHACategoryInfo: AdminResult =
      this.mainUNOCHACategoriesList.find(
        (x) => x.id === formValue.mainUNOCHACategory
      ) ?? new AdminResult();

    return this._getNewInstance({
      ...this.model,
      ...formValue,
      domainInfo: domainInfo,
      mainUNOCHACategoryInfo: mainUNOCHACategoryInfo,
      mainDACCategoryInfo: mainDACCategoryInfo,
    });
  }

  saveFail(error: Error): void {
    throw new Error(error.message);
  }

  buildForm(): void {
    this.form = this.fb.group(this.model.buildForm(true));
  }

  get mainDACCategoryField(): UntypedFormControl {
    return this.form.get(
      'mainDACCategory'
    ) as UntypedFormControl;
  }

  get mainUNOCHACategoryField(): UntypedFormControl {
    return this.form.get(
      'mainUNOCHACategory'
    ) as UntypedFormControl;
  }

  private loadOCHADACClassifications() {
    return this.dacOchaService
      .loadAsLookups()
      .pipe(
        map((list) => {
          return list.filter((model) => !model.parentId);
        }),
        map(list=>list.filter(x=>x.isActive() || x.id ===  this.model.mainDACCategory || x.id === this.model.mainUNOCHACategory)),
        map((result) => {
          return result.filter((record) => {
            if (record.type === DomainTypes.HUMANITARIAN) {
              this.mainUNOCHACategoriesList.push(record.convertToAdminResult());
            } else if (record.type === DomainTypes.DEVELOPMENT) {
              this.mainDACCategoriesList.push(record.convertToAdminResult());
            }
            return record;
          });
        })
      )
      .subscribe();
  }

  onDomainChange(value: any, userInteraction: boolean = false) {
    if (userInteraction) {
      this.mainDACCategoryField.setValue(null);
      this.mainUNOCHACategoryField.setValue(null);
    }
    if (!value) {
      this.mainDACCategoryField.setValue(null);
      this.mainUNOCHACategoryField.setValue(null);

    } else {
      if (value === DomainTypes.DEVELOPMENT) {
        this.displayByDomain = 'DAC';
        this.mainDACCategoryField.setValidators([
          CustomValidators.required,
        ]);
        this.mainUNOCHACategoryField.setValidators([]);
        this.mainUNOCHACategoryField.setValue(null);
      } else if (value === DomainTypes.HUMANITARIAN) {
        this.displayByDomain = 'OCHA';
        this.mainUNOCHACategoryField.setValidators([
          CustomValidators.required,
        ]);
        this.mainDACCategoryField.setValidators([]);
        this.mainDACCategoryField.setValue(null);
      }
    }


    this.mainDACCategoryField.updateValueAndValidity();
    this.mainUNOCHACategoryField.updateValueAndValidity();
  }

  _afterViewInit() {
    this.onDomainChange(this.model.domain, false);
  }
}
