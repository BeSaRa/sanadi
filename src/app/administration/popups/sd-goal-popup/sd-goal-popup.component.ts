import {AfterViewInit, Component, Inject, ViewChild} from '@angular/core';
import {AdminGenericDialog} from '@app/generics/admin-generic-dialog';
import {SDGoal} from '@app/models/sdgoal';
import {DialogRef} from '@app/shared/models/dialog-ref';
import {UntypedFormBuilder, UntypedFormGroup} from '@angular/forms';
import {Observable, Subject} from 'rxjs';
import {LangService} from '@app/services/lang.service';
import {OperationTypes} from '@app/enums/operation-types.enum';
import {Lookup} from '@app/models/lookup';
import {LookupService} from '@app/services/lookup.service';
import {DialogService} from '@app/services/dialog.service';
import {ToastService} from '@app/services/toast.service';
import {DIALOG_DATA_TOKEN} from '@app/shared/tokens/tokens';
import {IDialogData} from '@app/interfaces/i-dialog-data';
import {CommonStatusEnum} from '@app/enums/common-status.enum';
import {TableComponent} from '@app/shared/components/table/table.component';
import {SdGoalListComponent} from '@app/administration/pages/sd-goal-list/sd-goal-list.component';
import {TabComponent} from '@app/shared/components/tab/tab.component';
import {TabMap} from '@app/types/types';

@Component({
  selector: 'sd-goal-popup',
  templateUrl: './sd-goal-popup.component.html',
  styleUrls: ['./sd-goal-popup.component.scss']
})
export class SdGoalPopupComponent extends AdminGenericDialog<SDGoal> implements AfterViewInit {

  constructor(@Inject(DIALOG_DATA_TOKEN) data: IDialogData<SDGoal>,
              public fb: UntypedFormBuilder,
              public dialogRef: DialogRef,
              public lang: LangService,
              private lookupService: LookupService,
              private dialogService: DialogService,
              private toast: ToastService) {
    super();
    this.model = data.model;
    this.operation = data.operation;
    this.defaultSelectedTab = data.selectedTab || 'basic';
  }

  initPopup(): void {
  }

  ngAfterViewInit() {
    this._setDefaultSelectedTab();
  }

  private _setDefaultSelectedTab(): void {
    setTimeout(() => {
      if (this.tabsData.hasOwnProperty(this.defaultSelectedTab) && this.tabsData[this.defaultSelectedTab]) {
        this.selectedTabIndex$.next(this.tabsData[this.defaultSelectedTab].index);
      }
    });
  }

  form!: UntypedFormGroup;
  model!: SDGoal;
  operation!: OperationTypes;
  tabsData: TabMap = {
    basic: {
      name: 'basic', langKey: 'lbl_basic_info', index: 0,
      validStatus: () => {
        if (!this.form || this.readonly) {
          return true;
        }
        return this.form.valid;
      },
      isTouchedOrDirty: () => true
    },
    children: {
      name: 'children',
      langKey: 'lbl_sub_sd_goals',
      index: 1,
      validStatus: () => true,
      isTouchedOrDirty: () => true,
      isLoaded: false
    }
  };
  selectedTabIndex$: Subject<number> = new Subject<number>();
  defaultSelectedTab: string = 'basic';
  selectedTab: string = 'basic';
  statuses: Lookup[] = this.lookupService.listByCategory.CommonStatus;

  validToAddSubGoals = false;
  commonStatusEnum = CommonStatusEnum;
  saveVisible = true;
  @ViewChild('table') table!: TableComponent;
  @ViewChild('childListComponent') childListComponentRef!: SdGoalListComponent;

  get popupTitle(): string {
    if (this.operation === OperationTypes.CREATE) {
      return this.lang.map.lbl_add_sd_goal;
    } else if (this.operation === OperationTypes.UPDATE) {
      return this.lang.map.lbl_edit_sd_goal;
    }
    return this.lang.map.view;
  };

  get readonly(): boolean {
    return this.operation === OperationTypes.VIEW;
  }

  tabChanged(tab: TabComponent) {
    this.selectedTab = tab.name;
    this.setDialogButtonsVisibility(tab);
    /*if ((this.selectedTab === this.tabsData.children.name) && !this.tabsData.children.isLoaded) {
      this.childListComponentRef.reload$.next(null);
      this.tabsData.children.isLoaded = true;
    }*/
  }

  setDialogButtonsVisibility(tab: any): void {
    this.saveVisible = (tab.name && tab.name === this.tabsData.basic.name);
    this.validateFieldsVisible = (tab.name && tab.name === this.tabsData.basic.name);
  }

  buildForm(): void {
    this.form = this.fb.group(this.model.buildForm(true));
    if (this.readonly) {
      this.form.disable();
      this.saveVisible = false;
      this.validateFieldsVisible = false;
    }
  }

  prepareModel(model: SDGoal, form: UntypedFormGroup): Observable<SDGoal> | SDGoal {
    return (new SDGoal()).clone({...model, ...form.value});
  }

  beforeSave(model: SDGoal, form: UntypedFormGroup): Observable<boolean> | boolean {
    return form.valid;
  }

  afterSave(model: SDGoal, dialogRef: DialogRef): void {
    this.validToAddSubGoals = true;
    const message = this.operation === OperationTypes.CREATE ? this.lang.map.msg_create_x_success : this.lang.map.msg_update_x_success;
    // @ts-ignore
    this.toast.success(message.change({x: model.getName()}));
    this.model = model;
    const operationBeforeSave = this.operation;
    this.operation = OperationTypes.UPDATE;

    if (operationBeforeSave == OperationTypes.UPDATE || !!this.model.parentId) {
      this.dialogRef.close(this.model);
    }
  }

  saveFail(error: Error): void {
  }

  destroyPopup(): void {

  }

}
