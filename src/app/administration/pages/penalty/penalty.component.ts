import { Component, inject, ViewChild } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { ActionIconsEnum } from '@app/enums/action-icons-enum';
import { CommonStatusEnum } from '@app/enums/common-status.enum';
import { UserClickOn } from '@app/enums/user-click-on.enum';
import { AdminGenericComponent } from '@app/generics/admin-generic-component';
import { CommonUtils } from '@app/helpers/common-utils';
import { SearchColumnConfigMap } from '@app/interfaces/i-search-column-config';
import { SortEvent } from '@app/interfaces/sort-event';
import { Penalty } from '@app/models/penalty';
import { IMenuItem } from '@app/modules/context-menu/interfaces/i-menu-item';
import { DialogService } from '@app/services/dialog.service';
import { LangService } from '@app/services/lang.service';
import { LookupService } from '@app/services/lookup.service';
import { PenaltyService } from '@app/services/penalty.service';
import { TableComponent } from '@app/shared/components/table/table.component';
import { DialogRef } from '@app/shared/models/dialog-ref';
import { CustomValidators } from '@app/validators/custom-validators';
import { catchError, exhaustMap, filter, of, Subject, switchMap, takeUntil } from 'rxjs';

@Component({
  selector: 'penalty',
  templateUrl: 'penalty.component.html',
  styleUrls: ['penalty.component.scss']
})
export class PenaltyComponent extends AdminGenericComponent<Penalty, PenaltyService> {
  usePagination = true;

  lang = inject(LangService);
  service = inject(PenaltyService);
  fb = inject(FormBuilder);
  lookupService = inject(LookupService);
  dialog = inject(DialogService);

  constructor() {
    super();
  }

  protected _init(): void {
    this.listenToView();
    this.buildFilterForm()
  }

  @ViewChild('table') table!: TableComponent;
  displayedColumns: (keyof Penalty | 'actions')[] = ['penaltyAr', 'penaltyEn', 'status', 'actions'];
  searchColumns: string[] = ['search_penaltyAr', 'search_penaltyEn', 'search_status',];
  searchColumnsConfig: SearchColumnConfigMap = {
    search_penaltyAr: {
      key: 'penaltyAr',
      controlType: 'text',
      property: 'penaltyAr',
      label: 'arabic_name',
      maxLength: CustomValidators.defaultLengths.ARABIC_NAME_MAX
    },
    search_penaltyEn: {
      key: 'penaltyEn',
      controlType: 'text',
      property: 'penaltyEn',
      label: 'english_name',
      maxLength: CustomValidators.defaultLengths.ENGLISH_NAME_MAX
    },
    search_status: {
      key: 'status',
      controlType: 'select',
      property: 'status',
      label: 'lbl_status',
      selectOptions: {
        options: this.lookupService.listByCategory.CommonStatus.filter(status => !status.isRetiredCommonStatus()),
        labelProperty: 'getName',
        optionValueKey: 'lookupKey'
      }
    }

  }

  view$: Subject<Penalty> = new Subject<Penalty>();
  actions: IMenuItem<Penalty>[] = [
    // edit
    {
      type: 'action',
      label: 'btn_edit',
      icon: ActionIconsEnum.EDIT,
      onClick: (item: Penalty) => this.edit$.next(item)
    },
    // view
    {
      type: 'action',
      label: 'view',
      icon: ActionIconsEnum.VIEW,
      onClick: (item: Penalty) => this.view$.next(item)
    },
    // delete
    {
      type: 'action',
      label: 'btn_delete',
      icon: ActionIconsEnum.DELETE,
      onClick: (item: Penalty) => this.delete(item)
    },
    // activate
    {
      type: 'action',
      icon: 'mdi-list-status',
      label: 'btn_activate',
      displayInGrid: false,
      onClick: (item: Penalty) => this.updateStatus(item),
      show: (item) => {
        return item.status === CommonStatusEnum.DEACTIVATED;
      }
    },
    // deactivate
    {
      type: 'action',
      icon: 'mdi-list-status',
      label: 'btn_deactivate',
      displayInGrid: false,
      onClick: (item: Penalty) => this.updateStatus(item),
      show: (item) => {
        return item.status === CommonStatusEnum.ACTIVATED;
      }
    }

  ];
  sortingCallbacks = {
    statusInfo: (a: Penalty, b: Penalty, dir: SortEvent): number => {
      let value1 = !CommonUtils.isValidValue(a) ? '' : a.statusInfo?.getName().toLowerCase(),
        value2 = !CommonUtils.isValidValue(b) ? '' : b.statusInfo?.getName().toLowerCase();
      return CommonUtils.getSortValue(value1, value2, dir.direction);
    }
  }
  afterReload(): void {
    this.table && this.table.clearSelection();
  }

  listenToView(): void {
    this.view$
      .pipe(takeUntil(this.destroy$))
      .pipe(exhaustMap((model) => {
        return this.service.openViewDialog(model.id).pipe(catchError(_ => of(null)))
      }))
      .pipe(filter((dialog): dialog is DialogRef => !!dialog))
      .pipe(switchMap(dialog => dialog.onAfterClose$))
      .subscribe(() => this.reload$.next(null))
  }
  buildFilterForm() {
    this.columnFilterForm = this.fb.group({
      penaltyAr: [''], penaltyEn: [''], status: [null]
    })
  }
  delete(model: Penalty): void {
    const message = this.lang.map.msg_confirm_delete_x.change({x: model.getName()});
    this.dialog.confirm(message)
      .onAfterClose$.subscribe((click: UserClickOn) => {
      if (click === UserClickOn.YES) {
        const sub = model.delete().subscribe(() => {
          // @ts-ignore
          this.toast.success(this.lang.map.msg_delete_x_success.change({x: model.getName()}));
          this.reload$.next(null);
          sub.unsubscribe();
        });
      }
    });
  }
}

