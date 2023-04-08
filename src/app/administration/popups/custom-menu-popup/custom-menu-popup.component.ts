import { iconsList } from './../../../resources/icons-list';
import { MenuItem } from '@app/models/menu-item';
import {CustomMenu} from '@app/models/custom-menu';
import {AfterViewInit, ChangeDetectorRef, Component, ElementRef, Inject, ViewChild} from '@angular/core';
import {UntypedFormBuilder, UntypedFormControl, UntypedFormGroup} from '@angular/forms';
import {Lookup} from '@app/models/lookup';
import {OperationTypes} from '@app/enums/operation-types.enum';
import {IDialogData} from '@app/interfaces/i-dialog-data';
import {LangService} from '@app/services/lang.service';
import {LookupService} from '@app/services/lookup.service';
import {ToastService} from '@app/services/toast.service';
import {DialogRef} from '@app/shared/models/dialog-ref';
import {DIALOG_DATA_TOKEN} from '@app/shared/tokens/tokens';
import {AdminGenericDialog} from '@app/generics/admin-generic-dialog';
import {Observable, Subject} from 'rxjs';
import {TabMap} from '@app/types/types';
import {CustomMenuUrlHandlerComponent} from '@app/administration/shared/custom-menu-url-handler/custom-menu-url-handler.component';
import {CommonUtils} from '@helpers/common-utils';
import {DialogService} from '@services/dialog.service';
import {CustomMenuComponent} from '@app/administration/pages/custom-menu/custom-menu.component';
import {UserTypes} from '@app/enums/user-types.enum';
import { MenuItemService } from '@app/services/menu-item.service';
import { CustomValidators } from '@app/validators/custom-validators';

@Component({
  selector: 'app-custom-menu-popup',
  templateUrl: './custom-menu-popup.component.html',
  styleUrls: ['./custom-menu-popup.component.scss'],
})
export class CustomMenuPopupComponent extends AdminGenericDialog<CustomMenu> implements AfterViewInit {
  form!: UntypedFormGroup;
  model!: CustomMenu;
  operation: OperationTypes;
  saveVisible = true;
  statuses: Lookup[] = this.lookupService.listByCategory.CommonStatus;
  menuTypes: Lookup[] = this.lookupService.listByCategory.MenuType;
  menuView: Lookup[] = this.lookupService.listByCategory.MenuView;
  userTypes: Lookup[] = this.lookupService.listByCategory.UserType.filter(x => x.lookupKey !== UserTypes.INTEGRATION_USER);
  parentMenu?: CustomMenu;
  defaultParent?:MenuItem;
  icons = iconsList
  defaultParents:MenuItem[] = [];
  selectedTabIndex$: Subject<number> = new Subject<number>();
  defaultSelectedTab: string = 'basic';

  tabsData: TabMap = {
    basic: {
      name: 'basic',
      langKey: 'lbl_basic_info',
      index: 0,
      validStatus: () => {
        if (this.readonly || this.isMainMenu()) {
          return true;
        }
        return this.form && this.form.valid;
      },
      isTouchedOrDirty: () => true
    },
    linkSettings: {
      name: 'linkSettings',
      langKey: 'link_settings',
      index: 1,
      validStatus: () => {
        if (this.readonly || !this.urlHandlerComponentRef || this.isMainMenu()) {
          return true;
        }
        return this.urlHandlerComponentRef.isValidUrl();
      },
      isTouchedOrDirty: () => {
        if (!this.urlHandlerComponentRef) {
          return false;
        }
        return this.urlHandlerComponentRef.isTouchedOrDirty();
      }
    },
    sub: {
      name: 'sub',
      langKey: 'sub_lists',
      index: 2,
      validStatus: () => true,
      isTouchedOrDirty: () => true
    }
  };

  @ViewChild('dialogContent') dialogContent!: ElementRef;
  @ViewChild('urlHandlerComponent') urlHandlerComponentRef!: CustomMenuUrlHandlerComponent;
  @ViewChild('customMenuChildren') customMenuChildrenRef!: CustomMenuComponent;

  constructor(public dialogRef: DialogRef,
              public fb: UntypedFormBuilder,
              public lang: LangService,
              private cd: ChangeDetectorRef,
              @Inject(DIALOG_DATA_TOKEN) data: IDialogData<CustomMenu>,
              private toast: ToastService,
              private dialogService: DialogService,
              private lookupService: LookupService,
              private menuItemService: MenuItemService) {
    super();
    this.model = data.model;
    this.operation = data.operation;
    this.parentMenu = data.parentMenu;
    this.defaultSelectedTab = data.selectedTab ?? 'basic';

  }
  private _updateDefaultParentValidity() {
    this.systemMenuKeyControl.setValidators([CustomValidators.required])
    this.systemMenuKeyControl.updateValueAndValidity();
  }
  initPopup(): void {
  }

  private _afterViewInit(): void {
    if (this.operation === OperationTypes.UPDATE) {
      this.displayFormValidity(null, this.dialogContent.nativeElement);
    }

    this.handleDisableFields();

    if (this.readonly || this.isMainMenu()) {
      this.form.disable();
      this.saveVisible = false;
      this.validateFieldsVisible = false;
    }

  }

  handleDisableFields() {
    if (this.readonly) {
      this.form.disable();
      return;
    }
    if (!this.model?.isParentMenu()) {
      this._disableDependentFields();
    } else {
      if (!!this.model.id && (this.hasChildren || this.model.isSystem)) {
        this._disableDependentFields();
      } else {
        this._enableDependentFields();
      }
    }
  }

