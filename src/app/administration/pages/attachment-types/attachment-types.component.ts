import {catchError, exhaustMap, filter, switchMap, takeUntil} from 'rxjs/operators';
import {DialogRef} from './../../../shared/models/dialog-ref';
import {of, Subject, Subscription} from 'rxjs';
import {Component, ViewChild} from '@angular/core';
import {LangService} from '@app/services/lang.service';
import {AttachmentType} from '@app/models/attachment-type';
import {AttachmentTypeService} from '@app/services/attachment-type.service';
import {FormBuilder, UntypedFormControl} from '@angular/forms';
import {UserClickOn} from '@app/enums/user-click-on.enum';
import {DialogService} from '@app/services/dialog.service';
import {SharedService} from '@app/services/shared.service';
import {ToastService} from '@app/services/toast.service';
import {CommonStatusEnum} from '@app/enums/common-status.enum';
import {SortEvent} from '@app/interfaces/sort-event';
import {CommonUtils} from '@app/helpers/common-utils';
import {TableComponent} from '@app/shared/components/table/table.component';
import {AdminGenericComponent} from '@app/generics/admin-generic-component';
import {IMenuItem} from '@app/modules/context-menu/interfaces/i-menu-item';
import {ActionIconsEnum} from '@app/enums/action-icons-enum';
import { SearchColumnConfigMap } from '@app/interfaces/i-search-column-config';
import { CustomValidators } from '@app/validators/custom-validators';
import { LookupService } from '@app/services/lookup.service';

@Component({
  selector: 'attachment-types',
  templateUrl: './attachment-types.component.html',
  styleUrls: ['./attachment-types.component.scss']
})
export class AttachmentTypesComponent extends AdminGenericComponent<AttachmentType, AttachmentTypeService> {
  usePagination = true;
  list: AttachmentType[] = [];
  displayedColumns = ['arName', 'enName', 'status', 'actions'];
  searchColumns: string[] = ['search_arName', 'search_enName', 'search_status', 'search_actions'];
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
        options: this.lookupService.listByCategory.CommonStatus.filter(status => !status.isRetiredCommonStatus()),
        labelProperty: 'getName',
        optionValueKey: 'lookupKey'
      }
    }
  }

  reloadSubscription!: Subscription;
  filterControl: UntypedFormControl = new UntypedFormControl('');
  commonStatus = CommonStatusEnum;
  view$: Subject<AttachmentType> = new Subject<AttachmentType>();

  actions: IMenuItem<AttachmentType>[] = [
    // edit
    {
      type: 'action',
      label: 'btn_edit',
      icon: ActionIconsEnum.EDIT,
      onClick: (item: AttachmentType) => this.edit$.next(item)
    },
    // view
    {
      type: 'action',
      icon: ActionIconsEnum.VIEW,
      label: 'view',
      onClick: (item: AttachmentType) => this.view$.next(item)
    },
    // logs
    {
      type: 'action',
      icon: ActionIconsEnum.HISTORY,
      label: 'show_logs',
      onClick: (item: AttachmentType) => this.showAuditLogs(item)
    },
    // activate
    {
      type: 'action',
      icon: ActionIconsEnum.STATUS,
      label: 'btn_activate',
      onClick: (item: AttachmentType) => this.toggleStatus(item),
      displayInGrid: false,
      show: (item) => {
        return item.status !== CommonStatusEnum.RETIRED && item.status === CommonStatusEnum.DEACTIVATED;
      }
    },
    // deactivate
    {
      type: 'action',
      icon: ActionIconsEnum.STATUS,
      label: 'btn_deactivate',
      onClick: (item: AttachmentType) => this.toggleStatus(item),
      displayInGrid: false,
      show: (item) => {
        return item.status !== CommonStatusEnum.RETIRED && item.status === CommonStatusEnum.ACTIVATED;
      }
    }
  ];
  commonStatusEnum = CommonStatusEnum;

  @ViewChild('table') table!: TableComponent;

  constructor(public lang: LangService,
    public service: AttachmentTypeService,
    private dialogService: DialogService,
    private sharedService: SharedService,
    private toast: ToastService,
    private lookupService: LookupService,
    private fb: FormBuilder) {
    super();
  }

  protected _init() {
    this.listenToView();
    this.buildFilterForm()
  }
  get selectedRecords(): AttachmentType[] {
    return this.table.selection.selected;
  }

  sortingCallbacks = {
    statusInfo: (a: AttachmentType, b: AttachmentType, dir: SortEvent): number => {
      let value1 = !CommonUtils.isValidValue(a) ? '' : a.statusInfo?.getName().toLowerCase(),
        value2 = !CommonUtils.isValidValue(b) ? '' : b.statusInfo?.getName().toLowerCase();
      return CommonUtils.getSortValue(value1, value2, dir.direction);
    }
  };

  delete(model: AttachmentType, event?: MouseEvent): void {
    event?.preventDefault();
    // @ts-ignore
    const message = this.lang.map.msg_confirm_delete_x.change({ x: model.getName() });
    this.dialogService.confirm(message)
      .onAfterClose$.subscribe((click: UserClickOn) => {
        if (click === UserClickOn.YES) {
          const sub = model.delete().subscribe(() => {
            // @ts-ignore
            this.toast.success(this.lang.map.msg_delete_x_success.change({ x: model.getName() }));
            this.reload$.next(null);
            sub.unsubscribe();
          });
        }
      });
  }

  listenToView(): void {
    this.view$
      .pipe(takeUntil(this.destroy$))
      .pipe(exhaustMap((model) => {
        return this.service.openViewDialog(model.id).pipe(catchError(_ => of(null)));
      }))
      .pipe(filter((dialog): dialog is DialogRef => !!dialog))
      .pipe(switchMap(dialog => dialog.onAfterClose$))
      .subscribe(() => this.reload$.next(null));
  }

  deleteBulk($event: MouseEvent): void {
    $event.preventDefault();
    if (this.selectedRecords.length > 0) {
      const message = this.lang.map.msg_confirm_delete_selected;
      this.dialogService.confirm(message)
        .onAfterClose$.subscribe((click: UserClickOn) => {
          if (click === UserClickOn.YES) {
            const ids = this.selectedRecords.map((item) => {
              return item.id;
            });
            const sub = this.service.deleteBulk(ids).subscribe((response) => {
              this.sharedService.mapBulkResponseMessages(this.selectedRecords, 'id', response)
                .subscribe(() => {
                  this.reload$.next(null);
                  sub.unsubscribe();
                });
            });
          }
        });
    }
  }

  toggleStatus(model: AttachmentType) {
    model.status == CommonStatusEnum.ACTIVATED ? model.status = CommonStatusEnum.DEACTIVATED : model.status = CommonStatusEnum.ACTIVATED;
    model.update()
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.toast.success(this.lang.map.msg_status_x_updated_success.change({ x: model.getName() }));
        this.reload$.next(null);
      }, () => {
        this.toast.error(this.lang.map.msg_status_x_updated_fail.change({ x: model.getName() }));
        this.reload$.next(null);
      });
  }

  buildFilterForm() {
    this.columnFilterForm = this.fb.group({
      arName: [''], enName: [''], status: [null]
    })
  }
}
