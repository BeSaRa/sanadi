import {AfterViewInit, ChangeDetectorRef, Component, Inject, ViewChild} from '@angular/core';
import {DIALOG_DATA_TOKEN} from '@app/shared/tokens/tokens';
import {IDialogData} from '@contracts/i-dialog-data';
import {AdminLookup} from '@app/models/admin-lookup';
import {LangService} from '@services/lang.service';
import {UntypedFormBuilder, UntypedFormGroup} from '@angular/forms';
import {LookupService} from '@services/lookup.service';
import {ToastService} from '@services/toast.service';
import {DialogRef} from '@app/shared/models/dialog-ref';
import {DialogService} from '@services/dialog.service';
import {AdminGenericDialog} from '@app/generics/admin-generic-dialog';
import {Lookup} from '@app/models/lookup';
import {ActionIconsEnum} from '@app/enums/action-icons-enum';
import {FormManager} from '@app/models/form-manager';
import {OperationTypes} from '@app/enums/operation-types.enum';
import {TabMap} from '@app/types/types';
import {Observable, Subject} from 'rxjs';
import {TabComponent} from '@app/shared/components/tab/tab.component';
import {AdminLookupService} from '@services/admin-lookup.service';
import {AdminLookupListComponent} from '@app/administration/pages/admin-lookup-list/admin-lookup-list.component';

@Component({
  selector: 'admin-lookup-popup',
  templateUrl: './admin-lookup-popup.component.html',
  styleUrls: ['./admin-lookup-popup.component.scss']
})
export class AdminLookupPopupComponent extends AdminGenericDialog<AdminLookup> implements AfterViewInit {

  usePagination: boolean = true;
  count: number = 0;

  constructor(@Inject(DIALOG_DATA_TOKEN) data: IDialogData<AdminLookup>,
              public lang: LangService,
              public fb: UntypedFormBuilder,
              private cd: ChangeDetectorRef,
              public lookupService: LookupService,
              private adminLookupService: AdminLookupService,
              public toast: ToastService,
              public dialogRef: DialogRef,
              public dialogService: DialogService) {
    super();
    this.operation = data.operation;
    this.model = data.model;
    this.defaultSelectedTab = data.selectedTab || 'basic';
    this.adminLookupTypeId = data.model.type;
    this.typeWithSubRecord = this.adminLookupService.adminLookupTypesWithChildren.includes(data.model.type);
    this.classification = this.lookupService.findLookupByLookupKey(this.lookupService.listByCategory.AdminLookupType, this.model.type) ?? new Lookup();
  }

  ngAfterViewInit() {
    this._setDefaultSelectedTab();
    this.cd.detectChanges();
  }

  initPopup(): void {
  }

  popupTitle(): string {
    if (this.operation === OperationTypes.CREATE) {
      return this.lang.map.lbl_add_x.change({x: this.classification.getName()});
    } else if (this.operation === OperationTypes.UPDATE) {
      return this.lang.map.lbl_edit_x.change({x: this.classification.getName()});
    } else if (this.operation === OperationTypes.VIEW) {
      return this.lang.map.view;
    }
    return '';
  };

  actionIconsEnum = ActionIconsEnum;
  classification: Lookup;
  form!: UntypedFormGroup;
  fm!: FormManager;
  operation!: OperationTypes;
  model!: AdminLookup;
  validateFieldsVisible = true;
  saveVisible = true;
  tabsData: TabMap = {
    basic: {name: 'basic', langKey: 'lbl_basic_info', index: 0, validStatus: () => true, isTouchedOrDirty: () => true},
    children: {
      name: 'children',
      langKey: 'lbl_children_x',
      index: 1,
      validStatus: () => true,
      isTouchedOrDirty: () => true,
      getLangText: (tab) => {
        return this.lang.map[tab.langKey].change({x: this.classification.getName()});
      }
    }
  };
  selectedTabIndex$: Subject<number> = new Subject<number>();
  defaultSelectedTab: string = 'basic';
  typeWithSubRecord: boolean = false;
  selectedTab: string = 'basic';
  childrenLoaded: boolean = false;
  @ViewChild('childListComponent') childListComponentRef!: AdminLookupListComponent;

  get readonly(): boolean {
    return this.operation === OperationTypes.VIEW;
  }

  private _setDefaultSelectedTab(): void {
    setTimeout(() => {
      if (this.tabsData.hasOwnProperty(this.defaultSelectedTab) && this.tabsData[this.defaultSelectedTab]) {
        this.selectedTabIndex$.next(this.tabsData[this.defaultSelectedTab].index);
      }
    });
  }

  tabChanged(tab: TabComponent) {
    this.selectedTab = tab.name;
    this.setDialogButtonsVisibility(tab);
    if (this.typeWithSubRecord && (this.selectedTab === this.tabsData.children.name) && !this.childrenLoaded) {
      this.childListComponentRef.reload$.next(null);
      this.childrenLoaded = true;
    }
  }

  setDialogButtonsVisibility(tab: any): void {
    this.saveVisible = (tab.name && tab.name === this.tabsData.basic.name);
    this.validateFieldsVisible = (tab.name && tab.name === this.tabsData.basic.name);
  }

  buildForm(): void {
    this.form = this.fb.group(this.model.buildForm(true));
    this.fm = new FormManager(this.form, this.lang);
    if (this.readonly) {
      this.form.disable();
      this.saveVisible = false;
      this.validateFieldsVisible = false;
    }
  }

  beforeSave(model: AdminLookup, form: UntypedFormGroup): Observable<boolean> | boolean {
    return form.valid;
  }

  prepareModel(model: AdminLookup, form: UntypedFormGroup): Observable<AdminLookup> | AdminLookup {
    return (new AdminLookup()).clone({...model, ...form.value});
  }

  afterSave(model: AdminLookup, dialogRef: DialogRef): void {
    const message = this.operation === OperationTypes.CREATE ? this.lang.map.msg_create_x_success : this.lang.map.msg_update_x_success;
    this.toast.success(message.change({x: model.getName()}));
    this.model = model;
    const operationBeforeSave = this.operation;
    this.operation = OperationTypes.UPDATE;

    if (operationBeforeSave == OperationTypes.UPDATE) {
      this.dialogRef.close(this.model);
    }
  }

  saveFail(error: Error): void {
  }

  destroyPopup(): void {

  }

}
