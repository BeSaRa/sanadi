import { Component, Inject, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { OperationTypes } from '@app/enums/operation-types.enum';
import { AdminGenericDialog } from '@app/generics/admin-generic-dialog';
import { IDialogData } from '@app/interfaces/i-dialog-data';
import { FormManager } from '@app/models/form-manager';
import { Lookup } from '@app/models/lookup';
import { MenuItemList } from '@app/models/menu-item-list';
import { LangService } from '@app/services/lang.service';
import { LookupService } from '@app/services/lookup.service';
import { MenuItemListService } from '@app/services/menu-item-list.service';
import { ToastService } from '@app/services/toast.service';
import { DialogRef } from '@app/shared/models/dialog-ref';
import { DIALOG_DATA_TOKEN } from '@app/shared/tokens/tokens';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-menu-sub-list-item-popup',
  templateUrl: './menu-sub-list-item-popup.component.html',
  styleUrls: ['./menu-sub-list-item-popup.component.css'],
})
export class MenuSubListItemPopupComponent extends AdminGenericDialog<MenuItemList> {
  form!: UntypedFormGroup;
  fm!: FormManager;
  model!: MenuItemList;
  operation: OperationTypes;
  saveVisible = true;
  statuses: Lookup[] = this.lookupService.listByCategory.CommonStatus;
  menuTypes: Lookup[] = this.lookupService.listByCategory.MenuType;
  menuView: Lookup[] = this.lookupService.listByCategory.MenuView;
  userTypes: Lookup[] = this.lookupService.listByCategory.PermissionCategory;
  constructor(
    public dialogRef: DialogRef,
    public fb: UntypedFormBuilder,
    public lang: LangService,
    @Inject(DIALOG_DATA_TOKEN) data: IDialogData<MenuItemList>,
    private toast: ToastService,
    private lookupService: LookupService,
    private menuListItemService: MenuItemListService
  ) {
    super();
    this.model = data.model;
    this.operation = data.operation;
  }
  get readonly(): boolean {
    return this.operation === OperationTypes.VIEW;
  }
  initPopup(): void {}
  destroyPopup(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.destroy$.unsubscribe();
  }
  afterSave(model: MenuItemList, dialogRef: DialogRef): void {
    const message =
      this.operation === OperationTypes.CREATE
        ? this.lang.map.msg_create_x_success
        : this.lang.map.msg_update_x_success;
    this.operation === this.operationTypes.CREATE
      ? this.toast.success(
          message.change({
            x: this.form.controls[this.lang.map.lang + 'Name'].value,
          })
        )
      : this.toast.success(message.change({ x: model.getName() }));
    this.model = model;
    this.model.parentMenuItemId = this.model.id;
    this.operation = OperationTypes.UPDATE;
    dialogRef.close(model);
  }
  beforeSave(
    model: MenuItemList,
    form: UntypedFormGroup
  ): boolean | Observable<boolean> {
    return form.valid;
  }
  prepareModel(
    model: MenuItemList,
    form: UntypedFormGroup
  ): MenuItemList | Observable<MenuItemList> {
    return new MenuItemList().clone({
      ...model,
      ...form.value,
    });
  }
  saveFail(error: Error): void {}
  buildForm(): void {
    this.form = this.fb.group(this.model.buildForm(true));
    this.fm = new FormManager(this.form, this.lang);
    if (this.operation === OperationTypes.UPDATE) {
      this.fm.displayFormValidity();
    }
    if (this.readonly) {
      this.form.disable();
      this.saveVisible = false;
      this.validateFieldsVisible = false;
    }
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
  }

}
