import { Component, Inject, OnInit, OnDestroy } from '@angular/core';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import { CommonStatusEnum } from '@app/enums/common-status.enum';
import { GoalList } from '@app/models/goal-list';
import { LangService } from '@app/services/lang.service';
import { DialogRef } from '@app/shared/models/dialog-ref';
import { DIALOG_DATA_TOKEN } from '@app/shared/tokens/tokens';
import { Lookup } from '@app/models/lookup';
import { map, takeUntil } from 'rxjs/operators';
import { DomainTypes } from '@app/enums/domain-types';
import { CustomValidators } from '@app/validators/custom-validators';
import { Observable, Subject } from 'rxjs';
import { AdminResult } from '@app/models/admin-result';
import { DacOchaService } from '@app/services/dac-ocha.service';
import { LookupService } from '@app/services/lookup.service';
import { UiCrudDialogGenericComponent } from '@app/generics/ui-crud-dialog-generic-component.directive';
import { UiCrudDialogComponentDataContract } from '@app/contracts/ui-crud-dialog-component-data-contract';
import { DialogService } from '@app/services/dialog.service';
import { ToastService } from '@app/services/toast.service';
import { OperationTypes } from '@app/enums/operation-types.enum';
import { ILanguageKeys } from '@app/interfaces/i-language-keys';

@Component({
  selector: 'app-goals-list-popup',
  templateUrl: './goals-list-popup.component.html',
  styleUrls: ['./goals-list-popup.component.scss']
})
export class GoalsListPopupComponent extends UiCrudDialogGenericComponent<GoalList> {
  model: GoalList;
  form!: UntypedFormGroup;
  operation: OperationTypes;
  popupTitleKey!: keyof ILanguageKeys;
  commonStatusEnum = CommonStatusEnum;
  domainsList: Lookup[] = this.lookupService.listByCategory.Domain;
  mainDACCategoriesList: AdminResult[] = [];
  mainUNOCHACategoriesList: AdminResult[] = [];;
  _getNewInstance(override?: Partial<GoalList> | undefined): GoalList {
    return new GoalList().clone(override ?? {});
  }

  initPopup(): void {
    this.popupTitleKey = 'domain';
    this.displayByDomain = null;
    // this.listenToGoalListChange();
    this.loadOCHADACClassifications();
  }

  destroyPopup(): void {
  }

  afterSave(savedModel: GoalList, originalModel: GoalList): void {
    this.toast.success(this.operation === OperationTypes.CREATE
      ? this.lang.map.msg_added_in_list_success : this.lang.map.msg_updated_in_list_success);
    this.dialogRef.close(savedModel);
  }

  beforeSave(model: GoalList, form: UntypedFormGroup): boolean | Observable<boolean> {
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

  constructor(@Inject(DIALOG_DATA_TOKEN) data: UiCrudDialogComponentDataContract<GoalList>,
    public lang: LangService,
    public dialogRef: DialogRef,
    public dialogService: DialogService,
    public fb: UntypedFormBuilder,
    public toast: ToastService,
    private lookupService: LookupService,
    private dacOchaService: DacOchaService) {
    super();
    this.model = data.model;
    this.operation = data.operation;
    this.list = data.list;
  }


  displayByDomain: 'DAC' | 'OCHA' | null = null;



  private listenToGoalListChange(): void {
    this.form.get('domain')!.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe((value) => {
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

        this.mainDACCategoryField.updateValueAndValidity();
        this.mainUNOCHACategoryField.updateValueAndValidity();
      });
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
    if(userInteraction){
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
  _afterViewInit(){
    this.onDomainChange(this.model.domain,false);
  }
}
