import { Component } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { ActionIconsEnum } from '@app/enums/action-icons-enum';
import { AdminGenericComponent } from '@app/generics/admin-generic-component';
import { CommonUtils } from '@app/helpers/common-utils';
import { SearchColumnConfigMap } from '@app/interfaces/i-search-column-config';
import { SortEvent } from '@app/interfaces/sort-event';
import { IMenuItem } from '@app/modules/context-menu/interfaces/i-menu-item';
import { LangService } from '@app/services/lang.service';
import { LookupService } from '@app/services/lookup.service';
import { NpoDataService } from '@app/services/npo-data.service';
import { DialogRef } from '@app/shared/models/dialog-ref';
import { CustomValidators } from '@app/validators/custom-validators';
import { NpoData } from '@models/npo-data';
import { of, Subject } from 'rxjs';
import { catchError, exhaustMap, filter, switchMap, takeUntil } from 'rxjs/operators';

@Component({
    selector: 'npo-profile',
    templateUrl: 'npo-profile.component.html',
    styleUrls: ['npo-profile.component.scss']
})
export class NpoProfileComponent extends AdminGenericComponent<NpoData, NpoDataService> {
  usePagination = true;
  actions: IMenuItem<NpoData>[] = [
    // view
    {
      type: 'action',
      label: 'view',
      icon: ActionIconsEnum.VIEW,
      onClick: (item: NpoData) => this.view$.next(item),
      show:(item:NpoData) => item.canView
    },

  ];
  displayedColumns: string[] = ['arName', 'enName','profileId','status', 'actions'];
  searchColumns: string[] = ['search_arName', 'search_enName', '_','search_status', 'search_actions'];

  searchColumnsConfig: SearchColumnConfigMap = {
    search_arName: {
      key: 'arName',
      controlType: 'text',
      property: 'arName',
      label: 'arabic_name',
      maxLength: CustomValidators.defaultLengths.ARABIC_NAME_MAX
    },
    search_enName: {
      key: 'enName',
      controlType: 'text',
      property: 'enName',
      label: 'english_name',
      maxLength: CustomValidators.defaultLengths.ENGLISH_NAME_MAX
    },

    search_status: {
      key: 'status',
      controlType: 'select',
      property: 'status',
      label: 'lbl_status',
      selectOptions: {
        options: this.lookupService.listByCategory.ProfileStatus.filter(status => !status.isRetiredCommonStatus()),
        labelProperty: 'getName',
        optionValueKey: 'lookupKey'
      }
    }
  }

  view$: Subject<NpoData> = new Subject<NpoData>();

  constructor(public service: NpoDataService,
              public lang: LangService,
              private lookupService: LookupService,
              private fb:FormBuilder) {
    super();
  }

  protected _init(): void {
    this.listenToView();
    this.buildFilterForm();
  }

  sortingCallbacks = {
    status: (a: NpoData, b: NpoData, dir: SortEvent): number => {
      let value1 = !CommonUtils.isValidValue(a) ? '' : a.statusInfo?.getName().toLowerCase(),
        value2 = !CommonUtils.isValidValue(b) ? '' : b.statusInfo?.getName().toLowerCase();
      return CommonUtils.getSortValue(value1, value2, dir.direction);
    }
  }

  listenToView(): void {
    this.view$.pipe(
      takeUntil(this.destroy$),
      exhaustMap((model) => {
        return this.service.openViewDialog(model.id).pipe(catchError((_) => of(null)));
      })
    )
      .pipe(
        filter((dialog): dialog is DialogRef => !!dialog),
        switchMap((dialog) => dialog.onAfterClose$)
      )
      .subscribe(() => this.reload$.next(null));
  }

  buildFilterForm() {
    this.columnFilterForm = this.fb.group({
      arName: [''], enName: [''],status:[null]
    })
  }

}
