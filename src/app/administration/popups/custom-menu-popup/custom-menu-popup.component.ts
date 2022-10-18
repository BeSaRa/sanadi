import {HttpClient} from '@angular/common/http';
import {DialogService} from '@services/dialog.service';
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
import {Observable, of, Subject} from 'rxjs';
import {catchError, filter, switchMap, takeUntil, tap} from 'rxjs/operators';
import {CustomMenuService} from '@services/custom-menu.service';
import {SharedService} from '@app/services/shared.service';
import {TabMap} from '@app/types/types';
import {ExceptionHandlerService} from '@services/exception-handler.service';
import {CommonUtils} from '@helpers/common-utils';

@Component({
  selector: 'app-custom-menu-popup',
  templateUrl: './custom-menu-popup.component.html',
  styleUrls: ['./custom-menu-popup.component.css'],
})
export class CustomMenuPopupComponent extends AdminGenericDialog<CustomMenu> implements AfterViewInit {
  form!: UntypedFormGroup;
  model!: CustomMenu;
  operation: OperationTypes;
  saveVisible = true;
  statuses: Lookup[] = this.lookupService.listByCategory.CommonStatus;
  menuTypes: Lookup[] = this.lookupService.listByCategory.MenuType;
  menuView: Lookup[] = this.lookupService.listByCategory.MenuView;
  userTypes: Lookup[] = this.lookupService.listByCategory.PermissionCategory;
  isValidURL: boolean = false;

  selectedTabIndex$: Subject<number> = new Subject<number>();
  defaultSelectedTab: string = 'basic';

  tabsData: TabMap = {
    basic: {
      name: 'basic',
      langKey: 'lbl_basic_info',
      index: 0,
      validStatus: () => {
        if (this.readonly) {
          return true;
        }
        return this.form && this.form.valid;
      },
      isTouchedOrDirty: () => true
    },
    linkSettings: {name: 'linkSettings', langKey: 'link_settings', index: 1, validStatus: () => true, isTouchedOrDirty: () => true},
    sub: {name: 'sub', langKey: 'sub_lists', index: 2, validStatus: () => true, isTouchedOrDirty: () => true}
  };

  @ViewChild('dialogContent') dialogContent!: ElementRef;

  constructor(public dialogRef: DialogRef,
              public fb: UntypedFormBuilder,
              public lang: LangService,
              private cd: ChangeDetectorRef,
              @Inject(DIALOG_DATA_TOKEN) data: IDialogData<CustomMenu>,
              private toast: ToastService,
              private lookupService: LookupService,
              private customMenuService: CustomMenuService,
              private dialogService: DialogService,
              private sharedService: SharedService,
              private exceptionHandlerService: ExceptionHandlerService,
              private http: HttpClient) {
    super();
    this.model = data.model;
    this.operation = data.operation;
    this.defaultSelectedTab = data.selectedTab ?? 'basic';
  }

  initPopup(): void {
  }

  private _afterViewInit(): void {
    if (this.operation === OperationTypes.UPDATE) {
      this.displayFormValidity(null, this.dialogContent.nativeElement);
    }

    if (this.readonly) {
      this.form.disable();
      this.saveVisible = false;
      this.validateFieldsVisible = false;
    }
  }

  ngAfterViewInit(): void {
    this._setDefaultSelectedTab();
    this._afterViewInit();
    this.cd.detectChanges();
  }

  get readonly(): boolean {
    return this.operation === OperationTypes.VIEW;
  }

  buildForm(): void {
    this.form = this.fb.group(this.model.buildForm(true));
  }

  setDialogButtonsVisibility(tab: any): void {
    this.saveVisible = (tab.name && tab.name !== this.tabsData.sub.name);
    this.validateFieldsVisible = (tab.name && tab.name !== this.tabsData.sub.name);
  }

  getTabInvalidStatus(tabName: string): boolean {
    return !this.tabsData[tabName].validStatus();
  }

  beforeSave(model: CustomMenu, form: UntypedFormGroup): Observable<boolean> | boolean {
    return form.valid;
  }

  prepareModel(model: CustomMenu, form: UntypedFormGroup): Observable<CustomMenu> | CustomMenu {
    return (new CustomMenu()).clone({...model, ...form.value});
  }

  afterSave(model: CustomMenu, dialogRef: DialogRef): void {
    const message = this.operation === OperationTypes.CREATE ? this.lang.map.msg_create_x_success : this.lang.map.msg_update_x_success;
    this.operation === this.operationTypes.CREATE
      ? this.toast.success(message.change({x: this.form.controls[this.lang.map.lang + 'Name'].value}))
      : this.toast.success(message.change({x: model.getName()}));
    this.model = model;
    this.operation = OperationTypes.UPDATE;
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

  get menuURLControl(): UntypedFormControl {
    return this.form.controls.menuURL as UntypedFormControl;
  }

  get statusControl(): UntypedFormControl {
    return this.form.get('status') as UntypedFormControl;
  }

  get menuViewControl(): UntypedFormControl {
    return this.form.get('menuView') as UntypedFormControl;
  }

  checkURL() {
    of(this.menuURLControl.value)
      .pipe(
        takeUntil(this.destroy$),
        filter(value => CommonUtils.isValidValue(value)),
        // set the url to exclude list to skip exception handling
        tap(() => {
          this.exceptionHandlerService.excludeHandlingForURL(this.menuURLControl.value);
        }),
        switchMap(() => this.http.get<any>(this.menuURLControl.value)),
        catchError(() => {
          // remove the url from exclude list
          this.exceptionHandlerService.removeExcludeHandlingForURL(this.menuURLControl.value);
          this.isValidURL = false;
          this.dialogService.error(this.lang.map.err_invalid_URL);
          return of('INVALID_URL');
        })
      ).subscribe((result) => {
      // remove the url from exclude list
      this.exceptionHandlerService.removeExcludeHandlingForURL(this.menuURLControl.value);
      if (result !== 'INVALID_URL') {
        this.isValidURL = true;
      }
    });
  }

  getTranslatedStatus() {
    return !!this.statusControl.value ? this.lang.map.lbl_active : this.lang.map.lbl_inactive;
  }

  getTranslatedMenuView() {
    return !!this.menuViewControl.value ? this.lang.map.private_menu : this.lang.map.public_menu;
  }
}
