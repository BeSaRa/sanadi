import {AfterViewInit, ChangeDetectorRef, Component, ElementRef, Inject, ViewChild} from '@angular/core';
import {FormBuilder, FormGroup} from '@angular/forms';
import {OperationTypes} from '@app/enums/operation-types.enum';
import {LangService} from '@app/services/lang.service';
import {AidLookup} from '@app/models/aid-lookup';
import {DIALOG_DATA_TOKEN} from '@app/shared/tokens/tokens';
import {IDialogData} from '@app/interfaces/i-dialog-data';
import {ToastService} from '@app/services/toast.service';
import {CustomValidators} from '@app/validators/custom-validators';
import {AidTypes} from '@app/enums/aid-types.enum';
import {Observable} from 'rxjs';
import {Lookup} from '@app/models/lookup';
import {LookupService} from '@app/services/lookup.service';
import {IKeyValue} from '@app/interfaces/i-key-value';
import {DialogRef} from '@app/shared/models/dialog-ref';
import {AdminGenericDialog} from '@app/generics/admin-generic-dialog';
import {AidLookupStatusEnum} from '@app/enums/status.enum';

@Component({
  selector: 'app-aid-lookup-popup',
  templateUrl: './aid-lookup-popup.component.html',
  styleUrls: ['./aid-lookup-popup.component.scss']
})
export class AidLookupPopupComponent extends AdminGenericDialog<AidLookup> implements AfterViewInit {
  form!: FormGroup;
  model: AidLookup;
  parentId: number;
  operation: OperationTypes;
  aidType: number;
  gridAidType!: number;
  isAidTabVisible!: boolean;
  aidLookupStatusList!: Lookup[];
  saveVisible = true;
  aidLookupStatusEnum = AidLookupStatusEnum;

  @ViewChild('dialogContent') dialogContent!: ElementRef;

  tabsData: IKeyValue = {
    basic: {name: 'basic'},
    childAids: {name: 'childAids'}
  };

  constructor(@Inject(DIALOG_DATA_TOKEN) data: IDialogData<AidLookup>,
              private toast: ToastService,
              private lookupService: LookupService,
              public langService: LangService,
              public dialogRef: DialogRef,
              public fb: FormBuilder,
              private cd: ChangeDetectorRef) {
    super();
    this.model = data.model;
    this.parentId = data.parentId;
    this.operation = data.operation;
    this.aidType = data.aidType;
  }

  initPopup(): void {
    this.checkIfAidTabEnabled();
    this.setGridAidType();
    this.aidLookupStatusList = this.lookupService.listByCategory.AidLookupStatus;
  }

  ngAfterViewInit(): void {
    if (this.operation === OperationTypes.UPDATE) {
      this.displayFormValidity(null, this.dialogContent.nativeElement);
    }
    this.cd.detectChanges();
  }

  get popupTitle(): string {
    let title!: string;
    switch (this.aidType) {
      case AidTypes.CLASSIFICATIONS:
        title = this.operation === OperationTypes.CREATE ? this.langService.map.lbl_add_aid_class : this.langService.map.lbl_edit_aid_class;
        break;
      case AidTypes.MAIN_CATEGORY:
        title = this.operation === OperationTypes.CREATE ?
          this.langService.map.lbl_add_aid_main_category :
          this.langService.map.lbl_edit_aid_main_category;
        break;
      case AidTypes.SUB_CATEGORY:
        title = this.operation === OperationTypes.CREATE ?
          this.langService.map.lbl_add_aid_sub_category :
          this.langService.map.lbl_edit_aid_sub_category;
        break;
    }
    return title;
  }

  getTabTitleText(): string {
    let title!: string;
    switch (this.gridAidType) {
      case AidTypes.MAIN_CATEGORY:
        title = this.langService.map.menu_aid_main_category;
        break;
      case AidTypes.SUB_CATEGORY:
        title = this.langService.map.menu_aid_sub_category;
        break;
    }

    return title;
  }

  setDialogButtonsVisibility(tab: any): void {
    this.saveVisible = (tab.name && tab.name === this.tabsData.basic.name);
    this.validateFieldsVisible = (tab.name && tab.name === this.tabsData.basic.name);
  }

  setGridAidType(): void {
    if (this.aidType === AidTypes.CLASSIFICATIONS) {
      this.gridAidType = AidTypes.MAIN_CATEGORY;
    } else {
      this.gridAidType = AidTypes.SUB_CATEGORY;
    }
  }

  buildForm(): void {
    let model = (new AidLookup()).clone({...this.model});
    model.aidType = this.model.aidType || this.aidType;

    if (model.aidType === AidTypes.CLASSIFICATIONS) {
      model.parent = undefined;
    } else {
      model.parent = (this.operation === OperationTypes.CREATE) ? this.parentId : this.model.parent;
    }
    this.form = this.fb.group(model.buildForm(true), {validators: CustomValidators.validateFieldsStatus(['arName', 'enName', 'aidCode', 'aidType', 'status'])});
  }

  beforeSave(model: AidLookup, form: FormGroup): Observable<boolean> | boolean {
    return form.valid;
  }

  prepareModel(model: AidLookup, form: FormGroup): Observable<AidLookup> | AidLookup {
    return (new AidLookup()).clone({...model, ...form.value});
  }

  afterSave(model: AidLookup, dialogRef: DialogRef): void {
    const message = this.operation === OperationTypes.CREATE ? this.langService.map.msg_create_x_success : this.langService.map.msg_update_x_success;
    this.toast.success(message.change({x: model.getName()}));
    this.model = model;
    this.operation = OperationTypes.UPDATE;
    this.checkIfAidTabEnabled();
    if (this.aidType === AidTypes.SUB_CATEGORY) {
      this.dialogRef.close(model);
    }
  }

  saveFail(error: Error): void {
  }

  private checkIfAidTabEnabled(): void {
    this.isAidTabVisible = this.aidType !== AidTypes.SUB_CATEGORY && this.operation === OperationTypes.UPDATE;
  }

  destroyPopup(): void {
  }
}
