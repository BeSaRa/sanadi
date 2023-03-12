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
import { Observable } from 'rxjs';

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
  constructor(public dialogRef: DialogRef,
              public fb: UntypedFormBuilder,
              public lang: LangService,
              private cd: ChangeDetectorRef,
              @Inject(DIALOG_DATA_TOKEN) data: IDialogData<{
                parent:MenuItem
              }>,
              private menuItemService:MenuItemService
             ) {
    super();
    this.operation = data.operation;
    this.parentMenu = data.parentMenu;
    this.children = this.menuItemService.menuItems.filter(item => item.parent === data.parent.id);
    }

  initPopup(): void {
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
    return this.operation === OperationTypes.VIEW;
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
}
