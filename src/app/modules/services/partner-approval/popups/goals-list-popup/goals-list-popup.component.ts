import { Component, Inject, OnInit, OnDestroy } from '@angular/core';
import { UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import { CommonStatusEnum } from '@app/enums/common-status.enum';
import { GoalList } from '@app/models/goal-list';
import { LangService } from '@app/services/lang.service';
import { DialogRef } from '@app/shared/models/dialog-ref';
import { DIALOG_DATA_TOKEN } from '@app/shared/tokens/tokens';
import { Lookup } from '@app/models/lookup';
import { map, takeUntil } from 'rxjs/operators';
import { DomainTypes } from '@app/enums/domain-types';
import { CustomValidators } from '@app/validators/custom-validators';
import { Subject } from 'rxjs';
import { AdminResult } from '@app/models/admin-result';
import { DacOchaService } from '@app/services/dac-ocha.service';
import { LookupService } from '@app/services/lookup.service';

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
  domainsList: Lookup[] = this.lookupService.listByCategory.Domain;
  mainDACCategoriesList: AdminResult[] = [];
  mainUNOCHACategoriesList: AdminResult[] = [];;

  displayByDomain: 'DAC' | 'OCHA' | null = null;
  private destroy$: Subject<any> = new Subject<any>();

  constructor(@Inject(DIALOG_DATA_TOKEN)
  public data: {
    form: UntypedFormGroup,
    readonly: boolean,
    editItem: number,
    model: GoalList,
    viewOnly: boolean,
  },
    private dacOchaService: DacOchaService,
    private lookupService: LookupService,
    public lang: LangService,
    private dialogRef: DialogRef) {
    this.form = data.form;
    this.readonly = data.readonly;
    this.editItem = data.editItem;
    this.model = data.model;
    this.viewOnly = data.viewOnly;
  }
  ngOnInit() {
    this.displayByDomain = null;
    this.listenToGoalListChange();
    this.form.patchValue(this.model);
    this.loadOCHADACClassifications();
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
    let domainInfo: AdminResult =
      this.domainsList
        .find((x) => x.lookupKey === form.domain)
        ?.convertToAdminResult() ?? new AdminResult();
    let mainDACCategoryInfo: AdminResult =
      this.mainDACCategoriesList.find(
        (x) => x.id === form.mainDACCategory
      ) ?? new AdminResult();

    let mainUNOCHACategoryInfo: AdminResult =
      this.mainUNOCHACategoriesList.find(
        (x) => x.id === form.mainUNOCHACategory
      ) ?? new AdminResult();

    return new GoalList().clone({
      ...this.model,
      ...form,
      domainInfo: domainInfo,
      mainUNOCHACategoryInfo: mainUNOCHACategoryInfo,
      mainDACCategoryInfo: mainDACCategoryInfo,
    });
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
