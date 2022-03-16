import {AfterViewInit, ChangeDetectorRef, Component, ElementRef, Inject, ViewChild} from '@angular/core';
import {FormBuilder, FormControl, FormGroup} from '@angular/forms';
import {OperationTypes} from '@app/enums/operation-types.enum';
import {OrgUnit} from '@app/models/org-unit';
import {OrgBranch} from '@app/models/org-branch';
import {Lookup} from '@app/models/lookup';
import {IKeyValue} from '@app/interfaces/i-key-value';
import {DIALOG_DATA_TOKEN} from '@app/shared/tokens/tokens';
import {IDialogData} from '@app/interfaces/i-dialog-data';
import {LookupService} from '@app/services/lookup.service';
import {ToastService} from '@app/services/toast.service';
import {LangService} from '@app/services/lang.service';
import {LookupCategories} from '@app/enums/lookup-categories';
import {CustomValidators} from '@app/validators/custom-validators';
import {Observable} from 'rxjs';
import {AdminGenericDialog} from '@app/generics/admin-generic-dialog';
import {DialogRef} from '@app/shared/models/dialog-ref';

@Component({
  selector: 'app-organization-branch-popup',
  templateUrl: './organization-branch-popup.component.html',
  styleUrls: ['./organization-branch-popup.component.scss']
})
export class OrganizationBranchPopupComponent extends AdminGenericDialog<OrgBranch> implements AfterViewInit {
  constructor(public dialogRef: DialogRef,
              @Inject(DIALOG_DATA_TOKEN) data: IDialogData<OrgBranch>,
              private lookupService: LookupService,
              public fb: FormBuilder,
              private cd: ChangeDetectorRef,
              private toast: ToastService,
              public langService: LangService) {
    super();
    this.operation = data.operation;
    this.model = data.model;
    this.orgUnit = data.orgUnit;
  }
  @ViewChild('dialogContent') dialogContent!: ElementRef;

  form!: FormGroup;
  model: OrgBranch;
  operation: OperationTypes;
  saveVisible = true;

  orgUnit: OrgUnit;
  orgUnitStatusList: Lookup[] = [];

  tabsData: IKeyValue = {
    basic: {name: 'basic', langKey: 'lbl_basic_info', validStatus: () => this.form && this.form.valid},
    users: {name: 'users', langKey: 'lbl_org_users', validStatus: ()=> true}
  };
  inputMaskPatterns = CustomValidators.inputMaskPatterns;

  setDialogButtonsVisibility(tab: any): void {
    this.saveVisible = (tab.name && tab.name === this.tabsData.basic.name);
    this.validateFieldsVisible = (tab.name && tab.name === this.tabsData.basic.name);
  }

  initPopup(): void {
    this.orgUnitStatusList = this.lookupService.getByCategory(LookupCategories.ORG_STATUS);
  }

  private _afterViewInit(): void {
    if (this.operation === OperationTypes.UPDATE) {
      this.displayFormValidity(null, this.dialogContent.nativeElement);
    }
  }

  ngAfterViewInit(): void {
    // used the private function to reuse functionality of afterViewInit if needed
    this._afterViewInit();
    this.cd.detectChanges();
  }

  get popupTitle(): string {
    if (this.operation === OperationTypes.CREATE) {
      return this.langService.map.lbl_add_org_branch;
    } else if (this.operation === OperationTypes.UPDATE) {
      return this.langService.map.lbl_edit_org_branch;
    } else if (this.operation === OperationTypes.VIEW) {
      return this.langService.map.view;
    }
    return '';
  }

  public buildForm(): void {
    let record = (new OrgBranch()).clone(this.model);
    record.orgId = this.orgUnit.id;

    this.form = this.fb.group(record.buildForm(true), {validators: record.setFormCrossValidations()});
  }

  get isMainField(): FormControl {
    return this.form.get('isMain') as FormControl;
  }

  beforeSave(model: OrgBranch, form: FormGroup): boolean | Observable<boolean> {
    return this.form.valid;
  }
  prepareModel(model: OrgBranch, form: FormGroup): OrgBranch | Observable<OrgBranch> {
    return (new OrgBranch()).clone({...model, ...form.value});
  }
  afterSave(model: OrgBranch, dialogRef: DialogRef): void {
    const message = (this.operation === OperationTypes.CREATE)
      ? this.langService.map.msg_create_x_success
      : this.langService.map.msg_update_x_success;

    this.toast.success(message.change({x: model.getName()}));
    this.model = model;
    this.operation = OperationTypes.UPDATE;
  }

  saveFail(error: Error): void {
    throw new Error('Method not implemented.');
  }

  destroyPopup(): void {
  }

}
