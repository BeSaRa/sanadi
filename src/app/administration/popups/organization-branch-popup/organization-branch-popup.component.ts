import {Component, Inject, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {FormManager} from '../../../models/form-manager';
import {OperationTypes} from '../../../enums/operation-types.enum';
import {OrgUnit} from '../../../models/org-unit';
import {OrgBranch} from '../../../models/org-branch';
import {Lookup} from '../../../models/lookup';
import {IKeyValue} from '../../../interfaces/i-key-value';
import {DIALOG_DATA_TOKEN} from '../../../shared/tokens/tokens';
import {IDialogData} from '../../../interfaces/i-dialog-data';
import {LookupService} from '../../../services/lookup.service';
import {ToastService} from '../../../services/toast.service';
import {LangService} from '../../../services/lang.service';
import {LookupCategories} from '../../../enums/lookup-categories';
import {extender} from '../../../helpers/extender';
import {CustomValidators} from '../../../validators/custom-validators';

@Component({
  selector: 'app-organization-branch-popup',
  templateUrl: './organization-branch-popup.component.html',
  styleUrls: ['./organization-branch-popup.component.scss']
})
export class OrganizationBranchPopupComponent implements OnInit {
  form!: FormGroup;
  fm!: FormManager;
  operation: OperationTypes;
  model: OrgBranch;
  orgUnit: OrgUnit;
  orgUnitStatusList: Lookup[];

  tabsData: IKeyValue = {
    basic: {key: 'basic', show: true},
    users: {
      key: 'users', show: (): boolean => !!this.model.id
    }
  };

  constructor(@Inject(DIALOG_DATA_TOKEN)  data: IDialogData<OrgBranch>,
              private lookupService: LookupService,
              private fb: FormBuilder,
              private toast: ToastService,
              public langService: LangService) {
    this.operation = data.operation;
    this.model = data.model;
    this.orgUnit = data.orgUnit;
    this.orgUnitStatusList = lookupService.getByCategory(LookupCategories.ORG_STATUS);
  }

  ngOnInit(): void {
    this.buildForm();
  }

  get popupTitle(): string {
    return this.operation === OperationTypes.CREATE ? this.langService.map.lbl_add_org_branch : this.langService.map.lbl_edit_org_branch;
  }

  canShowTab(tab: string | object): boolean {
    // @ts-ignore
    const tabName = (typeof tab === 'string') ? tab : tab.key;
    if (!this.tabsData.hasOwnProperty(tabName)) {
      return false;
    } else {
      const canShow = this.tabsData[tabName].show;
      return (typeof canShow === 'function') ? canShow() : canShow;
    }
  }

  private buildForm(): void {
    this.form = this.fb.group({
      orgId: [this.orgUnit.id],
      arName: [this.model.arName, [Validators.required, Validators.maxLength(CustomValidators.defaultLengths.ARABIC_NAME_MAX)]],
      enName: [this.model.enName, [Validators.required, Validators.maxLength(CustomValidators.defaultLengths.ENGLISH_NAME_MAX)]],
      status: [this.model.status, Validators.required],
      // email: [this.model.email, [Validators.email, Validators.maxLength(50)]],
      phoneNumber1: [this.model.phoneNumber1, [Validators.required, CustomValidators.number, Validators.maxLength(CustomValidators.defaultLengths.PHONE_NUMBER_MAX)]],
      phoneNumber2: [this.model.phoneNumber2, [CustomValidators.number, Validators.maxLength(CustomValidators.defaultLengths.PHONE_NUMBER_MAX)]],
      address: [this.model.address, [Validators.maxLength(CustomValidators.defaultLengths.ADDRESS_MAX)]],
      // buildingName: [this.model.buildingName, [Validators.required, Validators.maxLength(200)]],
      // unitName: [this.model.unitName, [Validators.required, Validators.maxLength(200)]],
      // street: [this.model.street, [Validators.required, Validators.maxLength(200)]],
      // zone: [this.model.zone, [Validators.required, Validators.maxLength(100)]],
      isMain: [this.model.isMain, [Validators.required]]
    });
    this.fm = new FormManager(this.form, this.langService);

    if (this.operation === OperationTypes.UPDATE) {
      this.fm.displayFormValidity();
    }
  }

  saveModel(): void {
    const orgBranch = extender<OrgBranch>(OrgBranch, {...this.model, ...this.fm.getForm()?.value});
    orgBranch.save()
      .subscribe(() => {
        const message = (this.operation === OperationTypes.CREATE)
          ? this.langService.map.msg_create_x_success
          : this.langService.map.msg_update_x_success;

        this.toast.success(message.change({x: orgBranch.getName()}));
        this.model = orgBranch;
        this.operation = OperationTypes.UPDATE;
      });
  }

}
