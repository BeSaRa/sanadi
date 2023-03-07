import {Component, Inject, OnDestroy, OnInit} from '@angular/core';
import {LangService} from '@services/lang.service';
import {ImplementationFundraising} from "@models/implementation-fundraising";
import {ProjectFundraising} from "@models/project-fundraising";
import {DIALOG_DATA_TOKEN} from "@app/shared/tokens/tokens";
import {IMenuItem} from "@modules/context-menu/interfaces/i-menu-item";
import {ProjectImplementationService} from "@services/project-implementation.service";
import {Subject} from "rxjs";
import {exhaustMap, filter, map, takeUntil} from "rxjs/operators";
import currency from "currency.js";
import {DialogRef} from '@app/shared/models/dialog-ref';
import {DialogService} from "@services/dialog.service";

// noinspection AngularMissingOrInvalidDeclarationInModule
@Component({
  selector: 'select-project-fundraising-popup',
  templateUrl: './select-project-fundraising-popup.component.html',
  styleUrls: ['./select-project-fundraising-popup.component.scss']
})
export class SelectProjectFundraisingPopupComponent implements OnInit, OnDestroy {
  public models: ProjectFundraising[] = []
  private selectedFundraising: ImplementationFundraising[] = []
  private selectedIds: string[] = [];
  public displayedColumns: string[] = [
    "fullSerial",
    "arName",
    "enName",
    "permitTypeInfo",
    "projectTypeInfo",
    "domainInfo",
    "projectTotalCost",
    "actions",
  ];
  actions: IMenuItem<ProjectFundraising>[] = [
    {
      type: 'action',
      class: 'btn-sm',
      label: 'select',
      disabled: (item) => {
        return this.selectedIds.includes(item.id)
      },
      onClick: (item) => {
        this.selection$.next(item)
      }
    }
  ];
  private selection$ = new Subject<ProjectFundraising>()
  private destroy$ = new Subject<void>()

  constructor(
    @Inject(DIALOG_DATA_TOKEN) private data: { models: ProjectFundraising[], selected?: ImplementationFundraising[], templateId: string, caseId: string, requestType: number },
    public lang: LangService,
    private dialogRef: DialogRef,
    private dialog: DialogService,
    private service: ProjectImplementationService
  ) {
    this.models = this.data.models;
    this.selectedFundraising = this.data.selected || []
    this.selectedIds = this.selectedFundraising.map(item => item.projectLicenseId)
  }

  ngOnInit(): void {
    this.listenToSelection()
  }

  ngOnDestroy(): void {
    this.destroy$.next()
    this.destroy$.complete()
    this.destroy$.unsubscribe()
  }

  private listenToSelection() {
    this.selection$
      .pipe(filter(item => !this.selectedIds.includes(item.id)))
      .pipe(exhaustMap((model) => {
        return this.service.getConsumedAmount(model.id, this.data.templateId, this.data.caseId, this.data.requestType).pipe(map(license => ({
          consumedAmount: license.consumed!,
          model
        })))
      }))
      .pipe(filter((value) => {
        const hasRemaining = currency(value.model.targetAmount).subtract(value.consumedAmount).value
        return hasRemaining ? (() => {
          return true
        })() : (() => {
          this.dialog.error(this.lang.map.msg_full_amount_used)
          return false
        })()
      }))
      .pipe(map(({consumedAmount, model}) => {
        return model.convertToFundraisingTemplate().clone({
          projectTotalCost: model.targetAmount,
          consumedAmount,
          remainingAmount: currency(model.targetAmount).subtract(consumedAmount).value,
          totalCost: 0 //currency(model.targetAmount).subtract(consumedAmount).value
        })
      }))
      .pipe(takeUntil(this.destroy$))
      .subscribe((model) => {
        this.dialogRef.close(model)
      })
  }
}
