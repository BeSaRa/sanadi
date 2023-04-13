import { AdminLookup } from '@app/models/admin-lookup';
import { Component, Inject, OnInit, OnDestroy } from '@angular/core';
import { UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import { CommonStatusEnum } from '@app/enums/common-status.enum';
import { GoalList } from '@app/models/goal-list';
import { LangService } from '@app/services/lang.service';
import { DialogRef } from '@app/shared/models/dialog-ref';
import { DIALOG_DATA_TOKEN } from '@app/shared/tokens/tokens';
import { Lookup } from '@app/models/lookup';
import { takeUntil } from 'rxjs/operators';
import { DomainTypes } from '@app/enums/domain-types';
import { CustomValidators } from '@app/validators/custom-validators';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-goals-list-popup',
  templateUrl: './goals-list-popup.component.html',
  styleUrls: ['./goals-list-popup.component.scss']
})
export class GoalsListPopupComponent implements OnInit, OnDestroy {
  commonStatusEnum = CommonStatusEnum;
  form: UntypedFormGroup;
  readonly: boolean;
  editItem: number;
  model: GoalList;
  viewOnly: boolean;
  domainsList: Lookup[];
  mainDACCategoriesList: AdminLookup[];
  mainUNOCHACategoriesList: AdminLookup[];
  displayByDomain: 'DAC' | 'OCHA' | null = null;
  private destroy$: Subject<any> = new Subject<any>();

  constructor(@Inject(DIALOG_DATA_TOKEN)
  public data: {
    form: UntypedFormGroup,
    readonly: boolean,
    editItem: number,
    model: GoalList,
    viewOnly: boolean,
    domainsList: Lookup[],
    mainDACCategoriesList: AdminLookup[],
    mainUNOCHACategoriesList: AdminLookup[]
  },
    public lang: LangService,
    private dialogRef: DialogRef) {
    this.form = data.form;
    this.readonly = data.readonly;
    this.editItem = data.editItem;
    this.model = data.model;
    this.viewOnly = data.viewOnly;
    this.domainsList = data.domainsList;
    this.mainDACCategoriesList = data.mainDACCategoriesList;
    this.mainUNOCHACategoriesList = data.mainUNOCHACategoriesList;
  }
  ngOnInit() {
    this.displayByDomain = null;
    this.listenToGoalListChange();
    this.form.patchValue(this.model);
  }

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
  mapFormTo(form: any): GoalList {
    const model: GoalList = new GoalList().clone(form);

    return model;
  }
  cancel() {
    this.dialogRef.close(null)
  }
  save() {
    this.dialogRef.close(this.mapFormTo(this.form.getRawValue()))
  }
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.destroy$.unsubscribe();
  }
}
