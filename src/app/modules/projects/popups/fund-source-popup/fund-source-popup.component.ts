import {Component, Inject, OnDestroy, OnInit} from '@angular/core';
import {FundingResourceContract} from "@contracts/funding-resource-contract";
import {OperationTypes} from "@app/enums/operation-types.enum";
import {DIALOG_DATA_TOKEN} from "@app/shared/tokens/tokens";
import {LangService} from "@services/lang.service";
import {Subject} from "rxjs";
import {FundSourceType} from "@app/enums/fund-source-type";
import {AbstractControl, UntypedFormBuilder, UntypedFormGroup} from '@angular/forms';
import {CustomValidators} from "@app/validators/custom-validators";
import {debounceTime, map, takeUntil} from "rxjs/operators";
import {FundSource} from "@models/fund-source";
import {DialogRef} from "@app/shared/models/dialog-ref";

@Component({
  selector: 'fund-source-popup',
  templateUrl: './fund-source-popup.component.html',
  styleUrls: ['./fund-source-popup.component.scss']
})
export class FundSourcePopupComponent implements OnDestroy, OnInit {
  private destroy$ = new Subject<void>()
  public label: string;
  private model: FundingResourceContract
  public form!: UntypedFormGroup
  public maskPattern = CustomValidators.inputMaskPatterns
  projectTotalCost: number;
  remainingCost: number;

  constructor(
    public lang: LangService,
    private fb: UntypedFormBuilder,
    private dialogRef: DialogRef,
    @Inject(DIALOG_DATA_TOKEN) public data: {
      model: FundingResourceContract,
      operation: OperationTypes,
      projectTotalCost: number,
      type: FundSourceType,
      remainingAmount: number
    }) {
    this.label = this.data.type === FundSourceType.SELF ? this.lang.map.self_financial : this.lang.map.grant_financial
    this.model = this.data.model
    this.projectTotalCost = this.data.projectTotalCost
    this.remainingCost = this.data.remainingAmount
  }

  get totalCost(): AbstractControl {
    return this.form.get('totalCost')!
  }

  ngOnDestroy(): void {
    this.destroy$.next()
    this.destroy$.complete()
    this.destroy$.unsubscribe()
  }

  ngOnInit(): void {
    this.form = this.fb.group({
      ...this.isGrant() ? {fullName: [this.model.fullName, [CustomValidators.required, CustomValidators.maxLength(CustomValidators.defaultLengths.ENGLISH_NAME_MAX)]]} : null,
      totalCost: [this.model.totalCost, CustomValidators.required],
      notes: [this.model.notes, CustomValidators.maxLength(CustomValidators.defaultLengths.EXPLANATIONS)]
    })
    this.listenToTotalCost()
  }

  private listenToTotalCost() {
    this.totalCost
      .valueChanges
      .pipe(takeUntil(this.destroy$))
      .pipe(map(value => Number(value)))
      .pipe(debounceTime(300))
      .subscribe((value) => {
        this.totalCost.setValue(value > this.remainingCost ? this.remainingCost : value, {emitEvent: false})
      })
  }

  saveFundSource() {
    this.model = new FundSource().clone({
      ...this.form.getRawValue()
    })
    this.dialogRef.close(this.model)
  }

  isGrant(): boolean {
    return this.data.type === FundSourceType.GRANT
  }

  isView(): boolean {
    return this.data.operation === OperationTypes.VIEW
  }
}
