import { Component, Input, ViewChild } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { ActionIconsEnum } from '@app/enums/action-icons-enum';
import { AdminGenericComponent } from '@app/generics/admin-generic-component';
import { CommonUtils } from '@app/helpers/common-utils';
import { SearchColumnConfigMap } from '@app/interfaces/i-search-column-config';
import { SortEvent } from '@app/interfaces/sort-event';
import { InspectionOperation } from '@app/models/inspection-operation';
import { IMenuItem } from '@app/modules/context-menu/interfaces/i-menu-item';
import { InspectionOperationService } from '@app/services/inspection-operation.service';
import { LangService } from '@app/services/lang.service';
import { TableComponent } from '@app/shared/components/table/table.component';
import { DialogRef } from '@app/shared/models/dialog-ref';
import { TabMap } from '@app/types/types';
import { CustomValidators } from '@app/validators/custom-validators';
import { Subject, of } from 'rxjs';
import { catchError, exhaustMap, filter, map, switchMap, takeUntil } from 'rxjs/operators';

@Component({
    selector: 'inspection-operation',
    templateUrl: 'inspection-operation.component.html',
    styleUrls: ['inspection-operation.component.scss']
})
export class InspectionOperationComponent extends AdminGenericComponent<InspectionOperation, InspectionOperationService> {
  usePagination = true;
  @Input() parentId?: number;
  @Input() readonly: boolean = false;
  
  constructor(public lang: LangService,
              public service: InspectionOperationService,
              private fb:FormBuilder) {
    super();
  }

  protected _init(): void {
    this.listenToView();
    this.buildFilterForm()
  }

  @ViewChild('table') table!: TableComponent;
  displayedColumns: string[] = ['arName', 'egName', 'department',  'actions'];
  searchColumns: string[] = [ 'search_arName', 'search_egName'];
  searchColumnsConfig: SearchColumnConfigMap = {
    search_arName: {
      key: 'arName',
      controlType: 'text',
      property: 'arName',
      label: 'arabic_name',
      maxLength: CustomValidators.defaultLengths.ARABIC_NAME_MAX
    },
    search_egName: {
      key: 'egName',
      controlType: 'text',
      property: 'egName',
      label: 'english_name',
      maxLength: CustomValidators.defaultLengths.ENGLISH_NAME_MAX
    }

  }

  view$: Subject<InspectionOperation> = new Subject<InspectionOperation>();
  actions: IMenuItem<InspectionOperation>[] = [
    // edit
    {
      type: 'action',
      label: 'btn_edit',
      icon: 'mdi-pen',
      onClick: (item: InspectionOperation) => this.edit$.next(item)
    },
    // view
    {
      type: 'action',
      label: 'view',
      icon: 'mdi-eye',
      onClick: (item: InspectionOperation) => this.view$.next(item)
    },
     // children
     {
      type: 'action',
      label: (_item) => {
        return this.lang.map.lbl_children_x;
      },
      icon: ActionIconsEnum.CHILD_ITEMS,
      show: (item) => {
        return !item.parentId ;
      },
      onClick: (item) => this.showChildren(item)
    },
  ];

  sortingCallbacks = {
    department: (a: InspectionOperation, b: InspectionOperation, dir: SortEvent): number => {
      let value1 = !CommonUtils.isValidValue(a) ? '' : a.departmentInfo?.getName().toLowerCase(),
        value2 = !CommonUtils.isValidValue(b) ? '' : b.departmentInfo?.getName().toLowerCase();
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
      arName: [''], egName: [''],parentId:[this.parentId]
    })
  }
  showChildren(item: InspectionOperation, $event?: Event): void {
    $event?.preventDefault();

    this.service.openChildrenDialog(this.models.filter(model => model.parentId === item.id))
    .pipe(filter((dialog): dialog is DialogRef => !!dialog))
    .pipe(switchMap(dialog => dialog.onAfterClose$))
    .subscribe(() => this.reload$.next(null))
  }

  listenToAdd(): void {
    this.add$
      .pipe(takeUntil(this.destroy$))
      .pipe(filter(() => !this.readonly))
      .pipe(exhaustMap(() => this.service.openCreateDialog(this.parentId).onAfterClose$))
      .subscribe(() => this.reload$.next(null));
  }
  listenToReload() {
    this.reload$
      .pipe(takeUntil((this.destroy$)))
      .pipe(
        map(() => {
          const paginationOptions = {
            limit: this.pageEvent.pageSize,
            offset: (this.pageEvent.pageIndex * this.pageEvent.pageSize)
          }
          const criteria = !!this.parentId ? {parentId : this.parentId}:{parentId : null}
          if (this.usePagination) {
            return this.service.loadByFilterPaginate(paginationOptions,criteria).pipe(
              map((res) => {
                this.count = res.count;
                return res.rs;
              }));
          } else {
          
            return (this.useCompositeToLoad ? this.service.paginateComposite(paginationOptions) : this.service.paginate(paginationOptions))
            .pipe(map((res) => {
              this.count = res.count;
              return res.rs;
            }))
          }
        }),
        switchMap((finalRequest) => {
          return finalRequest.pipe(
            catchError(() => {
              this.count = 0;
              return of([]);
            })
          );
        }))
      .subscribe((list: InspectionOperation[]) => {
        this.models = list;
        this.afterReload();
      })
  }

  get mainOperations() {
    return this.models.filter(model => !model.parentId);
  }
  get supOperations() {
    return this.models.filter(model => !!model.parentId);
  }
  tabsData: TabMap = {
    mainOperations: {
      name: 'mainOperationsTab',
      langKey: 'lbl_main_operations',
      index: 0,
      checkTouchedDirty: false,
      isTouchedOrDirty: () => false,
      show: () => true,
      validStatus: () => true
    },
    subOperations: {
      name: 'subOperationsTab',
      langKey: 'lbl_sub_operations',
      index: 0,
      checkTouchedDirty: false,
      isTouchedOrDirty: () => false,
      show: () => true,
      validStatus: () => true
    },
  
  };
}