  private _disableDependentFields() {
    this.childrenDependentFields.forEach((field) => field.disable());
  }

  private _enableDependentFields() {
    this.childrenDependentFields.forEach((field) => field.enable());
  }

  get childrenDependentFields(): UntypedFormControl[] {
    let fields: UntypedFormControl[] = [];
    const isCustomMenu = this.parentMenu instanceof CustomMenu;
    if(isCustomMenu){
      if (this.parentMenu && !this.parentMenu.isActive()) {
        fields = [this.statusControl];
      }
    }
    if(this.parentMenu?.isSystem){
      return fields;
    }

    return fields.concat([this.menuTypeControl, this.menuViewControl, this.userTypeControl]);
  }

  ngAfterViewInit(): void {
    this._setDefaultSelectedTab();
    this._afterViewInit();
    this.cd.detectChanges();

  }

  get readonly(): boolean {
    return this.operation === OperationTypes.VIEW ;
  }

  get hasChildren(): boolean {
    if (!this.customMenuChildrenRef) {
      return false;
    }
    return this.customMenuChildrenRef.models.length > 0;
  }

  buildForm(): void {
    this.form = this.fb.group(this.model.buildForm(true));
    if(this.isDefaultParent() ){
      this._addDefaultParents();
      this._updateDefaultParentValidity();
    }
  }

  setDialogButtonsVisibility(tab: any): void {
    if(!this.isMainMenu()){
      this.saveVisible = (tab.name && tab.name !== this.tabsData.sub.name);
      this.validateFieldsVisible = (tab.name && tab.name !== this.tabsData.sub.name);
    }

  }

  getTabInvalidStatus(tabName: string): boolean {
    return !this.tabsData[tabName].validStatus();
  }

  beforeSave(model: CustomMenu, form: UntypedFormGroup): Observable<boolean> | boolean {
    const invalidTabs = this._getInvalidTabs();
    if (invalidTabs.length > 0) {
      const listHtml = CommonUtils.generateHtmlList(this.lang.map.msg_following_tabs_valid, invalidTabs);
      this.dialogService.error(listHtml.outerHTML);
      return false;
    }
    return true;
  }

  prepareModel(model: CustomMenu, form: UntypedFormGroup): Observable<CustomMenu> | CustomMenu {
    let value = (new CustomMenu()).clone({...model, ...form.getRawValue()});
    value.menuURL = this.urlHandlerComponentRef ? this.urlHandlerComponentRef.menuUrlControl.value : '';
    value.urlParamsParsed = this.urlHandlerComponentRef ? this.urlHandlerComponentRef.variableList : [];
    if(!!this.defaultParent){
      value.parentMenuItemId = -1;
      value.systemMenuKey = this.defaultParent.menuKey
    }
    return value;
  }

  afterSave(model: CustomMenu, dialogRef: DialogRef): void {
    const message = this.operation === OperationTypes.CREATE ? this.lang.map.msg_create_x_success : this.lang.map.msg_update_x_success;
    this.operation === this.operationTypes.CREATE
      ? this.toast.success(message.change({x: this.form.controls[this.lang.map.lang + 'Name'].value}))
      : this.toast.success(message.change({x: model.getName()}));
    this.model = model;
    this.operation = OperationTypes.UPDATE;
    this.customMenuChildrenRef && this.customMenuChildrenRef.reload$.next(null);
    dialogRef.close(model);
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

  private _setDefaultSelectedTab(): void {
    setTimeout(() => {
      if (this.tabsData.hasOwnProperty(this.defaultSelectedTab) && this.tabsData[this.defaultSelectedTab]) {
        const index = this.defaultSelectedTab === 'basic' ? 0 : 2;
        this.selectedTabIndex$.next(index);
      }
    });
  }

  get statusControl(): UntypedFormControl {
    return this.form.get('status') as UntypedFormControl;
  }

  get menuViewControl(): UntypedFormControl {
    return this.form.get('menuView') as UntypedFormControl;
  }

  get menuTypeControl(): UntypedFormControl {
    return this.form.get('menuType') as UntypedFormControl;
  }

  get userTypeControl(): UntypedFormControl {
    return this.form.get('userType') as UntypedFormControl;
  }
  get systemMenuKeyControl(): UntypedFormControl {
    return this.form.get('systemMenuKey') as UntypedFormControl;
  }
  getTranslatedStatus() {
    return !!this.statusControl.value ? this.lang.map.lbl_active : this.lang.map.lbl_inactive;
  }

  getTranslatedMenuView() {
    return !!this.menuViewControl.value ? this.lang.map.private_menu : this.lang.map.public_menu;
  }

  private _getInvalidTabs(): any {
    let failedList: string[] = [];
    for (const key in this.tabsData) {
      if (!(this.tabsData[key].validStatus())) {
        // @ts-ignore
        failedList.push(this.lang.map[this.tabsData[key].langKey]);
      }
    }
    return failedList;
  }
  private _addDefaultParents() {
    this.defaultParents = this.menuItemService.parents
      .filter((x) => !x.customMenu && !x.excludeFromDefaultParents)
      .sort((a, b) => a.defaultId! - b.defaultId!);
  }
  isDefaultParent(){
    return this.parentMenu && this.parentMenu.isDefaultItem();
  }
  isMainMenu(){
    return this.model.isDefaultItem();
  }
}
