import { DialogService } from '@app/services/dialog.service';
import { CustomMenuService } from '@services/custom-menu.service';
import { MenuItemService } from '@app/services/menu-item.service';
import { AfterViewInit, ChangeDetectorRef, Component, Inject } from '@angular/core';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import { OperationTypes } from '@app/enums/operation-types.enum';
import { AdminGenericDialog } from '@app/generics/admin-generic-dialog';
import { IDialogData } from '@app/interfaces/i-dialog-data';
import { CustomMenu } from '@app/models/custom-menu';
import { MenuItem } from '@app/models/menu-item';
import { LangService } from '@app/services/lang.service';
import { DialogRef } from '@app/shared/models/dialog-ref';
import { DIALOG_DATA_TOKEN } from '@app/shared/tokens/tokens';
import { BehaviorSubject, Observable, of, Subject } from 'rxjs';
import { IMenuItem } from '@app/modules/context-menu/interfaces/i-menu-item';
import { ActionIconsEnum } from '@app/enums/action-icons-enum';
import { CommonStatusEnum } from '@app/enums/common-status.enum';
import { catchError, exhaustMap, filter, map, switchMap, takeUntil } from 'rxjs/operators';
import { Pagination } from '@app/models/pagination';
import { UserClickOn } from '@app/enums/user-click-on.enum';

@Component({
  selector: 'app-custom-menu-defaults-popup',
  templateUrl: './custom-menu-defaults-popup.component.html',
  styleUrls: ['./custom-menu-defaults-popup.component.scss']
})
export class CustomMenuDefaultsPopupComponent extends AdminGenericDialog<CustomMenu> implements AfterViewInit {
  model!: CustomMenu;
  form!: UntypedFormGroup;
  children:MenuItem[] = [];
  operation: OperationTypes;
  saveVisible = true;
  parentMenu?: CustomMenu;
  displayedColumns: string[] = [ 'arName', 'enName', 'actions'];
  filterControl: UntypedFormControl = new UntypedFormControl('');
  reload$: BehaviorSubject<any> = new BehaviorSubject<any>(null);
  add$: Subject<any> = new Subject<any>();
  edit$: Subject<CustomMenu> = new Subject<CustomMenu>();
  view$: Subject<CustomMenu> = new Subject<CustomMenu>();

  parent!:MenuItem;
  selectedPopupTabName = 'basic'
  constructor(public dialogRef: DialogRef,
              public fb: UntypedFormBuilder,
              public lang: LangService,
              private cd: ChangeDetectorRef,
              @Inject(DIALOG_DATA_TOKEN) data: IDialogData<{
                parent:MenuItem
              }>,
              private menuItemService:MenuItemService,
              private service: CustomMenuService,
              private dialogService:DialogService
             ) {
    super();
    this.parent = data.parent
    this.operation = data.operation;
    this.parentMenu = data.parentMenu;
    this.children = this.menuItemService.menuItems.filter(item => item.parent === data.parent.id);
    }

  initPopup(): void {
    this.listenToAdd();
    this.listenToView();
    this.listenToEdit();

    this.listenToSave();
  }

  private _afterViewInit(): void {
    if (this.readonly) {
      this.saveVisible = false;
      this.validateFieldsVisible = false;
    }
  }

  ngAfterViewInit(): void {
    this._afterViewInit();
    this.cd.detectChanges();
  }

  get readonly(): boolean {
    return false;
  }

  buildForm(): void {
    this.form = this.fb.group({});
  }
  beforeSave(model: CustomMenu, form: UntypedFormGroup): Observable<boolean> | boolean {
    return true;
  }
  prepareModel(model: CustomMenu, form: UntypedFormGroup): CustomMenu | Observable<CustomMenu> {
    let value = (new CustomMenu()).clone();
    return value;
  }

  afterSave(model: CustomMenu, dialogRef: DialogRef): void {

  }

  saveFail(error: Error): void {
  }

  get popupTitle(): string {
    if (this.operation === OperationTypes.CREATE) {
      return this.lang.map.lbl_add_menu_item;
    } else if (this.operation === OperationTypes.UPDATE) {
      return this.lang.map.lbl_edit_menu_item;
    } else if (this.operation === OperationTypes.VIEW) {
      return this.lang.map.view;
    }
    return '';
  };

  destroyPopup(): void {

  }
  actions: IMenuItem<CustomMenu>[] = [
    // edit
    {
      type: 'action',
      label: 'btn_edit',
      icon: ActionIconsEnum.EDIT,
      onClick: (item: CustomMenu) => this.edit(item),
    },
    // view
    {
      type: 'action',
      label: 'view',
      icon: ActionIconsEnum.VIEW,
      onClick: (item: CustomMenu) => this.view(item),
    },
    // delete
    {
      type: 'action',
      label: 'btn_delete',
      icon: ActionIconsEnum.DELETE,
      onClick: (item) => this.delete(item),
    },

  ];
  // listenToReload(): void {
  //   this.reload$
  //     .pipe(takeUntil((this.destroy$)))
  //     .pipe(switchMap(() => {
  //       let load: Observable<Pagination<CustomMenu[]>>;
  //       const paginationOptions = {
  //         limit: this.pageEvent.pageSize,
  //         offset: (this.pageEvent.pageIndex * this.pageEvent.pageSize)
  //       };
  //       if (!!this.parent) {
  //         let criteria: Partial<ICustomMenuSearchCriteria> = {
  //           'parent-menu-item-id': this.parent.id
  //         };
  //         load = this.service.loadByCriteriaPaging(criteria, paginationOptions);
  //       } else {
  //         load = this.service.loadMain(paginationOptions);
  //       }
  //       return load.pipe(map((res) => {
  //           this.count = res.count;
  //           return res.rs;
  //         }),
  //         catchError(_ => {
  //           this.count = 0;
  //           return of([]);
  //         }));
  //     }))
  //     .subscribe((list: CustomMenu[]) => {
  //       this.models = list;
  //       this.afterReload();
  //     });
  // }

  afterReload(): void {
    // this.table && this.table.clearSelection();
    // this.listUpdated.emit(true);
  }

  listenToAdd(): void {
    this.add$
      .pipe(takeUntil(this.destroy$))
      .pipe(exhaustMap(() => this.service.openDefaultCreateDialog(this.parent).onAfterClose$))
      .subscribe(() => this.reload$.next(null));
  }

  listenToEdit(): void {
    this.edit$
      .pipe(takeUntil(this.destroy$))
      .pipe(exhaustMap((model) => {
        return this.service.openEditDialog(model.id, undefined, this.selectedPopupTabName).pipe(catchError(_ => of(null)));
      }))
      .pipe(filter((dialog): dialog is DialogRef => !!dialog))
      .pipe(switchMap(dialog => dialog.onAfterClose$))
      .subscribe(() => this.reload$.next(null));
  }

  listenToView(): void {
    this.view$
      .pipe(takeUntil(this.destroy$))
      .pipe(exhaustMap((model) => {
        return this.service.openViewDialog(model.id, undefined, this.selectedPopupTabName).pipe(catchError(_ => of(null)));
      }))
      .pipe(filter((dialog): dialog is DialogRef => !!dialog))
      .pipe(switchMap(dialog => dialog.onAfterClose$))
      .subscribe(() => this.reload$.next(null));
  }

  edit(model: CustomMenu): void {
    this.selectedPopupTabName = 'basic';
    this.edit$.next(model);
  }

  view(model: CustomMenu): void {
    this.selectedPopupTabName = 'basic';
    this.view$.next(model);
  }

  showChildren(item: CustomMenu): void {
    this.selectedPopupTabName = 'sub';
    if (this.readonly) {
      this.view$.next(item);
    } else {
      this.edit$.next(item);
    }
  }
  showDefaultsChildren(item:MenuItem){
    return this.service.openDefaultChildrenViewDialog(item)
    .pipe(catchError(_ => of(null)))

  .pipe(filter((dialog): dialog is DialogRef => !!dialog))
  .pipe(switchMap(dialog => dialog.onAfterClose$))
  .subscribe(() => this.reload$.next(null));
  }
  delete(model: CustomMenu): void {
    const message = this.lang.map.msg_confirm_delete_x.change({x: model.getName()});
    this.dialogService.confirm(message)
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
